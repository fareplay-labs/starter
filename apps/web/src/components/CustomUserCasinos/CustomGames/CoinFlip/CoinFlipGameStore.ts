// @ts-nocheck
import { createGameStore, validateBaseEntry } from '../shared/gameStoreFactory'
import { DEFAULT_COINFLIP_PARAMETERS, DEFAULT_COINFLIP_ENTRY } from './types'
import {
  type CoinFlipParameters,
  type CoinFlipResult,
  type CoinFlipEntry,
  type CoinSide,
} from './types'
import { createCoinFlipResult } from './logic/CoinFlipGameLogic'
import { CoinFlipSelection, isValidCoinFlipSide } from '@/components/CustomUserCasinos/lib/crypto/coinFlip'
import { entryEvent } from '@/components/CustomUserCasinos/events/entryEvent'

interface CoinFlipRuntimeState {
  flipResult: CoinSide | null
  isFlipping: boolean
}

interface CoinFlipActions {
  showResult: (flipResult: CoinSide) => Promise<CoinFlipResult>  // Required parameter - pure function
  playRandom: () => Promise<CoinFlipResult>
  simulateWin: () => Promise<CoinFlipResult>
  simulateLoss: () => Promise<CoinFlipResult>
  validateEntry: () => { isValid: boolean; errors: Record<string, string> }
  completeFlip: () => void
  resetGameSpecificState: (state: any) => void
}

export const useCoinFlipGameStore = createGameStore<
  CoinFlipParameters,
  CoinFlipResult,
  CoinFlipEntry,
  CoinFlipRuntimeState,
  CoinFlipActions
>(
  'coinFlip',
  DEFAULT_COINFLIP_PARAMETERS,

  // game-specific slice
  (set, get) => ({
    flipResult: null,
    isFlipping: false,

    // Pure animation function - just shows the given result
    async showResult(flipResult: CoinSide) {
      const { parameters, entry, gameState } = get()

      // Transition from RESOLVE to PLAYING (blockchain mode)
      // or directly to PLAYING (demo mode)
      set((state: any) => {
        state.isFlipping = true
        // Only update submittedEntry if not already set (demo mode)
        if (!state.submittedEntry) {
          state.submittedEntry = { ...entry }
        }
        state.gameState = 'PLAYING'
      })

      // Create result with the provided flip result
      const result = createCoinFlipResult(
        parameters,
        entry.entryAmount,
        entry.entryCount,
        entry.side,
        flipResult
      )

      set((state: any) => {
        state.lastResult = result
        state.flipResult = result.flipResult
        // Stay in PLAYING state while animation runs
        // The animation completion will trigger reset
      })

      return result
    },

    // Play with random result (demo mode)
    async playRandom() {
      const { submitEntry } = get()
      // First submit the entry (will set state to PLAYING in demo mode)
      submitEntry()
      // Then show a random result
      const randomResult: CoinSide = Math.random() < 0.5 ? CoinFlipSelection.Heads : CoinFlipSelection.Tails
      return get().showResult(randomResult)
    },

    async simulateWin() {
      const { entry, showResult, submitEntry } = get()
      // First submit the entry
      submitEntry()
      // Return the same side the player chose (guaranteed win)
      return showResult(entry.side)
    },

    async simulateLoss() {
      const { entry, showResult, submitEntry } = get()
      // First submit the entry
      submitEntry()
      // Return the opposite side (guaranteed loss)
      const losingResult = entry.side === CoinFlipSelection.Heads ? CoinFlipSelection.Tails : CoinFlipSelection.Heads
      return showResult(losingResult)
    },

    validateEntry: () => {
      const { entry } = get()
      
      // Get base validation
      const baseValidation = validateBaseEntry(entry)
      const errors = { ...baseValidation.errors }

      // Add CoinFlip-specific validation
      if (entry.side === undefined || !isValidCoinFlipSide(entry.side)) {
        errors.side = 'Must select heads or tails'
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      }
    },

    /**
     * Called when the Three-JS animation reports completion.
     * We stay in PLAYING state and just trigger reset
     */
    completeFlip() {
      set((state: any) => {
        state.isFlipping = false
      })

      // Update wallet balance
      entryEvent.pub('updateBalance')

      // Allow result to remain visible for a short time before resetting
      setTimeout(() => {
        get().reset()
      }, 1000)
    },

    resetGameSpecificState: (state: any) => {
      state.isFlipping = false
      state.flipResult = null
    },
  }),

  DEFAULT_COINFLIP_ENTRY
)
