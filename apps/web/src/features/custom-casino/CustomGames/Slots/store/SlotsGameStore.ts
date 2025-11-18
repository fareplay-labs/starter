// @ts-nocheck
import { createGameStore } from '@/features/custom-casino/CustomGames/shared/gameStoreFactory'
import {
  type SlotsParameters,
  type SlotsResult,
  type SlotsEntry,
  DEFAULT_SLOTS_PARAMETERS,
  DEFAULT_SLOTS_ENTRY,
} from '../types'
import { checkWinningLines } from '../utils/winDetection'
import type { WinLineResult } from '../utils/winDetection'
import { mapPayoutToReelPositions, getClosestValidPayout } from '../utils/payoutMapping'
import { getWinTier, getWinAnimationDuration } from '../utils/winTiers'
import { entryEvent } from '@/features/custom-casino/events/entryEvent'

/**
 * Slots runtime state
 */
interface SlotsRuntimeState {
  // Animation state
  isSpinning: boolean
  targetReelPositions: number[]

  // Debug state
  forcedOutcome: number | null

  // Win state
  winningLines: WinLineResult[]
  showWinAnimation: boolean

  // Demo mode
  isDemoMode: boolean
}

/**
 * Slots actions
 */
interface SlotsActions {
  // Spin actions
  startSpin: () => void
  completeSpinAnimation: () => void
  clearResult: () => void

  // Debug actions
  forceOutcome: (position: number) => void

  // Win actions
  showWinningLines: (lines: WinLineResult[]) => void
  clearWinningLines: () => void

  // Result display - now accepts optional blockchain payout for accuracy
  showResult: (reelPositions: number[], blockchainMultiplier?: number) => Promise<SlotsResult>

  // Multi-reel support
  reelCount: number

  // Demo mode
  setDemoMode: (isDemoMode: boolean) => void

  // Demo play methods
  playRandom: () => Promise<SlotsResult>
  simulateWin: () => Promise<SlotsResult>
  simulateLoss: () => Promise<SlotsResult>
}

/**
 * Create the slots game store
 */
export const useSlotsGameStore = createGameStore<
  SlotsParameters,
  SlotsResult,
  SlotsEntry,
  SlotsRuntimeState,
  SlotsActions
