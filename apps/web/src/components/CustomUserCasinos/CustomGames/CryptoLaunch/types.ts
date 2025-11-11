// @ts-nocheck
import {
  type BaseGameParameters,
  type BaseGameResult,
  type BaseGameEntry,
} from '@/components/CustomUserCasinos/CustomGames/shared/types'
import { SoundData } from '@/components/CustomUserCasinos/shared/types/sound.types'
import { AppGameName } from '@/chains/types'

/**
 * Crypto Launch specific game parameters
 */
export interface CryptoLaunchParameters extends BaseGameParameters {
  // Game Settings
  betAmount: number
  startPrice: number
  minSellPrice: number
  startDay: number
  endDay: number

  // Visual customization (minimal for now)
  chartColor: string
  /** Color used to highlight win area and win particles */
  winColor: string
  /** Opacity 0-1 for win area highlight */
  highlightOpacity: number
  /** Toggle visibility of x-axis grid lines & labels */
  showXAxis: boolean
  /** Toggle visibility of Start/End day labels */
  showDayLabels: boolean
  /** Toggle full grid lines */
  showGrid: boolean
  /** Color of grid lines */
  gridColor: string
  /** Global text color for labels */
  textColor: string
  /** Intensity 1-10 for win particle effect */
  particleIntensity: number
  /** Total animation duration in milliseconds (entire 365-day simulation) */
  animationDuration: number
  backgroundColor: string

  // Custom sound effects
  customSounds?: {
    gameStart?: SoundData
    positiveBeep?: SoundData
    negativeBeep?: SoundData
    win?: SoundData
    loss?: SoundData
    winningLoop?: SoundData
  }
}

/**
 * Default parameters for the crypto launch game
 */
export const DEFAULT_CRYPTO_LAUNCH_PARAMETERS: CryptoLaunchParameters = {
  // Base game parameters
  icon: { url: '🛰️' },
  description: 'Trade a crypto token over time and try to sell above your minimum price!',
  background: { url: '#0a0a0a' },

  // Game Settings
  betAmount: 10,
  startPrice: 1,
  minSellPrice: 5,
  startDay: 60,
  endDay: 240,

  // Visual customization
  chartColor: '#00ff88',
  winColor: '#00ff88',
  highlightOpacity: 0.2,
  showXAxis: true,
  showDayLabels: true,
  showGrid: true,
  gridColor: '#333333',
  textColor: '#cccccc',
  particleIntensity: 5,
  animationDuration: 15000,
  backgroundColor: '#0a0a0a',
}

/**
 * Result of a crypto launch game
 */
export interface CryptoLaunchResult extends BaseGameResult {
  finalPrice: number
  maxPrice: number
  sellPrice: number
  soldOnDay: number
  isWin: boolean
  profitLoss: number
  multiplier: number
}

/**
 * Configuration for the crypto launch game
 */
export const CRYPTO_LAUNCH_GAME_INFO = {
  type: AppGameName.CryptoLaunch_1,
  name: 'Crypto Launch',
  icon: '🛰️',
  description: 'Trade a crypto token over time and try to sell above your minimum price!',
}

/**
 * Constraints for crypto launch game parameters
 */
export const CRYPTO_LAUNCH_CONSTRAINTS = {
  betAmount: {
    min: 0,
    max: 1000,
    step: 1,
  },
  startPrice: {
    min: 1,
    max: 5,
    step: 0.1,
  },
  minSellPrice: {
    min: 2,
    max: 10,
    step: 0.1,
  },
  startDay: {
    min: 10,
    max: 300,
    step: 1,
  },
  endDay: {
    min: 70, // startDay + 60 minimum
    max: 360,
    step: 1,
  },
  highlightOpacity: {
    min: 0,
    max: 1,
    step: 0.05,
  },
  particleIntensity: {
    min: 1,
    max: 10,
    step: 1,
  },
  animationDuration: {
    min: 1000,
    max: 60000,
    step: 500,
  },
}

/**
 * Game state for price data
 */
export interface CryptoLaunchGameData {
  priceData: number[]
  currentDay: number
  currentPrice: number
  isInSellWindow: boolean
  isAboveMinSell: boolean
  hasWon: boolean
}

/**
 * Entry data for CryptoLaunch game
 */
export interface CryptoLaunchEntry extends BaseGameEntry {
  side: {
    startPrice: number
    minSellPrice: number
    startDay: number
    endDay: number
  }
}

export const DEFAULT_CRYPTO_LAUNCH_ENTRY: CryptoLaunchEntry = {
  entryAmount: 0,
  entryCount: 1,
  side: {
    startPrice: 1,
    minSellPrice: 5,
    startDay: 60,
    endDay: 240,
  },
}
