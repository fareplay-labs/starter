// @ts-nocheck
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import CustomGamePage from './CustomGamePage'
import { type BaseGameParameters } from '@/components/CustomUserCasinos/CustomGames/shared/types'
import { type CasinoEntity } from '@/components/CustomUserCasinos/shared/types'

// Directly import game components
import * as DiceComponents from '@/components/CustomUserCasinos/CustomGames/Dice'
import * as RPSComponents from '@/components/CustomUserCasinos/CustomGames/RPS'
import * as BombsComponents from '@/components/CustomUserCasinos/CustomGames/Bombs'
import * as CrashComponents from '@/components/CustomUserCasinos/CustomGames/Crash'
import * as RouletteComponents from '@/components/CustomUserCasinos/CustomGames/Roulette'
import * as PlinkoComponents from '@/components/CustomUserCasinos/CustomGames/Plinko'
import * as SlotsComponents from '@/components/CustomUserCasinos/CustomGames/Slots'
import * as CoinFlipComponents from '@/components/CustomUserCasinos/CustomGames/CoinFlip'
import * as CryptoLaunchComponents from '@/components/CustomUserCasinos/CustomGames/CryptoLaunch'
import * as CardsComponents from '@/components/CustomUserCasinos/CustomGames/Cards'

// Add import for useBackendService
import { useBackendService } from '@/components/CustomUserCasinos/backend/hooks'

const DEFAULT_OWNER_USERNAME = 'self'

