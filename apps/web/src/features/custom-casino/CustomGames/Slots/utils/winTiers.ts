// @ts-nocheck
/**
 * Centralized win tier definitions and calculations for Slots game
 * Single source of truth for win classifications
 */

export type WinTier = 'small' | 'medium' | 'large' | 'mega'

/**
 * Win tier thresholds calibrated for new payout structure (0.5x to 20x)
 */
const WIN_TIER_THRESHOLDS = {
  mega: 20,   // 20x jackpot (5x 💎)
  large: 6,   // 6x-10x (high tier wins)
  medium: 2,  // 2x-3x (decent wins)
  small: 0,   // >0x (any win)
} as const

/**
 * Get win tier based on multiplier
 */
export function getWinTier(multiplier: number): WinTier | null {
  if (multiplier <= 0) return null
  if (multiplier >= WIN_TIER_THRESHOLDS.mega) return 'mega'
  if (multiplier >= WIN_TIER_THRESHOLDS.large) return 'large'
  if (multiplier >= WIN_TIER_THRESHOLDS.medium) return 'medium'
  return 'small'
}

/**
 * Calculate win tier from payout and bet amount
 */
export function calculateWinTier(payout: number, betAmount: number): WinTier | null {
  const multiplier = betAmount > 0 ? payout / betAmount : 0
  return getWinTier(multiplier)
}

/**
 * Get display label for win tier
 */
export function getWinLabel(tier: WinTier | null): string {
  switch (tier) {
    case 'mega':
      return 'MEGA WIN!'
    case 'large':
      return 'BIG WIN!'
    case 'medium':
      return 'Nice Win!'
    case 'small':
      return ''
    default:
      return ''
  }
}

/**
 * Get animation duration for win tier (in milliseconds)
 */
export function getWinAnimationDuration(tier: WinTier | null): number {
  switch (tier) {
    case 'mega':
      return 5000
    case 'large':
      return 3500
    case 'medium':
      return 2500
    case 'small':
      return 2000
    default:
      return 0
  }
}

/**
 * Check if this is a jackpot win
 */
export function isJackpotWin(multiplier: number): boolean {
  return multiplier >= WIN_TIER_THRESHOLDS.mega
}

/**
 * Export thresholds for components that need direct access
 */
export { WIN_TIER_THRESHOLDS }