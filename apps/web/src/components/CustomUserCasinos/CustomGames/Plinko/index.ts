// @ts-nocheck
import PlinkoGame from './components/PlinkoGame'
export { PlinkoForm } from './components/PlinkoForm'
export { PlinkoRules } from './PlinkoRules'
export { AnimationControlPanel } from './components/AnimationControlPanel'
export { usePlinkoGameStore } from './store/PlinkoGameStore'
export * as PlinkoGameLogic from './logic/PlinkoGameLogic'
export * as PlinkoSimulation from './simulation'
export type { PlinkoParameters, PlinkoResult, PlinkoBallState } from './types'
export {
  PLINKO_GAME_INFO as PLINKO_CONFIG,
  DEFAULT_PLINKO_PARAMETERS,
  PLINKO_CONSTRAINTS,
  ANIMATION_CONFIGS,
} from './types'
export { PlinkoSchemaConfig } from './config/schema'
export { PLINKO_EDITOR_METADATA } from './config/PlinkoMetadata'
export { useAdvancedAnimations, useBallTrails } from './hooks'
export default PlinkoGame
