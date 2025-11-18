// @ts-nocheck
import { type GameHelperFunctions } from './types'

export const SLOTS_MAX_COUNT = 9

// @NOTE: Currently, we do not actually need any side info related to slots, as there is nothing user is doing that is relevant for defining qk or any extra logic it adds for backend's context
// @NOTE: I am adding this 'side' as number to potentially have more slots in future like, they can indicate that they are playing slots game 0, slots game 1, ... type of thing
// @NOTE: But, since we do not have such a thing yet, maybe this is not a good way to do it, so I wont even focus on this part
export const isValidSlotsSide = (side = 0) => {
  return side < 1
}

// @NOTE: For now, to have comparatively small qk length arrays, we are only allowing count to be 3
export const getMaxCountForSlots = (_side = 0) => {
  return SLOTS_MAX_COUNT
}

export const getSlotsPotentialProfitCoefficient = () => {
  return 0 //0.98
}

export const getSlotsMultiplierWithoutPPV = () => {
  return 0 //2
}

export const getSlotsMultiplierWithPPV = () => {
  return 0 //1.98
}

// @NOTE: https://en.wikipedia.org/wiki/Kelly_criterion
export const getSlotsKellyFraction = () => {
  return 0 //0.01530571818
}

export const slotsHelperFunctions: GameHelperFunctions = {
  isValidSide: isValidSlotsSide,
  getMaxCount: getMaxCountForSlots,
  getPotentialProfitCoefficient: getSlotsPotentialProfitCoefficient,
  getMultiplierWithoutPPV: getSlotsMultiplierWithoutPPV,
  getMultiplierWithPPV: getSlotsMultiplierWithPPV,
  getKellyFraction: getSlotsKellyFraction,
}
