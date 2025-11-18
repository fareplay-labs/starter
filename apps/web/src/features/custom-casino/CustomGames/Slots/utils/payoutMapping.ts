// @ts-nocheck
/**
 * Payout mapping utility for 7-icon slots with progressive tier system
 * Maps blockchain payout values to specific reel outcomes
 */

export interface PayoutCombination {
  iconIndex: number // 0-6 (icon 1-7)
  matchCount: number // 3, 4, or 5
  multiplier: number // The payout multiplier for this combination
}

/**
 * Complete payout matrix for 7 icons
 * Each icon has 3 payout levels (3, 4, 5 matches)
 * Higher icon index = higher tier = better payouts
 * Icons: ['🍒', '🍋', '🍊', '🍇', '7️⃣', '⭐', '💎']
 */
export const PAYOUT_MATRIX: PayoutCombination[] = [
  // Icon 1 (index 0) - 🍒 - Lowest tier
  { iconIndex: 0, matchCount: 3, multiplier: 0.5 },
  { iconIndex: 0, matchCount: 4, multiplier: 0.75 },
  { iconIndex: 0, matchCount: 5, multiplier: 1 },

  // Icon 2 (index 1) - 🍋
  { iconIndex: 1, matchCount: 3, multiplier: 0.75 },
  { iconIndex: 1, matchCount: 4, multiplier: 1 },
  { iconIndex: 1, matchCount: 5, multiplier: 1.5 },

  // Icon 3 (index 2) - 🍊
  { iconIndex: 2, matchCount: 3, multiplier: 1 },
  { iconIndex: 2, matchCount: 4, multiplier: 1.5 },
  { iconIndex: 2, matchCount: 5, multiplier: 2 },

  // Icon 4 (index 3) - 🍇
  { iconIndex: 3, matchCount: 3, multiplier: 1.5 },
  { iconIndex: 3, matchCount: 4, multiplier: 2 },
  { iconIndex: 3, matchCount: 5, multiplier: 3 },

  // Icon 5 (index 4) - 7️⃣
  { iconIndex: 4, matchCount: 3, multiplier: 2 },
  { iconIndex: 4, matchCount: 4, multiplier: 3 },
  { iconIndex: 4, matchCount: 5, multiplier: 6 },

  // Icon 6 (index 5) - ⭐
  { iconIndex: 5, matchCount: 3, multiplier: 3 },
  { iconIndex: 5, matchCount: 4, multiplier: 6 },
  { iconIndex: 5, matchCount: 5, multiplier: 10 },

  // Icon 7 (index 6) - 💎 - Highest tier
  { iconIndex: 6, matchCount: 3, multiplier: 6 },
  { iconIndex: 6, matchCount: 4, multiplier: 10 },
  { iconIndex: 6, matchCount: 5, multiplier: 20 },
]

/**
 * Smart contract payout probabilities
 * Maps multipliers to their occurrence probability
 */
export const PAYOUT_PROBABILITIES = [
  { multiplier: 0, probability: 0.455 }, // 45.5% - total loss
  { multiplier: 0.5, probability: 0.1 }, // 10%
  { multiplier: 0.75, probability: 0.1 }, // 10%
  { multiplier: 1, probability: 0.05 }, // 5% - break even
  { multiplier: 1.5, probability: 0.12 }, // 12%
  { multiplier: 2, probability: 0.1 }, // 10%
  { multiplier: 3, probability: 0.04 }, // 4%
  { multiplier: 6, probability: 0.02 }, // 2%
  { multiplier: 10, probability: 0.0105 }, // 1.05%
  { multiplier: 20, probability: 0.0045 }, // 0.45%
]

/**
 * Get payout for a specific icon and match count
 */
export function getPayoutForCombination(iconIndex: number, matchCount: number): number {
  const combination = PAYOUT_MATRIX.find(
    c => c.iconIndex === iconIndex && c.matchCount === matchCount
  )
  return combination?.multiplier ?? 0
}

/**
 * Find all possible combinations for a given payout multiplier
 */
export function getCombinationsForPayout(targetMultiplier: number): PayoutCombination[] {
  return PAYOUT_MATRIX.filter(c => c.multiplier === targetMultiplier)
}

