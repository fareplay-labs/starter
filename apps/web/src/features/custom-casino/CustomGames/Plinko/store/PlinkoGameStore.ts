// @ts-nocheck
import { createGameStore, validateBaseEntry } from '../../shared/gameStoreFactory'
import { getMultiplierForBucket, generatePathToBucket, generateBallPath } from '../logic/PlinkoGameLogic'
import {
  type PlinkoParameters,
  type PlinkoResult,
  type PlinkoEntry,
  type PlinkoBallState,
  DEFAULT_PLINKO_PARAMETERS,
  DEFAULT_PLINKO_ENTRY,
  PLINKO_CONSTRAINTS,
} from '../types'
import { ensureRowLoaded, getRandomAnimation } from '../runtime/animationManager'

// Game-specific runtime state
interface PlinkoRuntimeState {
  // Ball animation state
  droppedBalls: PlinkoBallState[]
  highlightedBuckets: number[]
  isDropping: boolean
}

// Game-specific actions
interface PlinkoActions {
  // Core game actions
  showResult: (bucketIndexes: number[]) => Promise<PlinkoResult>  // Pure function - required parameter
  playRandom: () => Promise<PlinkoResult>
  simulateWin: () => Promise<PlinkoResult>
  simulateLoss: () => Promise<PlinkoResult>
  testSpecificBucket: (targetBucket: number) => Promise<PlinkoResult>
  testSpecificAnimation: (
    animation: import('../simulation/types').BallAnimation
  ) => Promise<PlinkoResult>
  resetGame: () => void

  // Ball management
  highlightBucket: (bucketIndex: number) => void
  clearHighlights: () => void

  // Validation
  validateEntry: () => { isValid: boolean; errors: Record<string, string> }
  resetGameSpecificState: (state: any) => void
}

export const usePlinkoGameStore = createGameStore<
  PlinkoParameters,
  PlinkoResult,
  PlinkoEntry,
  PlinkoRuntimeState,
  PlinkoActions
