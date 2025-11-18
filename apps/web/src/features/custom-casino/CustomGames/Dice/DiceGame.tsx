// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDiceGameStore } from './DiceGameStore'
import { DiceScene } from './DiceScene'
import { useParams } from 'react-router-dom'
import { useBackendService } from '@/features/custom-casino/backend/hooks'
import {
  Loading,
  Error,
  GameContainer,
} from '@/features/custom-casino/CustomGames/shared/LoadingComponents'
import { withStandardBackground } from '@/features/custom-casino/CustomGames/shared/backgrounds'
import { useDiceSound } from './hooks/useDiceSound'
import { useDiceBlockchainResult } from './hooks/useDiceBlockchainResult'
import { entryEvent } from '@/features/custom-casino/events/entryEvent'

interface DiceGameProps {
  editorMode?: boolean
}

// Use HOC to add background support to the base GameContainer
const DiceGameContainerWithBackground = withStandardBackground(GameContainer, {
  overlay: {
    gradient: 'linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)',
    opacity: 1,
  },
})

const DiceGame: React.FC<DiceGameProps> = () => {
  const { username, instanceId } = useParams<{ username: string; instanceId: string }>()
  const { loadUserCasino } = useBackendService()

  // Use store with specific selectors
  const {
    parameters,
    rolledNumber,
    isLoading,
    configLoading,
    error,
    setContext,
    instanceId: currentStoreInstanceId,
    submittedEntry,
    isRolling,
  } = useDiceGameStore(state => ({
    parameters: state.parameters,
    rolledNumber: state.rolledNumber,
    gameState: state.gameState,
    isLoading: state.isLoading,
    configLoading: state.configLoading,
    error: state.error,
    setContext: state.setContext,
    instanceId: state.instanceId,
    submittedEntry: state.submittedEntry,
    isRolling: state.isRolling,
    lastResult: state.lastResult,
  }))

  // Convert flat parameters to nested structure for custom sounds
  const customSounds = useMemo(() => {
    if (!parameters) return undefined

    return {
      rollStart: (parameters as any)['customSounds.rollStart'],
      diceWin: (parameters as any)['customSounds.diceWin'],
      diceLoss: (parameters as any)['customSounds.diceLoss'],
    }
  }, [parameters])

  // Initialize sound system with custom sounds (after parameters are available)
  const { playDiceRollStart, playDiceWin, playDiceLoss } = useDiceSound(customSounds)

  // Hook to listen for blockchain results when not in demo mode
  useDiceBlockchainResult()

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
          if (!casino) console.error(`[DiceGame] Failed to load parent casino for ${username}`)
          if (!instanceId) console.error(`[DiceGame] Missing instanceId`)
        }
      } catch (error) {
        console.error('[DiceGame] Error initializing game context and config:', error)
      }
    }

    initializeGame()
  }, [username, instanceId, loadUserCasino, setContext, currentStoreInstanceId])

  // Track previous state for sound triggers
  const prevIsRolling = useRef(isRolling)
  const prevRolledNumber = useRef(rolledNumber)

  // Sound effect triggers - watching state changes
  useEffect(() => {
    // Trigger roll sound when dice starts rolling (isRolling goes from false to true)
    if (!prevIsRolling.current && isRolling) {
      playDiceRollStart()
    }
    prevIsRolling.current = isRolling
  }, [isRolling, playDiceRollStart])

  useEffect(() => {
    // Trigger win/loss sounds when rolledNumber becomes available (result revealed)
    if (prevRolledNumber.current === null && rolledNumber !== null && submittedEntry) {
      const targetNumber = submittedEntry.side
      const isWin = rolledNumber > targetNumber

      // Calculate timing to match when result text appears
      // From useDiceAnimation: dice animation completes, then result shows with RESULT_SHOW timing (0.3s)
      const animationDuration = parameters?.animationSpeed ?? 1200 // milliseconds
      const resultShowTiming = 300 // RESULT_SHOW from animations.ts
      const resultShowDelay = animationDuration + resultShowTiming

      setTimeout(() => {
        if (isWin) {
          playDiceWin()
        } else {
          playDiceLoss()
        }
      }, resultShowDelay)
    }
    prevRolledNumber.current = rolledNumber
  }, [rolledNumber, submittedEntry, parameters, playDiceWin, playDiceLoss])

  const handleRollComplete = useCallback(() => {
    // Update wallet balance
    entryEvent.pub('updateBalance')
    // Reset game state when animation completes
    useDiceGameStore.getState().reset()
  }, [])

  const sceneProps = useMemo(() => {
    const props = {
      size: parameters?.diceSize ?? 120,
      color:
        parameters?.diceModel === 'custom' ?
          (parameters?.diceImage ?? '/src/assets/svg/dice.svg')
        : (parameters?.diceColor ?? '#5f5fff'),
      winColor: parameters?.winColor ?? '#00ff00',
      loseColor: parameters?.loseColor ?? '#ff0000',
      animationDuration: (parameters?.animationSpeed ?? 1200) / 1000,
      targetNumber: submittedEntry?.side ?? parameters?.targetNumber ?? 50,
      animationPreset: parameters?.animationPreset ?? 'simple',
      diceModel: parameters?.diceModel ?? 'wireframe',
      rolledNumber,
      isRolling: isRolling,
      onRollComplete: handleRollComplete,
    }
    return props
  }, [
    parameters?.diceSize,
    parameters?.diceModel,
    parameters?.diceImage,
    parameters?.diceColor,
    parameters?.winColor,
    parameters?.loseColor,
    parameters?.animationSpeed,
    parameters?.targetNumber,
    parameters?.animationPreset,
    submittedEntry?.side,
    rolledNumber,
    isRolling,
    handleRollComplete,
  ])

  if (isLoading || configLoading || !parameters) {
    return <Loading message='Loading dice game configuration...' />
  }

  if (error) {
    return <Error error={error} />
  }

  return (
    <DiceGameContainerWithBackground
      backgroundColor={parameters.background}
      data-testid='dice-game-container'
    >
      <DiceScene {...sceneProps} />
    </DiceGameContainerWithBackground>
  )
}

export default DiceGame
