// @ts-nocheck
import { type TradingParametersWithoutBetAmount } from '@/components/CustomUserCasinos/CustomGames/CryptoLaunch/Legacy/GameConfig'
import { type GameHelperFunctions } from './types'
interface ICryptoLaunchQKBuildParameters {
  seed: string // @NOTE: Allows us to reproduce the random ks on the server side to validate that user is not sending custom k values but rather k values created according to this func's rules
  kDecimals?: number // @NOTE: If we are making use of USDC or some other low decimal token, k values having more precision does not help, it only causes the ev to increase and does not have an actual payout effect for the user, so to make sure that user has the most q, we are building ks with given decimals, therefore supporting any decimal token
  qkLen?: number // @NOTE: Starting by using the `firstHighBounds2sExponent`, this func goes and creates `qkLen` amount of different k values in ranges of different ranges defined by low and high bounds
  firstHighBounds2sExponent?: number // @NOTE: This determines the first high bound for the range of the first k element. It is basically the max k value that can be get for the first element
  firstLowBoundShouldBeZero?: boolean // @NOTE: Lets say you want the first high bound to be '2', you might want the first low bound to be either directly 0 or the value that is the previous value for 2's exponent.
  targetEVString?: string
}

export interface ICryptoLaunchSide {
  qkBuildParameters: ICryptoLaunchQKBuildParameters
  tradingParameters: TradingParametersWithoutBetAmount
}

/**
 * Type guard to check if a value is a 256-bit hex string (with optional "0x" prefix and whitespace).
 * @param value - The value to check
 * @param [strict=false] - If true, requires "0x" prefix to be present
 * @returns `true` if the value is a valid 256-bit hex string
 */
function is256BitHexString(value: unknown, strict = true): value is string {
  if (typeof value !== 'string') return false

  // Process the string
  const processed = value
    .trim() // Always trim whitespace
    .replace(/^0x/i, '') // Remove "0x" prefix if present
    .replace(/\s+/g, '') // Remove all internal whitespace

  // Validate structure
  const isValid =
    processed.length === 64 && // 64 hex chars = 256 bits
    /^[0-9a-f]+$/i.test(processed) // Valid hex characters

  // If strict mode, check that original string had "0x" prefix
  if (strict) {
    return isValid && /^0x/i.test(value.trim())
  }

  return isValid
}

export const cryptoLaunchHelperFunctions: GameHelperFunctions<ICryptoLaunchSide> = {
  // used
  isValidSide: function (side: ICryptoLaunchSide): boolean {
    return is256BitHexString(side?.qkBuildParameters?.seed)
    // @TODO: Validate trading params as well
  },
  // used
  getMaxCount: function (_side: ICryptoLaunchSide): number {
    return 1
  },
}
