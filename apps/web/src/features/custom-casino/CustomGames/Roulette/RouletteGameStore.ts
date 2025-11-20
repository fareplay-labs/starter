// @ts-nocheck
import { createGameStore } from '../shared/gameStoreFactory'
import { DEFAULT_ROULETTE_PARAMETERS, DEFAULT_ROULETTE_ENTRY } from './types'
import {
  type RouletteParameters,
  type RouletteResult,
  type RouletteEntry,
  type RouletteBet,
} from './types'
import { createRouletteResult, generateWinningNumber } from './logic/RouletteGameLogic'
import { entryEvent } from '@/features/custom-casino/events/entryEvent'

interface RouletteRuntimeState {
  winningNumber: number | null
  isSpinning: boolean
  selectedChip: number // Now stores multiplier (1, 5, 25, 100) instead of absolute value
  chipValues: number[]
  showingResult: boolean  // Renamed from showResult to avoid conflict
  lightChasePosition: number
  isDrawerOpen: boolean
  keepSelection: boolean
}

interface RouletteActions {
  showResult: (winningNumber: number) => Promise<RouletteResult>  // Pure function - required parameter
  playRandom: () => Promise<RouletteResult>
  simulateWin: (forcedNumber?: number) => Promise<RouletteResult>
  simulateLoss: (forcedNumber?: number) => Promise<RouletteResult>

  placeBet: (bet: RouletteBet) => void
  removeBet: (betIndex: number) => void
  clearAllBets: () => void
  setSelectedChip: (chipValue: number) => void

  setDrawerOpen: (isOpen: boolean) => void
  setLightChasePosition: (position: number) => void
  resetForNewRound: () => void
  startResetting: () => void
  validateEntry: () => { isValid: boolean; errors: Record<string, string> }
  resetGameSpecificState: (state: any) => void
}

export const useRouletteGameStore = createGameStore<
  RouletteParameters,
  RouletteResult,
  RouletteEntry,
  RouletteRuntimeState,
  RouletteActions
