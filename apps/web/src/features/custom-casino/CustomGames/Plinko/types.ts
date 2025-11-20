// @ts-nocheck
import {
  type BaseGameParameters,
  type BaseGameResult,
  type BaseGameEntry,
} from '@/features/custom-casino/CustomGames/shared/types'
import { SoundData } from '@/features/custom-casino/shared/types/sound.types'
import { AppGameName } from '@/chains/types'

export type PlinkoAnimationPreset = 'realistic' | 'smooth' | 'bouncy' | 'quick'

/**
 * Plinko-specific game parameters that extend base game parameters
 */
export interface PlinkoParameters extends BaseGameParameters {
  // Core gameplay parameters
  rowCount: number // 8-16 rows
  riskLevel: number // 0=Low, 1=Medium, 2=High
  ballCount: number // 1-20 balls

  // Visual parameters
  boardColor: string
  ballColor: string
  pegColor: string
  bucketColor: string | { url: string }
  bucketOutlineColor: string
  multiplierColor: string

  // Animation parameters
  ballSpeed: number
  ballDropDelay: number // Time in milliseconds between ball drops
  animationPreset: PlinkoAnimationPreset
  ballTrail: boolean
  showBucketAnimations: boolean

  // Layout parameters
  gameSize?: number // 0.5-1.25, controls relative size in container (1.25 = fills game window)

  // Custom sound effects
  customSounds?: {
    ballDrop?: SoundData
    bucketLanding?: SoundData
  }
}

/**
 * Constraints for plinko game parameters
 */
export const PLINKO_CONSTRAINTS = {
  ballCount: {
    min: 1,
    max: 20,
    step: 1,
  },
  rowCount: {
    min: 8,
    max: 16,
    step: 1,
  },
  riskLevel: {
    min: 0,
    max: 2,
    step: 1,
  },

  ballSpeed: {
    min: 0.3,
    max: 2.0,
    step: 0.1,
  },
  ballDropDelay: {
    min: 10,
    max: 500,
    step: 10,
  },
  gameSize: {
    min: 0.5,
    max: 1.25,
    step: 0.05,
  },
}

/**
 * Default parameters for the plinko game
 */
export const DEFAULT_PLINKO_PARAMETERS: PlinkoParameters = {
  // Base game parameters
  icon: { url: '🎯' },
  description: 'Drop balls through pegs to win big!',
  background: { url: '#1a1a2e' },

  // Core gameplay parameters
  rowCount: 12,
  riskLevel: 0, // Low
  ballCount: 1,

  // Visual parameters
  boardColor: '#2d2d44',
  ballColor: '#ff6b6b',
  pegColor: '#ffffff',
  bucketColor: '#4B5563',
  bucketOutlineColor: '#ffffff',
  multiplierColor: '#ffffff',

  // Animation parameters
  ballSpeed: 1.0,
  ballDropDelay: 200, // 200ms delay between ball drops
  animationPreset: 'realistic',
  ballTrail: true,
  showBucketAnimations: true,

  // Layout parameters
  gameSize: 1.00,
}

/**
 * State of an individual ball during animation
 */
export interface PlinkoBallState {
  id: number
  path: number[]
  currentRow: number
  position: { x: number; y: number }
  isAnimating: boolean
  finalPosition: number
  multiplier: number
  animation?: import('./simulation/types').BallAnimation // Optional deterministic animation
}

/**
 * Result of a plinko game
 */
export interface PlinkoResult extends BaseGameResult {
  // Path taken by each ball [ballIndex][rowIndex] = position
  ballPaths: number[][]

  // Final bucket positions for each ball
  finalPositions: number[]

  // Multiplier for each ball
  multipliers: number[]

  // Combined average multiplier
  totalMultiplier: number

  // Game configuration used
  rowCount: number
  riskLevel: number
  ballCount: number
}

/**
 * Animation configuration for different presets
 */
export const ANIMATION_CONFIGS = {
  realistic: { gravity: 0.8, friction: 0.95, bounce: 0.7, duration: 1200 },
  smooth: { gravity: 0.6, friction: 0.98, bounce: 0.5, duration: 1000 },
  bouncy: { gravity: 0.7, friction: 0.92, bounce: 0.9, duration: 1400 },
  quick: { gravity: 1.2, friction: 0.99, bounce: 0.3, duration: 800 },
}

/**
 * Configuration for the plinko game
 */
export const PLINKO_GAME_INFO = {
  type: AppGameName.Plinko,
  name: 'Plinko',
  icon: '🎯',
  description: 'Drop balls through pegs to win big!',
}

/**
 * Entry data for Plinko game
 */
export interface PlinkoEntry extends BaseGameEntry {
  side: {
    rowCount: number
    riskLevel: number // 0=Low, 1=Medium, 2=High
    ballCount: number
  }
}

export const DEFAULT_PLINKO_ENTRY: PlinkoEntry = {
  entryAmount: 0,
  entryCount: 1,
  side: {
    rowCount: 12,
    riskLevel: 0, // Low
    ballCount: 1,
  },
}
