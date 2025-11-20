// @ts-nocheck
import React, { useCallback, useEffect, useMemo } from 'react'
import { useSlotsGameStore } from '../store/SlotsGameStore'
import { SlotsScene } from './SlotsScene'
import { useParams } from 'react-router-dom'
import { useSlotsSoundEffects } from '../hooks/useSlotsSoundEffects'
import { calculateWinTier, getWinAnimationDuration } from '../utils/winTiers'
import { useSlotsBlockchainResult } from '../hooks/useSlotsBlockchainResult'
import { transformParameters } from '../utils/parameterTransform'
import { soundSynthesizer } from '../utils/SoundSynthesizer'
import {
  Loading,
  Error,
  GameContainer,
} from '@/features/custom-casino/CustomGames/shared/LoadingComponents'
import { useBackendService } from '@/features/custom-casino/backend/hooks'
import { withStandardBackground } from '@/features/custom-casino/CustomGames/shared/backgrounds'
import { entryEvent } from '@/features/custom-casino/events/entryEvent'

interface SlotsGameProps {
  editorMode?: boolean
}

// Use HOC to add background support to the base GameContainer
const SlotsGameContainerWithBackground = withStandardBackground(GameContainer, {
  overlay: {
    gradient: 'linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)',
    opacity: 1,
  },
})

const SlotsGame: React.FC<SlotsGameProps> = () => {
  const { username, instanceId } = useParams<{ username: string; instanceId: string }>()
  const { loadUserCasino } = useBackendService()

  // Hook automatically handles blockchain results when not in demo mode
  useSlotsBlockchainResult()

  // Use store with specific selectors
  const {
    parameters,
    configLoading,
    error,
    setContext,
    instanceId: currentStoreInstanceId,
    isSpinning,
    targetReelPositions,
    winningLines,
    completeSpinAnimation,
    gameState,
    reset,
    entry,
  } = useSlotsGameStore(state => ({
    parameters: state.parameters,
    configLoading: state.configLoading,
    error: state.error,
    setContext: state.setContext,
    instanceId: state.instanceId,
    isSpinning: state.isSpinning,
    targetReelPositions: state.targetReelPositions,
    winningLines: state.winningLines,
    completeSpinAnimation: state.completeSpinAnimation,
    gameState: state.gameState,
    reset: state.reset,
    entry: state.entry,
  }))

  // Transform parameters to include nested structures
  const transformedParameters = useMemo(() => {
    return transformParameters(parameters)
  }, [parameters])

  // Initialize sound systems with transformed parameters
  const sfx = useSlotsSoundEffects(transformedParameters.customSounds, transformedParameters.synthConfig)

  // Play spin start sound when spin begins
  const prevIsSpinningRef = React.useRef(isSpinning)
  useEffect(() => {
    if (!prevIsSpinningRef.current && isSpinning) {
      sfx.playSpinStart()
    }
    prevIsSpinningRef.current = isSpinning
  }, [isSpinning, sfx])

  // Initialize sound synthesizer
  useEffect(() => {
    soundSynthesizer.init()
    if (transformedParameters.synthConfig) {
      soundSynthesizer.applyConfig(transformedParameters.synthConfig)
    }
  }, [transformedParameters.synthConfig])
  
  // Update synthesizer volume at the start/end of each spin @TODO: Should probably do some sort of event system for this instead
  useEffect(() => {
    // Update volume when spinning state changes (start or end of round)
    const savedVolume = localStorage.getItem('audioVolume')
    const savedMuteState = localStorage.getItem('audioMuted')
    const isMuted = savedMuteState ? JSON.parse(savedMuteState) : false
    const volume = isMuted ? 0 : (savedVolume ? parseFloat(savedVolume) : 0.5)
    soundSynthesizer.setVolume(volume)
  }, [isSpinning]) // Only update when spin starts or stops

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
        if (casino) {
          setContext(casino, instanceId)
        }
      } catch (err) {
        console.error('Failed to initialize game:', err)
      }
    }

    initializeGame()
  }, [username, instanceId, currentStoreInstanceId, setContext, loadUserCasino])

  // Handle spin complete callback
  const handleSpinComplete = useCallback(() => {
    completeSpinAnimation()
  }, [completeSpinAnimation])

  // Reset timing based on win tier to avoid cutting off big/mega wins
  useEffect(() => {
    if (gameState !== 'SHOWING_RESULT') return

    // Determine total multiplier and bet
    const totalMultiplier = winningLines.reduce((sum, line) => sum + line.payout, 0)
    const betAmount = Number(entry?.entryAmount ?? 0)

    let resetDelay = 1800 // default for losses or minimal wins

    if (totalMultiplier > 0 && betAmount > 0) {
      // Translate multiplier → payout amount for tier calculation
      const payoutAmount = totalMultiplier * betAmount
      const tier = calculateWinTier(payoutAmount, betAmount)
      const baseDuration = getWinAnimationDuration(tier)
      // Add a buffer so effects and coins complete cleanly
      resetDelay = baseDuration + 1200
    }

    const timer = setTimeout(() => {
      reset()
    }, resetDelay)

    return () => clearTimeout(timer)
  }, [gameState, winningLines, entry?.entryAmount, reset])

  // Handle reel stop with sound
  const handleReelStop = useCallback(
    (reelIndex: number) => {
      // Play file-based sound effect for reel stopping
      sfx.playReelStop(reelIndex, 5) // 5 total reels
    },
    [sfx]
  )

  // Show loading state
  if (configLoading) {
    return (
      <SlotsGameContainerWithBackground backgroundColor={parameters.background}>
        <Loading />
      </SlotsGameContainerWithBackground>
    )
  }

  // Show error state
  if (error) {
    return (
      <SlotsGameContainerWithBackground backgroundColor={parameters.background}>
        <Error error={error || 'An error occurred'} />
      </SlotsGameContainerWithBackground>
    )
  }

  return (
    <SlotsGameContainerWithBackground
      backgroundColor={parameters.background}
      data-testid='slots-game-container'
    >
      <SlotsScene
        parameters={transformedParameters}
        isSpinning={isSpinning}
        reelPositions={targetReelPositions}
        winningLines={winningLines}
        onSpinComplete={handleSpinComplete}
        onReelStop={handleReelStop}
        sfx={sfx}
      />
    </SlotsGameContainerWithBackground>
  )
}

export { SlotsGame }
export default SlotsGame