>(
  'roulette',
  DEFAULT_ROULETTE_PARAMETERS,

  (set, get) => ({
    winningNumber: null,
    isSpinning: false,
    selectedChip: 1,
    chipValues: [1, 5, 25, 100],
    showingResult: false,  // Renamed property
    lightChasePosition: 0,
    isDrawerOpen: true,
    keepSelection: true,

    // Pure animation function - just shows the given result
    async showResult(winningNumber: number) {
      const { parameters, entry } = get()

      set((state: any) => {
        state.isSpinning = true
        state.gameState = 'PLAYING'
        state.showingResult = false  // Use renamed property
        state.isDrawerOpen = false
        state.winningNumber = winningNumber
        state.submittedEntry = { ...entry }
      })

      // Ensure entry.side is an array before passing to createRouletteResult
      const bets = Array.isArray(entry.side) ? entry.side : []
      const result = createRouletteResult(
        parameters,
        bets, // placedBets are now in entry.side
        entry.entryAmount,
        entry.entryCount,
        winningNumber
      )

      setTimeout(() => {
        set((state: any) => {
          state.lastResult = result
          state.winningNumber = result.winningNumber
          state.isSpinning = false
          state.showingResult = true  // Use renamed property
          state.gameState = 'SHOWING_RESULT'
        })

        // Update wallet balance and auto-reset after win animation
        entryEvent.pub('updateBalance')
        setTimeout(() => {
          get().startResetting()
        }, parameters.resetDuration || 2000)
      }, parameters.spinDuration || 5000)

      return result
    },

    // Play with random winning number
    async playRandom() {
      const { validateEntry } = get()

      // Validate before submission
      const validation = validateEntry()
      if (!validation.isValid) {
        // Get the first error message from validation
        const firstError = validation.errors.bets || 
                          validation.errors.entryAmount || 
                          validation.errors.entryCount || 
                          'Invalid entry data'
        throw new Error(firstError)
      }

      const winningNumber = generateWinningNumber()
      return get().showResult(winningNumber)
    },

    async simulateWin(forcedNumber?: number) {
      const { entry, showResult } = get()

      if (entry.side.length === 0) {
        throw new Error('No bets placed')
      }

      // Find a number that would win based on placed bets
      let winningNumber = forcedNumber
      if (winningNumber === undefined) {
        // Pick the first number from the first bet
        const firstBet = entry.side[0]
        winningNumber = firstBet.numbers[0]
      }

      return showResult(winningNumber)
    },

    async simulateLoss(forcedNumber?: number) {
      const { entry, showResult } = get()

      if (entry.side.length === 0) {
        throw new Error('No bets placed')
      }

      // Find a number that would lose based on placed bets
      let winningNumber = forcedNumber
      if (winningNumber === undefined) {
        // Find a number not covered by any bet
        const coveredNumbers = new Set<number>()
        entry.side.forEach((bet: { numbers: any[] }) => {
          bet.numbers.forEach((num: number) => coveredNumbers.add(num))
        })

        // Find an uncovered number
        for (let i = 0; i <= 36; i++) {
          if (!coveredNumbers.has(i)) {
            winningNumber = i
            break
          }
        }

        // If all numbers are covered (unlikely), just use 0
        if (winningNumber === undefined) {
          winningNumber = 0
        }
      }

      return showResult(winningNumber)
    },

    placeBet(bet: RouletteBet) {
      const { entry, setEntry } = get()
      // Ensure entry.side is an array
      const currentBets = Array.isArray(entry.side) ? entry.side : []

      // Check if a bet already exists at this position
      const existingBetIndex = currentBets.findIndex(
        (existingBet: { position: string }) => existingBet.position === bet.position
      )

      if (existingBetIndex >= 0) {
        // Stack the chip - add to the existing bet amount
        const newBets = [...currentBets]
        newBets[existingBetIndex] = {
          ...newBets[existingBetIndex],
          amount: newBets[existingBetIndex].amount + bet.amount,
        }
        setEntry({ side: newBets })
      } else {
        // New position - add as a new bet
        const newBets = [...currentBets, bet]
        setEntry({ side: newBets })
      }
    },

    removeBet(betIndex: number) {
      const { entry, setEntry } = get()
      // Ensure entry.side is an array
      const currentBets = Array.isArray(entry.side) ? entry.side : []
      // Remove the entire bet from that position
      const newBets = currentBets.filter((_: any, index: number) => index !== betIndex)
      setEntry({ side: newBets })
    },

    clearAllBets() {
      const { setEntry } = get()
      setEntry({ side: [] })
    },

    setSelectedChip(chipMultiplier: number) {
      set((state: any) => {
        state.selectedChip = chipMultiplier
      })
    },

    setDrawerOpen(isOpen: boolean) {
      set((state: any) => {
        state.isDrawerOpen = isOpen
      })
    },

    setLightChasePosition(position: number) {
      set((state: any) => {
        state.lightChasePosition = position
      })
    },

    resetForNewRound() {
      const { keepSelection, reset } = get()

      set((state: any) => {
        // Keep winningNumber visible during reset animation, clear it after
        state.showingResult = false  // Use renamed property
        state.gameState = 'IDLE'
        state.isDrawerOpen = true
        state.lightChasePosition = 0
        // Clear winning number after a short delay to allow reset animation
        setTimeout(() => {
          useRouletteGameStore.setState((state: any) => {
            state.winningNumber = null
          })
        }, 100)
      })

      // Clear bets for new round only if keepSelection is false
      if (!keepSelection) {
        get().clearAllBets()
      }
      
      // Call the base reset to properly reset submit button and other base state
      reset()
    },

    startResetting() {
      const { parameters } = get()

      set((state: any) => {
        state.gameState = 'RESETTING'
      })

      setTimeout(() => {
        get().resetForNewRound()
      }, parameters.resetDuration || 2000)
    },

    validateEntry: () => {
      const { entry } = get()
      const errors: Record<string, string> = {}

      if (entry.entryAmount < 1) {
        errors.entryAmount = 'Entry amount must be at least 1'
      }

      if (entry.entryCount < 1) {
        errors.entryCount = 'Entry count must be at least 1'
      }

      // Ensure entry.side is an array
      const bets = Array.isArray(entry.side) ? entry.side : []

      if (bets.length === 0) {
        errors.bets = 'Must place at least one bet'
      }

      // In Roulette, players can place any number of chips
      // The entry amount represents their bankroll, not a bet limit per spin
      // So we don't need to validate total bet amount against entry amount

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      }
    },

    resetGameSpecificState: (state: any) => {
      state.winningNumber = null
      state.isSpinning = false
      state.showingResult = false  // Use renamed property
      state.lightChasePosition = 0
      state.isDrawerOpen = true
      // Ensure entry.side remains an array on reset
      if (!Array.isArray(state.entry.side)) {
        state.entry.side = []
      }
    },
  }),

  DEFAULT_ROULETTE_ENTRY
)

// Override setDemoMode to clear bets when switching modes (Roulette-specific behavior)
const originalSetDemoMode = useRouletteGameStore.getState().setDemoMode
useRouletteGameStore.setState({
  setDemoMode: (isDemoMode: boolean) => {
    // Call the original setDemoMode
    originalSetDemoMode(isDemoMode)
    
    // Clear the bets when switching modes (Roulette-specific)
    useRouletteGameStore.setState((state) => ({
      entry: {
        ...state.entry,
        side: []
      }
    }))
  }
})
