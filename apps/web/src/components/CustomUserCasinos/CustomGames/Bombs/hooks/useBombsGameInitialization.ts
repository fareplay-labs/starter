// @ts-nocheck
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useBackendService } from '@/components/CustomUserCasinos/backend/hooks'
import { useBombsGameStore } from '../store/BombsGameStore'
import { DEFAULT_BOMBS_PARAMETERS } from '../types'

/**
 * Custom hook to handle Bombs game initialization
 * Extracts initialization logic from the main component for better organization
 * @TODO: See if this can be standardized across all games
 */
export const useBombsGameInitialization = () => {
  const { username, instanceId } = useParams<{ username: string; instanceId: string }>()
  const { loadUserCasino } = useBackendService()

  const {
    parameters,
    isLoading,
    configLoading,
    error,
    setContext,
    instanceId: currentStoreInstanceId,
  } = useBombsGameStore((state: any) => ({
    parameters: state.parameters,
    isLoading: state.isLoading,
    configLoading: state.configLoading,
    error: state.error,
    setContext: state.setContext,
    instanceId: state.instanceId,
  }))

  useEffect(() => {
    const initializeGame = async () => {
      if (!username || !instanceId) {
        return
      }

      if (currentStoreInstanceId === instanceId) {
        return
      }

      try {
        const casino = await loadUserCasino(username)

        if (casino && instanceId) {
          setContext(casino, instanceId)
        } else {
          if (!casino) console.error(`[BombsGame] Failed to load parent casino for ${username}`)
          if (!instanceId) console.error(`[BombsGame] Missing instanceId`)
        }
      } catch (error) {
        console.error('[BombsGame] Error initializing game context and config:', error)
      }
    }

    initializeGame()
  }, [username, instanceId, loadUserCasino, setContext, currentStoreInstanceId])

  return {
    isLoading: isLoading || configLoading || !parameters,
    error,
    parameters: parameters || DEFAULT_BOMBS_PARAMETERS, // Use proper default parameters
  }
}
