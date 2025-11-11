// @ts-nocheck
import React, { useEffect, useCallback, useState } from 'react'
import { type RPSChoice, type RPSAnimationPreset, type RPSGameParameters } from '../types'
import { styled } from 'styled-components'
import { StandardAnimation } from './AnimationEffects/StandardAnimation'
import { ClashAnimation } from './AnimationEffects/ClashAnimation'
// import { LaserAnimation } from './AnimationEffects/LaserAnimation' // Disabled temporarily
import { WinEffects } from './WinEffects'
import { useRPSGameStore } from '../RPSGameStore'
import { useRPSSound } from '../hooks/useRPSSound'
// import { entryEvent } from '@/components/CustomUserCasinos/events/entryEvent'

const SceneContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

const VsOverlay = styled.div<{ $color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  font-weight: bold;
  color: ${props => props.$color};
  text-shadow: 0 0 20px ${props => props.$color}40;
  user-select: none;
  pointer-events: none;
  z-index: -1;
`

interface RPSSceneProps {
  handSize: number
  handSpacing: number
  primaryColor: string
  secondaryColor: string
  winColor: string
  loseColor: string
  animationSpeed: number
  playerChoice: RPSChoice | null
  computerChoice: RPSChoice | null
  isPlaying: boolean
  animationPreset: RPSAnimationPreset
  useCustomIcons?: boolean
  customRockImage?: string
  customPaperImage?: string
  customScissorsImage?: string
  onGameComplete?: () => void
  showResultText?: boolean
  showVsText?: boolean
  glowEffect?: boolean
  customSounds?: RPSGameParameters['customSounds']
}

export const RPSScene: React.FC<RPSSceneProps> = ({
  handSize,
  primaryColor,
  secondaryColor,
  handSpacing,
  winColor,
  loseColor,
  animationSpeed,
  playerChoice,
  computerChoice,
  isPlaying,
  animationPreset,
  useCustomIcons,
  customRockImage,
  customPaperImage,
  customScissorsImage,
  onGameComplete,
  showResultText = true,
  showVsText = true,
  glowEffect = true,
  customSounds,
}) => {
  const { gameState, lastResult } = useRPSGameStore()
  const { playBeep, playImpact, playGameWin, playGameLoss, playGameDraw } =
    useRPSSound(customSounds)
  const [showResult, setShowResult] = useState(false)
  const [showWinEffects, setShowWinEffects] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)

  // Debug logs removed for production parity

  // Handle animation complete
  const handleAnimationComplete = useCallback(() => {
    setShowResult(true)
    setShouldAnimate(false)

    // Notify store to complete round (single balance update + reset delay handled in store)
    useRPSGameStore.getState().completeRound()

    // Show result overlay (text always; particles gated in component)
    setShowWinEffects(true)
    setTimeout(() => setShowWinEffects(false), 2000)

    // Complete the game
    if (onGameComplete) {
      onGameComplete()
    }
  }, [onGameComplete, lastResult, playGameWin, playGameLoss, playGameDraw])

  // Universal result sound to be used at reveal time across presets
  const playResultSound = useCallback(() => {
    if (!lastResult) return
    if (lastResult.playerChoice === lastResult.computerChoice) {
      playGameDraw()
    } else if (lastResult.isWin) {
      playGameWin()
    } else {
      playGameLoss()
    }
  }, [lastResult, playGameWin, playGameLoss, playGameDraw])

  // Handle game state changes
  useEffect(() => {
    if (gameState === 'PLAYING' || gameState === 'SHOWING_RESULT') {
      setShouldAnimate(true)
    } else if (gameState === 'IDLE') {
      setShowResult(false)
      setShowWinEffects(false)
      setShouldAnimate(false)
    }
  }, [gameState])

  // Common props for all animations
  const animationProps = {
    playerChoice,
    computerChoice,
    isPlaying: shouldAnimate,
    handSize,
    handSpacing,
    primaryColor,
    secondaryColor,
    winColor,
    loseColor,
    animationSpeed,
    showResult,
    onAnimationComplete: handleAnimationComplete,
    showVsText,
    glowEffect,
  }

  // Additional props for animations that use custom hands
  const handProps = {
    useCustomIcons,
    customRockImage,
    customPaperImage,
    customScissorsImage,
  }

  // Fallback: treat 'laser' as 'standard' while disabled
  const effectivePreset = animationPreset === 'laser' ? 'standard' : animationPreset

  return (
    <SceneContainer>
      {showVsText && <VsOverlay $color={primaryColor}>VS</VsOverlay>}
      {effectivePreset === 'standard' && (
        <StandardAnimation
          {...animationProps}
          {...handProps}
          onBeat={playBeep}
          onFinalBeat={playResultSound}
        />
      )}

      {effectivePreset === 'clash' && (
        <ClashAnimation
          {...animationProps}
          {...handProps}
          onImpact={() => {
            playImpact()
            playResultSound()
          }}
        />
      )}
      {/** LaserAnimation disabled temporarily
      {animationPreset === 'laser' && (
        <LaserAnimation
          {...animationProps}
          {...handProps}
          onReveal={playResultSound}
        />
      )}
      */}

      {/* Win/Loss Effects */}
      <WinEffects
        isVisible={showWinEffects}
        isWin={lastResult?.isWin ?? null}
        isDraw={lastResult ? lastResult.playerChoice === lastResult.computerChoice : false}
        winColor={winColor}
        loseColor={loseColor}
        payout={lastResult?.payout}
        showResultText={showResultText}
        showParticles={showResultText}
      />
    </SceneContainer>
  )
}
