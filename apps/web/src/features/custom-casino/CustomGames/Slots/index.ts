// @ts-nocheck
// Main game component
export { SlotsGame } from './components/SlotsGame'
export { SlotsGame as default } from './components/SlotsGame'

// Rules
export { SlotsRules } from './SlotsRules'

// Store
export { useSlotsGameStore } from './store/SlotsGameStore'

// Types
export {
  type SlotsParameters,
  type SlotsResult,
  type SlotsEntry,
  type PayoutTableEntry,
  type SymbolCount,
  type SlotsSceneProps,
  DEFAULT_SLOTS_PARAMETERS,
  DEFAULT_SLOTS_ENTRY,
  SLOTS_CONSTRAINTS,
  SLOTS_GAME_INFO,
} from './types'

// Config and metadata
export { SLOTS_METADATA, SLOTS_EDITOR_METADATA } from './config/SlotsMetadata'
export {
  SlotsParamsSchema,
  validateSlotsParameters,
  loadSlotsParameters,
  getDefaultSlotsParameters,
} from './config/schema'

// Hooks
export { useSlotsBlockchainResult } from './hooks/useSlotsBlockchainResult'
export { useSlotsSound } from './hooks/useSlotsSound'

// Components (for potential reuse)
export { SlotsForm } from './components/SlotsForm'
export { SlotsScene } from './components/SlotsScene'
export { WinParticles } from './components/WinParticles'
export { PaylineDisplay } from './components/PaylineDisplay'
