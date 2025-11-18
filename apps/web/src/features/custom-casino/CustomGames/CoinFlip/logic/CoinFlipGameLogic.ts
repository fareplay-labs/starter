// @ts-nocheck
import { type CoinFlipParameters, type CoinFlipResult, type CoinSide } from '../types'
import { CoinFlipSelection } from '@/features/custom-casino/lib/crypto/coinFlip'

/**
 * Calculate the multiplier for coin flip game (always 2.0 for fair coin flip)
 */
export const calculateCoinFlipMultiplier = (): number => {
  return 2.0 // 50% chance = 2x multiplier
}

/**
 * Calculate the win chance for coin flip game (always 50%)
 */
export const calculateWinChance = (): number => {
  return 50.0 // 50% chance for heads or tails
}

/**
 * Simulate a coin flip result
 */
export const simulateCoinFlip = (): CoinSide => {
  return Math.random() < 0.5 ? CoinFlipSelection.Heads : CoinFlipSelection.Tails
}

/**
 * Create a coin flip result based on parameters and bet details
 */
export const createCoinFlipResult = (
  parameters: CoinFlipParameters,
  betAmount: number,
  numberOfEntries: number,
  playerChoice: CoinSide,
  overrideResult?: CoinSide
): CoinFlipResult => {
  const flipResult = overrideResult ?? simulateCoinFlip()
  const isWin = playerChoice === flipResult
  const multiplier = calculateCoinFlipMultiplier()

  const payout = isWin ? betAmount * multiplier * numberOfEntries : 0

  return {
    timestamp: Date.now(),
    entryAmount: betAmount,
    numberOfEntries,
    playerChoice,
    flipResult,
    isWin,
    multiplier,
    payout,
  }
}

/**
 * Validate a coin flip choice
 */
export const validateCoinChoice = (choice: number): choice is CoinSide => {
  return choice === CoinFlipSelection.Heads || choice === CoinFlipSelection.Tails
}

/**
 * Get the opposite side of a coin
 */
export const getOppositeSide = (side: CoinSide): CoinSide => {
  return side === CoinFlipSelection.Heads ? CoinFlipSelection.Tails : CoinFlipSelection.Heads
}

/**
 * Generate a winning result for simulation
 */
export const generateWinningResult = (
  parameters: CoinFlipParameters,
  betAmount: number,
  numberOfEntries: number,
  playerChoice: CoinSide
): CoinFlipResult => {
  return createCoinFlipResult(parameters, betAmount, numberOfEntries, playerChoice, playerChoice)
}

/**
 * Generate a losing result for simulation
 */
export const generateLosingResult = (
  parameters: CoinFlipParameters,
  betAmount: number,
  numberOfEntries: number,
  playerChoice: CoinSide
): CoinFlipResult => {
  const oppositeChoice = getOppositeSide(playerChoice)
  return createCoinFlipResult(parameters, betAmount, numberOfEntries, playerChoice, oppositeChoice)
}
