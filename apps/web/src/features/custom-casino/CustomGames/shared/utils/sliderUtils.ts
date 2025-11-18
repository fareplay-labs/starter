// @ts-nocheck
/**
 * Calculate the step value for a slider based on the maximum value
 * Matches the legacy implementation's step zones
 */
export function calculateSliderStep(maxValue: number): number {
  if (maxValue <= 1) {
    return 0.01
  } else if (maxValue < 5) {
    return 0.1
  } else if (maxValue < 25) {
    return 0.25
  } else if (maxValue < 50) {
    return 0.5
  } else if (maxValue < 100) {
    return 1
  } else if (maxValue < 250) {
    return 5
  } else {
    return 10
  }
}

/**
 * Get dynamic max value based on user's balance
 * This should be used instead of hardcoded max values
 */
export function getMaxBetAmount(balance: number): number {
  // Match the legacy implementation's buffering logic
  return balance > 1 ? Math.floor(balance) : balance
}