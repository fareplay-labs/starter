// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { LaserLine, HorizontalLaserLine } from '../styles/animation.styles'
import { LaserParticles } from './LaserParticles'
import { CONFIG } from '../config/animation.config'

interface LaserEffectsProps {
  isPlaying: boolean
  showResult?: boolean
  primaryColor: string
  secondaryColor: string
  winColor: string
  loseColor: string
  isWin?: boolean
  startPosition?: number
  endPosition?: number
  durationSec?: number
  delaySec?: number
}

export const LaserEffects: React.FC<LaserEffectsProps> = ({
  isPlaying,
  showResult,
  primaryColor,
  secondaryColor,
  winColor,
  loseColor,
  isWin,
  startPosition,
  endPosition,
  durationSec,
  delaySec,
}) => {
  // Add a key to force animation reset when showResult changes
  const [animationKey, setAnimationKey] = useState(0)
  
  useEffect(() => {
    if (showResult) {
      // Trigger horizontal laser on result reveal
      setAnimationKey(prevKey => prevKey + 1)
    } else if (!isPlaying) {
      // Reset when not playing and result hidden
      setAnimationKey(0)
    }
  }, [showResult, isPlaying])

  // // Debug log to verify game state and animation key changes
  // useEffect(() => {
  //   console.log(`[LaserEffects] Game state: ${gameState}, Animation key: ${animationKey}`)
  // }, [gameState, animationKey])

  // Calculate laser width for particle effects
  const laserWidth = (endPosition || 67.5) - (startPosition || 33)
  const pixelWidth = (laserWidth / 100) * window.innerWidth

  // Calculate animation delay for particles to match horizontal laser
  const particleDelay = CONFIG.animations.timings.rightHandStartDelay + 1

  return (
    <>
      <LaserLine
        key={`laser-${animationKey}`}
        $isPlaying={isPlaying}
        $startPosition={startPosition}
        $endPosition={endPosition}
        $primaryColor={primaryColor}
        $secondaryColor={secondaryColor}
        $duration={durationSec}
        $delay={delaySec}
      />
      <HorizontalLaserLine
        key={`horizontal-${animationKey}`}
        $isPlaying={showResult || false}
        $primaryColor={isWin ? winColor : loseColor}
        $secondaryColor={isWin ? winColor : loseColor}
        $delay={0.15}
      />

      {/* Laser particles effect */}
      <LaserParticles
        key={`particles-horizontal-${animationKey}`}
        isVisible={showResult || false}
        color={isWin ? winColor : loseColor}
        secondaryColor={isWin ? winColor : loseColor}
        lineWidth={pixelWidth * 0.9} // 90% of the horizontal laser width
        particleCount={80}
        duration={1.2}
        gravity={200}
        animationDelay={particleDelay}
      />
    </>
  )
}
