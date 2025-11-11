// @ts-nocheck
import { DEFAULT_MAX_COUNT } from './constants'
import { qUnit } from '../vault/helpers'
import { type GameHelperFunctions } from './types'

const isValidDiceSide = (side = 0) => {
  return side >= 500 && side <= 9990
}

const getMaxCountForDice = (side = 0) => {
  const maxCountLimitingSide = Math.min(side, 10000 - side)
  let i = BigInt(DEFAULT_MAX_COUNT)
  for (; i >= 1n; i--) {
    const q = ((10000n - BigInt(maxCountLimitingSide)) * qUnit) / 10000n
    const minQ = q > qUnit - q ? qUnit - q : q
    if (minQ ** i / qUnit ** (i - 1n) > 0n) {
      break
    }
  }
  // when loop ends or breaks out, the i should be the max valid count for given prob
  return Number(i)
}

export const diceHelperFunctions: GameHelperFunctions<number> = {
  isValidSide: isValidDiceSide,
  getMaxCount: getMaxCountForDice,
}

export const getDiceMultiplierFromSide = (side = 0) => {
  return (10000 / (10000 - side)) * 0.99
}
