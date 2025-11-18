// @ts-nocheck
/**
 * Win detection utilities for 5-reel slots
 * Analyzes reel positions to determine wins, near-misses, and payouts
 */

import type { ResultAnalysis } from '../animations/strategies'
import type { SlotSymbol } from '../types'

export interface PaylinePattern {
  name: string
  positions: number[] // Row positions for each reel (0=top, 1=middle, 2=bottom)
}

export interface WinLineResult {
  lineNumber: number
  pattern: PaylinePattern
  symbols: SlotSymbol[]
  matchCount: number
  payout: number
}

export interface WinData {
  winningLines: WinLineResult[]
  totalPayout: number
  isWin: boolean
  isJackpot: boolean
  bestMatch: number // Highest number of matching symbols
}

/**
 * Standard 5-reel payline patterns
 * Currently using single payline (center) for simplicity
 */
export const PAYLINE_PATTERNS: PaylinePattern[] = [
  // Single center payline only
  { name: 'middle', positions: [1, 1, 1, 1, 1] },

  // Additional patterns commented out for potential future use:
  // { name: 'top', positions: [0, 0, 0, 0, 0] },
  // { name: 'bottom', positions: [2, 2, 2, 2, 2] },
  // { name: 'v-shape', positions: [0, 1, 2, 1, 0] },
  // { name: 'inverted-v', positions: [2, 1, 0, 1, 2] },
  // { name: 'diagonal-down', positions: [0, 1, 2, 2, 2] },
  // { name: 'diagonal-up', positions: [2, 1, 0, 0, 0] },
  // { name: 'zigzag', positions: [0, 2, 0, 2, 0] },
  // { name: 'zigzag-reverse', positions: [2, 0, 2, 0, 2] },
  // { name: 'w-shape', positions: [1, 0, 1, 2, 1] },
  // { name: 'm-shape', positions: [1, 2, 1, 0, 1] },
]

/**
 * Get payout for a symbol based on its index using the new 7-icon system
 * Higher index = higher payout tier
 * Default symbols: ['🍒', '🍋', '🍊', '🍇', '7️⃣', '⭐', '💎']
 */
function getPayoutByIndex(symbolIndex: number, matchCount: number): number {
  const basePayouts = [
    { 3: 0.5, 4: 0.75, 5: 1 },
    { 3: 0.75, 4: 1, 5: 1.5 },
    { 3: 1, 4: 1.5, 5: 2 },
    { 3: 1.5, 4: 2, 5: 3 },
    { 3: 2, 4: 3, 5: 6 },
    { 3: 3, 4: 6, 5: 10 },
    { 3: 6, 4: 10, 5: 20 },
  ]

  const payoutConfig = basePayouts[Math.min(symbolIndex, basePayouts.length - 1)]
  return payoutConfig[matchCount as keyof typeof payoutConfig] || 0
}

/**
 * Get symbol at position for a reel configuration
 */
function getSymbolAtPosition(
  reelPosition: number,
  rowPosition: number,
  symbols: SlotSymbol[],
  visibleRows = 3
): SlotSymbol {
  // Calculate actual symbol index accounting for visible window
  // reelPosition is the center symbol, adjust for top/bottom
  const adjustment = rowPosition - Math.floor(visibleRows / 2)
  const symbolIndex = (reelPosition + adjustment + symbols.length) % symbols.length
  return symbols[symbolIndex]
}


/**
 * Calculate payout for matching symbols
 */
function calculatePayout(_symbol: SlotSymbol, matchCount: number, symbolIndex: number): number {
  // Use index-based payout since we don't have IDs anymore
  // Higher index = higher payout (index 9 is jackpot)
  return getPayoutByIndex(symbolIndex, matchCount)
}

/**
 * Check all paylines for wins
 */
export function checkWinningLines(
  reelPositions: number[],
  symbols: SlotSymbol[],
  patterns: PaylinePattern[] = PAYLINE_PATTERNS
): WinData {
  const winningLines: WinLineResult[] = []
  let totalPayout = 0
  let bestMatch = 0

  // Check each payline pattern
  patterns.forEach((pattern, lineNumber) => {
    const lineSymbolIndices: number[] = []
    const lineSymbols: SlotSymbol[] = []

    // Get symbol indices and symbols along this payline
    pattern.positions.forEach((rowPos, reelIndex) => {
      if (reelIndex < reelPositions.length) {
        // Calculate actual symbol index accounting for visible window
        const adjustment = rowPos - Math.floor(3 / 2)
        const symbolIndex = (reelPositions[reelIndex] + adjustment + symbols.length) % symbols.length
        lineSymbolIndices.push(symbolIndex)
        lineSymbols.push(symbols[symbolIndex])
      }
    })

    // Check for matching symbol indices (not values)
    const { matches, count } = checkSymbolIndexMatch(lineSymbolIndices)

    if (matches && count >= 3) {
      // Use the actual index of the matching symbol for payout calculation
      const winningSymbolIndex = lineSymbolIndices[0]
      const payout = calculatePayout(lineSymbols[0], count, winningSymbolIndex)

      winningLines.push({
        lineNumber: lineNumber + 1, // 1-indexed for display
        pattern,
        symbols: lineSymbols.slice(0, count), // Only the matching symbols
        matchCount: count,
        payout,
      })

      totalPayout += payout
      bestMatch = Math.max(bestMatch, count)
    }
  })

  return {
    winningLines,
    totalPayout,
    isWin: totalPayout > 0,
    isJackpot: totalPayout >= 20, // 20x is jackpot (5x 💎 symbols)
    bestMatch,
  }
}