// Move this function outside to prevent recreation on every render
const loadGameComponents = async (gameType: string) => {
  try {
    // Normalize the game type for consistent handling
    const normalizedType = gameType.toLowerCase()

    // Special case for hyphenated names
    let formattedGameType = ''
    if (normalizedType === 'coin-flip' || normalizedType === 'coinflip') {
      formattedGameType = 'CoinFlip'
    } else if (normalizedType === 'rps' || normalizedType === 'rock-paper-scissors') {
      formattedGameType = 'RPS'
    } else {
      // Standard formatting for other games (first letter uppercase)
      formattedGameType = normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1)
    }

    console.group(`[CustomGamesRouter] Loading ${formattedGameType} game components`)

    // Special handling for dice game using imported components
    if (normalizedType === 'dice') {
      if (DiceComponents.DiceGame) {
        console.groupEnd()

        return {
          GameComponent: DiceComponents.DiceGame,
          FormComponent: DiceComponents.DiceForm || null,
          GameRules: DiceComponents.DiceRules || null,
          useGameStore: DiceComponents.useDiceGameStore,
          success: true,
        }
      } else {
        console.error('Direct dice import available but DiceGame not found', DiceComponents)
      }
    }

    // Special handling for slots_1 game using imported components
    if (normalizedType === 'slots_1') {
      if (SlotsComponents.SlotsGame) {
        console.groupEnd()

        return {
          GameComponent: SlotsComponents.SlotsGame,
          FormComponent: SlotsComponents.SlotsForm || null,
          useGameStore: SlotsComponents.useSlotsGameStore,
          success: true,
        }
      } else {
        console.error('Direct slots import available but SlotsGame not found', SlotsComponents)
      }
    }

    // Special handling for RPS game using imported components
    if (normalizedType === 'rps' || normalizedType === 'rock-paper-scissors') {
      const rpsGame = RPSComponents.default || RPSComponents.RPSGame
      if (rpsGame) {
        console.groupEnd()

        return {
          GameComponent: rpsGame,
          FormComponent: RPSComponents.RPSForm || null,
          GameRules: RPSComponents.RPSRules || null,
          useGameStore: RPSComponents.useRPSGameStore,
          success: true,
        }
      } else {
        console.error('Direct RPS import available but components not found', RPSComponents)
      }
    }

    // Special handling for Bombs game using imported components
    if (normalizedType === 'bombs') {
      const bombsGame = BombsComponents.default
      if (bombsGame) {
        console.groupEnd()

        return {
          GameComponent: bombsGame,
          FormComponent: BombsComponents.BombsForm || null,
          GameRules: BombsComponents.BombsRules || null,
          useGameStore: BombsComponents.useBombsGameStore,
          success: true,
        }
      } else {
        console.error('Direct Bombs import available but components not found', BombsComponents)
      }
    }

    // Special handling for Cards game using imported components
    if (normalizedType === 'cards' || normalizedType === 'cards_1') {
      const cardsGame = CardsComponents.default || (CardsComponents as any).CardsGame
      if (cardsGame) {
        console.groupEnd()

        return {
          GameComponent: cardsGame,
          FormComponent: CardsComponents.CardsForm || null,
          useGameStore: CardsComponents.useCardsGameStore,
          success: true,
        }
      } else {
        console.error('Direct Cards import available but components not found', CardsComponents)
      }
    }

    // Special handling for Crash game using imported components
    if (normalizedType === 'crash') {
      if (CrashComponents.CrashGame) {
        console.groupEnd()

        return {
          GameComponent: CrashComponents.CrashGame,
          FormComponent: CrashComponents.CrashForm || null,
          GameRules: CrashComponents.CrashRules || null,
          useGameStore: CrashComponents.useCrashGameStore,
          success: true,
        }
      } else {
        console.error('Direct Crash import available but CrashGame not found', CrashComponents)
      }
    }

    // Special handling for Roulette game using imported components
    if (normalizedType === 'roulette') {
      if (RouletteComponents.RouletteGame) {
        console.groupEnd()

        return {
          GameComponent: RouletteComponents.RouletteGame,
          FormComponent: RouletteComponents.RouletteForm || null,
          GameRules: RouletteComponents.RouletteRules || null,
          useGameStore: RouletteComponents.useRouletteGameStore,
          success: true,
        }
      } else {
        console.error(
          'Direct Roulette import available but RouletteGame not found',
          RouletteComponents
        )
      }
    }

    // Special handling for Plinko game using imported components
    if (normalizedType === 'plinko') {
      const plinkoGame = PlinkoComponents.default
      if (plinkoGame) {
        console.groupEnd()

        return {
          GameComponent: plinkoGame,
          FormComponent: PlinkoComponents.PlinkoForm || null,
          GameRules: PlinkoComponents.PlinkoRules || null,
          useGameStore: PlinkoComponents.usePlinkoGameStore,
          success: true,
        }
      } else {
        console.error('Direct Plinko import available but components not found', PlinkoComponents)
      }
    }

    // Special handling for CoinFlip game using imported components
    if (normalizedType === 'coin-flip' || normalizedType === 'coinflip') {
      const coinFlipGame = CoinFlipComponents.default || CoinFlipComponents.CoinFlipGame
      if (coinFlipGame) {
        console.groupEnd()

        return {
          GameComponent: coinFlipGame,
          FormComponent: CoinFlipComponents.CoinFlipForm || null,
          GameRules: CoinFlipComponents.CoinFlipRules || null,
          useGameStore: CoinFlipComponents.useCoinFlipGameStore,
          success: true,
        }
      } else {
        console.error(
          'Direct CoinFlip import available but components not found',
          CoinFlipComponents
        )
      }
    }

    // Special handling for Crypto Launch game using imported components
    if (normalizedType === 'cryptolaunch_1' || normalizedType.startsWith('cryptolaunch_1')) {
      const cryptoGame = CryptoLaunchComponents.default
      if (cryptoGame) {
        console.groupEnd()

        return {
          GameComponent: cryptoGame,
          FormComponent: (CryptoLaunchComponents as any).CryptoLaunchForm || null,
          GameRules: (CryptoLaunchComponents as any).CryptoLaunchRules || null,
          useGameStore: (CryptoLaunchComponents as any).useCryptoLaunchGameStore,
          success: true,
        }
      } else {
        console.error(
          'Direct CryptoLaunch import available but components not found',
          CryptoLaunchComponents
        )
      }
    }

    // Try various import paths as a fallback for other games
    const importPaths = [
      // Path from current file (CustomGames/shared/CustomGamePage) up two levels to CustomGames root
      `../../${formattedGameType}/index`,
      `../../${formattedGameType}`,
      // Alternative: up one level to shared then into game dir (handles potential build quirks)
      `../${formattedGameType}/index`,
      `../${formattedGameType}`,
    ]

    for (const path of importPaths) {
      try {
        const module = await import(/* @vite-ignore */ path)

        const gameComponent = module.default || module[`${formattedGameType}Game`]
        const useStoreHook = module.useGameStore || module[`use${formattedGameType}GameStore`]

        if (gameComponent && useStoreHook) {
          console.groupEnd()
          return {
            GameComponent: gameComponent,
            FormComponent: module[`${formattedGameType}Form`] || module.Form || null,
            GameRules: module[`${formattedGameType}Rules`] || module.Rules || null,
            useGameStore: useStoreHook,
            success: true,
          }
        } else if (gameComponent) {
          console.warn(
            `[CustomGamesRouter] Found game component but MISSING store hook for ${formattedGameType}`
          )
          console.groupEnd()
          return {
            GameComponent: gameComponent,
            FormComponent: module[`${formattedGameType}Form`] || module.Form || null,
            GameRules: module[`${formattedGameType}Rules`] || module.Rules || null,
            useGameStore: null,
            success: true,
          }
        }

        console.warn(`[CustomGamesRouter] Module was imported but didn't have expected exports`)
      } catch (importError) {
        console.error(`[CustomGamesRouter] Import failed for path ${path}:`, importError)
      }
    }

    throw new Error(`No valid game component found for ${gameType}`)
  } catch (error) {
    console.error(`[CustomGamesRouter] Error loading game components:`, error)
    console.groupEnd()
    return { success: false }
  }
}