/**
 * Map a blockchain payout value to reel positions
 * Returns positions that will produce the desired payout
 */
export function mapPayoutToReelPositions(
  payoutMultiplier: number,
  seed: string,
  reelCount = 5
): number[] {
  // Handle total loss (no matches)
  if (payoutMultiplier === 0) {
    return generateLosingPositions(seed, reelCount)
  }

  // Find valid combinations for this payout
  const validCombinations = getCombinationsForPayout(payoutMultiplier)

  if (validCombinations.length === 0) {
    // Fallback to closest payout if exact match not found
    console.warn(`No exact match for payout ${payoutMultiplier}, using closest`)
    return generateLosingPositions(seed, reelCount)
  }

  // Use seed to deterministically select which combination to use
  const seedHash = hashString(seed)
  const selectedCombo = validCombinations[seedHash % validCombinations.length]

  // Generate positions for the selected combination
  return generateWinningPositions(
    selectedCombo.iconIndex,
    selectedCombo.matchCount,
    seed,
    reelCount
  )
}

/**
 * Generate positions that result in no winning combinations
 */
function generateLosingPositions(seed: string, reelCount: number): number[] {
  const positions: number[] = []
  let hash = hashString(seed)

  // Ensure no payline has 3+ matching symbols
  // Use a pattern that avoids matches: different symbol for each position
  for (let i = 0; i < reelCount; i++) {
    hash = Math.imul(hash ^ i, 0x01000193)
    // Use modulo 7 for our 7 icons, but offset each reel to avoid matches
    // Use Math.abs to ensure positive result
    positions.push(Math.abs(hash + i) % 7)
  }

  // Verify no accidental wins (3+ consecutive matches)
  const hasWin = checkForAccidentalWin(positions)
  if (hasWin) {
    // Adjust middle reel to break any accidental pattern
    positions[2] = (positions[2] + 3) % 7
  }

  return validatePositions(positions)
}

/**
 * Generate positions for a winning combination
 */
function generateWinningPositions(
  iconIndex: number,
  matchCount: number,
  seed: string,
  reelCount: number
): number[] {
  const positions: number[] = []
  let hash = hashString(seed)

  // First 'matchCount' reels show the winning icon
  for (let i = 0; i < matchCount; i++) {
    positions.push(iconIndex)
  }

  // Remaining reels show different icons
  for (let i = matchCount; i < reelCount; i++) {
    hash = Math.imul(hash ^ i, 0x01000193)
    // Use Math.abs to ensure positive number before modulo
    let otherIcon = Math.abs(hash) % 7
    // Ensure it's different from the winning icon
    if (otherIcon === iconIndex) {
      otherIcon = (otherIcon + 1 + Math.abs(hash % 6)) % 7
    }
    positions.push(otherIcon)
  }

  return validatePositions(positions)
}

/**
 * Check if positions accidentally create a win
 */
function checkForAccidentalWin(positions: number[]): boolean {
  if (positions.length < 3) return false

  // Check for 3+ consecutive matching symbols
  let consecutiveCount = 1
  const currentSymbol = positions[0]

  for (let i = 1; i < positions.length; i++) {
    if (positions[i] === currentSymbol) {
      consecutiveCount++
      if (consecutiveCount >= 3) {
        return true
      }
    } else {
      break // Stop at first non-match (left-to-right wins only)
    }
  }

  return false
}

/**
 * Simple string hash function for deterministic randomness
 */
function hashString(str: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return Math.abs(hash)
}

/**
 * Validate that all positions are within valid range
 */
function validatePositions(positions: number[], symbolCount: number = 7): number[] {
  return positions.map(pos => {
    if (pos < 0 || pos >= symbolCount) {
      console.error(`[Slots] Invalid position ${pos} detected, clamping to valid range`)
      return Math.max(0, Math.min(symbolCount - 1, Math.abs(pos) % symbolCount))
    }
    return pos
  })
}

/**
 * Get the closest valid payout multiplier for a given value
 */
export function getClosestValidPayout(value: number): number {
  const validPayouts = [0, 0.5, 0.75, 1, 1.5, 2, 3, 6, 10, 20]
  return validPayouts.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  )
}