/**
 * Check if symbol indices match for a win
 */
function checkSymbolIndexMatch(symbolIndices: number[]): { matches: boolean; count: number } {
  if (symbolIndices.length === 0) return { matches: false, count: 0 }

  const firstIndex = symbolIndices[0]
  let matchCount = 1

  // Count consecutive matches from the start (using indices, not values)
  for (let i = 1; i < symbolIndices.length; i++) {
    if (symbolIndices[i] === firstIndex) {
      matchCount++
    } else {
      break // Stop at first non-match
    }
  }

  // Need at least 3 matches for a win
  return {
    matches: matchCount >= 3,
    count: matchCount,
  }
}

/**
 * Detect near-miss scenarios
 */
export function detectNearMiss(
  reelPositions: number[],
  symbols: SlotSymbol[],
  patterns: PaylinePattern[] = PAYLINE_PATTERNS
): { isNearMiss: boolean; nearMissReels: number[] } {
  const nearMissReels = new Set<number>()
  let hasNearMiss = false

  // Check each payline for near-misses
  patterns.forEach(pattern => {
    const lineSymbolIndices: number[] = []

    // Get symbol indices along this payline
    pattern.positions.forEach((rowPos, reelIndex) => {
      if (reelIndex < reelPositions.length) {
        // Calculate actual symbol index accounting for visible window
        const adjustment = rowPos - Math.floor(3 / 2)
        const symbolIndex = (reelPositions[reelIndex] + adjustment + symbols.length) % symbols.length
        lineSymbolIndices.push(symbolIndex)
      }
    })

    // Check for near-miss (4 matching with 1 different)
    if (lineSymbolIndices.length === 5) {
      const indexCounts = new Map<number, number>()
      lineSymbolIndices.forEach(index => {
        indexCounts.set(index, (indexCounts.get(index) || 0) + 1)
      })

      // Near-miss: one symbol index appears 4 times
      for (const [symbolIndex, count] of indexCounts) {
        if (count === 4) {
          hasNearMiss = true

          // Find which reel is the odd one out
          lineSymbolIndices.forEach((idx, reelIndex) => {
            if (idx !== symbolIndex) {
              nearMissReels.add(reelIndex)
            }
          })
        }
      }

      // Also check for "almost jackpot" - 4 of the last symbol (index 6 for 💎)
      const jackpotIndex = 6 // Highest tier symbol
      if (symbols.length > jackpotIndex && lineSymbolIndices.filter(idx => idx === jackpotIndex).length === 4) {
        hasNearMiss = true
        lineSymbolIndices.forEach((idx, reelIndex) => {
          if (idx !== jackpotIndex) {
            nearMissReels.add(reelIndex)
          }
        })
      }
    }
  })

  return {
    isNearMiss: hasNearMiss,
    nearMissReels: Array.from(nearMissReels),
  }
}

/**
 * Analyze complete result for strategy selection
 */
export function analyzeResult(reelPositions: number[], symbols: SlotSymbol[]): ResultAnalysis {
  // Check for wins
  const winData = checkWinningLines(reelPositions, symbols)

  // Check for near-misses
  const { isNearMiss, nearMissReels } = detectNearMiss(reelPositions, symbols)

  // Count matching symbol indices across all reels (for cascade effects)
  const centerIndices = reelPositions.map(pos => pos % symbols.length)
  
  const indexCounts = new Map<number, number>()
  centerIndices.forEach(index => {
    indexCounts.set(index, (indexCounts.get(index) || 0) + 1)
  })
  const maxMatching = Math.max(...indexCounts.values())

  return {
    isWin: winData.isWin,
    isJackpot: winData.isJackpot,
    isNearMiss,
    winMultiplier: winData.totalPayout,
    matchingSymbols: maxMatching,
    nearMissReels,
  }
}

/**
 * Generate random reel positions for testing
 */
export function generateRandomPositions(reelCount: number, symbolCount: number): number[] {
  const positions: number[] = []
  for (let i = 0; i < reelCount; i++) {
    positions.push(Math.floor(Math.random() * symbolCount))
  }
  return positions
}

/**
 * Generate positions for a guaranteed win (testing)
 */
export function generateWinningPositions(reelCount: number, symbolIndex = 0): number[] {
  // All reels show the same symbol (middle line win)
  return new Array(reelCount).fill(symbolIndex)
}

/**
 * Generate positions for a near-miss (testing)
 */
export function generateNearMissPositions(reelCount: number, symbolIndex = 0): number[] {
  const positions = new Array(reelCount).fill(symbolIndex)
  // Change the last reel to create near-miss
  positions[reelCount - 1] = (symbolIndex + 1) % 7
  return positions
}
