// @ts-nocheck
import {
  type BaseGameParameters,
  type BaseGameResult,
  type BaseGameEntry,
} from '@/features/custom-casino/CustomGames/shared/types'
import { AppGameName } from '@/chains/types'
import { type SoundData } from '../../shared/types/sound.types'

/**
 * Dice-specific game parameters that extend base game parameters
 */
export interface DiceParameters extends BaseGameParameters {
  // Gameplay parameters
  targetNumber: number // Number player needs to roll over to win (0-99)
  maxNumber: number // Maximum number on the dice (default 100)

  // Visual parameters
  diceColor: string
  diceImage?: string // Custom dice image when using 'custom' model
  textColor: string
  diceSize: number
  animationSpeed: number
  winColor: string
  loseColor: string
  animationPreset: DiceAnimationPreset
  diceModel: DiceModelType

  // Custom sound effects
  customSounds?: {
    rollStart?: SoundData
    diceWin?: SoundData
    diceLoss?: SoundData
  }
}

/**
 * Constraints for dice game parameters
 */
export const DICE_CONSTRAINTS = {
  targetNumber: {
    min: 0,
    max: 95,
    step: 1,
  },
  maxNumber: {
    min: 10,
    max: 100,
    step: 10,
  },
  diceSize: {
    min: 40,
    max: 200,
    step: 10,
  },
  animationSpeed: {
    min: 200,
    max: 2000,
    step: 100,
  },
}

/**
 * Default parameters for the dice game
 */
export const DEFAULT_DICE_PARAMETERS: DiceParameters = {
  // Base game parameters
  icon: { url: '🎲' },
  description: 'Choose a number and roll above it to win!',
  background: { url: '#121212' },

  // Dice-specific parameters
  targetNumber: 50,
  maxNumber: 100,
  diceColor: '#5f5fff',
  diceImage: '/src/assets/svg/dice.svg',
  textColor: '#ffffff',
  diceSize: 120,
  animationSpeed: 1200,
  winColor: '#00ff00',
  loseColor: '#ff0000',
  animationPreset: 'simple',
  diceModel: 'wireframe',
}

/**
 * Dice-specific entry structure
 */
export interface DiceEntry extends BaseGameEntry {
  side: number // Target number (0-95)
}

/**
 * Default entry for dice game
 */
export const DEFAULT_DICE_ENTRY: DiceEntry = {
  entryAmount: 0,
  entryCount: 1,
  side: 50,
}

/**
 * Result of a dice game
 */
export interface DiceResult extends BaseGameResult {
  // The rolled number (0-100)
  rolledNumber: number

  // The target number (0-95)
  targetNumber: number

  // The multiplier based on the target number
  multiplier: number

  // Whether the game was won or lost
  isWin: boolean
}

/**
 * Configuration for the dice game
 */
export const DICE_GAME_INFO = {
  type: AppGameName.Dice,
  name: 'Dice',
  icon: '🎲',
  description: 'Choose a number and roll above it to win!',
}

export type DiceAnimationPreset = 'simple' | 'thump' | 'spin'
export type DiceModelType = 'wireframe' | 'solid' | 'neon' | 'custom'

export interface DiceSceneProps {
  size: number
  color: string
  winColor: string
  loseColor: string
  animationDuration: number
  targetNumber: number
  rolledNumber: number | null
  isRolling: boolean
  animationPreset: DiceAnimationPreset
  diceModel: DiceModelType
  onRollComplete: () => void
}
