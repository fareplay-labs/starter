// @ts-nocheck
import { parseUnits } from 'viem'

export const CRYPTO_LAUNCH_1_FIRST_HIGH_BOUND_2_EXPONENT = -1 // @NOTE: Ideally we would start with a range like [1/4, 1/2] and to do this, we would update this value to be -1. But this compilcates things when we are trying to get the q values, so to not include any k < 1, we are using 1 as a value for this variable for now
export const CRYPTO_LAUNCH_1_QK_LENGTH = 6
export const CRYPTO_LAUNCH_1_FIRST_LOW_BOUND_IS_ZERO = false
export const CRYPTO_LAUNCH_1_EV_STRING = String(parseUnits('0.99', 60))
export const CRYPTO_LAUNCH_1_K_DECIMALS = 2
