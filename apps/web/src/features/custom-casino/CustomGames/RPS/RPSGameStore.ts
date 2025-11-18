// @ts-nocheck
import { createGameStore, validateBaseEntry } from '../shared/gameStoreFactory'
import {
  type RPSGameParameters,
  type RPSGameResult,
  type RPSChoice,
  type RPSEntry,
  DEFAULT_RPS_PARAMETERS,
  DEFAULT_RPS_ENTRY,
} from './types'
import { createRPSResult, generateWinningResult, generateLosingResult } from './logic/RPSGameLogic'
import { type BaseSlice, type FareGameState } from '../shared/types'
import { type StoreApi } from 'zustand'
import { entryEvent } from '@/features/custom-casino/events/entryEvent'

// Game-specific runtime state
interface RPSRuntimeState {
  playerChoice: RPSChoice | null
  computerChoice: RPSChoice | null
  isPlaying: boolean
}

// Game-specific actions
interface RPSActions {
  setPlayerChoice: (choice: RPSChoice) => void
  showResult: (computerChoice: RPSChoice) => Promise<RPSGameResult>  // Pure function - required parameter
  playRandom: () => Promise<RPSGameResult>
  simulateWin: () => Promise<RPSGameResult>
  simulateLoss: () => Promise<RPSGameResult>
  validateEntry: () => { isValid: boolean; errors: Record<string, string> }
  resetGameSpecificState: (state: any) => void
  completeRound: () => void
}

type RPSStoreSlice = BaseSlice<RPSGameParameters, RPSGameResult, RPSEntry> &
  RPSRuntimeState &
  RPSActions

export const useRPSGameStore = createGameStore<
  RPSGameParameters,
  RPSGameResult,
  RPSEntry,
  RPSRuntimeState,
  RPSActions
>(
  'rps',
  DEFAULT_RPS_PARAMETERS,
  (set: StoreApi<RPSStoreSlice>['setState'], get: StoreApi<RPSStoreSlice>['getState']) => ({
    // Runtime defaults
    playerChoice: 'rock' as RPSChoice,
    computerChoice: null,
    isPlaying: false,

    setPlayerChoice: (choice: RPSChoice) => set({ playerChoice: choice, entry: { ...get().entry, side: choice } }),

    // Pure animation function - just shows the given result
    async showResult(computerChoice: RPSChoice) {
      const { parameters, entry } = get()
      const playerChoice = entry.side

      // Transition to PLAYING, preserve submitted entry for display
      set((state) => ({
        ...state,
        isPlaying: true,
        // Submit entry only if not already set (demo vs on-chain compatibility)
        submittedEntry: state.submittedEntry || { ...entry },
        gameState: 'PLAYING' as FareGameState
      }))

      // Create result with provided computer choice
      const result = createRPSResult(
        parameters,
        entry.entryAmount,
        entry.entryCount,
        playerChoice,
        computerChoice
      )

      // Update state with result; remain in PLAYING while animation runs
      set({
        computerChoice: result.computerChoice,
        lastResult: result,
        isPlaying: true,
      })

      return result
    },

    // Play with random computer choice
    async playRandom() {
      const choices: RPSChoice[] = ['rock', 'paper', 'scissors']
      const randomChoice = choices[Math.floor(Math.random() * choices.length)]
      return get().showResult(randomChoice)
    },

    async simulateWin() {
      const { entry, showResult } = get()
      const playerChoice = entry.side
      
      // Generate winning computer choice
      const winningChoice = generateWinningResult(
        get().parameters,
        entry.entryAmount,
        entry.entryCount,
        playerChoice
      ).computerChoice
      
      return showResult(winningChoice)
    },

    async simulateLoss() {
      const { entry, showResult } = get()
      const playerChoice = entry.side
      
      // Generate losing computer choice
      const losingChoice = generateLosingResult(
        get().parameters,
        entry.entryAmount,
        entry.entryCount,
        playerChoice
      ).computerChoice
      
      return showResult(losingChoice)
    },
    
    validateEntry: () => {
      const { entry } = get()
      
      // Get base validation
      const baseValidation = validateBaseEntry(entry)
      const errors = { ...baseValidation.errors }
      
      // Add RPS-specific validation
      if (!entry.side || !['rock', 'paper', 'scissors'].includes(entry.side)) {
        errors.side = 'Must choose rock, paper, or scissors'
      }
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      }
    },
    
    resetGameSpecificState: (state: any) => {
      state.isPlaying = false
      state.computerChoice = null
      state.playerChoice = state.entry?.side || 'rock'
    },

    /**
     * Called by the animation layer when result display is complete.
     * Publishes a single balance update and resets store after a brief delay.
     */
    completeRound: () => {
      // Update wallet balance once per round completion
      entryEvent.pub('updateBalance')

      // Allow result visibility before full reset
      set({ isPlaying: false })
      setTimeout(() => {
        get().reset()
      }, 2300)
    },
  }),
  DEFAULT_RPS_ENTRY
)
