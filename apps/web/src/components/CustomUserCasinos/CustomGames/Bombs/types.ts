// @ts-nocheck
import {
  type BaseGameParameters,
  type BaseGameResult,
  type BaseGameEntry,
} from '@/components/CustomUserCasinos/CustomGames/shared/types'
import { AppGameName } from '@/chains/types'
import { type SoundData } from '../../shared/types/sound.types'

export type ParticleEffectLevel = 'none' | 'less' | 'more'

/**
 * Bombs-specific game parameters that extend base game parameters
 */
export interface BombsParameters extends BaseGameParameters {
  // Visual parameters
  tileColor: string
  selectedTileColor: string
  bombColor: string
  safeColor: string

  // Shape and layout options
  tileShape: TileShape
  tileSize: number
  tileSpacing: number

  // Border colors
  borderColor: string
  selectedBorderColor: string
  winColor: string
  lossColor: string

  // Effects
  particleEffects: ParticleEffectLevel

  // Custom sound effects
  customSounds?: {
    tileClick?: SoundData
    coinReveal?: SoundData
    bombExplosion?: SoundData
    gameWin?: SoundData
    gameLoss?: SoundData
  }
}

/**
 * Tile shape options
 */
export type TileShape = 'square' | 'round'

/**
 * Constraints for bombs game parameters
 */
export const BOMBS_CONSTRAINTS = {
  minBombs: {
    min: 1,
    max: 24,
    step: 1,
  },
  maxBombs: {
    min: 1,
    max: 24,
    step: 1,
  },
  defaultBombs: {
    min: 1,
    max: 24,
    step: 1,
  },
  tileSize: {
    min: 40,
    max: 120,
    step: 5,
  },
  tileSpacing: {
    min: 0,
    max: 20,
    step: 1,
  },
}

/**
 * Default parameters for the bombs game
 */
export const DEFAULT_BOMBS_PARAMETERS: BombsParameters = {
  // Base game parameters
  icon: { url: '💣' },
  description: 'Select tiles and avoid the bombs to win!',
  background: { url: '#1a1a1a' },

  // Bombs-specific parameters
  tileColor: '#2a2a2a',
  selectedTileColor: '#3a3a3a',
  bombColor: '#ff4444',
  safeColor: '#44ff44',
  tileShape: 'square',
  tileSize: 75,
  tileSpacing: 8,
  borderColor: '#000000',
  selectedBorderColor: '#4a4a4a',
  winColor: '#44ff44',
  lossColor: '#ff4444',
  particleEffects: 'less',
}

/**
 * Result of a bombs game
 */
export interface BombsResult extends BaseGameResult {
  // Whether the game was won or lost
  isWin: boolean

  // The number of bombs in the game
  numberOfBombs: number

  // The cells that were revealed
  revealedCells: number[]

  // The cells that contained bombs
  bombCells: number[]
}

/**
 * Configuration for the bombs game
 */
export const BOMBS_GAME_INFO = {
  type: AppGameName.Bombs,
  name: 'Bombs',
  icon: '💣',
  description: 'Select tiles and avoid the bombs to win!',
}

/**
 * Entry data for Bombs game
 */
export interface BombsEntry extends BaseGameEntry {
  side: {
    bombCount: number
    selectedTiles: number[]
  }
}

export const DEFAULT_BOMBS_ENTRY: BombsEntry = {
  entryAmount: 0,
  entryCount: 1,
  side: {
    bombCount: 3,
    selectedTiles: [],
  },
}
