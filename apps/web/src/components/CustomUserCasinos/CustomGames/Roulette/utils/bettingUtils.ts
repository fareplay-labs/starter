// @ts-nocheck
import { type RouletteBet, type RouletteResult } from '../types'

export const formatEntryDescription = (bet: RouletteBet): string => {
  switch (bet.type) {
    case 'straight':
      return `Number ${bet.numbers[0]}`
    case 'split':
      return `Split ${bet.numbers.join('/')}`
    case 'street':
      return `Street ${bet.numbers[0]}-${bet.numbers[bet.numbers.length - 1]}`
    case 'corner':
      return `Corner ${bet.numbers.join('/')}`
    case 'line':
      return `Line ${bet.numbers[0]}-${bet.numbers[bet.numbers.length - 1]}`
    case 'dozen':
      const dozenNum = Math.ceil(bet.numbers[0] / 12)
      return `${dozenNum}${dozenNum === 1 ? 'st' : dozenNum === 2 ? 'nd' : 'rd'} Dozen`
    case 'column':
      const colNum = ((bet.numbers[0] - 1) % 3) + 1
      return `Column ${colNum}`
    case 'redBlack':
      // Check if any of the numbers are red to determine Red or Black
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
      const isRed = bet.numbers.some(num => redNumbers.includes(num))
      return isRed ? 'Red' : 'Black'
    case 'oddEven':
      // Check if the first number is odd or even
      const isOdd = bet.numbers[0] % 2 === 1
      return isOdd ? 'Odd' : 'Even'
    case 'highLow':
      // Check if the first number is in low (1-18) or high (19-36)
      const isLow = bet.numbers[0] <= 18
      return isLow ? 'Low (1-18)' : 'High (19-36)'
    case 'trio':
      return `Trio ${bet.numbers.join('/')}`
    default:
      return `${bet.type}: ${bet.numbers.join(',')}`
  }
}

export const isBetWinning = (
  bet: RouletteBet,
  gameState: string,
  lastResult?: RouletteResult
): boolean => {
  if (gameState !== 'SHOWING_RESULT' || !lastResult?.winningNumber) return false
  return bet.numbers.includes(lastResult.winningNumber)
}

export const calculateWinIntensity = (bet: RouletteBet): number => {
  const payout = bet.amount
  if (payout >= 500) return 5
  if (payout >= 200) return 4
  if (payout >= 100) return 3
  if (payout >= 50) return 2
  return 1
}

export const createBetKey = (bet: RouletteBet, index: number): string => {
  return `${bet.type}-${bet.numbers.join('-')}-${bet.amount}-${bet.position}-${index}`
}

export const calculateTotalBetAmount = (bets: RouletteBet[]): number => {
  return bets.reduce((total, bet) => total + bet.amount, 0)
}

export const generateChipValues = (baseAmount: number): number[] => {
  return [1, 5, 25, 100].map(multiplier => baseAmount * multiplier)
}

export const getIntensityColor = (intensity?: number, opacity = '4D') => {
  if (!intensity) return `#333333${opacity}`

  const colors = [
    '#4ade80', // green-400
    '#22c55e', // green-500
    '#16a34a', // green-600
    '#15803d', // green-700
    '#166534', // green-800
  ]

  return `${colors[Math.min(intensity - 1, colors.length - 1)]}${opacity}`
}
