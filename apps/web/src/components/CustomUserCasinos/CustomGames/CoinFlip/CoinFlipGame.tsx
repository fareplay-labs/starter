// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useCoinFlipGameStore } from './CoinFlipGameStore'
import { CoinFlipScene } from './CoinFlipScene'
import { useParams } from 'react-router-dom'
import { useBackendService } from '@/components/CustomUserCasinos/backend/hooks'
import { useCoinFlipSound } from './hooks/useCoinFlipSound'
import { useCoinFlipBlockchainResult } from './hooks/useCoinFlipBlockchainResult'
import {
  Loading,
  Error,
  GameContainer,
} from '@/components/CustomUserCasinos/CustomGames/shared/LoadingComponents'
import { withStandardBackground } from '@/components/CustomUserCasinos/CustomGames/shared/backgrounds'

interface CoinFlipGameProps {
  editorMode?: boolean
}

// Use HOC to add background support to the base GameContainer
const CoinFlipGameContainerWithBackground = withStandardBackground(GameContainer, {
  overlay: {
    gradient: 'linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)',
    opacity: 1,
  },
})

const CoinFlipGame: React.FC<CoinFlipGameProps> = () => {
  const { username, instanceId } = useParams<{ username: string; instanceId: string }>()
  const { loadUserCasino } = useBackendService()
  
  // Hook automatically handles blockchain results when not in demo mode
  useCoinFlipBlockchainResult()

  // Use store with specific selectors
  const {
    parameters,
    entry,
    flipResult,
    gameState,
    isLoading,
    configLoading,
    error,
    setContext,
    instanceId: currentStoreInstanceId,
  } = useCoinFlipGameStore(state => ({
    parameters: state.parameters,
    entry: state.entry,
    flipResult: state.flipResult,
    gameState: state.gameState,
    isLoading: state.isLoading,
    configLoading: state.configLoading,
    error: state.error,
    setContext: state.setContext,
    instanceId: state.instanceId,
  }))

  // Convert flat parameters to nested structure for custom sounds
  const customSounds = useMemo(() => {
    if (!parameters) return undefined

    return {
      coinFlip: (parameters as any)['customSounds.coinFlip'],
      gameWin: (parameters as any)['customSounds.gameWin'],
      gameLoss: (parameters as any)['customSounds.gameLoss'],
    }
  }, [parameters])

  const coinFlipSound = useCoinFlipSound(customSounds)

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
          // Load config after setting context
          await useCoinFlipGameStore.getState().loadConfigForInstance()
        } else {
          if (!casino) console.error(`[CoinFlipGame] Failed to load parent casino for ${username}`)
          if (!instanceId) console.error(`[CoinFlipGame] Missing instanceId`)
        }
      } catch (error) {
        console.error('[CoinFlipGame] Error initializing game context and config:', error)
      }
    }

    initializeGame()
  }, [username, instanceId, loadUserCasino, setContext, currentStoreInstanceId])

  // Track previous state for sound triggers
  const prevGameState = useRef(gameState)
  const hasPlayedFlipSound = useRef(false)

  // Play flip sound when game starts
  useEffect(() => {
    if (gameState === 'PLAYING' && prevGameState.current === 'IDLE') {
      coinFlipSound.playCoinFlip()
      hasPlayedFlipSound.current = true
    }
    prevGameState.current = gameState
  }, [gameState, coinFlipSound])

  // Create a callback for when the coin lands
  const handleCoinLand = useCallback(() => {
    if (flipResult && hasPlayedFlipSound.current) {
      // Determine if player won
      const playerWon = flipResult === entry.side
      if (playerWon) {
        coinFlipSound.playWin()
      } else {
        coinFlipSound.playLoss()
      }
      hasPlayedFlipSound.current = false // Reset for next game
    }
  }, [flipResult, entry.side, coinFlipSound])

  const handleFlipComplete = useCallback(() => {
    // Complete the flip animation and update state
    useCoinFlipGameStore.getState().completeFlip()
  }, [])

  const sceneProps = useMemo(
    () => ({
      size: parameters?.coinSize ?? 120,
      coinColor: parameters?.coinColor ?? '#ffd700',
      headsCustomImage: parameters?.headsCustomImage,
      tailsCustomImage: parameters?.tailsCustomImage,
      winColor: parameters?.winColor ?? '#00ff00',
      loseColor: parameters?.lossColor ?? '#ff0000',
      animationDuration: parameters?.animationDuration ?? 1500, // Keep in milliseconds
      flipCount: parameters?.flipCount ?? 5,
      glowEffect: parameters?.glowEffect ?? true,
      particleEffects: parameters?.particleEffects ?? 'less',
      particleCount: parameters?.particleCount ?? 32,
      animationPreset: parameters?.animationPreset ?? 'flip',
      coinModel: parameters?.coinModel ?? 'solid',
      playerChoice: entry.side,
      flipResult,
      isFlipping: gameState === 'PLAYING',
      onFlipComplete: handleFlipComplete,
      onCoinLand: handleCoinLand,
    }),
    [parameters, entry.side, flipResult, gameState, handleFlipComplete, handleCoinLand]
  )

  if (isLoading || configLoading || !parameters) {
    return <Loading message='Loading coin flip game configuration...' />
  }

  if (error) {
    return <Error error={error} />
  }

  return (
    <CoinFlipGameContainerWithBackground
      backgroundColor={parameters.background}
      data-testid='coinflip-game-container'
    >
      <CoinFlipScene {...sceneProps} />
    </CoinFlipGameContainerWithBackground>
  )
}

export default CoinFlipGame
