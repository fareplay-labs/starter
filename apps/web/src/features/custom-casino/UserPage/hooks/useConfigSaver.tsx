// @ts-nocheck
import { useCallback } from 'react'
import { useBackendService } from '@/features/custom-casino/backend/hooks'
import { useEditStore } from '../editor/useEditStore'
import { ConfigManager } from '../../config/ConfigManager'
import { type CasinoEntity } from '../../shared/types'
import { type PageConfig } from '../../config/PageConfig'

interface UseConfigSaverProps {
  casino: CasinoEntity | null
  userId: string
  setCasino: React.Dispatch<React.SetStateAction<CasinoEntity | null>>
}

export const useConfigSaver = ({ casino, userId, setCasino }: UseConfigSaverProps) => {
  // Backend service integration
  const { saveUserCasino } = useBackendService()

  // Access the edit store to manage edit state
  const { savePendingChanges } = useEditStore()

  // Get ConfigManager instance once outside component
  const configManagerInstance = ConfigManager.getInstance()

  // Save config to backend
  const saveConfig = useCallback(async () => {
    if (!casino?.config) return

    // Always save pending changes in the local zustand store
    savePendingChanges()

    // Get the updated config from the local zustand store
    const { casinoConfig } = useEditStore.getState()

    // Save to backend service
    try {
      const newConfig =
        casinoConfig ?
          (configManagerInstance.loadConfig('page', casinoConfig) as PageConfig)
        : casino.config

      const updatedCasino: CasinoEntity = {
        ...casino,
        config: newConfig,
        updatedAt: new Date().toISOString(),
      }

      await saveUserCasino(userId, updatedCasino)
      setCasino(updatedCasino) // Update local state with changes
    } catch (error) {
      console.error('Failed to save casino configuration:', error)
    }
  }, [casino, savePendingChanges, configManagerInstance, saveUserCasino, userId, setCasino])

  return { saveConfig }
}
