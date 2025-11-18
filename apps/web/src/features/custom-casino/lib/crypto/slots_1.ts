// @ts-nocheck
import { type GameHelperFunctions } from './types'

const SLOTS_1_MAX_COUNT = 10

const isValidSlots_1Side = (side = 0) => {
  return side < 1
}

const getMaxCountForSlots_1 = () => {
  return SLOTS_1_MAX_COUNT
}

export const slots_1HelperFunctions: GameHelperFunctions = {
  isValidSide: isValidSlots_1Side,
  getMaxCount: getMaxCountForSlots_1,
}
