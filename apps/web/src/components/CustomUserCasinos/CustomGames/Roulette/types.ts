// @ts-nocheck
import {
  type BaseGameParameters,
  type BaseGameResult,
  type BaseGameEntry,
} from '@/components/CustomUserCasinos/CustomGames/shared/types'
import { SoundData } from '@/components/CustomUserCasinos/shared/types/sound.types'
import { AppGameName } from '@/chains/types'

/**
 * Roulette-specific game parameters that extend base game parameters
 */
export interface RouletteParameters extends BaseGameParameters {
  minBetAmount: number // Minimum bet amount (default 1)
  maxBetAmount: number // Maximum bet amount (default 1000)

  layoutType: RouletteLayoutType // Main layout type: spin, scroll, tiles

  textColor: string // Text color on tiles and UI
  rouletteColor1: string // Color for red numbers
  rouletteColor2: string // Color for black numbers
  neutralColor: string // Color for the 0 tile (green)

  spinDuration: number // Base animation duration in ms
  resetDuration: number // Duration to reset after win in ms (renamed from winAnimationDuration)

  wheelRadius?: number // Size of the wheel
  wheelAccentColor?: string // Color for wheel borders and accents
  wheelBackground?: string // Background inside the wheel (supports images, gradients, etc.)

  scrollSpeed?: number // Initial scroll velocity
  decelerationRate?: number // How quickly scroll slows down
  neighborOpacity?: number // Opacity of side numbers (0-1)
  visibleNeighbors?: number // How many neighbors to show (1-3)
  numberSize?: number // Size of displayed numbers

  tileSize?: number // Individual tile dimensions
  tileSpacing?: number // Gap between tiles
  tileBorderRadius?: number // Border radius for tiles
  tileBorderHighlightColor?: string // Color for active tile borders
  animationPattern?: RouletteTilesAnimationPattern // Animation pattern for tiles

  layoutStyle?: RouletteSpinLayoutStyle // @deprecated: use spinLayoutStyle instead
  tileColor?: string // @deprecated: will use computed colors
  tileHoverColor?: string // @deprecated: will use computed colors
  winningTileColor?: string // @deprecated: will use computed colors
  accentColor?: string // @deprecated: will use rouletteColor1
  winAnimationDuration?: number // @deprecated: use resetDuration

  chipColors: string[] // Colors for different chip values
  showBettingHistory: boolean // Show recent betting history
  enableQuickBets: boolean // Enable quick bet buttons

  theme: RouletteTheme // Predefined theme
  customCSS: string // Custom CSS for advanced styling

  // Custom sound effects
  customSounds?: {
    spinStart?: SoundData
    spinResult?: SoundData
    spinReset?: SoundData
    tileHighlight?: SoundData
    tilesResult?: SoundData
  }
}

/**
 * Constraints for roulette game parameters
 */
export const ROULETTE_CONSTRAINTS = {
  minBetAmount: {
    min: 0,
    max: 100,
    step: 0.1,
  },
  maxBetAmount: {
    min: 10,
    max: 10000,
    step: 10,
  },
  spinDuration: {
    min: 2000,
    max: 10000,
    step: 500,
  },
  resetDuration: {
    min: 1000,
    max: 5000,
    step: 250,
  },
  winAnimationDuration: {
    min: 1000,
    max: 5000,
    step: 250,
  },
  wheelRadius: {
    min: 150,
    max: 300,
    step: 10,
  },
  lightChaseSpeed: {
    min: 50,
    max: 300,
    step: 25,
  },
  scrollSpeed: {
    min: 100,
    max: 1000,
    step: 50,
  },
  decelerationRate: {
    min: 0.1,
    max: 0.9,
    step: 0.05,
  },
  neighborOpacity: {
    min: 0.1,
    max: 0.8,
    step: 0.05,
  },
  visibleNeighbors: {
    min: 1,
    max: 3,
    step: 1,
  },
  numberSize: {
    min: 20,
    max: 100,
    step: 5,
  },
  tileSize: {
    min: 30,
    max: 60,
    step: 1,
  },
  tileSpacing: {
    min: 1,
    max: 30,
    step: 1,
  },
  tileBorderRadius: {
    min: 1,
    max: 50,
    step: 1,
  },
}

/**
 * Default parameters for the roulette game
 */
