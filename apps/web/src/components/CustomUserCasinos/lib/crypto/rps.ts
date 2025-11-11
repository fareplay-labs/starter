// @ts-nocheck
import { DEFAULT_MAX_COUNT } from './constants'
import { type GameHelperFunctions } from './types'

export enum RPSSelection {
  Rock = 0,
  Paper = 1,
  Scissors = 2,
  Random = 3,
}

const isValidRPSSide = (side = 0) => {
  return side >= 0 && side <= 2
}

const getMaxCountForRPS = (_side = 0) => {
  return DEFAULT_MAX_COUNT
}

export const rpsHelperFunctions: GameHelperFunctions<number> = {
  isValidSide: isValidRPSSide,
  getMaxCount: getMaxCountForRPS,
} as const
