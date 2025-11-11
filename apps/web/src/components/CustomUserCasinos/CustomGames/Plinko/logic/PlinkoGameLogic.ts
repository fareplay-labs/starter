// @ts-nocheck
import { type PlinkoResult, type PlinkoParameters } from '../types'
import { PlinkoProbabilitiesAndMultipliers } from '@/components/CustomUserCasinos/lib/crypto/plinko'

/**
 * Pure game logic functions for Plinko game
 */

/**
 * Generates a random ball path through the plinko board
 */
export const generateBallPath = (rowCount: number, _randomSeed?: number): number[] => {
  const path: number[] = []
  let position = Math.floor(rowCount / 2) // Start near center

  for (let row = 0; row < rowCount; row++) {
    // Simulate left/right bounces (-1 = left, 1 = right)
    const bounce = Math.random() < 0.5 ? -1 : 1
    position = Math.max(0, Math.min(rowCount, position + bounce))
    path.push(position)
  }

  return path
}

/**
 * Gets the final bucket position from a ball path
 */
export const getBucketFromPath = (path: number[]): number => {
  // Clamp to prevent out-of-bounds access
  const lastPosition = path[path.length - 1]
  return Math.max(0, Math.min(path.length, lastPosition))
}

/**
 * Gets multiplier for a specific bucket position
 */
export const getMultiplierForBucket = (
  riskLevel: number,
  rowCount: number,
  bucketIndex: number
): number => {
  try {
    const multiplierBigint =
      PlinkoProbabilitiesAndMultipliers.getMultiplierForRiskLevelRowCountAndPosition(
        riskLevel,
        rowCount,
        bucketIndex
      )
    // Convert bigint to number by dividing by 10^18 (standard precision)
    return Number(multiplierBigint) / 1e18
  } catch (error) {
    console.warn('Error getting multiplier, using fallback:', error)
    // Fallback multiplier calculation
    const center = Math.floor(rowCount / 2)
    const distance = Math.abs(bucketIndex - center)
    const maxDistance = Math.floor(rowCount / 2)
    const multiplier = 0.1 + (distance / maxDistance) * (riskLevel + 1) * 2
    return Math.round(multiplier * 100) / 100
  }
}

/**
 * Generates a path that leads to a specific bucket with realistic bouncing
 */
export const generatePathToBucket = (rowCount: number, targetBucket: number): number[] => {
  const path: number[] = []

  // Clamp target bucket to valid range
  targetBucket = Math.max(0, Math.min(rowCount, targetBucket))

  // Start at center of top
  let currentPosition = Math.floor(rowCount / 2)

  for (let row = 0; row < rowCount; row++) {
    // Calculate how many rows we have left to reach target
    const remainingRows = rowCount - row - 1

    if (remainingRows === 0) {
      // Last row - must hit target exactly
      path.push(targetBucket)
    } else {
      // Calculate ideal direction to target
      const distanceToTarget = targetBucket - currentPosition
      const idealDirection =
        distanceToTarget > 0 ? 1
        : distanceToTarget < 0 ? -1
        : 0

      // Add some randomness but bias toward target
      let actualDirection: number
      if (Math.abs(distanceToTarget) <= remainingRows) {
        // We're close enough - can afford some randomness
        actualDirection =
          Math.random() < 0.7 ? idealDirection
          : Math.random() < 0.5 ? -1
          : 1
      } else {
        // We need to move toward target more aggressively
        actualDirection = idealDirection
      }

      // Ensure we don't go out of bounds for this row
      const maxPosition = row + 2 // Each row has (row + 3) pegs, so max index is row + 2
      const newPosition = Math.max(0, Math.min(maxPosition, currentPosition + actualDirection))

      path.push(newPosition)
      currentPosition = newPosition
    }
  }

  return path
}

/**
 * Generates ball paths for a guaranteed win scenario with better targeting
 */
