// @ts-nocheck
// Import components
import RPSGame from './RPSGame'
import { RPSConfig } from './RPSConfig'
import { useRPSGameStore } from './RPSGameStore'
import { RPSForm } from './components/RPSForm'
import { RPSRules } from './RPSRules'
import { LaserParticles } from './components/LaserParticles'
import {
  type RPSGameParameters,
  type RPSGameResult,
  type RPSChoice,
  type RPSAnimationPreset,
  RPS_CONSTRAINTS,
  DEFAULT_RPS_PARAMETERS,
  RPS_CONFIG,
} from './types'

// Re-export everything
export {
  // Components
  RPSGame,
  RPSConfig,
  RPSForm,
  RPSRules,
  LaserParticles,

  // Store
  useRPSGameStore,

  // Types
  RPSGameParameters,
  RPSGameResult,
  RPSChoice,
  RPSAnimationPreset,
  RPS_CONSTRAINTS,
  DEFAULT_RPS_PARAMETERS,
  RPS_CONFIG,

}

// Default export for simpler imports
export default RPSGame
