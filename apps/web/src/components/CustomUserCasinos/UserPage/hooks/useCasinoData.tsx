// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react'
import { useBackendService } from '@/components/CustomUserCasinos/backend/hooks'
import { useEditStore } from '../editor/useEditStore'
import { type CasinoEntity } from '../../shared/types'
import { type PageConfig } from '../../config/PageConfig'
import { ConfigManager } from '../../config/ConfigManager'
import { type CustomCasinoGame } from '../../shared/types'
import { useAuth } from '@/hooks/useAuth'

interface UseCasinoDataReturn {
  casino: CasinoEntity | null
  configInitialized: boolean
  showOnboarding: boolean
  setShowOnboarding: React.Dispatch<React.SetStateAction<boolean>>
  isNewCasino: boolean
  updateConfig: (config: PageConfig) => void
  setCasino: React.Dispatch<React.SetStateAction<CasinoEntity | null>>
  isLoading: boolean
  refreshCasino: () => Promise<void>
}

// Get ConfigManager instance once outside component
const configManagerInstance = ConfigManager.getInstance()

// Function to create a default casino entity when nothing exists
export const createDefaultCasino = (username: string): CasinoEntity => {
  const userId = username || 'default'
  // Create a proper PageConfig instance using ConfigManager
  const displayTitle = `${username || 'Player'}'s Casino`

  // Start with empty games and sections for AI generation
  const games: CustomCasinoGame[] = []

  const configData = {
    title: displayTitle,
    shortDescription: 'Welcome to my custom casino!',
    longDescription: 'This is my custom casino where you can play various games and have fun!',
    font: 'Arial, Helvetica, sans-serif',
    colors: {
      themeColor1: '#ffcd9e',
      themeColor2: '#ff5e4f',
      themeColor3: '#d900d5',
      backgroundColor: '#0a0a0a',
    },
    bannerImage: 'placeholder',
    profileImage: 'placeholder',
    sections: [], // Empty sections to be populated by AI
    socialLinks: {
      links: [],
      layoutType: 'horizontal',
    },
  }

  // Create a proper PageConfig instance
  const pageConfig = configManagerInstance.loadConfig('page', configData) as PageConfig

  return {
    id: userId,
    username: username || 'Player',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    games,
    stats: {
      totalPlays: 0,
      totalWagered: 0,
      uniquePlayers: 0,
      jackpot: 0,
    },
    config: pageConfig,
  }
}