export const DEFAULT_ROULETTE_PARAMETERS: RouletteParameters = {
  icon: { url: '🎰' },
  description: 'Place your bets and watch the light chase reveal the winning number!',
  background: { url: '#0a0a0a' },

  minBetAmount: 0,
  maxBetAmount: 1000,
  layoutType: 'spin', // Default to spin layout

  textColor: '#ffffff',
  rouletteColor1: '#CC0000', // Red numbers
  rouletteColor2: '#000000', // Black numbers
  neutralColor: '#00ff00', // Green for the 0 tile

  spinDuration: 5000,
  resetDuration: 2000,

  wheelRadius: 180,
  wheelAccentColor: '#00ffff',
  wheelBackground: '#0a0a0a',

  scrollSpeed: 300,
  decelerationRate: 0.3,
  neighborOpacity: 0.4,
  visibleNeighbors: 2,
  numberSize: 60,

  tileSize: 35,
  tileSpacing: 4,
  tileBorderRadius: 8,
  tileBorderHighlightColor: '#00ffff',
  animationPattern: 'sequential',

  layoutStyle: 'circular',
  tileColor: '#2a2a2a',
  tileHoverColor: '#4a4a4a',
  winningTileColor: '#ffd700',
  accentColor: '#ffd700',
  winAnimationDuration: 2000,

  chipColors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
  showBettingHistory: true,
  enableQuickBets: true,

  theme: 'classic',
  customCSS: '',
}

/**
 * Result of a roulette game
 */
export interface RouletteResult extends BaseGameResult {
  winningNumber: number

  placedBets: RouletteBet[]

  winningBets: RouletteWinningBet[]

  totalPayout: number

  hasWin: boolean
}

/**
 * Individual bet placed on the roulette table
 */
export interface RouletteBet {
  type: RouletteBetType
  numbers: number[]
  amount: number
  position: string // Human-readable position description
}

/**
 * Winning bet with payout information
 */
export interface RouletteWinningBet extends RouletteBet {
  payout: number
  multiplier: number
}

/**
 * Roulette bet types matching the existing system
 */
export type RouletteBetType =
  | 'straight' // Single number
  | 'split' // Two adjacent numbers
  | 'street' // Three numbers in a row
  | 'corner' // Four numbers in a square
  | 'line' // Six numbers (two rows)
  | 'column' // Column bet
  | 'dozen' // 1st, 2nd, or 3rd dozen
  | 'redBlack' // Red or black
  | 'oddEven' // Odd or even
  | 'highLow' // 1-18 or 19-36
  | 'trio' // 0, 1, 2 or 0, 2, 3

/**
 * Configuration for the roulette game
 */
export const ROULETTE_GAME_INFO = {
  type: AppGameName.Roulette,
  name: 'Roulette',
  icon: '🎰',
  description: 'Digital roulette with customizable layouts and stunning light-chase animations',
}

export type RouletteLayoutType = 'spin' | 'scroll' | 'tiles'
export type RouletteSpinLayoutStyle = 'circular' | 'grid' | 'spiral' | 'linear'
export type RouletteTilesAnimationPattern = 'sequential' | 'random' | 'waterfall'
export type RouletteTheme = 'classic' | 'neon' | 'minimal' | 'casino' | 'futuristic' | 'custom'

export type RouletteLayoutStyle = RouletteSpinLayoutStyle

export interface RouletteSceneProps {
  parameters: RouletteParameters
  winningNumber: number | null
  isSpinning: boolean
  placedBets: RouletteBet[]
  gameState: string
  onSpinComplete: (winningNumber: number) => void
  onBetPlaced: (bet: RouletteBet) => void
}

/**
 * Props for layout-specific components
 */
export interface RouletteLayoutProps {
  parameters: RouletteParameters
  winningNumber: number | null
  isSpinning: boolean
  gameState: string
  onSpinComplete?: (number: number) => void
}

/**
 * Position interface for betting overlay
 */
export interface BetPosition {
  type: RouletteBetType
  numbers: number[]
  value?: string // For red/black, odd/even, high/low bets
}

/**
 * Entry data for Roulette game
 */
export interface RouletteEntry extends BaseGameEntry {
  side: RouletteBet[] // Array of bets placed
}

export const DEFAULT_ROULETTE_ENTRY: RouletteEntry = {
  entryAmount: 100, // Default bankroll amount
  entryCount: 1,
  side: [], // Start with no bets
}