const CustomGamesRouter: React.FC = () => {
  // Extract URL parameters once
  const { gameType, instanceId } = useParams<{ gameType: string; instanceId?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEditor = useMemo(() => searchParams.get('editor') === 'true', [searchParams])

  // Memoize backend service hooks to prevent recreation
  const { loadGameConfig, loadUserCasino } = useBackendService()
  const loadGameConfigRef = useRef(loadGameConfig)
  const loadUserCasinoRef = useRef(loadUserCasino)

  // Component state
  const [casino, setCasino] = useState<CasinoEntity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [components, setComponents] = useState<{
    GameComponent?: React.ComponentType<any>
    FormComponent?: React.ComponentType<any>
    GameRules?: React.ComponentType<any>
    useGameStore?: () => any
    loading: boolean
    error?: string
  }>({
    loading: true,
  })

  // State to hold parameters loaded from backend
  const [initialParameters, setInitialParameters] = useState<Partial<BaseGameParameters> | null>(
    null
  )

  // Memoize the casino fetch function to avoid recreating it on each render
  const fetchCasino = useCallback(async () => {
    try {
      const foundCasino = await loadUserCasinoRef.current(DEFAULT_OWNER_USERNAME)

      setCasino(foundCasino)
      setLoading(false)

      if (!foundCasino) {
        console.error('[CustomGamesRouter] Casino not found for owner')
        setError('Casino not found')
        navigate('/', { replace: true })
      }
    } catch (error) {
      console.error('[CustomGamesRouter] Error fetching casino:', error)
      setLoading(false)
      setError('Error loading casino data')
    }
  }, [navigate])

  // Load casino data once
  useEffect(() => {
    setCasino(null)
    setLoading(true)
    fetchCasino()
  }, [fetchCasino])

  const effectiveInstanceId = useMemo(() => {
    if (instanceId) return instanceId
    if (!casino?.games || !gameType) return undefined
    const match = casino.games.find(
      game => (game.type || '').toLowerCase() === gameType.toLowerCase(),
    )
    return match?.id
  }, [instanceId, casino?.games, gameType])

  // Load game config from backend when casino, gameType or instanceId changes
  useEffect(() => {
    if (!casino || !gameType) return
    setInitialParameters(null)

    const loadDataFromBackend = async () => {
      try {
        if (!effectiveInstanceId) {
          setInitialParameters({})
          return
        }

        const configData = await loadGameConfigRef.current(
          casino.username,
          gameType,
          effectiveInstanceId,
        )

        if (configData) {
          const params: any = {
            ...(configData.parameters || {}),
          }

          if (configData.name) {
            params.name = configData.name
          }
          if (configData.icon) {
            params.icon = configData.icon
          }

          setInitialParameters(params)
        } else {
          setInitialParameters({})
        }
      } catch (error) {
        console.error('[CustomGameRouter] Error loading config from backend:', error)
        setInitialParameters({})
      }
    }

    loadDataFromBackend()
  }, [casino, gameType, effectiveInstanceId])

  // Load game components when casino or gameType changes
  useEffect(() => {
    if (!casino || !gameType) return
    setComponents(prev => ({ ...prev, loading: true }))
    loadGameComponents(gameType)
      .then(result => {
        if (result.success) {
          setComponents({
            GameComponent: result.GameComponent,
            FormComponent: result.FormComponent,
            GameRules: result.GameRules,
            useGameStore: result.useGameStore,
            loading: false,
          })
        } else {
          setComponents({
            loading: false,
            error: `Failed to load ${gameType} game components`,
          })
        }
      })
      .catch(error => {
        console.error(`[CustomGamesRouter] Error loading game components:`, error)
        setComponents({
          loading: false,
          error: `Error loading ${gameType} game: ${error.message}`,
        })
      })
  }, [gameType, casino?.id])

  // Redirect if params are missing (only when not loading)
  useEffect(() => {
    if (!loading && !gameType) {
      navigate('/', { replace: true })
    }
  }, [gameType, navigate, loading])

  // Clean rendering logic
  if (loading || components.loading) {
    return <div>Loading...</div>
  }

  if (
    error ||
    components.error ||
    !components.GameComponent ||
    !casino ||
    !components.useGameStore
  ) {
    const displayError = error || components.error || `${gameType} game not found`
    return (
      <div>
        <div
          style={{
            padding: '10px',
            color: 'red',
            backgroundColor: 'rgba(255,0,0,0.1)',
            margin: '10px 0',
            border: '1px solid red',
          }}
        >
          Error: {displayError}
        </div>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    )
  }

  // Waiting for initial parameters to be loaded from backend
  if (initialParameters === null) {
    return <div>Loading configuration...</div>
  }

  if (components.loading) {
    return <div>Loading Game Components...</div>
  }

  if (components.error) {
    return <div>Error loading game: {components.error}</div>
  }

  const resolvedInstanceId = effectiveInstanceId ?? null

  if (!resolvedInstanceId) {
    return <div>No {gameType} game instances configured.</div>
  }

  if (components.GameComponent && components.useGameStore) {
    return (
      <CustomGamePage
        gameName={gameType ?? 'game'}
        gameType={gameType}
        GameComponent={components.GameComponent}
        FormComponent={components.FormComponent}
        useGameStore={components.useGameStore}
        casinoName={casino?.config?.title ?? 'User Casino'}
        bannerImage={casino?.config?.bannerImage ?? ''}
        themeColor={casino?.config?.colors?.themeColor1}
        editorMode={isEditor}
        initialParameters={initialParameters}
        parentCasino={casino}
        instanceId={resolvedInstanceId}
      />
    )
  }

  // Fallback if component loading failed in an unexpected way
  return <div>Game not available.</div>
}

export default CustomGamesRouter
