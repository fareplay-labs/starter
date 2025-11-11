// @ts-nocheck
/**
 * Dynamically formats a monetary value with appropriate decimal places
 * - Values >= 1: 2 decimal places
 * - Values >= 0.01: 3 decimal places  
 * - Values >= 0.001: 4 decimal places
 * - Values < 0.001: Up to 6 decimal places
 */
export const formatCardValue = (value: number): string => {
  if (value === 0) return '0.00'
  
  // Determine decimal places based on value size
  let decimals: number
  if (value >= 1) {
    decimals = 2
  } else if (value >= 0.01) {
    decimals = 3
  } else if (value >= 0.001) {
    decimals = 4
  } else {
    decimals = 6
  }
  
  // Format and remove trailing zeros
  const formatted = value.toFixed(decimals)
  
  // Remove unnecessary trailing zeros but keep at least 2 decimal places
  const trimmed = formatted.replace(/(\.\d{2})\d*?0+$/, '$1').replace(/\.?0+$/, '')
  
  // Ensure at least 2 decimal places
  if (!trimmed.includes('.')) {
    return trimmed + '.00'
  }
  const parts = trimmed.split('.')
  if (parts[1].length < 2) {
    return trimmed + '0'
  }
  
  return trimmed
}

/**
 * Get the number of decimal places to use for CountUp component
 */
export const getDecimalPlaces = (value: number): number => {
  if (value >= 1) return 2
  if (value >= 0.01) return 3
  if (value >= 0.001) return 4
  return 6
}