>(
  'Slots',
  DEFAULT_SLOTS_PARAMETERS,

  // Game-specific slice
  (set, get) => ({
    // Slots-specific state
    isSpinning: false,
    targetReelPositions: [], // Empty until we have a result
    forcedOutcome: null,
    reelCount: 5, // 5-reel slot machine
    winningLines: [],
    showWinAnimation: false,
    isDemoMode: true, // Default to demo mode

    // Spin actions
    startSpin: () => {
      // Starting spin

      set({
        gameState: 'PLAYING',
        isSpinning: true,
        winningLines: [],
        showWinAnimation: false,
        targetReelPositions: [], // Clear previous positions
      })
    },

    completeSpinAnimation: () => {
      const { lastResult } = get()

      // Enter result state and stop spinning; allow celebration to run
      set({
        isSpinning: false,
        gameState: 'SHOWING_RESULT',
      })

      // Update wallet balance now
      entryEvent.pub('updateBalance')

      // Do not auto-reset here; CustomGamePage/scene manages reset timing
      // based on the win celebration lifecycle to avoid cutting off big wins.
      if (lastResult?.isWin) {
        const multiplier = lastResult.multiplier || 0
        const winTier = getWinTier(multiplier)
        const animationDuration = getWinAnimationDuration(winTier)
        console.log('[Slots] Win detected:', { multiplier, winTier, animationDuration })
      }
    },

    // Win actions
    showWinningLines: lines => {
      set({
        winningLines: lines,
        showWinAnimation: true,
      })
    },

    clearWinningLines: () => {
      set({
        winningLines: [],
        showWinAnimation: false,
      })
    },

    clearResult: () => {
      set({
        winningLines: [],
        showWinAnimation: false,
      })
    },


    // Pure animation function - follows pattern from other games
    async showResult(reelPositions: number[], blockchainMultiplier?: number) {
      const { parameters, reelCount } = get()

      // Use win detection for multi-reel
      const winData =
        reelCount > 1 ?
          checkWinningLines(reelPositions, parameters.slotsSymbols)
        : {
            // Fallback for single reel
            winningLines: [],
            totalPayout: 0,
            isWin: false,
            isJackpot: false,
            bestMatch: 0,
          }

      // Convert win data to store format
      const winningLines = winData.winningLines.map(line => ({
        lineNumber: line.lineNumber,
        symbols: line.symbols,
        payout: line.payout,
        pattern: line.pattern,
        matchCount: line.matchCount,
      }))

      // IMPORTANT: Use blockchain multiplier if provided (for accurate payouts)
      // Otherwise fall back to calculated value (for demo mode)
      const totalMultiplier = blockchainMultiplier ?? winData.totalPayout
      
      // Log payout discrepancy if any
      if (blockchainMultiplier !== undefined && blockchainMultiplier !== winData.totalPayout) {
        console.warn('[Slots] Payout mismatch detected:', {
          blockchainMultiplier,
          calculatedPayout: winData.totalPayout,
          reelPositions,
          winningLines: winData.winningLines
        })
      }

      const result: SlotsResult = {
        timestamp: Date.now(),
        entryAmount: get().entry.entryAmount,
        numberOfEntries: get().entry.entryCount,
        payout: get().entry.entryAmount * totalMultiplier,
        isWin: totalMultiplier > 0, // Win if multiplier is greater than 0
        reelPositions,
        winningLines,
        multiplier: totalMultiplier,
        isJackpot: totalMultiplier >= 20, // Jackpot at 20x or higher
      }

      // Set playing state and results (following CoinFlip/Dice pattern)
      set((state: any) => {
        state.submittedEntry = { ...get().entry }
        state.gameState = 'PLAYING'
        state.lastResult = result
        state.targetReelPositions = reelPositions
      })

      // Show winning lines after all reels stop (delayed)
      if (winningLines.length > 0) {
        setTimeout(() => {
          get().showWinningLines(winningLines)
        }, 3000) // Approximate time for all reels to stop
      }

      return result
    },

    setDemoMode: (isDemoMode: boolean) => {
      set({ isDemoMode })
    },

    // Debug actions
    forceOutcome: (position: number) => {
      // Forcing next outcome
      set({ forcedOutcome: position })
    },

    // Demo play methods
    playRandom: async () => {
      const { reelCount } = get()

      // Following pattern from other games - direct showResult call
      get().startSpin()

      // Generate a random payout based on actual probabilities
      const rand = Math.random()
      let targetMultiplier = 0

      // Match smart contract probabilities
      if (rand < 0.455) {
        targetMultiplier = 0 // 45.5% loss
      } else if (rand < 0.555) {
        targetMultiplier = 0.5 // 10%
      } else if (rand < 0.655) {
        targetMultiplier = 0.75 // 10%
      } else if (rand < 0.705) {
        targetMultiplier = 1 // 5%
      } else if (rand < 0.825) {
        targetMultiplier = 1.5 // 12%
      } else if (rand < 0.925) {
        targetMultiplier = 2 // 10%
      } else if (rand < 0.965) {
        targetMultiplier = 3 // 4%
      } else if (rand < 0.985) {
        targetMultiplier = 6 // 2%
      } else if (rand < 0.9955) {
        targetMultiplier = 10 // 1.05%
      } else {
        targetMultiplier = 20 // 0.45%
      }

      // Generate seed and use payout mapping
      const seed = `demo_${Date.now()}_${Math.random()}`
      const positions = mapPayoutToReelPositions(targetMultiplier, seed, reelCount)

      // Direct showResult call (following other games pattern)
      return get().showResult(positions)
    },

    simulateWin: async () => {
      const { reelCount, showResult } = get()

      // Following pattern from other games
      get().startSpin()

      // Pick a random winning payout (exclude 0)
      const winningPayouts = [0.5, 0.75, 1, 1.5, 2, 3, 6, 10, 20]
      const targetMultiplier = winningPayouts[Math.floor(Math.random() * winningPayouts.length)]

      // Generate seed and use payout mapping
      const seed = `win_${Date.now()}_${Math.random()}`
      const positions = mapPayoutToReelPositions(targetMultiplier, seed, reelCount)

      return showResult(positions)
    },

    simulateLoss: async () => {
      const { reelCount, showResult } = get()

      // Following pattern from other games
      get().startSpin()

      // Generate seed and use payout mapping for a loss (0x multiplier)
      const seed = `loss_${Date.now()}_${Math.random()}`
      const positions = mapPayoutToReelPositions(0, seed, reelCount)

      return showResult(positions)
    },

    // Reset function for game-specific state - follows pattern from other games
    resetGameSpecificState: (state: any) => {
      // Reset all Slots-specific state
      state.isSpinning = false
      state.targetReelPositions = []
      state.forcedOutcome = null
      state.winningLines = []
      state.showWinAnimation = false
    },
  }),
  DEFAULT_SLOTS_ENTRY
)
