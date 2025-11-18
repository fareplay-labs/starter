// @ts-nocheck
import React, { useEffect, useMemo, useRef } from 'react'
import { useCrashGameStore } from './CrashGameStore'
import { CrashScene } from './CrashScene'
import { useParams } from 'react-router-dom'
import { useCrashSound } from './hooks/useCrashSound'
import { useCrashBlockchainResult } from './hooks/useCrashBlockchainResult'
import { useContainerDimensions } from './hooks/useContainerDimensions'
import {
  Loading,
  Error,
  GameContainer,
} from '@/features/custom-casino/CustomGames/shared/LoadingComponents'
import { useBackendService } from '@/features/custom-casino/backend/hooks'
import { withStandardBackground } from '@/features/custom-casino/CustomGames/shared/backgrounds'

interface CrashGameProps {
  editorMode?: boolean
}

// Use HOC to add background support to the base GameContainer
const CrashGameContainerWithBackground = withStandardBackground(GameContainer, {
  overlay: {
    gradient: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)',
    opacity: 1,
  },
})

const CrashGame: React.FC<CrashGameProps> = () => {
  const { username, instanceId } = useParams<{ username: string; instanceId: string }>()
  const { loadUserCasino } = useBackendService()
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useContainerDimensions(containerRef)

  // Use store with specific selectors
  const {
    parameters,
    currentMultiplier,
    crashMultiplier,
    animationState,
    gameState,
    isLoading,
    configLoading,
    error,
    setContext,
    instanceId: currentStoreInstanceId,
    entry,
    submittedEntry,
  } = useCrashGameStore(state => ({
    parameters: state.parameters,
    currentMultiplier: state.currentMultiplier,
    crashMultiplier: state.crashMultiplier,
    animationState: state.animationState,
    gameState: state.gameState,
    isLoading: state.isLoading,
    configLoading: state.configLoading,
    error: state.error,
    setContext: state.setContext,
    instanceId: state.instanceId,
    lastResult: state.lastResult,
    entry: state.entry,
    submittedEntry: state.submittedEntry,
  }))

  // Convert flat parameters to nested structure for custom sounds
  const customSounds = useMemo(() => {
    if (!parameters) return undefined

    return {
      rocketLaunch: (parameters as any)['customSounds.rocketLaunch'],
      cashOut: (parameters as any)['customSounds.cashOut'],
      crashExplosion: (parameters as any)['customSounds.crashExplosion'],
    }
  }, [parameters])

  const crashSound = useCrashSound(customSounds)

  // Hook to listen for blockchain results when not in demo mode
  useCrashBlockchainResult()

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
          if (!casino) console.error(`[CrashGame] Failed to load parent casino for ${username}`)
          if (!instanceId) console.error(`[CrashGame] Missing instanceId`)
        }
      } catch (error) {
        console.error('[CrashGame] Error initializing game context and config:', error)
      }
    }

    initializeGame()
  }, [username, instanceId, loadUserCasino, setContext, currentStoreInstanceId])

  // Track previous animation state for sound triggers
  const prevAnimationState = useRef(animationState)

  // Play sounds based on animation state changes
  useEffect(() => {
    // Rocket launch sound
    if (animationState === 'rising' && prevAnimationState.current === 'idle') {
      crashSound.playRocketLaunch()
    }

    // Cash out sound (win) - only play when first transitioning to a cashed out state
    if (
      (animationState === 'cashedOutContinuing' || animationState === 'cashedOut') &&
      prevAnimationState.current === 'rising'
    ) {
      crashSound.playCashOut()
    }

    // Crash explosion sound (can happen after cash out or without)
    if (animationState === 'crashed' && prevAnimationState.current !== 'crashed') {
      crashSound.playCrashExplosion()
    }

    // Update previous state after all checks
    prevAnimationState.current = animationState
  }, [animationState, crashSound])

  // Track when game ends to trigger reset
  const prevGameStateRef = useRef(gameState)
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const resetAnimation = useCrashGameStore(state => state.resetAnimation)

  useEffect(() => {
    // Clear any existing timeout when game state changes
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }

    if (gameState === 'SHOWING_RESULT' && prevGameStateRef.current === 'PLAYING') {
      // Now that SHOWING_RESULT only triggers after crash, we can use a shorter, more reasonable delay
      // Just long enough to appreciate the result, with slight variation for high multipliers
      const resetDelay = 2000

      resetTimeoutRef.current = setTimeout(() => {
        // Use the stable reference from the hook instead of getState()
        resetAnimation()
        resetTimeoutRef.current = null
      }, resetDelay)
    }

    prevGameStateRef.current = gameState

    // Cleanup on unmount or when dependencies change
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
        resetTimeoutRef.current = null
      }
    }
  }, [gameState, resetAnimation, crashMultiplier, parameters?.gameSpeed])

  // Calculate canvas dimensions based on container size and graphSize scale factor
  const canvasDimensions = useMemo(() => {
    if (!dimensions.width || !dimensions.height) {
      // Default dimensions if container not yet measured
      return { width: 645, height: 500 }
    }

    const graphSize = parameters?.graphSize ?? 500
    const scaleFactor = graphSize / 500 // 500 is the "base" size
    const aspectRatio = 1.29

    // Calculate dimensions that fit within container while maintaining aspect ratio
    const containerAspectRatio = dimensions.width / dimensions.height

    let canvasWidth: number
    let canvasHeight: number

    if (containerAspectRatio > aspectRatio) {
      // Container is wider than our aspect ratio, constrain by height
      canvasHeight = dimensions.height * scaleFactor
      canvasWidth = canvasHeight * aspectRatio
    } else {
      // Container is taller than our aspect ratio, constrain by width
      canvasWidth = dimensions.width * scaleFactor
      canvasHeight = canvasWidth / aspectRatio
    }

    return {
      width: Math.round(canvasWidth),
      height: Math.round(canvasHeight),
    }
  }, [dimensions, parameters?.graphSize])

  const sceneProps = useMemo(
    () => ({
      width: canvasDimensions.width,
      height: canvasDimensions.height,
      lineColor: parameters?.lineColor ?? '#00ff88',
      backgroundColor: parameters?.backgroundColor ?? '#0a0a0a',
      gridColor: parameters?.gridColor ?? '#333333',
      gridTextColor: parameters?.gridTextColor ?? '#ffffff',
      textColor: parameters?.textColor ?? '#ffffff',
      crashColor: parameters?.crashColor ?? '#ff4444',
      winColor: parameters?.winColor ?? '#00ff88',
      axesColor: parameters?.axesColor ?? '#666666',
      lineThickness: parameters?.lineThickness ?? 3,
      showGridlines: parameters?.showGridlines ?? true,
      showGridLabels: parameters?.showGridLabels ?? true,
      showAxes: parameters?.showAxes ?? true,
      showTargetLine: parameters?.showTargetLine ?? true,
      gameSpeed: parameters?.gameSpeed ?? 5,
      currentMultiplier,
      crashMultiplier,
      cashOutMultiplier:
        gameState === 'IDLE' ?
          entry.side.cashOutMultiplier > 1.0 ?
            entry.side.cashOutMultiplier
          : null
        : (submittedEntry?.side?.cashOutMultiplier ?? 0) > 1.0 ?
          (submittedEntry?.side?.cashOutMultiplier ?? null)
        : null,
      animationState,
      winText: parameters?.winText ?? 'CASHED OUT!',
      lossText: parameters?.lossText ?? 'CRASHED OUT!',
      particleIntensity: parameters?.particleIntensity ?? 5,
      rocketAppearance: parameters?.rocketAppearance ?? { url: '#ffffff' },
      rocketSize: parameters?.rocketSize ?? 12,
      rotateTowardsDirection: parameters?.rotateTowardsDirection ?? true,
      rocketEndingEffect: parameters?.rocketEndingEffect ?? 'fade',
      scaleFactor: (parameters?.graphSize ?? 500) / 500, // Pass scale factor to scene
    }),
    [
      parameters,
      currentMultiplier,
      crashMultiplier,
      animationState,
      gameState,
      entry,
      submittedEntry,
      canvasDimensions,
    ]
  )

  if (isLoading || configLoading || !parameters) {
    return <Loading message='Loading crash game configuration...' />
  }

  if (error) {
    return <Error error={error} />
  }

  return (
    <CrashGameContainerWithBackground
      ref={containerRef}
      backgroundColor={parameters.background}
      data-testid='crash-game-container'
    >
      <CrashScene {...sceneProps} />
    </CrashGameContainerWithBackground>
  )
}

export default CrashGame
