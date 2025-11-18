// @ts-nocheck
import { type StateCreator } from 'zustand'
import { type CasinoEntity } from '../../shared/types'
import {
  type BaseGameParameters,
  type BaseGameResult,
  type BaseGameEntry,
  type FareGameState,
  type BaseSlice,
} from './types'
import { BackendService } from '@/features/custom-casino/backend/core/BackendService'
import { type IGameConfigData } from '@/features/custom-casino/config/GameConfig'

/**
 * Creates a base game store slice with common functionality
 */
export function createBaseSlice<
  TParams extends BaseGameParameters,
  TResult extends BaseGameResult,
  TEntry extends BaseGameEntry,
>(
  gameType: string,
  defaultParams: TParams,
  defaultEntry: TEntry
): StateCreator<BaseSlice<TParams, TResult, TEntry>, [], [], BaseSlice<TParams, TResult, TEntry>> {
  return (set, get) => ({
    // state
    gameState: 'IDLE' as FareGameState,
    isLoading: false,
    error: undefined,

    // config flags
    isSaving: false,
    isDirty: false,
    configLoading: false,
    isDemoMode: true,

    // context
    parentCasino: null,
    instanceId: null,

    // data
    parameters: defaultParams,
    lastResult: null,

    // game identity
    gameName: gameType,
    gameIcon: '',

    // Entry-based state
    entry: defaultEntry,
    submittedEntry: null,
    validation: {
      isValid: false,
      errors: {},
    },

    // actions
    reset: () =>
      set(state => ({
        ...state,
        gameState: 'IDLE',
        lastResult: null,
        error: undefined,
      })),

    initializeParameters: params =>
      set(state => ({
        parameters: { ...state.parameters, ...params },
        isDirty: false,
      })),

    updateParameters: params =>
      set(state => ({
        parameters: { ...state.parameters, ...params },
        isDirty: true,
      })),

    updateGameName: name =>
      set(_state => ({
        gameName: name,
        isDirty: true,
      })),

    updateGameIcon: icon =>
      set(_state => ({
        gameIcon: icon,
        isDirty: true,
      })),

    // Entry actions
    setEntry: (entry: Partial<TEntry>) =>
      set(state => ({
        entry: { ...state.entry, ...entry },
      })),

    setEntryAmount: (amount: number) =>
      set(state => ({
        entry: { ...state.entry, entryAmount: amount },
      })),

    setEntryCount: (count: number) =>
      set(state => ({
        entry: { ...state.entry, entryCount: count },
      })),

    submitEntry: () =>
      set(state => ({
        submittedEntry: state.entry,
      })),

    resetEntry: () =>
      set(_state => ({
        entry: defaultEntry,
        submittedEntry: null,
        validation: {
          isValid: false,
          errors: {},
        },
      })),

    validateEntry: () => {
      const { entry } = get()
      const errors: Record<string, string> = {}

      if (entry.entryAmount <= 0) {
        errors.entryAmount = 'Entry amount must be greater than 0'
      }

      if (entry.entryCount <= 0) {
        errors.entryCount = 'Entry count must be greater than 0'
      }

      const isValid = Object.keys(errors).length === 0

      set(_state => ({
        validation: { isValid, errors },
      }))

      return { isValid, errors }
    },

    // Demo mode action
    setDemoMode: (isDemoMode: boolean) => set({ isDemoMode }),

    loadConfigForInstance: async () => {
      const { parentCasino, instanceId } = get()
      if (!parentCasino?.username || !instanceId) {
        console.error(
          `[${gameType}GameStore] Cannot load config without parentCasino.username or instanceId`
        )
        return
      }

      try {
        const configData = await BackendService.getGameConfig(parentCasino.username, instanceId, gameType)

        if (configData) {
          // Also check casino.games for name and icon as fallback
          let gameName = configData.name || gameType
          let gameIcon = configData.icon || ''

          if (parentCasino.games) {
            const casinoGame = parentCasino.games.find(g => g.id === instanceId)
            if (casinoGame) {
              gameName = casinoGame.name || gameName
              gameIcon = casinoGame.icon || gameIcon
            }
          }

          set(state => ({
            ...state,
            gameName,
            gameIcon,
            parameters:
              configData.parameters ?
                { ...state.parameters, ...configData.parameters }
              : state.parameters,
            isDirty: false,
          }))
        } else {
          set(state => ({
            ...state,
            parameters: defaultParams,
            isDirty: false,
          }))
        }
      } catch (error) {
        console.error(`[${gameType}GameStore] Error loading config:`, error)
        set(state => ({ ...state, error: 'Failed to load game configuration' }))
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

      set({ isSaving: true })
      try {
        const configData: IGameConfigData<TParams> = {
          name: gameName || gameType,
          icon: gameIcon || '',
          parameters: parameters,
        }

        await BackendService.saveGameConfig(parentCasino.username, instanceId, configData, gameType)

        set({ isSaving: false, isDirty: false })
        return true
      } catch (error) {
        console.error(`[${gameType}GameStore] Error saving config:`, error)
        set({ isSaving: false })
        return false
      }
    },

    setContext: (casino: CasinoEntity, instanceId: string) =>
      set({ parentCasino: casino, instanceId }),
  })
}
