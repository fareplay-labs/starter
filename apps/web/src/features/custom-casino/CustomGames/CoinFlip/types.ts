// @ts-nocheck
import {
  type BaseGameParameters,
  type BaseGameResult,
  type BaseGameEntry,
} from '@/features/custom-casino/CustomGames/shared/types'
import { AppGameName } from '@/chains/types'
import { type SoundData } from '../../shared/types/sound.types'
import { CoinFlipSelection } from '@/features/custom-casino/lib/crypto/coinFlip'

export type CoinSide = CoinFlipSelection
export type ParticleEffectLevel = 'none' | 'less' | 'more'
export type CoinAnimationPreset = 'flip' | 'spin' | 'twist'
export type CoinModelType = 'wireframe' | 'solid' | 'neon' | 'custom'
/**
 * CoinFlip-specific game parameters that extend base game parameters
 */
export interface CoinFlipParameters extends BaseGameParameters {
  // Visual parameters
  coinColor: string
  headsCustomImage?: string
  tailsCustomImage?: string
  coinSize: number

  // Animation parameters
  animationDuration: number
  flipCount: number
  animationPreset: CoinAnimationPreset

  // Model and background parameters
  coinModel: CoinModelType

  // Effect parameters
  particleEffects: ParticleEffectLevel
  // Number of particles emitted on win
  particleCount: number
  glowEffect: boolean

  // Border and UI colors
  borderColor: string
  winColor: string
  lossColor: string
  textColor: string

  // Custom sound effects
  customSounds?: {
    coinFlip?: SoundData
    gameWin?: SoundData
    gameLoss?: SoundData
  }
}

/**
 * Constraints for coin flip game parameters
 */
export const COINFLIP_CONSTRAINTS = {
  coinSize: {
    min: 40,
    max: 110,
    step: 10,
  },
  animationDuration: {
    min: 500,
    max: 3000,
    step: 100,
  },
  flipCount: {
    min: 1,
    max: 10,
    step: 1,
  },
  particleCount: {
    min: 0,
    max: 128,
    step: 4,
  },
}

/**
 * Default parameters for the coin flip game
 */
export const DEFAULT_COINFLIP_PARAMETERS: CoinFlipParameters = {
  // Base game parameters
  icon: { url: '🪙' },
  description: 'Choose heads or tails and flip the coin to win!',
  background: { url: '#1a1a1a' },

  // CoinFlip-specific parameters
  coinColor: '#FFD700',
  headsCustomImage: '',
  tailsCustomImage: '',
  coinSize: 60,
  animationDuration: 1200,
  flipCount: 5,
  animationPreset: 'spin',
  coinModel: 'solid',
  particleEffects: 'less',
  particleCount: 32,
  glowEffect: true,
  borderColor: '#333333',
  winColor: '#4CAF50',
  lossColor: '#f44336',
  textColor: '#ffffff',
}

/**
 * Result of a coin flip game
 */
export interface CoinFlipResult extends BaseGameResult {
  // The player's choice
  playerChoice: CoinSide

  // The actual result of the flip
  flipResult: CoinSide

  // Whether the game was won or lost
  isWin: boolean

  // The multiplier for this game (typically 2.0 for coin flip)
  multiplier: number
}

/**
 * Configuration for the coin flip game
 */
export const COINFLIP_GAME_INFO = {
  type: AppGameName.CoinFlip,
  name: 'CoinFlip',
  icon: '🪙',
  description: 'Choose heads or tails and flip the coin to win!',
}

/**
 * Entry data for CoinFlip game
 */
export interface CoinFlipEntry extends BaseGameEntry {
  side: CoinSide // Player's choice
}

export const DEFAULT_COINFLIP_ENTRY: CoinFlipEntry = {
  entryAmount: 0,
  entryCount: 1,
  side: CoinFlipSelection.Heads,
}
