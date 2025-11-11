// @ts-nocheck
import {
  type BaseGameParameters,
  type BaseGameResult,
  type BaseGameEntry,
} from '@/components/CustomUserCasinos/CustomGames/shared/types'
import { AppGameName } from '@/chains/types'
import { type SoundData } from '../../shared/types/sound.types'

/**
 * Crash-specific game parameters that extend base game parameters
 * These are visual/animation configurations that casino owners can customize
 */
export interface CrashParameters extends BaseGameParameters {
  // Visual parameters
  lineColor: string // Color of the crash line
  backgroundColor: string // Background color of the graph
  gridColor: string // Color of the grid lines
  gridTextColor: string // Color of grid labels and text
  textColor: string // Color of text elements
  crashColor: string // Color when crash occurs
  winColor: string // Color when player wins
  axesColor: string // Color of the main axes lines
  gameSpeed: number // Speed of the game (higher = faster/shorter duration)
  showGridlines: boolean // Whether to show grid lines
  showGridLabels: boolean // Whether to show grid labels
  showAxes: boolean // Whether to show axes
  showTargetLine: boolean // Whether to show the target cash out line
  lineThickness: number // Thickness of the crash line
  graphSize: number // Size of the graph (height in pixels, width scales proportionally)
  particleIntensity: number // Intensity of particle effects (1-10 scale)
  rocketAppearance: { url: string } | string // Rocket appearance (color, gradient, image, AI generated)
  rocketSize: number // Size of the rocket (pixels)
  rotateTowardsDirection: boolean

  // Text customization
  winText: string // Text displayed when player wins/cashes out
  lossText: string // Text displayed when game crashes

  // Rocket ending effects
  rocketEndingEffect: 'fade' | 'physics' // How rocket behaves when game ends

  // Custom sound effects
  customSounds?: {
    rocketLaunch?: SoundData
    cashOut?: SoundData
    crashExplosion?: SoundData
  }
}

/**
 * Constraints for crash game parameters
 */
export const CRASH_CONSTRAINTS = {
  gameSpeed: {
    min: 1,
    max: 10,
    step: 1,
  },
  lineThickness: {
    min: 1,
    max: 10,
    step: 1,
  },
  graphSize: {
    min: 250,
    max: 600,
    step: 10,
  },
  particleIntensity: {
    min: 0,
    max: 10,
    step: 1,
  },
  rocketSize: {
    min: 10,
    max: 34,
    step: 2,
  },
}

/**
 * Fixed game constants (not configurable)
 */
export const CRASH_GAME_CONSTANTS = {
  maxMultiplier: 10.0, // Maximum possible multiplier before guaranteed crash
  cashOutMultiplier: {
    // TODO: This needs updated to match the smart contract calculations
    min: 1.01,
    max: 100.0,
    step: 0.01,
    default: 2.0,
  },
}

/**
 * Default parameters for the crash game
 */
export const DEFAULT_CRASH_PARAMETERS: CrashParameters = {
  // Base game parameters
  icon: { url: '💥' },
  description: 'Watch the multiplier rise and cash out before it crashes!',
  background: { url: '#0a0a0a' },

  // Visual parameters
  lineColor: '#00ff88',
  backgroundColor: '#0a0a0a',
  gridColor: '#333333',
  gridTextColor: '#ffffff',
  textColor: '#ffffff',
  crashColor: '#ff4444',
  winColor: '#00ff88',
  axesColor: '#666666',
  gameSpeed: 5,
  showGridlines: true,
  showGridLabels: true,
  showAxes: true,
  showTargetLine: true,
  lineThickness: 3,
  graphSize: 500,
  particleIntensity: 5,
  rocketAppearance: { url: '#ffffff' },
  rocketSize: 24,
  rotateTowardsDirection: true,

  // Text customization
  winText: 'CASHED OUT!',
  lossText: 'CRASHED OUT!',

  // Rocket ending effects
  rocketEndingEffect: 'physics',
}

/**
 * Result of a crash game
 */
export interface CrashResult extends BaseGameResult {
  // The multiplier at which the game crashed
  crashMultiplier: number

  // The multiplier at which player cashed out (if they did)
  cashOutMultiplier: number | null

  // Whether the player cashed out before crash
  cashedOut: boolean

  // The actual payout multiplier achieved
  achievedMultiplier: number

  // Whether the game was won or lost
  isWin: boolean
}

/**
 * Configuration for the crash game
 */
export const CRASH_GAME_INFO = {
  type: AppGameName.Crash,
  name: 'Crash',
  icon: '💥',
  description: 'Watch the multiplier rise and cash out before it crashes!',
}

export type CrashAnimationState =
  | 'idle'
  | 'rising'
  | 'crashed'
  | 'cashedOut'
  | 'cashedOutContinuing'

export interface CrashSceneProps {
  width: number
  height: number
  lineColor: string
  backgroundColor: string
  gridColor: string
  gridTextColor: string
  textColor: string
  crashColor: string
  winColor: string
  axesColor: string
  lineThickness: number
  showGridlines: boolean
  showGridLabels: boolean
  showAxes: boolean
  showTargetLine: boolean
  gameSpeed: number
  currentMultiplier: number
  crashMultiplier: number | null
  cashOutMultiplier: number | null // Target cash out multiplier for drawing target line
  animationState: CrashAnimationState
  winText: string // Text displayed when player wins/cashes out
  lossText: string // Text displayed when game crashes
  particleIntensity: number // Intensity of particle effects (1-10 scale)
  rocketAppearance: { url: string } | string // Rocket appearance (color, gradient, image, AI generated)
  rocketSize: number // Size of the rocket (pixels)
  rotateTowardsDirection: boolean // Whether the rocket rotates to face its direction of travel
  rocketEndingEffect?: 'fade' | 'physics' // How rocket behaves when game ends
  scaleFactor: number // Scale factor based on graphSize (graphSize / 500)
}

/**
 * Entry data for Crash game
 */
export interface CrashEntry extends BaseGameEntry {
  side: {
    cashOutMultiplier: number // The multiplier at which to automatically cash out
  }
}

export const DEFAULT_CRASH_ENTRY: CrashEntry = {
  entryAmount: 0,
  entryCount: 1,
  side: {
    cashOutMultiplier: 2.0,
  },
}
