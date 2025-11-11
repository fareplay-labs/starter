// @ts-nocheck
import { useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfigManager } from '../../config/ConfigManager'
import { useBackendService } from '@/components/CustomUserCasinos/backend/hooks'
import { type CasinoEntity } from '../../shared/types'
import { type PageConfig, type IPageConfigData } from '../../config/PageConfig'

interface UseIntegrateCasinoConfigProps {
  casino: CasinoEntity | null
  setCasino: React.Dispatch<React.SetStateAction<CasinoEntity | null>>
  updateConfig: (config: PageConfig) => void
  userId: string
  isNewCasino: boolean
}

export const useIntegrateCasinoConfig = ({
  casino,
  setCasino,
  updateConfig,
  userId,
  isNewCasino,
}: UseIntegrateCasinoConfigProps) => {
  const [_searchParams, setSearchParams] = useSearchParams()
  const { saveUserCasino, loadGameConfig } = useBackendService()
  const configManagerInstance = ConfigManager.getInstance()

  // Ref to ensure we integrate only once to avoid infinite state update loops
  const hasIntegratedRef = useRef(false)

  // Apply AI-generated casino configuration
  const integrateCasinoConfig = useCallback(
    async (aiConfig: any): Promise<boolean> => {
      if (!casino) return false

      // Prevent repeated integrations that can trigger React's maximum update depth error
      if (hasIntegratedRef.current) return true

      try {
        // Determine if aiConfig is a full CasinoEntity or a partial config payload
        let pageConfig: PageConfig

        if (aiConfig && aiConfig.config) {
          // Treat as CasinoEntity-like object coming from MockAIApiService
          pageConfig = aiConfig.config as PageConfig
        } else {
          // Treat as partial raw config fields (legacy path)
          const configData: IPageConfigData = {
            casinoId: userId,
            title: aiConfig.title || casino.config.title,
            shortDescription: aiConfig.shortDescription || casino.config.shortDescription,
            longDescription: aiConfig.longDescription || casino.config.longDescription,
            font: aiConfig.font || casino.config.font,
            colors: aiConfig.colors || casino.config.colors,
            bannerImage: aiConfig.bannerImage || casino.config.bannerImage,
            profileImage: aiConfig.profileImage || casino.config.profileImage,
            sections: aiConfig.sections || casino.config.sections,
            socialLinks: aiConfig.socialLinks || casino.config.socialLinks,
          }

          pageConfig = configManagerInstance.loadConfig('page', configData) as PageConfig
        }

        // Load and apply game-specific configurations that were saved separately by AI service
        const updatedGames = await Promise.all(
          casino.games.map(async game => {
            try {
              // Load game config that may have been saved by AI generation
              // loadGameConfig expects (username, gameType, instanceId)
              const gameConfig = await loadGameConfig(casino.username, game.type, game.id)

              if (gameConfig && gameConfig.parameters) {
                // Apply the loaded parameters to the game config
                return {
                  ...game,
                  config: {
                    ...game.config,
                    ...gameConfig.parameters,
                  },
                }
              }

              return game
            } catch (error) {
              console.error(`Error loading game config for ${game.id}:`, error)
              return game
            }
          })
        )

        // Create a new casino object with the AI-generated configuration and updated games
        const updatedCasino: CasinoEntity = {
          ...casino,
          config: pageConfig,
          games: updatedGames,
        }

        // Mark integration performed before state updates to avoid recursive calls
        hasIntegratedRef.current = true

        // Update local state
        setCasino(updatedCasino)
        updateConfig(pageConfig)

        // Save to backend
        await saveUserCasino(userId, updatedCasino)

        // Set edit mode so user can refine the AI-generated casino
        if (isNewCasino) {
          setSearchParams({ mode: 'edit' })
        }

        return true
      } catch (error) {
        console.error('Error applying AI configuration:', error)
        return false
      }
    },
    [
      casino,
      configManagerInstance,
      setCasino,
      updateConfig,
      saveUserCasino,
      loadGameConfig,
      userId,
      isNewCasino,
      setSearchParams,
    ]
  )

  return { integrateCasinoConfig }
}