export const useCasinoData = (userId: string): UseCasinoDataReturn => {
  // Backend service integration
  const { loadUserCasino, loadGameConfig } = useBackendService()
  const { user } = useAuth()
  const resolvedUserId = (userId || user?.address || 'fare-casino').toLowerCase()

  // Initialize with a default casino that will be populated
  const [casino, setCasino] = useState<CasinoEntity | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // State for onboarding modal
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isNewCasino, setIsNewCasino] = useState(false)

  // Flag to track if config has been initialized
  const [configInitialized, setConfigInitialized] = useState(false)
  const fetchInFlightRef = useRef(false)

  // Access the edit store to manage edit state
  const { updateConfig: storeUpdateConfig } = useEditStore()

  // Create an adapter function to update the entire config at once
  const updateConfig = useCallback(
    (config: PageConfig) => {
      // Initialize with the config's title
      storeUpdateConfig('title', config.title)

      // Update other fields one by one if they exist
      if (config.shortDescription) storeUpdateConfig('shortDescription', config.shortDescription)
      if (config.longDescription) storeUpdateConfig('longDescription', config.longDescription)
      if (config.bannerImage) storeUpdateConfig('bannerImage', config.bannerImage)
      if (config.profileImage) storeUpdateConfig('profileImage', config.profileImage)
      if (config.font) storeUpdateConfig('font', config.font)
      if (config.colors) storeUpdateConfig('colors', config.colors)
      if (config.socialLinks) storeUpdateConfig('socialLinks', config.socialLinks)
      if (config.sections) storeUpdateConfig('sections', config.sections)
    },
    [storeUpdateConfig]
  )

  // Get casino data from API or localStorage
  useEffect(() => {
    if (configInitialized || fetchInFlightRef.current) return

    const abortController = new AbortController()
    const isOwnCasino = Boolean(user?.address) && user?.address.toLowerCase() === resolvedUserId
    console.info('[TEMP] bootstrap:start', { resolvedUserId, isOwnCasino })

    const fetchCasino = async () => {
      fetchInFlightRef.current = true
      let updatedState = false
      try {
        const savedCasino = await loadUserCasino(resolvedUserId)
        if (abortController.signal.aborted) return
        console.info('[TEMP] bootstrap:result', { ok: Boolean(savedCasino) })

        if (savedCasino) {
          const gamesWithConfigs = await Promise.all(
            savedCasino.games.map(async game => {
              try {
                const gameConfig = await loadGameConfig(savedCasino.username, game.type, game.id)
                if (gameConfig?.parameters) {
                  return {
                    ...game,
                    icon: gameConfig.parameters.gameIcon || game.icon || '',
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

          const casinoWithConfigs = {
            ...savedCasino,
            games: gamesWithConfigs,
          }

          setCasino(casinoWithConfigs)
          updateConfig(casinoWithConfigs.config)
          setConfigInitialized(true)
          updatedState = true
          console.info('[TEMP] bootstrap:applied', {
            title: casinoWithConfigs.config?.title,
            games: casinoWithConfigs.games?.length ?? 0,
          })
          return
        }

        // No casino returned means backend didn’t respond—defer saving until user explicitly confirms
        if (isOwnCasino) {
          setIsNewCasino(true)
          setShowOnboarding(true)
          const defaultCasino = createDefaultCasino(resolvedUserId)
          setCasino(defaultCasino)
          updateConfig(defaultCasino.config)
          updatedState = true
          console.info('[TEMP] bootstrap:fallback', { own: true })
        } else {
          setCasino(createDefaultCasino(resolvedUserId))
          updatedState = true
          console.info('[TEMP] bootstrap:fallback', { own: false })
        }

        setConfigInitialized(true)
      } catch (error) {
        if (abortController.signal.aborted) return
        console.warn('[TEMP] bootstrap:error', error?.message ?? error)

        if (isOwnCasino) {
          const fallback = createDefaultCasino(resolvedUserId)
          setCasino(fallback)
          updateConfig(fallback.config)
          updatedState = true
          setShowOnboarding(true)
          console.info('[TEMP] bootstrap:fallback', { own: true, error: true })
        } else {
          setCasino(null)
          console.info('[TEMP] bootstrap:fallback', { own: false, error: true })
        }
        setConfigInitialized(true)
      } finally {
        fetchInFlightRef.current = false
        // Safety: if nothing set and not aborted, initialize a local default to unblock UI
        if (!abortController.signal.aborted && !updatedState) {
          const fallback = createDefaultCasino(resolvedUserId)
          setCasino(prev => prev ?? fallback)
          setConfigInitialized(true)
          console.info('[TEMP] bootstrap:safety')
        }
        console.info('[TEMP] bootstrap:done')
      }
    }

    fetchCasino()

    return () => {
      abortController.abort()
    }
  }, [resolvedUserId, configInitialized])

  // Function to refresh casino data from backend
  const refreshCasino = useCallback(async () => {
    console.debug('[TEMP][useCasinoData] refreshCasino → start')
    try {
      setIsLoading(true)
      const savedCasino = await loadUserCasino(resolvedUserId, true)
      console.debug('[TEMP][useCasinoData] refreshCasino → loadUserCasino result', {
        hasSavedCasino: Boolean(savedCasino),
      })
      if (savedCasino) {
        // Load game configs for all games to get icons and other parameters
        const gamesWithConfigs = await Promise.all(
          savedCasino.games.map(async game => {
            try {
              const gameConfig = await loadGameConfig(savedCasino.username, game.type, game.id)
              if (gameConfig && gameConfig.parameters) {
                return {
                  ...game,
                  icon: gameConfig.parameters.gameIcon || game.icon || '',
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

        const casinoWithConfigs = {
          ...savedCasino,
          games: gamesWithConfigs,
        }

        setCasino(casinoWithConfigs)
        updateConfig(casinoWithConfigs.config)
        console.debug('[TEMP][useCasinoData] refreshCasino → applied casino', {
          title: casinoWithConfigs.config?.title,
          games: casinoWithConfigs.games?.length ?? 0,
        })
      }
    } catch (error) {
      console.error('Error refreshing casino data:', error)
    } finally {
      setIsLoading(false)
      console.debug('[TEMP][useCasinoData] refreshCasino → end')
    }
  }, [loadGameConfig, loadUserCasino, resolvedUserId, updateConfig])

  return {
    casino,
    configInitialized,
    showOnboarding,
    setShowOnboarding,
    isNewCasino,
    updateConfig,
    setCasino,
    isLoading,
    refreshCasino,
  }
}
