// @ts-nocheck
import { useState, useCallback } from 'react'
import { RealBackendService } from '../core/RealBackendService'
import {
  type CasinoEntity,
  type CasinoPreview,
  type FeaturedCasinoPreview,
} from '../../shared/types'
import { type IGameConfigData } from '../../config/GameConfig'

/**
 * Custom React hook for using the Backend Service
 * Provides loading states and error handling for common operations
 * Uses the real backend API exclusively
 */
export function useBackendService() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Loads user casino data from backend
   * @param userId The user ID to load casino data for
   * @param force If true, bypass any caching mechanism and fetch fresh data
   */
  const loadUserCasino = useCallback(
    async (userId: string, force = false): Promise<CasinoEntity | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const casino = await RealBackendService.loadUserCasino(userId, force)
        setIsLoading(false)
        return casino
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user casino'
        setError(errorMessage)
        setIsLoading(false)
        return null
      }
    },
    []
  )

  /**
   * Saves user casino data to backend
   */
  const saveUserCasino = useCallback(
    async (userId: string, casino: CasinoEntity): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        await RealBackendService.saveUserCasino(userId, casino)
        setIsLoading(false)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save user casino'
        setError(errorMessage)
        setIsLoading(false)
        return false
      }
    },
    []
  )

  /**
   * Loads a game configuration from backend
   */
  const loadGameConfig = async (
    username: string,
    gameType: string,
    instanceId: string
  ): Promise<IGameConfigData<any> | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const config = await RealBackendService.getGameConfig(username, instanceId, gameType)
      setIsLoading(false)
      return config
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load game config'
      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }

  /**
   * Saves a game configuration to backend
   */
  const saveGameConfig = async (
    username: string,
    gameType: string,
    instanceId: string,
    config: IGameConfigData<any>
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await RealBackendService.saveGameConfig(username, instanceId, config, gameType)
      setIsLoading(false)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save game config'
      setError(errorMessage)
      setIsLoading(false)
      return false
    }
  }

  /**
   * Gets all casino previews (for discovery page)
   */
  const getCasinoPreviews = useCallback(async (): Promise<CasinoPreview[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const previews = await RealBackendService.getCasinoPreviews()
      setIsLoading(false)
      return previews
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get casino previews'
      setError(errorMessage)
      setIsLoading(false)
      return []
    }
  }, [])

  /**
   * Gets featured casino previews
   */
  const getFeaturedCasinoPreviews = useCallback(
    async (limit = 3): Promise<FeaturedCasinoPreview[]> => {
      setIsLoading(true)
      setError(null)

      try {
        const featured = await RealBackendService.getFeaturedCasinoPreviews(limit)
        setIsLoading(false)
        return featured
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get featured casinos'
        setError(errorMessage)
        setIsLoading(false)
        return []
      }
    },
    []
  )

  /**
   * Clears all user data
   */
  const clearAllUserData = useCallback(async (userId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await RealBackendService.clearAllUserData(userId)
      setIsLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear user data'
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [])

  /**
   * Creates a new game instance
   */
  const createGame = useCallback(
    async (userId: string, type: string, name: string): Promise<{ id: string; type: string; name: string } | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const game = await RealBackendService.createGame(userId, type, name)
        setIsLoading(false)
        return game
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create game'
        setError(errorMessage)
        setIsLoading(false)
        return null
      }
    },
    []
  )

  /**
   * Deletes a game from a casino
   */
  const deleteGameFromCasino = useCallback(async (userId: string, gameId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await RealBackendService.deleteGameFromCasino(userId, gameId)
      setIsLoading(false)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete game'
      setError(errorMessage)
      setIsLoading(false)
      return false
    }
  }, [])

  return {
    // State
    isLoading,
    error,
    clearError: () => setError(null),

    // Casino operations
    loadUserCasino,
    saveUserCasino,

    // Game operations
    createGame,
    deleteGameFromCasino,

    // Game config operations
    loadGameConfig,
    saveGameConfig,

    // Discovery features
    getCasinoPreviews,
    getFeaturedCasinoPreviews,

    // User data management
    clearAllUserData,

    // Direct access to service (for advanced usage)
    service: RealBackendService,
  }
}