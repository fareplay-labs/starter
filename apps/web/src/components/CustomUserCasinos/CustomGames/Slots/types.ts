// @ts-nocheck
import {
  type BaseGameParameters,
  type BaseGameResult,
  type BaseGameEntry,
} from '@/components/CustomUserCasinos/CustomGames/shared/types'
import { AppGameName } from '@/chains/types'
import { type ImageData } from '@/components/CustomUserCasinos/config/PageConfig'
import { type SoundData } from '@/components/CustomUserCasinos/shared/types/sound.types'
import type { WinLineResult } from './utils/winDetection'

/**
 * Slot symbol type - can be emoji string or ImageData object
 */
export type SlotSymbol = string | ImageData

/**
 * Symbol count for payout combinations
 */
export interface SymbolCount {
  symbolId: string
  count: string
}

/**
 * Payout table entry defining winning combinations
 */
export interface PayoutTableEntry {
  payout: string
  combinations: SymbolCount[]
}

/**
 * Synthesizer configuration for dynamic sound generation
 */
export interface SynthConfig {
  // Click sounds configuration
  clickEnabled?: boolean // Enable click sounds during reel spin
  clickStyle?: 'classic' | 'modern' | 'minimal' // Style for reel click sounds
  clickPitch?: number // -1 to 1 (low to high)
  clickVolume?: number // 0 to 1 volume multiplier

  // Whirr sound configuration
  whirrEnabled?: boolean // Enable ambient whirr sound
  whirrPitch?: number // -1 to 1 (low to high)
  whirrVolume?: number // 0 to 1 volume multiplier
}

/**
 * Slots-specific game parameters that extend base game parameters
 */
export interface SlotsParameters extends BaseGameParameters {
  // Visual parameters - Colors
  reelBackground: string // Background inside each reel
  reelContainer: string // Background of the container holding all reels
  borderColor: string // Border color for container and reels
  paylineIndicator: string // Color of the center payline indicator
  winColor: string // Color for win indicators and effects

  // Slot symbols configuration
  slotsSymbols: SlotSymbol[] // Array of symbols (emojis or images)

  // Size controls
  iconSize: number // Size of icons within reels (0.7 to 2.0)
  gameScale: number // Overall scale of the game (0.7 to 1.4)

  // Custom sound effects
  customSounds?: {
    spinStart?: SoundData // Lever pull/spin start sound
    reelStop?: SoundData // Individual reel stop sound
    winSound?: SoundData // Base win celebration sound
    bigWin?: SoundData // Big win sound (5x-10x)
    megaWin?: SoundData // Mega win sound (10x+)
    coinDrop?: SoundData // Coin collection sound (plays multiple times)
  }

  // Synthesizer configuration
  synthConfig?: SynthConfig

  // Animation configuration (multiselect arrays)
  animationDirections?: string[] // Selected direction modes for random selection
  reelStopOrders?: string[] // Selected stop orders for random selection
  animationStrategies?: string[] // Selected strategies for random selection
}

/**
 * Constraints for slots game parameters
 */
export const SLOTS_CONSTRAINTS = {
  // No constraints needed for current parameters
}

/**
 * Default parameters for the slots game
 */
export const DEFAULT_SLOTS_PARAMETERS: SlotsParameters = {
  // Base game parameters
  icon: { url: '🎡' },
  description: 'Spin the reels and match symbols to win!',
  background: { url: '#1a1a2e' },

  // Slots-specific parameters - Colors
  reelBackground: '#0a0a1e',
  reelContainer: '#2c3e50',
  borderColor: '#1a1a2e',
  paylineIndicator: 'rgba(255, 215, 0, 0.3)',
  winColor: '#4ade80',

  // Default symbols - 7 icons with progressive tier system
  slotsSymbols: ['🍒', '🍋', '🍊', '🍇', '7️⃣', '⭐', '💎'],

  // Size controls
  iconSize: 1.0,
  gameScale: 1.0,

  // Synthesizer configuration
  synthConfig: {
    clickEnabled: true, // Default to on
    clickStyle: 'classic',
    clickPitch: 0,
    clickVolume: 0.5,
    whirrEnabled: false, // Default to off
    whirrPitch: 0.5, // Higher pitched for softer sound
    whirrVolume: 0.05, // Much quieter
  },

  // Animation configuration defaults
  animationDirections: ['forward', 'backward', 'random', 'alternating'],
  reelStopOrders: ['sequential', 'random'],
  animationStrategies: [
    'basicStandard',
    'turboStandard',
    'cascade',
    'nearMiss',
    'bigWin',
    'jackpot',
  ],
}

/**
 * Slots-specific entry structure
 */
export interface SlotsEntry extends BaseGameEntry {
  side: number // For slots, side represents the slot game variant (always 0 for now)
}

/**
 * Default entry for slots game
 */
export const DEFAULT_SLOTS_ENTRY: SlotsEntry = {
  entryAmount: 0, // Default to 0
  entryCount: 1,
  side: 0, // Always 0 for current implementation
}

/**
 * Result of a slots game
 */
export interface SlotsResult extends BaseGameResult {
  // The final reel positions (array of symbol indices for each reel)
  reelPositions: number[]

  // Winning line information
  winningLines: WinLineResult[]

  // Total payout multiplier
  multiplier: number

  // Whether this was a jackpot win
  isJackpot: boolean
}

/**
 * Configuration for the slots game
 */
export const SLOTS_GAME_INFO = {
  type: AppGameName.Slots_1,
  name: 'Slots',
  icon: '🎡',
  description: 'Spin the reels and match symbols to win!',
}

/**
 * Props for the slots scene component
 */
export interface SlotsSceneProps {
  parameters: SlotsParameters
  isSpinning: boolean
  reelPositions: number[]
  winningLines: WinLineResult[]
  onSpinComplete: () => void
  onReelStop: (reelIndex: number) => void
  // Optional shared sound fx controller from SlotsGame
  sfx?: {
    playSpinStart: () => void
    playReelStop: (reelIndex: number, totalReels: number) => void
    playClick: (volume?: number, pitch?: number) => void
    playWinSound: (multiplier: number, betAmount: number) => void
    playCoinsCollecting: (duration: number, intensity?: number) => void
    playError: () => void
    stopAllWinSounds: () => void
  }
}

/**
 * Internal state for slot machine animation
 */
export interface SlotMachineState {
  currentReelPositions: number[]
  isSpinning: boolean
  stoppedReels: boolean[]
  highlightedLines: number[]
  showWinAnimation: boolean
}
