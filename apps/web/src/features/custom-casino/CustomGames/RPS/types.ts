// @ts-nocheck
import {
  type BaseGameParameters,
  type BaseGameResult,
  type BaseGameEntry,
} from '@/features/custom-casino/CustomGames/shared/types'
import { AppGameName } from '@/chains/types'
import { type SoundData } from '../../shared/types/sound.types'

export type RPSChoice = 'rock' | 'paper' | 'scissors'
export type RPSAnimationPreset = 'standard' | 'clash' | 'laser'

// Update RPSGameParameters to extend BaseGameParameters
export interface RPSGameParameters extends BaseGameParameters {
  // Visual customization
  handSize: number
  handSpacing: number
  primaryColor: string
  secondaryColor: string
  winColor: string
  loseColor: string
  showResultText: boolean
  showVsText?: boolean
  useCustomIcons?: boolean

  // Hand customization
  customRockImage?: string
  customPaperImage?: string
  customScissorsImage?: string

  // Animation settings
  animationSpeed: number // 500-3000ms
  animationPreset: RPSAnimationPreset

  // Effect settings
  glowEffect: boolean

  // Custom sound effects
  customSounds?: {
    beep?: SoundData
    impact?: SoundData
    gameWin?: SoundData
    gameLoss?: SoundData
    gameDraw?: SoundData
  }
}

// Update constraints format to match Dice
export const RPS_CONSTRAINTS = {
  handSize: {
    min: 40,
    max: 200,
    step: 10,
  },
  handSpacing: {
    min: 40,
    max: 240,
    step: 5,
  },
  animationSpeed: {
    min: 500, // milliseconds
    max: 3000,
    step: 100,
  },
}

// Add default parameters
export const DEFAULT_RPS_PARAMETERS: RPSGameParameters = {
  // Base game parameters
  icon: { url: '✂️' },
  description: 'Choose rock, paper, or scissors to beat your opponent!',
  background: { url: '#1a1a1a' },

  // RPS-specific parameters
  handSize: 120,
  handSpacing: 100,
  primaryColor: '#3498db',
  secondaryColor: '#2980b9',
  winColor: '#2ecc71',
  loseColor: '#e74c3c',
  showResultText: true,
  showVsText: true,
  useCustomIcons: false,

  // Hand customization
  customRockImage: undefined,
  customPaperImage: undefined,
  customScissorsImage: undefined,

  // Animation settings
  animationSpeed: 1500,
  animationPreset: 'standard',

  // Effect settings
  glowEffect: true,
}

// Update RPSGameResult to properly extend BaseGameResult
export interface RPSGameResult extends BaseGameResult {
  playerChoice: RPSChoice
  computerChoice: RPSChoice
  isWin: boolean
  resultSides?: [RPSChoice, RPSChoice]
}

/**
 * RPS-specific entry structure
 */
export interface RPSEntry extends BaseGameEntry {
  side: RPSChoice // Player's choice: 'rock', 'paper', or 'scissors'
}

/**
 * Default entry for RPS game
 */
export const DEFAULT_RPS_ENTRY: RPSEntry = {
  entryAmount: 0,
  entryCount: 1,
  side: 'rock',
}

// Add standard config export similar to DICE_CONFIG
export const RPS_CONFIG = {
  type: AppGameName.RPS,
  name: 'Rock Paper Scissors',
  icon: '✂️',
  description: 'Choose rock, paper, or scissors to beat your opponent!',
}

/**
 * Animation timing configurations
 */
export const getAnimationTimings = (preset: RPSAnimationPreset, speed: number) => {
  const baseTimings = {
    standard: {
      pumpDuration: speed * 0.2,  // Each pump takes 20% of total
      pumpCount: 3,
      revealDuration: speed * 0.4, // Final slam and reveal
    },
    clash: {
      pullBackDuration: speed * 0.3,
      slamDuration: speed * 0.2,
      impactPause: speed * 0.1,
      revealDuration: speed * 0.4,
    },
    laser: {
      handMoveDuration: speed * 0.3,
      laserBuildUp: speed * 0.2,
      laserFire: speed * 0.3,
      resultReveal: speed * 0.2,
    }
  }
  return baseTimings[preset]
}
