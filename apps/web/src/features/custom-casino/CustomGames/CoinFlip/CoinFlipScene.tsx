// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react'
import { styled } from 'styled-components'
import { motion, useAnimationControls } from 'framer-motion'
import {
  type CoinSide,
  type ParticleEffectLevel,
  type CoinAnimationPreset,
  type CoinModelType,
} from './types'
import { WinParticles } from './components/WinParticles'
import { CoinModel } from './components/CoinModel'
import { useGameStore } from '@/features/custom-casino/CustomGames/shared/CustomGamePage/GameStoreContext'
import { CoinFlipSelection } from '@/features/custom-casino/lib/crypto/coinFlip'

export interface CoinFlipSceneProps {
  size: number
  coinColor: string
  headsCustomImage?: string
  tailsCustomImage?: string
  winColor: string
  loseColor: string
  animationDuration: number
  flipCount: number
  glowEffect: boolean
  particleEffects: ParticleEffectLevel
  particleCount: number
  animationPreset: CoinAnimationPreset
  coinModel: CoinModelType
  playerChoice: CoinSide | null
  flipResult: CoinSide | null
  isFlipping: boolean
  onFlipComplete: () => void
  onCoinLand?: () => void
}

const SceneContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-height: 300px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: 50px 50px;
    background-position: 0 0, 25px 25px;
    opacity: 0.3;
    pointer-events: none;
    z-index: 0;
  }
`

const CoinWrapper = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  will-change: transform;
`

export const CoinFlipScene: React.FC<CoinFlipSceneProps> = ({
  size,
  coinColor,
  headsCustomImage,
  tailsCustomImage,
  winColor,
  animationDuration,
  particleEffects,
  particleCount,
  animationPreset,
  coinModel,
  flipCount,
  playerChoice,
  flipResult,
  isFlipping,
  onFlipComplete,
  onCoinLand,
}) => {
  const setEntry = useGameStore(state => state.setEntry)
  const resultControls = useAnimationControls()
  const [showParticles, setShowParticles] = useState(false)
  const particlesShownRef = useRef(false)

  const handleCoinClick = () => {
    if (isFlipping) return // Don't allow clicks during animation
    const newChoice = playerChoice === CoinFlipSelection.Heads ? CoinFlipSelection.Tails : CoinFlipSelection.Heads
    setEntry({ side: newChoice })
  }

  // Determine if it's a winning flip
  const isWinningFlip = flipResult !== null && flipResult === playerChoice

  // Handle flipping animation
  useEffect(() => {
    const animate = async () => {
      if (isFlipping) {
        setShowParticles(false)
        particlesShownRef.current = false

        // Hide any previous result
        await resultControls.start({ opacity: 0, scale: 0, y: 0 })

        // Animation is now handled in child component

        // Show result with animation (after assumed animation time)
        if (flipResult !== null) {
          setTimeout(async () => {
            const resultY = -(size / 2 + 50) // Half the coin size plus 50px offset
            await resultControls.start({
              opacity: [0, 1, 1],
              scale: [0.5, 1.2, 1],
              y: [0, resultY * 1.2, resultY],
              transition: {
                duration: 0.3,
                times: [0, 0.5, 1],
                ease: 'easeOut',
              },
            })

            // Play sound when coin lands
            if (onCoinLand) {
              onCoinLand()
            }

            // Show particles if it's a win
            if (isWinningFlip && particleEffects !== 'none' && !particlesShownRef.current) {
              particlesShownRef.current = true
              setShowParticles(true)
              setTimeout(() => setShowParticles(false), 800)
            }
            // NOTE: onFlipComplete will be triggered by ThreeCoin after animation ends – avoid duplicate call here
          }, animationDuration) // Wait for animation duration
        }
      }
    }

    animate()
  }, [
    isFlipping,
    flipResult,
    resultControls,
    animationDuration,
    isWinningFlip,
    particleEffects,
    onFlipComplete,
    onCoinLand,
    size,
  ])

  return (
    <SceneContainer>
      <CoinWrapper>
        {' '}
        {/* Remove animate={coinControls} */}
        <CoinModel
          type={coinModel}
          size={size}
          color={coinColor}
          headsCustomImage={headsCustomImage}
          tailsCustomImage={tailsCustomImage}
          animationPreset={animationPreset}
          animationDuration={animationDuration}
          flipCount={flipCount}
          flipResult={flipResult}
          isFlipping={isFlipping}
          onAnimationComplete={onFlipComplete} // Note: parent onFlipComplete is for after result, but adjust if needed
          playerChoice={playerChoice}
          onCoinClick={handleCoinClick}
        />
        {showParticles && (
          <WinParticles
            isVisible={showParticles}
            color={winColor}
            coinSize={size}
            particleCount={particleCount}
          />
        )}
      </CoinWrapper>
    </SceneContainer>
  )
}
