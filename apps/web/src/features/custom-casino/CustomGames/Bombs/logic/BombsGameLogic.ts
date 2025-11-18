// @ts-nocheck
import { type BombsResult } from '../types'

/**
 * Pure game logic functions for Bombs game
 */

export interface RevealStep {
  tileIndex: number
  isBomb: boolean
  payout: number
  isGameEnd: boolean
}

/**
 * Generates random bomb positions, excluding specified tiles
 */
export const generateBombPositions = (bombCount: number, excludeTiles: number[] = []): number[] => {
  const allTiles = Array.from({ length: 25 }, (_, i) => i)
  const availableTiles = allTiles.filter(tile => !excludeTiles.includes(tile))

  if (bombCount > availableTiles.length) {
    throw new Error(
      `Cannot place ${bombCount} bombs when only ${availableTiles.length} tiles are available`
    )
  }

  const bombPositions = new Set<number>()
  while (bombPositions.size < bombCount) {
    const randomIndex = Math.floor(Math.random() * availableTiles.length)
    bombPositions.add(availableTiles[randomIndex])
  }

  return Array.from(bombPositions)
}

/**
 * Generates bomb positions for a guaranteed win scenario
 */
export const generateWinningBombPositions = (
  bombCount: number,
  selectedTiles: number[]
): number[] => {
  // For a win, bombs must be placed only outside selected tiles
  return generateBombPositions(bombCount, selectedTiles)
}

/**
 * Generates bomb positions for a guaranteed loss scenario
 */
export const generateLosingBombPositions = (
  bombCount: number,
  selectedTiles: number[]
): number[] => {
  if (selectedTiles.length === 0) {
    throw new Error('Cannot generate losing scenario with no selected tiles')
  }

  // Pick one selected tile at random to be a bomb
  const loseTileIndex = Math.floor(Math.random() * selectedTiles.length)
  const loseTile = selectedTiles[loseTileIndex]

  const otherBombs = generateBombPositions(bombCount - 1, [loseTile])
  return [loseTile, ...otherBombs]
}

/**
 * Calculates payout based on bet amount and bomb count
 */
export const calculatePayout = (betAmount: number, bombCount: number, isWin: boolean): number => {
  if (!isWin) return 0
  return betAmount * (1 + bombCount / 5)
}

/**
 * Determines if a tile selection results in hitting a bomb
 */
export const isTileSafe = (tileIndex: number, bombPositions: number[]): boolean => {
  return !bombPositions.includes(tileIndex)
}

/**
 * Determines the overall game outcome for a set of selected tiles
 */
export const determineGameOutcome = (
  selectedTiles: number[],
  bombPositions: number[]
): 'win' | 'loss' => {
  return selectedTiles.every(tile => isTileSafe(tile, bombPositions)) ? 'win' : 'loss'
}

/**
 * Generates a sequence of reveal steps for animation
 */
export const getRevealSequence = (
  selectedTiles: number[],
  bombPositions: number[],
  betAmount: number,
  bombCount: number
): RevealStep[] => {
  const steps: RevealStep[] = []
  let gameStillActive = true

  for (const tileIndex of selectedTiles) {
    const isBomb = !isTileSafe(tileIndex, bombPositions)
    const isWin = gameStillActive && !isBomb
    const payout = isWin ? calculatePayout(betAmount, bombCount, true) : 0
    const isGameEnd = isBomb

    steps.push({
      tileIndex,
      isBomb,
      payout,
      isGameEnd,
    })

    if (isGameEnd) {
      gameStillActive = false
    }
  }

  return steps
}

/**
 * Creates a complete game result
 */
export const createGameResult = (
  selectedTiles: number[],
  bombPositions: number[],
  betAmount: number,
  bombCount: number
): BombsResult => {
  const outcome = determineGameOutcome(selectedTiles, bombPositions)
  const payout = outcome === 'win' ? calculatePayout(betAmount, bombCount, true) : 0

  return {
    timestamp: Date.now(),
    entryAmount: betAmount,
    numberOfEntries: selectedTiles.length,
    payout,
    isWin: outcome === 'win',
    numberOfBombs: bombCount,
    revealedCells: selectedTiles,
    bombCells: bombPositions,
  }
}

/**
 * Validates bomb count within game constraints
 */
export const validateBombCount = (bombCount: number, minBombs = 1, maxBombs = 24): number => {
  return Math.min(Math.max(bombCount, minBombs), maxBombs)
}

/**
 * Calculates win probability using hypergeometric distribution
 * Returns percentage chance (0-100) that all selected tiles are safe
 */
export const calculateWinChance = (bombCount: number, selectedTiles: number[]): string => {
  const selectedCount = selectedTiles.length
  
  if (selectedCount === 0) return '0.0'
  
  const totalTiles = 25
  const safeTiles = totalTiles - bombCount
  
  // If we're selecting more tiles than there are safe tiles, chance is 0
  if (selectedCount > safeTiles) return '0.0'
  
  // Calculate probability using successive multiplication
  // P = (safeTiles/totalTiles) × (safeTiles-1)/(totalTiles-1) × ... 
  let probability = 1
  for (let i = 0; i < selectedCount; i++) {
    probability *= (safeTiles - i) / (totalTiles - i)
  }
  
  return (probability * 100).toFixed(1)
}
