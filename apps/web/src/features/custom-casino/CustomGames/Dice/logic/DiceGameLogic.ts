// @ts-nocheck
import { type DiceResult, type DiceParameters } from '../types'

/**
 * Pure functions for dice game mechanics
 * Extracted from DiceGameStore to improve testability and reusability
 */

/**
 * Generate a dice roll result
 * @param maxNumber Maximum number on the dice (e.g., 100)
 * @param targetNumber Number player needs to roll over to win
 * @returns The rolled number (0 to maxNumber-1)
 */
export const generateDiceRoll = (maxNumber: number): number => {
  return Math.floor(Math.random() * maxNumber)
}

/**
 * Calculate the multiplier for a given target number
 * Formula: multiplier = (100 / (100 - target)) * 0.99 (1% house edge)
 * @param targetNumber The target number to beat
 * @returns The calculated multiplier
 */
export const calculateDiceMultiplier = (targetNumber: number): number => {
  const houseEdge = 0.01 // 1%
  return Number(((100 / (100 - targetNumber)) * (1 - houseEdge)).toFixed(2))
}

/**
 * Determine if a dice roll is a win or loss
 * @param rolledNumber The number that was rolled
 * @param targetNumber The number that needs to be beaten
 * @returns 'win' if rolled > target, 'loss' otherwise
 */
export const determineDiceOutcome = (
  rolledNumber: number,
  targetNumber: number
): 'win' | 'loss' => {
  return rolledNumber > targetNumber ? 'win' : 'loss'
}

/**
 * Get the animation sequence steps for a dice roll
 * @param finalNumber The final number to land on
 * @param animationSpeed Animation duration in milliseconds
 * @returns Array of animation steps
 */
export interface AnimationStep {
  value: number
  duration: number
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export const getDiceAnimationSequence = (
  finalNumber: number,
  animationSpeed = 1200
): AnimationStep[] => {
  const steps: AnimationStep[] = []
  const numSteps = Math.min(8, Math.max(3, animationSpeed / 200)) // 3-8 steps based on speed

  for (let i = 0; i < numSteps; i++) {
    const isLast = i === numSteps - 1
    const value = isLast ? finalNumber : Math.floor(Math.random() * 100)
    const duration = isLast ? animationSpeed * 0.3 : animationSpeed * 0.1
    const easing = isLast ? 'ease-out' : 'linear'

    steps.push({ value, duration, easing })
  }

  return steps
}

/**
 * Validate a dice roll result
 * @param rolledNumber The rolled number
 * @param maxNumber The maximum possible number
 * @returns true if valid, false otherwise
 */
export const validateDiceRoll = (rolledNumber: number, maxNumber: number): boolean => {
  return rolledNumber >= 0 && rolledNumber < maxNumber && Number.isInteger(rolledNumber)
}

/**
 * Create a complete dice game result
 * @param params Game parameters
 * @param betAmount The bet amount
 * @param numberOfEntries Number of entries
 * @param rolledNumber The rolled number (if not provided, will generate)
 * @param targetNumberOverride Override target number from entry (optional)
 * @returns Complete dice result object
 */
export const createDiceResult = (
  params: DiceParameters,
  betAmount: number,
  numberOfEntries: number,
  rolledNumber?: number,
  targetNumberOverride?: number
): DiceResult => {
  const { maxNumber } = params
  const targetNumber = targetNumberOverride ?? params.targetNumber
  const rolled = rolledNumber ?? generateDiceRoll(maxNumber)
  const isWin = determineDiceOutcome(rolled, targetNumber) === 'win'
  const multiplier = calculateDiceMultiplier(targetNumber)
  const payout = isWin ? betAmount * multiplier : 0

  return {
    timestamp: Date.now(),
    entryAmount: betAmount,
    numberOfEntries,
    payout,
    isWin,
    rolledNumber: rolled,
    targetNumber,
    multiplier,
  }
}

/**
 * Validate dice game parameters
 * @param params Parameters to validate
 * @returns Validation result with errors if any
 */
export interface DiceValidationResult {
  isValid: boolean
  errors: string[]
}

export const validateDiceParameters = (params: Partial<DiceParameters>): DiceValidationResult => {
  const errors: string[] = []

  if (params.targetNumber !== undefined) {
    if (params.targetNumber < 0 || params.targetNumber > 95) {
      errors.push('Target number must be between 0 and 95')
    }
  }

  if (params.maxNumber !== undefined) {
    if (params.maxNumber < 10 || params.maxNumber > 100) {
      errors.push('Max number must be between 10 and 100')
    }
  }

  if (params.diceSize !== undefined) {
    if (params.diceSize < 40 || params.diceSize > 200) {
      errors.push('Dice size must be between 40 and 200 pixels')
    }
  }

  if (params.animationSpeed !== undefined) {
    if (params.animationSpeed < 200 || params.animationSpeed > 2000) {
      errors.push('Animation speed must be between 200 and 2000 milliseconds')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
