// @ts-nocheck
// Crash's side will be really similar to Dice
// It will only represent the cashoutMultiplier, in this case if user wants to cashout at x2.00 it has to provide 200 to represent that. So, it will be a number with 2 decimal precision as an integer

import { unit } from '../vault/helpers'
import { DEFAULT_MAX_COUNT } from './constants'
import { type GameHelperFunctions } from './types'

// We consider a side valid as long as it has at least x1.00 cashout multiplier
const isValidCrashSide = (side: number) => {
  return side > 100 && side <= 50000
}

const getMaxCountForCrash = (side: number) => {
  let i = BigInt(DEFAULT_MAX_COUNT)
  for (; i >= 1n; i--) {
    const q = (((99n * unit) / 100n) * unit) / ((BigInt(side) * unit) / 100n)
    const minQ = q > unit - q ? unit - q : q
    if (minQ ** i / unit ** (i - 1n) > 0n) {
      break
    }
  }
  // when loop ends or breaks out, the i should be the max valid count for given prob
  return Number(i)
}

export const crashHelperFunctions: GameHelperFunctions<number> = {
  isValidSide: isValidCrashSide,
  getMaxCount: getMaxCountForCrash,
}
