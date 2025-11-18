// @ts-nocheck
import { DEFAULT_MAX_COUNT } from './constants'
import { type GameHelperFunctions } from './types'

export enum CoinFlipSelection {
  Heads = 0,
  Tails = 1,
}

export const isValidCoinFlipSide = (side = 0) => {
  return side === 0 || side === 1
}

const getMaxCountForCoinFlip = (side = 0) => {
  return DEFAULT_MAX_COUNT
}

export const coinFlipHelperFunctions: GameHelperFunctions<number> = {
  isValidSide: isValidCoinFlipSide,
  getMaxCount: getMaxCountForCoinFlip,
} as const
