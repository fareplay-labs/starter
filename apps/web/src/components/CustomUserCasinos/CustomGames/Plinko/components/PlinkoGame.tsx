// @ts-nocheck
import React, { memo, useEffect, useRef, useMemo } from 'react'
import { PlinkoSceneDeterministic } from './PlinkoSceneDeterministic'

import { usePlinkoGameStore } from '../store/PlinkoGameStore'
import { useParams } from 'react-router-dom'
import { useBackendService } from '@/components/CustomUserCasinos/backend/hooks'
import {
  Error,
  GameContainer,
} from '@/components/CustomUserCasinos/CustomGames/shared/LoadingComponents'
import { withStandardBackground } from '@/components/CustomUserCasinos/CustomGames/shared/backgrounds'
import { usePlinkoSound } from '../hooks/usePlinkoSound'
import { usePlinkoBlockchainResult } from '../hooks/usePlinkoBlockchainResult'

interface PlinkoGameProps {
  editorMode?: boolean
}

// Use HOC to add background support to the base GameContainer
const PlinkoGameContainerWithBackground = withStandardBackground(GameContainer, {
  overlay: {
    gradient: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)',
    opacity: 1,
  },
})

const PlinkoGame: React.FC<PlinkoGameProps> = memo(() => {
  // Extract route params (username + instanceId)
  const { username, instanceId } =
    useParams<{ username: string; instanceId: string }>() || ({} as any)

  const { loadUserCasino } = useBackendService()
  
  // Hook automatically handles blockchain results when not in demo mode
  usePlinkoBlockchainResult()

  const {
    parameters,
    entry,
    gameState,
    isDropping,
    lastResult,
    droppedBalls,
    highlightedBuckets,
    error,
    setContext,
    instanceId: currentStoreInstanceId,
  } = usePlinkoGameStore(state => ({
    parameters: state.parameters,
    entry: state.entry,
    gameState: state.gameState,
    isDropping: state.isDropping,
    lastResult: state.lastResult,
    droppedBalls: state.droppedBalls,
    highlightedBuckets: state.highlightedBuckets,
    error: state.error,
    setContext: state.setContext,
    instanceId: state.instanceId,
  }))

  // Convert flat parameters to nested structure for custom sounds
  const customSounds = useMemo(() => {
    if (!parameters) return undefined

    return {
      ballDrop: (parameters as any)['customSounds.ballDrop'],
      bucketLanding: (parameters as any)['customSounds.bucketLanding'],
    }
  }, [parameters])

  const sounds = usePlinkoSound(customSounds)
  const soundsTriggeredRef = useRef(false)

  // Initialize store context once the component mounts / params change
  useEffect(() => {
    const initializeGameContext = async () => {
      if (!username || !instanceId) return

      if (currentStoreInstanceId === instanceId) return

      try {
        const casino = await loadUserCasino(username)

        if (casino && instanceId) {
          setContext(casino, instanceId)
        } else {
          if (!casino) console.error('[PlinkoGame] Failed to load parent casino for', username)
          if (!instanceId) console.error('[PlinkoGame] Missing instanceId')
        }
      } catch (err) {
        console.error('[PlinkoGame] Error initializing game context:', err)
      }
    }

    initializeGameContext()
  }, [username, instanceId, loadUserCasino, setContext, currentStoreInstanceId])

  // Reset sound trigger when game goes back to IDLE
  useEffect(() => {
    if (gameState === 'IDLE') {
      soundsTriggeredRef.current = false
    }
  }, [gameState])

  // Sound effects for game events - timed ball drop sounds
  useEffect(() => {
    // Only play sounds when we first start dropping balls and haven't triggered sounds yet
    if (
      droppedBalls.length > 0 &&
      parameters &&
      gameState === 'PLAYING' &&
      !soundsTriggeredRef.current
    ) {
      soundsTriggeredRef.current = true

      // Play sound for each ball drop with proper timing
      const dropDelay = parameters.ballDropDelay || 500

      for (let i = 0; i < droppedBalls.length; i++) {
        setTimeout(() => {
          sounds.playBallDrop()
        }, i * dropDelay)
      }
    }
  }, [droppedBalls.length, parameters, gameState, sounds])

  // Show error state
  if (error) {
    return <Error error={error} />
  }

  // Ensure parameters exist
  if (!parameters) {
    console.error('PlinkoGame: parameters is undefined!')
    return <Error error='Game parameters not loaded' />
  }

  return (
    <PlinkoGameContainerWithBackground
      backgroundColor={parameters.background}
      data-testid='plinko-game-container'
    >
      <PlinkoSceneDeterministic
        parameters={parameters}
        entry={entry}
        droppedBalls={droppedBalls}
        isDropping={isDropping}
        gameState={gameState}
        lastResult={lastResult}
        highlightedBuckets={highlightedBuckets}
        sounds={{
          playBucketLanding: sounds.playBucketLanding,
        }}
      />
    </PlinkoGameContainerWithBackground>
  )
})

PlinkoGame.displayName = 'PlinkoGame'

export default PlinkoGame
