// @ts-nocheck
// Export main components
export { default as CrashGame } from './CrashGame'
export { default as CrashForm } from './CrashForm'
export { CrashScene } from './CrashScene'
import { CrashRules } from './CrashRules'
export { CrashRules }

// Export types
export type { CrashParameters, CrashResult, CrashAnimationState, CrashSceneProps } from './types'

export { DEFAULT_CRASH_PARAMETERS, CRASH_CONSTRAINTS, CRASH_GAME_INFO } from './types'

// Export store
export { useCrashGameStore } from './CrashGameStore'

// Export config
export { CrashSchemaConfig } from './schema'

// Export metadata
export { CRASH_EDITOR_METADATA } from './CrashMetadata'

// Export logic functions
export {
  generateCrashMultiplier,
  determineCashOutSuccess,
  calculateCrashPayout,
  generateCrashAnimationCurve,
  validateCrashParameters,
  createCrashResult,
} from './logic/CrashGameLogic'
