// @ts-nocheck
import {
  type RouletteParameters,
  type RouletteResult,
  type RouletteBet,
  type RouletteWinningBet,
} from '../types'
import { RED_NUMBERS } from '../utils/spinUtils'

/**
 * Payout multipliers for different bet types in European Roulette
 */
const PAYOUT_MULTIPLIERS = {
  straight: 35, // Single number
  split: 17, // Two numbers
  street: 11, // Three numbers
  corner: 8, // Four numbers
  line: 5, // Six numbers
  column: 2, // Column
  dozen: 2, // Dozen
  redBlack: 1, // Red/Black
  oddEven: 1, // Odd/Even
  highLow: 1, // High/Low
  trio: 11, // 0, 1, 2 or 0, 2, 3
}

/**
 * Check if a number is red
 */
export const isRedNumber = (number: number): boolean => {
  return RED_NUMBERS.includes(number)
}

/**
 * Check if a number is black
 */
export const isBlackNumber = (number: number): boolean => {
  return number !== 0 && !RED_NUMBERS.includes(number)
}

/**
 * Check if a bet wins for a given winning number
 */
export const checkBetWin = (bet: RouletteBet, winningNumber: number): boolean => {
  switch (bet.type) {
    case 'straight':
      return bet.numbers.includes(winningNumber)

    case 'split':
      return bet.numbers.includes(winningNumber)

    case 'street':
      return bet.numbers.includes(winningNumber)

    case 'corner':
      return bet.numbers.includes(winningNumber)

    case 'line':
      return bet.numbers.includes(winningNumber)

    case 'column':
      if (winningNumber === 0) return false
      return bet.numbers.includes(winningNumber)

    case 'dozen':
      if (winningNumber === 0) return false
      return bet.numbers.includes(winningNumber)

    case 'redBlack':
      if (winningNumber === 0) return false
      const isRed = isRedNumber(winningNumber)
      return (bet.position === 'red' && isRed) || (bet.position === 'black' && !isRed)

    case 'oddEven':
      if (winningNumber === 0) return false
      const isOdd = winningNumber % 2 === 1
      return (bet.position === 'odd' && isOdd) || (bet.position === 'even' && !isOdd)

    case 'highLow':
      if (winningNumber === 0) return false
      const isHigh = winningNumber >= 19
      return (bet.position === 'high' && isHigh) || (bet.position === 'low' && !isHigh)

    case 'trio':
      return bet.numbers.includes(winningNumber)

    default:
      return false
  }
}

/**
 * Calculate payout for a winning bet
 */
export const calculatePayout = (bet: RouletteBet): number => {
  const multiplier = PAYOUT_MULTIPLIERS[bet.type]
  return bet.amount * multiplier
}

/**
 * Generate a random winning number (0-36)
 */
export const generateWinningNumber = (): number => {
  return Math.floor(Math.random() * 37) // 0-36 inclusive
}

/**
 * Create a roulette game result
 */
export const createRouletteResult = (
  parameters: RouletteParameters,
  placedBets: RouletteBet[],
  entryAmount: number,
  numberOfEntries: number,
  forcedWinningNumber?: number
): RouletteResult => {
  const winningNumber = forcedWinningNumber ?? generateWinningNumber()

  const winningBets: RouletteWinningBet[] = []
  let totalPayout = 0

  for (const bet of placedBets) {
    if (checkBetWin(bet, winningNumber)) {
      const payout = calculatePayout(bet)
      const multiplier = PAYOUT_MULTIPLIERS[bet.type]

      winningBets.push({
        ...bet,
        payout,
        multiplier,
      })

      totalPayout += payout
    }
  }

  const hasWin = winningBets.length > 0

  return {
    timestamp: Date.now(),
    entryAmount,
    numberOfEntries,
    payout: totalPayout,
    isWin: hasWin,
    winningNumber,
    placedBets,
    winningBets,
    totalPayout,
    hasWin,
  }
}

/**
 * Helper function to create bet objects for common bet types
 */
export const createBet = (
  type: RouletteBet['type'],
  numbers: number[],
  amount: number,
  position?: string
): RouletteBet => {
  return {
    type,
    numbers,
    amount,
    position: position || `${type}-${numbers.join('-')}`,
  }
}

/**
 * Get numbers for column bets
 */
export const getColumnNumbers = (column: 1 | 2 | 3): number[] => {
  const numbers: number[] = []
  for (let i = column; i <= 36; i += 3) {
    numbers.push(i)
  }
  return numbers
}

/**
 * Get numbers for dozen bets
 */
export const getDozenNumbers = (dozen: 1 | 2 | 3): number[] => {
  const start = (dozen - 1) * 12 + 1
  const end = dozen * 12
  const numbers: number[] = []
  for (let i = start; i <= end; i++) {
    numbers.push(i)
  }
  return numbers
}

/**
 * Get numbers for red/black bets
 */
export const getRedBlackNumbers = (color: 'red' | 'black'): number[] => {
  if (color === 'red') {
    return RED_NUMBERS
  } else {
    return Array.from({ length: 36 }, (_, i) => i + 1).filter(n => !RED_NUMBERS.includes(n))
  }
}

/**
 * Get numbers for odd/even bets
 */
export const getOddEvenNumbers = (type: 'odd' | 'even'): number[] => {
  const numbers: number[] = []
  for (let i = 1; i <= 36; i++) {
    if ((type === 'odd' && i % 2 === 1) || (type === 'even' && i % 2 === 0)) {
      numbers.push(i)
    }
  }
  return numbers
}

/**
 * Get numbers for high/low bets
 */
export const getHighLowNumbers = (type: 'high' | 'low'): number[] => {
  if (type === 'low') {
    return Array.from({ length: 18 }, (_, i) => i + 1)
  } else {
    return Array.from({ length: 18 }, (_, i) => i + 19)
  }
}
