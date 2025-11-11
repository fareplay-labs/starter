// @ts-nocheck
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { type StateCreator } from 'zustand/vanilla'
import { createBaseSlice } from './baseGameStore'
import { entryEvent } from '@/components/CustomUserCasinos/events/entryEvent'
import {
  type BaseSlice,
  type BaseGameParameters,
  type BaseGameResult,
  type BaseGameEntry,
} from './types'
import { RealBackendService } from '@/components/CustomUserCasinos/backend/core/RealBackendService'
import { type IGameConfigData } from '@/components/CustomUserCasinos/config/GameConfig'

/**
 * Base validation helper for all games
 * Games can call this and add their own validation on top
 */
export function validateBaseEntry<TEntry extends BaseGameEntry>(
  entry: TEntry
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (entry.entryAmount <= 0) {
    errors.entryAmount = 'Entry amount must be greater than 0'
  }

  if (entry.entryCount < 1) {
    errors.entryCount = 'Entry count must be at least 1'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * createGameStore instantiates a Zustand store with entry-based state management:
 *   • the generic base slice (with entry management)
 *   • a game‑specific runtime slice (extra state + actions)
 */
export function createGameStore<
  TParams extends BaseGameParameters,
  TResult extends BaseGameResult,
  TEntry extends BaseGameEntry,
  TRuntimeState extends Record<string, any>,
  TActions extends Record<string, any>,
>(
  gameType: string,
  defaultParameters: TParams,
  gameSlice: (set: any, get: any) => TRuntimeState & TActions,
  defaultEntry?: TEntry
) {
  const createExtendedBaseSlice = (set: any, get: any): BaseSlice<TParams, TResult, TEntry> => ({
    // All existing BaseSlice properties
    gameState: 'IDLE',
    isLoading: false,
    error: undefined,
    isSaving: false,
    isDirty: false,
    configLoading: false,
    isDemoMode: true, // Default to demo mode for safety
    parentCasino: null,
    instanceId: null,
    parameters: defaultParameters,
    lastResult: null,

    // game identity
    gameName: gameType,
    gameIcon: '',

    // Entry-based state
    entry:
      defaultEntry ||
      ({
        entryAmount: 10,
        entryCount: 1,
        side: null,
      } as TEntry),
    submittedEntry: null,
    validation: {
      isValid: true,
      errors: {},
    },

    // Entry actions that work with FareGameState
    setEntry: (entryUpdate: Partial<TEntry>) => {
      set((state: any) => {
        // Create a new entry object to ensure React detects the change
        const newEntry = { ...state.entry }

        // Handle nested 'side' - check if it's an array or object
        if (entryUpdate.side !== undefined) {
          if (Array.isArray(entryUpdate.side)) {
            // For arrays (like Roulette bets), replace entirely
            newEntry.side = entryUpdate.side
          } else if (
            typeof entryUpdate.side === 'object' &&
            entryUpdate.side !== null &&
            state.entry.side &&
            typeof state.entry.side === 'object' &&
            !Array.isArray(state.entry.side)
          ) {
            // For objects, merge
            newEntry.side = { ...state.entry.side, ...entryUpdate.side }
          } else {
            // For primitives or other types, replace
            newEntry.side = entryUpdate.side
          }
        }

        // Apply other updates
        Object.keys(entryUpdate).forEach(key => {
          if (key !== 'side') {
            ;(newEntry as any)[key] = (entryUpdate as any)[key]
          }
        })

        state.entry = newEntry
      })

      // Update validation after entry change
      const validation = get().validateEntry()
      set((state: any) => {
        state.validation = validation
      })
    },

    setEntryAmount: (amount: number) => {
      get().setEntry({ entryAmount: amount } as Partial<TEntry>)
    },

    setEntryCount: (count: number) => {
      get().setEntry({ entryCount: count } as Partial<TEntry>)
    },

    submitEntry: () => {
      set((state: any) => {
        state.submittedEntry = { ...state.entry }
        // In blockchain mode, we start with START state, in demo mode go directly to PLAYING
        state.gameState = state.isDemoMode ? 'PLAYING' : 'START'
      })
    },

    resetEntry: () => {
      set((state: any) => {
        state.entry =
          defaultEntry ||
          ({
            entryAmount: 10,
            entryCount: 1,
            side: null,
          } as TEntry)
        state.submittedEntry = null
        state.validation = { isValid: true, errors: {} }
      })
    },

    validateEntry: () => {
      // Default validation - games can override
      const { entry } = get()
      return validateBaseEntry(entry)
    },

    // Existing BaseSlice actions
    reset: () => {
      // Announce completion to unlock submit button in blockchain mode
      entryEvent.pub('gameFinished')
      set((state: any) => {
        state.gameState = 'IDLE'
        state.isLoading = false
        state.error = undefined
        state.lastResult = null
        // Don't reset entry - preserve all player selections
        state.submittedEntry = null
        state.validation = { isValid: true, errors: {} }
        // Call game-specific reset if available
        if (
          'resetGameSpecificState' in state &&
          typeof state.resetGameSpecificState === 'function'
        ) {
          state.resetGameSpecificState(state)
        }
      })
    },

    initializeParameters: (params: Partial<TParams> & { name?: string; icon?: string }) => {
      set((state: any) => {
        // Extract name and icon if present (from top-level)
        const { name, icon, gameIcon, ...parameters } = params as any

        // Update parameters (excluding gameIcon which is handled separately)
        state.parameters = { ...state.parameters, ...parameters }

        // Update gameName and gameIcon if provided
        // Priority: icon from top-level, then gameIcon from parameters
        if (name) {
          state.gameName = name
        }
        if (icon) {
          state.gameIcon = icon
        } else if (gameIcon) {
          state.gameIcon = gameIcon
        }

        state.isDirty = false
      })
    },

    updateParameters: (params: Partial<TParams>) => {
      set((state: any) => {
        state.parameters = { ...state.parameters, ...params }
        state.isDirty = true
      })
    },

    updateGameName: (name: string) => {
      set((state: any) => {
        state.gameName = name
        state.isDirty = true
      })
    },

    updateGameIcon: (icon: string) => {
      set((state: any) => {
        state.gameIcon = icon
        state.isDirty = true
      })
    },
    
    setDemoMode: (_isDemoMode: boolean) => {
      set((state: any) => {
        state.isDemoMode = true
      })
    },

    loadConfigForInstance: async () => {
      const { parentCasino, instanceId } = get()
      if (!parentCasino?.username || !instanceId) {
        console.error(
          `[${gameType}GameStore] Cannot load config without parentCasino.username or instanceId`
        )
        return
      }

      try {
        const configData = await RealBackendService.getGameConfig(parentCasino.username, instanceId, gameType)

        if (configData) {
          // Also check casino.games for name and icon as fallback
          let gameName = configData.name || gameType
          let gameIcon = configData.icon || ''

          if (parentCasino.games) {
            const casinoGame = parentCasino.games.find((g: any) => g.id === instanceId)
            if (casinoGame) {
              gameName = casinoGame.name || gameName
              // Handle both string icons and ImageData structures
              if (typeof casinoGame.icon === 'string') {
                gameIcon = casinoGame.icon
              } else if (
                casinoGame.icon &&
                typeof casinoGame.icon === 'object' &&
                casinoGame.icon.url
              ) {
                gameIcon = casinoGame.icon.url
              }
            }
          }

          set((state: any) => {
            state.gameName = gameName
            state.gameIcon = gameIcon
            state.parameters =
              configData.parameters ?
                { ...state.parameters, ...configData.parameters }
              : state.parameters
            state.isDirty = false
          })
        } else {
          set((state: any) => {
            state.parameters = defaultParameters
            state.isDirty = false
          })
        }
      } catch (error) {
        console.error(`[${gameType}GameStore] Error loading config:`, error)
        set((state: any) => {
          state.error = 'Failed to load game configuration'
        })
      }
    },

    saveCurrentConfig: async () => {
      const { parentCasino, instanceId, parameters, gameName, gameIcon } = get()
      if (!parentCasino?.username || !instanceId) {
        console.error(
          `[${gameType}GameStore] Cannot save config without parentCasino.username or instanceId`
        )
        return false
      }

      set((state: any) => {
        state.isSaving = true
      })
      try {
        // Include gameIcon in parameters as 'gameIcon' (backend convention)
        const parametersWithIcon = {
          ...parameters,
          gameIcon: gameIcon || '',
        }

        const configData: IGameConfigData<TParams> = {
          name: gameName || gameType,
          icon: gameIcon || '',
          parameters: parametersWithIcon as TParams,
        }

        await RealBackendService.saveGameConfig(parentCasino.username, instanceId, configData, gameType)

        set((state: any) => {
          state.isSaving = false
          state.isDirty = false
        })
        return true
      } catch (error) {
        console.error(`[${gameType}GameStore] Error saving config:`, error)
        set((state: any) => {
          state.isSaving = false
        })
        return false
      }
    },

    setContext: (casino: any, instanceId: string) => {
      set((state: any) => {
        state.parentCasino = casino
        state.instanceId = instanceId
      })
    },
  })

  return create<BaseSlice<TParams, TResult, TEntry> & TRuntimeState & TActions>()(
    devtools(
      immer((set, get) => ({
        ...createExtendedBaseSlice(set, get),
        ...gameSlice(set, get),
      })),
      { name: `${gameType}GameStore` }
    )
  )
}

// Temporary compatibility layer for old games
export function createGameStoreOldPattern<
  P extends BaseGameParameters,
  R extends BaseGameResult,
  ExtraState extends object,
  ExtraActions extends object,
>(gameType: string, defaultParams: P, extra: StateCreator<any, [], [], ExtraState & ExtraActions>) {
  return create<any>()((...a) => ({
    ...createBaseSlice<P, R, any>(gameType, defaultParams, undefined)(...a),
    ...extra(...a),
  }))
}
