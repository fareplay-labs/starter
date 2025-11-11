// @ts-nocheck
export {
  generatePriceData,
  validatePriceDataParams,
  validateCryptoLaunchParameters,
  validateGameplayParameters,
  validateVisualParameters,
  scalePriceData,
  generateFallbackPriceData,
  calculateMultiplier,
  calculatePayout,
  determineWinCondition,
  createCryptoLaunchResult,
  determineCryptoOutcome,
  validateCryptoRoll,
} from './CryptoLaunchGameLogic'

export type { ValidationResult, ValidationResultWithSafeParams } from './CryptoLaunchGameLogic'
