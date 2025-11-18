// @ts-nocheck
import React, { useCallback, useEffect } from 'react'
import { useRouletteGameStore } from './RouletteGameStore'
import { RouletteGameRenderer } from './components/RouletteGameRenderer'
import { RouletteDrawer } from './components/RouletteDrawer'
import { useParams } from 'react-router-dom'
import { useBackendService } from '@/features/custom-casino/backend/hooks'
import { useRouletteBlockchainResult } from './hooks/useRouletteBlockchainResult'
import {
  Loading,
  Error,
  GameContainer,
} from '@/features/custom-casino/CustomGames/shared/LoadingComponents'
import { withStandardBackground } from '@/features/custom-casino/CustomGames/shared/backgrounds'
import { styled } from 'styled-components'
import { entryEvent } from '@/features/custom-casino/events/entryEvent'

const GameAreaContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  overflow: visible;
`

interface RouletteGameProps {
  editorMode?: boolean
}

const RouletteGameContainerWithBackground = withStandardBackground(GameContainer, {
  overlay: {
    gradient: 'linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)',
    opacity: 1,
  },
})

const RouletteGame: React.FC<RouletteGameProps> = () => {
  const { username, instanceId } = useParams<{ username: string; instanceId: string }>()
  const { loadUserCasino } = useBackendService()
  
  // Hook automatically handles blockchain results when not in demo mode
  useRouletteBlockchainResult()

  const {
    parameters,
    winningNumber,
    isSpinning,
    gameState,
    isLoading,
    configLoading,
    error,
    setContext,
    instanceId: currentStoreInstanceId,
    resetForNewRound,
    startResetting,
  } = useRouletteGameStore(state => ({
    parameters: state.parameters,
    winningNumber: state.winningNumber,
    isSpinning: state.isSpinning,
    gameState: state.gameState,
    isLoading: state.isLoading,
    configLoading: state.configLoading,
    error: state.error,
    setContext: state.setContext,
    instanceId: state.instanceId,
    resetForNewRound: state.resetForNewRound,
    isDrawerOpen: state.isDrawerOpen,
    placeBet: state.placeBet,
    clearAllBets: state.clearAllBets,
    playRandom: state.playRandom,
    startResetting: state.startResetting,
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
          if (!casino) console.error(`[RouletteGame] Failed to load parent casino for ${username}`)
          if (!instanceId) console.error(`[RouletteGame] Missing instanceId`)
        }
      } catch (error) {
        console.error('[RouletteGame] Error initializing game context and config:', error)
      }
    }

    initializeGame()
  }, [username, instanceId, loadUserCasino, setContext, currentStoreInstanceId])

  const handleSpinComplete = useCallback((resultNumber: number) => {
    console.log(`[RouletteGame] Spin completed with number: ${resultNumber}`)
    // Update wallet balance
    entryEvent.pub('updateBalance')
    // Note: Reset is handled by the store's resetForNewRound after the reset animation
  }, [])

  // RouletteGameStore already handles result timing, no need for additional timeouts here

  if (isLoading || configLoading || !parameters) {
    return <Loading message='Loading roulette game configuration...' />
  }

  if (error) {
    return <Error error={error} />
  }

  return (
    <RouletteGameContainerWithBackground
      backgroundColor={parameters.background}
      data-testid='roulette-game-container'
    >
      <GameAreaContainer>
        {/* Roulette Game Renderer Section */}
        {/* <WheelSection> */}
        <RouletteGameRenderer
          parameters={parameters}
          winningNumber={winningNumber}
          isSpinning={isSpinning}
          gameState={gameState}
          onSpinComplete={handleSpinComplete}
        />
        {/* </WheelSection> */}
        {/* Betting Drawer Overlay */}
        <RouletteDrawer />
      </GameAreaContainer>
    </RouletteGameContainerWithBackground>
  )
}

export default RouletteGame
