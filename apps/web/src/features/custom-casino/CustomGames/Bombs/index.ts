// @ts-nocheck
import BombsGame from './components/BombsGame'
export { BombsForm } from './components/BombsForm'
export { BombsScene } from './components/BombsScene'
export { useBombsGameStore } from './store/BombsGameStore'
export { useBombsGameInitialization } from './hooks/useBombsGameInitialization'
export { useBombsGrid } from './hooks/useBombsGrid'
export * as BombsGameLogic from './logic/BombsGameLogic'
export type { BombsParameters, BombsResult } from './types'
export type { RevealStep } from './logic/BombsGameLogic'

export { BombsRules } from './BombsRules'

export {
  BOMBS_GAME_INFO as BOMBS_CONFIG,
  DEFAULT_BOMBS_PARAMETERS,
  BOMBS_CONSTRAINTS,
} from './types'
export default BombsGame
