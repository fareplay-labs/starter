// @ts-nocheck
import { type CasinoEntity } from '../../shared/types'
import { type ImageData } from '../../config/PageConfig'

/**
 * Core game state shared by all games
 *
 * @property IDLE - Default state. User can interact with forms and place bets
 * @property START - (Blockchain mode) Entry has been submitted to blockchain, waiting for transaction
 * @property RESOLVE - (Blockchain mode) Blockchain result received, preparing to show animation
 * @property RESOLVING - (Optional) Processing/calculating results before animation
 * @property PLAYING - Animation is actively playing. Forms are disabled
 * @property SHOWING_RESULT - (Optional) Animation complete, showing results/payouts
 * @property RESETTING - (Optional) Cleaning up before returning to IDLE
 *
 * Demo mode flow: IDLE → PLAYING → IDLE (simple games)
 * Blockchain mode flow: IDLE → START → RESOLVE → PLAYING → IDLE
 * Extended flow: IDLE → START → RESOLVE → RESOLVING → PLAYING → SHOWING_RESULT → IDLE (complex games)
 */
export type FareGameState = 'IDLE' | 'START' | 'RESOLVE' | 'RESOLVING' | 'PLAYING' | 'SHOWING_RESULT' | 'RESETTING'

// Base interface for game parameters
export interface BaseGameParameters {
  icon: ImageData
  description: string
  background: ImageData
}

// Base interface for game entries
export interface BaseGameEntry {
  entryAmount: number
  entryCount: number
  side: unknown // Game-specific parameters (will be typed per game)
}

// Core game result shared by all games
export interface BaseGameResult {
  timestamp: number
  entryAmount: number
  numberOfEntries: number
  payout: number
  isWin: boolean
}

// Extended result to include entry side data for new pattern
export interface ExtendedBaseGameResult extends BaseGameResult {
  side?: unknown // Game-specific side data
}

export interface BaseSlice<
  T extends BaseGameParameters,
  R extends BaseGameResult,
  E extends BaseGameEntry,
> {
  // runtime
  gameState: FareGameState
  isLoading: boolean
  error: string | undefined

  // config flags
  isSaving: boolean
  isDirty: boolean
  configLoading: boolean
  
  // Demo mode flag - when true, uses local simulation; when false, uses blockchain
  isDemoMode: boolean

  // context
  parentCasino: CasinoEntity | null
  instanceId: string | null

  // data
  parameters: T
  lastResult: R | null

  // game identity
  gameName: string
  gameIcon: string

  // Entry-based state
  entry: E
  submittedEntry: E | null
  validation: {
    isValid: boolean
    errors: Record<string, string>
  }

  // actions - always present in the store
  reset: () => void
  initializeParameters: (params: Partial<T> & { name?: string; icon?: string; gameIcon?: string }) => void
  updateParameters: (params: Partial<T>) => void
  saveCurrentConfig: () => Promise<boolean>
  loadConfigForInstance: () => Promise<void>
  setContext: (casino: CasinoEntity, instanceId: string) => void
  updateGameName: (name: string) => void
  updateGameIcon: (icon: string) => void

  // Entry actions
  setEntry: (entry: Partial<E>) => void
  setEntryAmount: (amount: number) => void
  setEntryCount: (count: number) => void
  submitEntry: () => void
  resetEntry: () => void
  validateEntry: () => { isValid: boolean; errors: Record<string, string> }
  
  // Demo mode action
  setDemoMode: (isDemoMode: boolean) => void
}