export const generateWinningBallPaths = (
  rowCount: number,
  ballCount: number,
  riskLevel: number
): number[][] => {
  const paths: number[][] = []

  // Get all possible multipliers to find the best ones
  const multipliers: { bucket: number; multiplier: number }[] = []
  for (let bucket = 0; bucket <= rowCount; bucket++) {
    const multiplier = getMultiplierForBucket(riskLevel, rowCount, bucket)
    multipliers.push({ bucket, multiplier })
  }

  // Sort by multiplier (highest first)
  multipliers.sort((a, b) => b.multiplier - a.multiplier)

  // Target the highest multiplier buckets for wins
  const winningBuckets = multipliers.slice(0, Math.max(1, Math.floor(multipliers.length / 3)))

  for (let i = 0; i < ballCount; i++) {
    // Pick a random winning bucket
    const targetBucket = winningBuckets[Math.floor(Math.random() * winningBuckets.length)].bucket
    const path = generatePathToBucket(rowCount, targetBucket)
    paths.push(path)
  }

  return paths
}

/**
 * Generates ball paths for a guaranteed loss scenario with better targeting
 */
export const generateLosingBallPaths = (
  rowCount: number,
  ballCount: number,
  riskLevel: number
): number[][] => {
  const paths: number[][] = []

  // Get all possible multipliers to find the worst ones
  const multipliers: { bucket: number; multiplier: number }[] = []
  for (let bucket = 0; bucket <= rowCount; bucket++) {
    const multiplier = getMultiplierForBucket(riskLevel, rowCount, bucket)
    multipliers.push({ bucket, multiplier })
  }

  // Sort by multiplier (lowest first)
  multipliers.sort((a, b) => a.multiplier - b.multiplier)

  // Target the lowest multiplier buckets for losses
  const losingBuckets = multipliers.slice(0, Math.max(1, Math.floor(multipliers.length / 2)))

  for (let i = 0; i < ballCount; i++) {
    // Pick a random losing bucket
    const targetBucket = losingBuckets[Math.floor(Math.random() * losingBuckets.length)].bucket
    const path = generatePathToBucket(rowCount, targetBucket)
    paths.push(path)
  }

  return paths
}

/**
 * Simulates a complete plinko game with spoofed outcomes
 */
export const simulatePlinkoGame = (
  parameters: PlinkoParameters,
  betAmount: number,
  forceOutcome?: 'win' | 'loss'
): PlinkoResult => {
  const { ballCount, rowCount, riskLevel } = parameters
  let ballPaths: number[][]

  // Generate paths based on forced outcome or random
  if (forceOutcome === 'win') {
    ballPaths = generateWinningBallPaths(rowCount, ballCount, riskLevel)
  } else if (forceOutcome === 'loss') {
    ballPaths = generateLosingBallPaths(rowCount, ballCount, riskLevel)
  } else {
    // Random paths
    ballPaths = Array.from({ length: ballCount }, () => generateBallPath(rowCount))
  }

  const finalPositions: number[] = []
  const multipliers: number[] = []

  // Calculate results for each ball
  for (const path of ballPaths) {
    const finalPos = getBucketFromPath(path)
    const multiplier = getMultiplierForBucket(riskLevel, rowCount, finalPos)

    finalPositions.push(finalPos)
    multipliers.push(multiplier)
  }

  // Calculate total results
  const totalMultiplier = multipliers.reduce((sum, mult) => sum + mult, 0) / ballCount
  const totalPayout = betAmount * multipliers.reduce((sum, mult) => sum + mult, 0)

  return {
    // Base game result properties
    timestamp: Date.now(),
    entryAmount: betAmount,
    numberOfEntries: ballCount,
    payout: totalPayout,
    isWin: totalPayout > betAmount,
    // Plinko-specific properties
    ballPaths,
    finalPositions,
    multipliers,
    totalMultiplier,
    rowCount,
    riskLevel,
    ballCount,
  }
}

/**
 * Validates game parameters
 */
export const validateGameParameters = (params: PlinkoParameters): boolean => {
  const { ballCount, rowCount, riskLevel } = params

  return (
    ballCount >= 1 &&
    ballCount <= 20 &&
    rowCount >= 8 &&
    rowCount <= 16 &&
    riskLevel >= 0 &&
    riskLevel <= 2
  )
}

/**
 * Gets all multipliers for a given risk level and row count
 */
export const getMultipliersForGame = (riskLevel: number, rowCount: number): number[] => {
  const multipliers: number[] = []
  for (let i = 0; i <= rowCount; i++) {
    multipliers.push(getMultiplierForBucket(riskLevel, rowCount, i))
  }
  return multipliers
}
