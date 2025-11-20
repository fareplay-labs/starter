// @ts-nocheck
import { createGameStore, validateBaseEntry } from '../shared/gameStoreFactory'
import { DEFAULT_CRASH_PARAMETERS, DEFAULT_CRASH_ENTRY, CRASH_GAME_CONSTANTS } from './types'
import {
  type CrashParameters,
  type CrashResult,
  type CrashEntry,
  type CrashAnimationState,
} from './types'
import { createCrashResult } from './logic/CrashGameLogic'
import {
  getMultiplierAtTime,
  getTimeAtMultiplier,
  getAcceleratedTimeProgress,
  getScreenTimeProgress,
} from './utils'
import { entryEvent } from '@/features/custom-casino/events/entryEvent'

interface CrashRuntimeState {
  currentMultiplier: number
  crashMultiplier: number | null
  animationState: CrashAnimationState
  isPlaying: boolean
  timeProgress: number // 0 to 1 representing time progression (linear)
  animationFrameId: number | null
}

interface CrashActions {
  showResult: (crashValue: number) => Promise<CrashResult>  // Required parameter - pure function
  playRandom: () => Promise<CrashResult>
  simulateWin: (targetMultiplier?: number) => Promise<CrashResult>
  simulateLoss: (targetMultiplier?: number) => Promise<CrashResult>
  animateCrashResult: (result: CrashResult) => void
  resetAnimation: () => void
  validateEntry: () => { isValid: boolean; errors: Record<string, string> }
  resetGameSpecificState: (state: any) => void
}

export const useCrashGameStore = createGameStore<
  CrashParameters,
  CrashResult,
  CrashEntry,
  CrashRuntimeState,
  CrashActions
>(
  'crash',
  DEFAULT_CRASH_PARAMETERS,

  // game-specific slice
  (set, get) => ({
    currentMultiplier: 0.0,
    crashMultiplier: null,
    animationState: 'idle',
    isPlaying: false,
    timeProgress: 0,
    animationFrameId: null,

    // Pure animation function - just shows the given result
    async showResult(crashValue: number) {
      const { parameters, entry, animationFrameId, animateCrashResult } = get()

      // Cancel any existing animation
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      // Create the result with provided crash value
      const result = createCrashResult(
        parameters,
        entry.entryAmount,
        entry.entryCount,
        entry.side.cashOutMultiplier,
        crashValue
      )

      // Store the result
      set((state: any) => {
        state.lastResult = result
        state.submittedEntry = { ...entry }
      })

      // Animate the result
      animateCrashResult(result)
      
      return result
    },

    // Play with random result
    async playRandom() {
      const randomCrash = 1 + Math.random() * 10 // Random between 1.0 and 11.0
      return get().showResult(randomCrash)
    },

    async simulateWin(targetMultiplier?: number) {
      const { entry, showResult } = get()
      const target = targetMultiplier ?? entry.side.cashOutMultiplier
      const winningCrash = target + Math.random() * 20 + 0.5 // Crash 0.5-20.5x after target
      return showResult(winningCrash)
    },

    async simulateLoss(targetMultiplier?: number) {
      const { entry, showResult } = get()
      const target = targetMultiplier ?? entry.side.cashOutMultiplier
      const losingCrash = Math.max(1.01, target - Math.random() * 0.5 - 0.1) // Crash 0.1-0.6x before target
      return showResult(losingCrash)
    },

    // Extracted animation logic - can be called from anywhere
    animateCrashResult(result: CrashResult) {
      const { parameters, entry } = get()

      // Set initial animation state
      set((state: any) => {
        state.crashMultiplier = result.crashMultiplier
        state.animationState = 'rising'
        state.isPlaying = true
        state.timeProgress = 0
        state.currentMultiplier = 0.0
        state.gameState = 'PLAYING'
      })

      // Animation configuration
      const baseDuration = (40 / (parameters.gameSpeed ?? 5)) * 1500
      const animationDuration = baseDuration
      const maxCurveMultiplier = 50.0
      let startTime: number | null = null

      const animateStep = (currentTime: number) => {
        if (!startTime) startTime = currentTime

        const elapsed = currentTime - startTime
        const timeProgress = Math.min(elapsed / animationDuration, 1)

        const acceleratedTime = getAcceleratedTimeProgress(timeProgress)
        const currentMultiplier = getMultiplierAtTime(acceleratedTime, maxCurveMultiplier, 1.2)

        set((s: any) => ({
          ...s,
          currentMultiplier: Math.min(currentMultiplier, result.crashMultiplier),
          timeProgress: getScreenTimeProgress(acceleratedTime),
        }))

        // Check for auto cash out at target multiplier
        if (currentMultiplier >= entry.side.cashOutMultiplier && result.cashedOut) {
          set((s: any) => {
            s.animationState = 'cashedOutContinuing'
          })
        }

        // Check if we've reached the crash point
        const acceleratedCrashTime = getTimeAtMultiplier(
          result.crashMultiplier,
          maxCurveMultiplier,
          1.2
        )

        if (acceleratedTime >= acceleratedCrashTime) {
          // Animation complete
          const currentState = get()
          const finalAnimationState =
            currentState.animationState === 'cashedOutContinuing' ? 'cashedOut' : 'crashed'

          set((s: any) => {
            s.currentMultiplier = result.crashMultiplier
            s.animationState = finalAnimationState
            s.isPlaying = false
            s.timeProgress = getScreenTimeProgress(acceleratedCrashTime)
            s.gameState = 'SHOWING_RESULT'
            s.animationFrameId = null
          })

          // Update wallet balance when animation completes
          entryEvent.pub('updateBalance')

        } else {
          const frameId = requestAnimationFrame(animateStep)
          set((s: any) => {
            s.animationFrameId = frameId
          })
        }
      }

      const initialFrameId = requestAnimationFrame(animateStep)
      set((s: any) => {
        s.animationFrameId = initialFrameId
      })
    },

    resetAnimation() {
      const { animationFrameId } = get()

      // Cancel any existing animation
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      // Call the base reset which publishes gameFinished event
      get().reset()
      
      // Also reset Crash-specific animation state
      set((state: any) => {
        state.currentMultiplier = 0.0
        state.crashMultiplier = null
        state.animationState = 'idle'
        state.timeProgress = 0
        state.animationFrameId = null
      })
    },

    validateEntry: () => {
      const { entry } = get()
      
      // Get base validation
      const baseValidation = validateBaseEntry(entry)
      const errors = { ...baseValidation.errors }

      if (
        entry.side.cashOutMultiplier < CRASH_GAME_CONSTANTS.cashOutMultiplier.min ||
        entry.side.cashOutMultiplier > CRASH_GAME_CONSTANTS.cashOutMultiplier.max
      ) {
        errors.cashOutMultiplier = `Cash out multiplier must be between ${CRASH_GAME_CONSTANTS.cashOutMultiplier.min} and ${CRASH_GAME_CONSTANTS.cashOutMultiplier.max}`
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      }
    },

    resetGameSpecificState: (state: any) => {
      state.currentMultiplier = 1.0
      state.crashMultiplier = null
      state.animationState = 'idle'
      state.isPlaying = false
      state.timeProgress = 0
    },
  }),

  DEFAULT_CRASH_ENTRY
)
