// @ts-nocheck
export * from './typechain'

export type GameHelperFunctions<T = number> = {
  isValidSide: (side: T) => boolean
  getMaxCount: (side: T) => number
  getPotentialProfitCoefficient?: (side: T) => number
  getMultiplierWithoutPPV?: (side: T) => number
  getMultiplierWithPPV?: (side: T) => number
  getKellyFraction?: (side: T) => number
}