>(
  'plinko',
  DEFAULT_PLINKO_PARAMETERS,

  // game-specific slice
  (set, get) => ({
    // Initial runtime state
    droppedBalls: [],
    highlightedBuckets: [],
    isDropping: false,

    // Pure animation function - just shows the given result
    async showResult(bucketIndexes: number[]): Promise<PlinkoResult> {
      const { entry } = get()
      const { ballCount, rowCount, riskLevel } = entry.side

      if (bucketIndexes.length !== ballCount) {
        throw new Error(`Expected ${ballCount} bucket indexes, got ${bucketIndexes.length}`)
      }

      set((state: any) => {
        state.isDropping = true
        state.gameState = 'PLAYING'
        state.lastResult = null
        state.error = undefined
        state.droppedBalls = []
        state.highlightedBuckets = []
        state.submittedEntry = { ...entry }
      })

      // Create ball states and result based on provided bucket indexes
      const ballPaths: number[][] = []
      const multipliers: number[] = []
      const allBalls: PlinkoBallState[] = []
      
      for (let i = 0; i < ballCount; i++) {
        const targetBucket = bucketIndexes[i]
        const path = generatePathToBucket(rowCount, targetBucket)
        const multiplier = getMultiplierForBucket(riskLevel, rowCount, targetBucket)
        
        ballPaths.push(path)
        multipliers.push(multiplier)
        
        const droppedBall: PlinkoBallState = {
          id: i + 1,
          finalPosition: targetBucket,
          multiplier,
          path,
          currentRow: 0,
          position: { x: 0, y: 0 },
          isAnimating: false,
        }
        
        allBalls.push(droppedBall)
      }
      
      const totalMultiplier = multipliers.reduce((sum, mult) => sum + mult, 0) / ballCount
      const totalPayout = entry.entryAmount * multipliers.reduce((sum, mult) => sum + mult, 0)
      
      const gameResult: PlinkoResult = {
        ballPaths,
        finalPositions: bucketIndexes,
        multipliers,
        totalMultiplier,
        rowCount,
        riskLevel,
        ballCount,
        timestamp: Date.now(),
        entryAmount: entry.entryAmount,
        numberOfEntries: entry.entryCount,
        payout: totalPayout,
        isWin: totalPayout > entry.entryAmount,
      }
      
      // Set all balls at once
      set((state: any) => {
        state.droppedBalls = allBalls
        state.lastResult = gameResult
        state.isDropping = false
        state.gameState = 'PLAYING'
      })
      
      return gameResult
    },
    
    // Play with random bucket positions
    async playRandom(): Promise<PlinkoResult> {
      const { entry, validateEntry } = get()
      
      // Validate before submission
      const validation = validateEntry()
      if (!validation.isValid) {
        throw new Error(
          validation.errors.ballCount || validation.errors.entryAmount || 'Invalid entry data'
        )
      }
      
      if (get().isDropping || get().gameState !== 'IDLE') {
        return get().lastResult!
      }
      
      const { ballCount, rowCount } = entry.side
      
      // Generate random bucket indexes for each ball
      const bucketIndexes: number[] = []
      for (let i = 0; i < ballCount; i++) {
        // Generate a random path and get its final bucket
        const randomPath = generateBallPath(rowCount)
        const finalBucket = randomPath[randomPath.length - 1]
        bucketIndexes.push(finalBucket)
      }
      
      return get().showResult(bucketIndexes)
    },

    async simulateWin(): Promise<PlinkoResult> {
      const { entry, showResult } = get()
      const { ballCount, rowCount, riskLevel } = entry.side
      
      if (get().isDropping || get().gameState !== 'IDLE') return get().lastResult!
      
      // Get all possible multipliers to find the best ones
      const multipliers: { bucket: number; multiplier: number }[] = []
      for (let bucket = 0; bucket <= rowCount; bucket++) {
        const multiplier = getMultiplierForBucket(riskLevel, rowCount, bucket)
        multipliers.push({ bucket, multiplier })
      }
      
      // Sort by multiplier (highest first) and take top third
      multipliers.sort((a, b) => b.multiplier - a.multiplier)
      const winningBuckets = multipliers.slice(0, Math.max(1, Math.floor(multipliers.length / 3)))
      
      // Generate bucket indexes for winning
      const bucketIndexes: number[] = []
      for (let i = 0; i < ballCount; i++) {
        const targetBucket = winningBuckets[Math.floor(Math.random() * winningBuckets.length)].bucket
        bucketIndexes.push(targetBucket)
      }
      
      return showResult(bucketIndexes)
    },

    async simulateLoss(): Promise<PlinkoResult> {
      const { entry, showResult } = get()
      const { ballCount, rowCount, riskLevel } = entry.side
      
      if (get().isDropping || get().gameState !== 'IDLE') return get().lastResult!
      
      // Get all possible multipliers to find the worst ones
      const multipliers: { bucket: number; multiplier: number }[] = []
      for (let bucket = 0; bucket <= rowCount; bucket++) {
        const multiplier = getMultiplierForBucket(riskLevel, rowCount, bucket)
        multipliers.push({ bucket, multiplier })
      }
      
      // Sort by multiplier (lowest first) and take bottom half
      multipliers.sort((a, b) => a.multiplier - b.multiplier)
      const losingBuckets = multipliers.slice(0, Math.max(1, Math.floor(multipliers.length / 2)))
      
      // Generate bucket indexes for losing
      const bucketIndexes: number[] = []
      for (let i = 0; i < ballCount; i++) {
        const targetBucket = losingBuckets[Math.floor(Math.random() * losingBuckets.length)].bucket
        bucketIndexes.push(targetBucket)
      }
      
      return showResult(bucketIndexes)
    },

    async testSpecificBucket(targetBucket: number): Promise<PlinkoResult> {
      const { entry } = get()

      if (get().isDropping || get().gameState !== 'IDLE') return get().lastResult!

      set((state: any) => {
        state.isDropping = true
        state.gameState = 'PLAYING'
        state.lastResult = null
        state.error = undefined
        state.droppedBalls = []
        state.highlightedBuckets = []
        state.submittedEntry = { ...entry }
      })

      try {
        const { rowCount, riskLevel } = entry.side

        // Try to get a deterministic animation from the library (random from bucket)
        await ensureRowLoaded(rowCount)
        const animation = getRandomAnimation(rowCount, targetBucket)

        // Create a single ball that targets the specific bucket
        const multiplier = getMultiplierForBucket(riskLevel, rowCount, targetBucket)
        const payout = entry.entryAmount * multiplier
        const profit = payout - entry.entryAmount

        const gameResult: PlinkoResult = {
          // Base game result properties
          payout,
          isWin: profit > 0,
          timestamp: Date.now(),
          entryAmount: entry.entryAmount,
          numberOfEntries: entry.entryCount,

          // Plinko-specific properties
          ballPaths: [[]],
          finalPositions: [targetBucket],
          multipliers: [multiplier],
          totalMultiplier: multiplier,
          rowCount,
          riskLevel,
          ballCount: 1,
        }

        // Create ball state for the deterministic test
        const testBall: PlinkoBallState = {
          id: 1,
          finalPosition: targetBucket,
          multiplier,
          path: [], // Empty path for deterministic animation
          currentRow: 0,
          position: { x: 0, y: 0 },
          isAnimating: true,
          // Add animation data if available
          animation: animation || undefined,
        }

        set((state: any) => {
          state.droppedBalls = [testBall]
          state.lastResult = gameResult
          state.isDropping = false
          state.gameState = 'PLAYING'
        })

        return gameResult
      } catch (error) {
        console.error('Error during specific bucket test:', error)
        set((state: any) => {
          state.error = error instanceof Error ? error.message : 'Unknown error occurred'
          state.isDropping = false
          state.gameState = 'IDLE'
        })
        throw error
      }
    },

    async testSpecificAnimation(
      animation: import('../simulation/types').BallAnimation
    ): Promise<PlinkoResult> {
      const { entry } = get()

      if (get().isDropping || get().gameState !== 'IDLE') return get().lastResult!

      set((state: any) => {
        state.isDropping = true
        state.gameState = 'PLAYING'
        state.lastResult = null
        state.error = undefined
        state.droppedBalls = []
        state.highlightedBuckets = []
        state.submittedEntry = { ...entry }
      })

      try {
        const { rowCount, riskLevel } = entry.side
        const targetBucket = animation.targetBucket

        // Create a single ball that targets the specific bucket
        const multiplier = getMultiplierForBucket(riskLevel, rowCount, targetBucket)
        const payout = entry.entryAmount * multiplier
        const profit = payout - entry.entryAmount

        const gameResult: PlinkoResult = {
          // Base game result properties
          payout,
          isWin: profit > 0,
          timestamp: Date.now(),
          entryAmount: entry.entryAmount,
          numberOfEntries: entry.entryCount,

          // Plinko-specific properties
          ballPaths: [[]],
          finalPositions: [targetBucket],
          multipliers: [multiplier],
          totalMultiplier: multiplier,
          rowCount,
          riskLevel,
          ballCount: 1,
        }

        // Create ball state for the specific animation
        const testBall: PlinkoBallState = {
          id: 1,
          finalPosition: targetBucket,
          multiplier,
          path: [], // Empty path for deterministic animation
          currentRow: 0,
          position: { x: 0, y: 0 },
          isAnimating: true,
          animation: animation,
        }

        set((state: any) => {
          state.droppedBalls = [testBall]
          state.lastResult = gameResult
          state.isDropping = false
          state.gameState = 'PLAYING'
        })

        return gameResult
      } catch (error) {
        console.error('Error during specific animation test:', error)
        set((state: any) => {
          state.error = error instanceof Error ? error.message : 'Unknown error occurred'
          state.isDropping = false
          state.gameState = 'IDLE'
        })
        throw error
      }
    },

    resetGame(): void {
      // Call the base reset which publishes gameFinished event
      get().reset()
      // Also reset Plinko-specific state
      set((state: any) => {
        state.droppedBalls = []
        state.highlightedBuckets = []
      })
    },

    highlightBucket(bucketIndex: number): void {
      // Add bucket to highlights array (allow concurrent highlights)
      set((state: any) => ({
        highlightedBuckets: [...state.highlightedBuckets, bucketIndex],
      }))

      // Remove only this bucket after 500 ms
      setTimeout(() => {
        set((state: any) => ({
          highlightedBuckets: state.highlightedBuckets.filter((idx: number) => idx !== bucketIndex),
        }))
      }, 500)
    },

    clearHighlights(): void {
      set({ highlightedBuckets: [] })
    },

    validateEntry: () => {
      const { entry } = get()
      
      // Get base validation
      const baseValidation = validateBaseEntry(entry)
      const errors = { ...baseValidation.errors }

      const { ballCount, rowCount, riskLevel } = entry.side

      if (
        ballCount < PLINKO_CONSTRAINTS.ballCount.min ||
        ballCount > PLINKO_CONSTRAINTS.ballCount.max
      ) {
        errors.ballCount = `Ball count must be between ${PLINKO_CONSTRAINTS.ballCount.min} and ${PLINKO_CONSTRAINTS.ballCount.max}`
      }

      if (
        rowCount < PLINKO_CONSTRAINTS.rowCount.min ||
        rowCount > PLINKO_CONSTRAINTS.rowCount.max
      ) {
        errors.rowCount = `Row count must be between ${PLINKO_CONSTRAINTS.rowCount.min} and ${PLINKO_CONSTRAINTS.rowCount.max}`
      }

      if (
        riskLevel < PLINKO_CONSTRAINTS.riskLevel.min ||
        riskLevel > PLINKO_CONSTRAINTS.riskLevel.max
      ) {
        errors.riskLevel = `Risk level must be between ${PLINKO_CONSTRAINTS.riskLevel.min} and ${PLINKO_CONSTRAINTS.riskLevel.max}`
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      }
    },

    resetGameSpecificState: (state: any) => {
      state.droppedBalls = []
      state.highlightedBuckets = []
      state.isDropping = false
    },
  }),

  DEFAULT_PLINKO_ENTRY
)

export default usePlinkoGameStore
