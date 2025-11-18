// @ts-nocheck
import { createGameStore, validateBaseEntry } from '../shared/gameStoreFactory'
import { DEFAULT_DICE_PARAMETERS, DEFAULT_DICE_ENTRY } from './types'
import { type DiceParameters, type DiceResult, type DiceEntry } from './types'
import { createDiceResult } from './logic/DiceGameLogic'

interface DiceRuntimeState {
  rolledNumber: number | null
  isRolling: boolean
}

interface DiceActions {
  showResult: (rollValue: number) => Promise<DiceResult>  // Required parameter - pure function
  playRandom: () => Promise<DiceResult>
  simulateWin: () => Promise<DiceResult>
  simulateLoss: () => Promise<DiceResult>
  validateEntry: () => { isValid: boolean; errors: Record<string, string> }
  resetGameSpecificState: (state: any) => void
}

export const useDiceGameStore = createGameStore<
  DiceParameters,
  DiceResult,
  DiceEntry,
  DiceRuntimeState,
  DiceActions
>(
  'dice',
  DEFAULT_DICE_PARAMETERS,
  
  // game-specific slice
  (set, get) => ({
    rolledNumber: null,
    isRolling: false,


    // Pure animation function - just shows the given result
    async showResult(rollValue: number) {
      const { parameters, entry } = get()

      // Set playing state
      set((state: any) => {
        state.isRolling = true
        state.submittedEntry = { ...entry }
        state.gameState = 'PLAYING'
      })

      // Create result with the provided roll value
      const result = createDiceResult(
        parameters, 
        entry.entryAmount, 
        entry.entryCount, 
        rollValue,
        entry.side
      )

      set((state: any) => {
        state.lastResult = result
        state.rolledNumber = result.rolledNumber
        // Stay in PLAYING state while animation runs
        // The animation completion will trigger reset
      })

      return result
    },

    // Play with random result
    async playRandom() {
      const randomRoll = Math.floor(Math.random() * 101) // 0-100
      return get().showResult(randomRoll)
    },

    async simulateWin() {
      const { entry, showResult } = get()
      const target = entry.side
      const winningRoll = target + 1 + Math.floor(Math.random() * (100 - target - 1)) // Random winning roll
      return showResult(winningRoll)
    },

    async simulateLoss() {
      const { entry, showResult } = get()
      const target = entry.side
      const losingRoll = Math.floor(Math.random() * (target + 1)) // Random losing roll
      return showResult(losingRoll)
    },

    validateEntry: () => {
      const { entry } = get()
      
      // Get base validation
      const baseValidation = validateBaseEntry(entry)
      const errors = { ...baseValidation.errors }
      
      // Add Dice-specific validation
      // Note: side is stored as 0-99.9 but validated as 5-99.9 to match blockchain requirements
      if (entry.side < 5 || entry.side > 99.9) {
        errors.side = 'Target must be between 5 and 99.9'
      }
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      }
    },

    resetGameSpecificState: (state: any) => {
      state.isRolling = false
      state.rolledNumber = null
    },
  }),
  
  DEFAULT_DICE_ENTRY
)