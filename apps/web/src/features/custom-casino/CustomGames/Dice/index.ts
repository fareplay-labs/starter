// @ts-nocheck
// Import components
import DiceGame from './DiceGame'
import DiceForm from './DiceForm'
import { DiceRules } from './DiceRules'
import { useDiceGameStore } from './DiceGameStore'
import { type DiceParameters, type DiceResult } from './types'

// Import types for re-export
import { DEFAULT_DICE_PARAMETERS, DICE_CONSTRAINTS, DICE_GAME_INFO } from './types'

// Re-export everything
export {
  // Components
  DiceGame,
  DiceForm,
  DiceRules,

  // Store
  useDiceGameStore,

  // Types
  DiceParameters as DiceGameParameters,
  DiceResult as DiceGameResult,
  DEFAULT_DICE_PARAMETERS,
  DICE_CONSTRAINTS,
  DICE_GAME_INFO as DICE_CONFIG,
}

// Default export for simpler imports
export default DiceGame
