// @ts-nocheck
import React, { useEffect, useCallback, useMemo, useRef } from 'react'
import { CryptoLaunchChart, WinningsTicker } from './CryptoLaunchVisuals'
import { useCryptoLaunchGameStore } from '../store/CryptoLaunchGameStore'
import { useCryptoLaunchGameInitialization } from '../hooks/useCryptoLaunchGameInitialization'
import { usePriceDataAnimator } from '../hooks/usePriceDataAnimator'
import { useCryptoLaunchSound } from '../hooks/useCryptoLaunchSound'
import { useCryptoLaunchBlockchainResult } from '../hooks/useCryptoLaunchBlockchainResult'
import {
  Loading,
  Error,
  GameContainer,
} from '@/components/CustomUserCasinos/CustomGames/shared/LoadingComponents'
import { withStandardBackground } from '@/components/CustomUserCasinos/CustomGames/shared/backgrounds'
import { entryEvent } from '@/components/CustomUserCasinos/events/entryEvent'

// Animation speed derives from parameters (ms per day)

const CryptoLaunchGameContainerWithBackground = withStandardBackground(GameContainer, {
  overlay: {
    gradient: 'linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)',
    opacity: 1,
  },
})

export const CryptoLaunchGame: React.FC = () => {
  // Initialize game context + load parameters
  const { isLoading: initLoading, error: initError } = useCryptoLaunchGameInitialization()

  // Access store state
  const { gameState, gameData, parameters, entry, predeterminedResult } = useCryptoLaunchGameStore(state => ({
    gameState: state.gameState,
    gameData: state.gameData,
    parameters: state.parameters,
    entry: state.entry,
    hasWon: state.hasWon,
    finalResult: state.finalResult,
    predeterminedResult: state.predeterminedResult,
  }))

  // Convert flat parameters to nested structure for custom sounds
  const customSounds = useMemo(() => {
    if (!parameters) return undefined

    return {
      gameStart: (parameters as any)['customSounds.gameStart'],
      positiveBeep: (parameters as any)['customSounds.positiveBeep'],
      negativeBeep: (parameters as any)['customSounds.negativeBeep'],
      win: (parameters as any)['customSounds.win'],
      loss: (parameters as any)['customSounds.loss'],
      winningLoop: (parameters as any)['customSounds.winningLoop'],
    }
  }, [parameters])

  // Sound integration
  const { 
    playGameStart, 
    playPositiveBeep, 
    playNegativeBeep, 
    playGameWin, 
    playGameLoss,
    startWinningLoop,
    stopWinningLoop 
  } = useCryptoLaunchSound(customSounds)

  // Blockchain integration - listen for results when not in demo mode
  useCryptoLaunchBlockchainResult()

  // Track previous state for sound events
  const prevStateRef = useRef({ gameState: 'IDLE', isAboveMinSell: false, hasPlayedResult: false })

  // Handle animation completion callback
  const handleAnimationComplete = useCallback(
    (finalPoint: any) => {
      if (!predeterminedResult) {
        console.warn('[CryptoLaunch] No predetermined result available')
        return
      }

      // Use the predetermined result from the store
      const isWin = predeterminedResult.isWin

      // Stop winning loop if it's playing
      soundsRef.current.stopWinningLoop()

      // Play result sound
      if (isWin) {
        soundsRef.current.playGameWin()
      } else {
        soundsRef.current.playGameLoss()
      }

      // Update store with final result
      useCryptoLaunchGameStore.setState({
        gameState: 'SHOWING_RESULT',
        hasWon: isWin,
        finalResult: predeterminedResult,
        lastResult: predeterminedResult,
      })

      // Update wallet balance
      entryEvent.pub('updateBalance')
      
      // Reset after a delay to show the result
      setTimeout(() => {
        // Call the store's reset function which will publish gameFinished event
        const store = useCryptoLaunchGameStore.getState()
        store.reset() // This will call the base reset which publishes gameFinished
      }, 2000) // 2 second delay to show result
    },
    [predeterminedResult]
  )

  // Handle day changes from animation
  const handleDayChange = useCallback((_day: number, point: any) => {
    // Manage winning loop and crossing sounds when in sell window
    if (point && point.isInSellWindow) {
      const wasAboveMinSell = prevStateRef.current.isAboveMinSell
      const isAboveMinSell = point.isAboveMinSell

      // Start winning loop when above min sell price in sell window
      if (isAboveMinSell && !wasAboveMinSell) {
        soundsRef.current.startWinningLoop()
        soundsRef.current.playPositiveBeep() // Also play positive beep
      }
      // Stop winning loop when below min sell price
      else if (!isAboveMinSell && wasAboveMinSell) {
        soundsRef.current.stopWinningLoop()
        soundsRef.current.playNegativeBeep() // Also play negative beep
      }

      prevStateRef.current.isAboveMinSell = isAboveMinSell
    } else {
      // Stop winning loop when outside sell window
      if (prevStateRef.current.isAboveMinSell) {
        soundsRef.current.stopWinningLoop()
        prevStateRef.current.isAboveMinSell = false
      }
    }
  }, [])

  // Set up price data animator
  const priceData = useMemo(
    () => gameData?.priceData || Array(365).fill(entry.side.startPrice),
    [gameData?.priceData, entry.side.startPrice]
  )

  const animatorConfig = useMemo(
    () => ({
      startDay: entry.side.startDay,
      endDay: entry.side.endDay,
      minSellPrice: entry.side.minSellPrice,
      animationDuration: parameters.animationDuration,
      autoPlay: gameState === 'PLAYING',
      onDayChange: handleDayChange,
      onComplete: handleAnimationComplete,
    }),
    [
      entry.side.startDay,
      entry.side.endDay,
      entry.side.minSellPrice,
      parameters.animationDuration,
      gameState,
      handleDayChange,
      handleAnimationComplete,
    ]
  )

  const [animatorState, animatorControls] = usePriceDataAnimator(priceData, animatorConfig)

  // Store sound functions in refs to avoid re-renders
  const soundsRef = useRef({
    playGameStart,
    playPositiveBeep,
    playNegativeBeep,
    playGameWin,
    playGameLoss,
    startWinningLoop,
    stopWinningLoop,
  })
  soundsRef.current = {
    playGameStart,
    playPositiveBeep,
    playNegativeBeep,
    playGameWin,
    playGameLoss,
    startWinningLoop,
    stopWinningLoop,
  }

  // Auto-start animation when game starts playing
  useEffect(() => {
    if (gameState === 'PLAYING' && gameData && prevStateRef.current.gameState !== 'PLAYING') {
      // Play game start sound when transitioning to PLAYING
      soundsRef.current.playGameStart()
      prevStateRef.current.gameState = gameState

      // Start animation
      animatorControls.reset()
      animatorControls.play()
    } else if (gameState === 'IDLE' && prevStateRef.current.gameState !== 'IDLE') {
      // Reset animation when going to IDLE state
      animatorControls.reset()
      prevStateRef.current.gameState = gameState
    } else if (gameState !== 'PLAYING') {
      prevStateRef.current.gameState = gameState
    }
  }, [gameState, gameData, animatorControls])

  // Show loading / error states during initialization (after hooks to satisfy rules)
  if (initLoading || !parameters) {
    return <Loading message='Loading crypto launch game configuration...' />
  }

  if (initError) {
    return <Error error={initError} />
  }

  // Use animation state for display
  const displayCurrentDay = gameState === 'IDLE' ? 0 : animatorState.currentDay
  const currentPoint = animatorState.currentPoint || {
    day: 0,
    price: entry.side.startPrice,
    isInSellWindow: false,
    isAboveMinSell: false,
  }

  return (
    <CryptoLaunchGameContainerWithBackground backgroundColor={parameters.background}>
      <CryptoLaunchChart
        parameters={parameters}
        entry={entry}
        priceData={priceData}
        currentDay={displayCurrentDay}
        isInSellWindow={currentPoint.isInSellWindow}
        isAboveMinSell={currentPoint.isAboveMinSell}
      />
      {/* Winnings ticker overlay */}
      <WinningsTicker currentDay={displayCurrentDay} />
    </CryptoLaunchGameContainerWithBackground>
  )
}
