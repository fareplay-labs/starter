// @ts-nocheck
import React, { useCallback, useEffect, useMemo } from 'react'
import { type RPSGameResult } from './types'
import { useRPSGameStore } from './RPSGameStore'
import { RPSScene } from './components/RPSScene'
import { useParams } from 'react-router-dom'
import { useBackendService } from '@/components/CustomUserCasinos/backend/hooks'
import { useRPSBlockchainResult } from './hooks/useRPSBlockchainResult'
import {
  Loading,
  Error,
  GameContainer,
} from '@/components/CustomUserCasinos/CustomGames/shared/LoadingComponents'
import { withStandardBackground } from '@/components/CustomUserCasinos/CustomGames/shared/backgrounds'
// styled-components not used after switching to base GameContainer background wrapper

interface RPSGameProps {
  onGameResult?: (result: RPSGameResult) => void
}

// Use HOC to add background support to the base GameContainer
const RPSGameContainerWithBackground = withStandardBackground(GameContainer, {
  overlay: {
    gradient: 'linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)',
    opacity: 1,
  },
})

const RPSGame: React.FC<RPSGameProps> = ({ onGameResult }) => {
  // Get URL params and backend service
  const { username, instanceId } = useParams<{ username: string; instanceId: string }>()
  const { loadUserCasino } = useBackendService()
  
  // Hook automatically handles blockchain results when not in demo mode
  useRPSBlockchainResult()

  // Use the store with simplified access pattern
  const {
    gameState,
    lastResult,
    isLoading,
    configLoading,
    isPlaying,
    playerChoice,
    computerChoice,
    error,
    parameters: storeParameters,
    setContext,
    parentCasino,
    instanceId: currentStoreInstanceId,
  } = useRPSGameStore(state => ({
    gameState: state.gameState,
    lastResult: state.lastResult,
    isLoading: state.isLoading,
    configLoading: state.configLoading,
    isPlaying: state.isPlaying,
    playerChoice: state.playerChoice,
    computerChoice: state.computerChoice,
    error: state.error,
    parameters: state.parameters,
    setContext: state.setContext,
    parentCasino: state.parentCasino,
    instanceId: state.instanceId,
  }))

  const {
    primaryColor,
    secondaryColor,
    handSize,
    handSpacing,
    winColor,
    loseColor,
    showResultText,
    showVsText,
    animationSpeed,
    animationPreset,
    useCustomIcons,
    customRockImage,
    customPaperImage,
    customScissorsImage,
    glowEffect,
    background,
  } = storeParameters

  // Convert flat parameters to nested structure for custom sounds
  const customSounds = useMemo(() => {
    if (!storeParameters) return undefined

    return {
      beep: (storeParameters as any)['customSounds.beep'],
      impact: (storeParameters as any)['customSounds.impact'],
      gameWin: (storeParameters as any)['customSounds.gameWin'],
      gameLoss: (storeParameters as any)['customSounds.gameLoss'],
      gameDraw: (storeParameters as any)['customSounds.gameDraw'],
    }
  }, [storeParameters])

  // Load the parent casino and initialize with instance ID + config
  useEffect(() => {
    const initializeGame = async () => {
      if (!username || !instanceId) return
      if (currentStoreInstanceId === instanceId) return

      try {
        const casino = await loadUserCasino(username)
        if (casino && instanceId) {
          setContext(casino, instanceId)
          await useRPSGameStore.getState().loadConfigForInstance()
        } else {
          if (!casino) console.error(`[RPSGame] Failed to load parent casino for ${username}`)
          if (!instanceId) console.error('[RPSGame] Missing instanceId')
        }
      } catch (error) {
        console.error('[RPSGame] Error initializing game context and config:', error)
      }
    }

    initializeGame()
  }, [username, instanceId, loadUserCasino, setContext, currentStoreInstanceId])

  // Handle game completion
  const handleGameComplete = useCallback(() => {
    // Only forward the result to parent if requested
    if (lastResult && onGameResult) {
      if ('playerChoice' in lastResult && 'computerChoice' in lastResult) {
        onGameResult(lastResult as RPSGameResult)
      }
    }
  }, [lastResult, onGameResult])

  // Derived props for RPSScene
  const sceneProps = useCallback(
    () => ({
      handSize,
      handSpacing,
      primaryColor,
      secondaryColor,
      winColor,
      loseColor,
      animationSpeed,
      playerChoice,
      computerChoice,
      isPlaying,
      gameState,
      animationPreset,
      useCustomIcons,
      customRockImage,
      customPaperImage,
      customScissorsImage,
      glowEffect,
      showVsText,
      onGameComplete: handleGameComplete,
      showResultText,
      customSounds,
    }),
    [
      handSize,
      handSpacing,
      primaryColor,
      secondaryColor,
      winColor,
      loseColor,
      animationSpeed,
      playerChoice,
      computerChoice,
      isPlaying,
      gameState,
      animationPreset,
      useCustomIcons,
      customRockImage,
      customPaperImage,
      customScissorsImage,
      glowEffect,
      showVsText,
      showResultText,
      customSounds,
      handleGameComplete,
    ]
  )

  // Handle errors
  if (error) {
    return <Error error={error} />
  }

  // Show loading state if loading
  if (isLoading || configLoading) {
    return <Loading message='Loading rock-paper-scissors game configuration...' />
  }

  // We will only render the actual game when we have parameters and loading is complete
  return (
    <RPSGameContainerWithBackground
      backgroundColor={background}
      data-testid='rps-game-container'
    >
      <RPSScene {...sceneProps()} />
    </RPSGameContainerWithBackground>
  )
}

export default RPSGame
