// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { type RPSChoice } from '../../types'
import { HandIcon } from '../HandIcon'
import { HandBorder } from '../HandBorder'
import { LaserEffects } from '../LaserEffects'
import { styled } from 'styled-components'

interface LaserAnimationProps {
  playerChoice: RPSChoice | null
  computerChoice: RPSChoice | null
  isPlaying: boolean
  handSize: number
  handSpacing: number
  glowEffect?: boolean
  primaryColor: string
  secondaryColor: string
  winColor: string
  loseColor: string
  animationSpeed: number
  onAnimationComplete?: () => void
  onReveal?: () => void
  showResult: boolean
  showVsText?: boolean
  useCustomIcons?: boolean
  customRockImage?: string
  customPaperImage?: string
  customScissorsImage?: string
}

const AnimationContainer = styled(motion.div)<{ $gap: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${props => props.$gap}px;
  width: 100%;
  height: 100%;
  position: relative;
`

const HandContainer = styled(motion.div)<{ $size: number }>`
  position: relative;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  display: flex;
  align-items: center;
  justify-content: center;
`


export const LaserAnimation: React.FC<LaserAnimationProps> = ({
  playerChoice,
  computerChoice,
  isPlaying,
  handSize,
  handSpacing,
  glowEffect = true,
  primaryColor,
  secondaryColor,
  winColor,
  loseColor,
  animationSpeed,
  onAnimationComplete,
  onReveal,
  showResult,
  showVsText = true,
  useCustomIcons,
  customRockImage,
  customPaperImage,
  customScissorsImage,
}) => {
  const leftHandControls = useAnimationControls()
  const rightHandControls = useAnimationControls()
  const versusControls = useAnimationControls()
  const [showComputerChoice, setShowComputerChoice] = useState(false)
  const [showLaser, setShowLaser] = useState(false)
  const animationStartedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [lineRange, setLineRange] = useState<{ start: number; end: number }>({ start: 33, end: 67.5 })

  // Calculate timing based on animation speed (convert ms → seconds)
  const speedSec = Math.max(0.2, (animationSpeed || 1200) / 1000)
  const handMoveDuration = speedSec * 0.2
  const laserBuildUp = speedSec * 0.3
  const laserFire = speedSec * 0.3
  const resultReveal = speedSec * 0.2
  // Keep spacing between hand containers from parameter; scale only icons
  const containerSize = 220

  // Determine if player won
  const isWin =
    playerChoice &&
    computerChoice &&
    ((playerChoice === 'rock' && computerChoice === 'scissors') ||
      (playerChoice === 'paper' && computerChoice === 'rock') ||
      (playerChoice === 'scissors' && computerChoice === 'paper'))

  useEffect(() => {
    // Recompute dynamic laser line positions based on container width + spacing + hand size
    const el = containerRef.current
    if (!el) return
    const cw = el.clientWidth || 0
    if (cw === 0) return
    const borderSize = Math.max(40, handSize)
    const offsetPx = handSpacing / 2 + borderSize / 2
    const deltaPct = (offsetPx / cw) * 100
    const center = 50
    const start = Math.max(0, center - deltaPct)
    const end = Math.min(100, center + deltaPct)
    setLineRange({ start, end })
  }, [handSize, handSpacing])

  useEffect(() => {
    if (isPlaying && playerChoice && !animationStartedRef.current) {
      animationStartedRef.current = true

      const runAnimation = async () => {
        // Reset state
        setShowComputerChoice(false)
        setShowLaser(false)

        // Ensure clean baseline: original transforms
        await Promise.all([
          leftHandControls.start({ scale: 1, x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 0 } }),
          rightHandControls.start({ scale: 1, x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 0 } })
        ])

        // Subtle intro pause (previously VS intro)
        await new Promise(resolve => setTimeout(resolve, handMoveDuration * 1000))

        // Build up phase - subtle hand glow/scale to sync with laser charge
        await Promise.all([
          leftHandControls.start({
            scale: [1.0, 1.06, 1.0],
            transition: {
              duration: laserBuildUp,
              repeat: 1,
              repeatType: 'reverse',
            },
          }),
          rightHandControls.start({
            scale: [1.0, 1.06, 1.0],
            transition: {
              duration: laserBuildUp,
              repeat: 1,
              repeatType: 'reverse',
            },
          }),
        ])

        // Sequence: left border -> center line -> right border
        const leftBorderDuration = speedSec * 0.35
        const centerLineDuration = speedSec * 0.25

        // Start center line after left border
        setTimeout(() => setShowLaser(true), leftBorderDuration * 1000)

        // Reveal computer choice roughly when right border should begin
        setTimeout(() => setShowComputerChoice(true), (leftBorderDuration + centerLineDuration) * 1000)

        // Wait for entire beam duration window
        await new Promise(resolve => setTimeout(resolve, (leftBorderDuration + centerLineDuration + laserFire) * 1000))

        // Minimal settle, no translation
        await Promise.all([
          leftHandControls.start({ scale: 1, transition: { duration: resultReveal } }),
          rightHandControls.start({ scale: 1, transition: { duration: resultReveal } }),
        ])

        if (onAnimationComplete) {
          onAnimationComplete()
        }
      }

      runAnimation()
    } else if (!isPlaying) {
      // Reset the ref when not playing
      animationStartedRef.current = false
    }
  }, [
    isPlaying,
    playerChoice,
    leftHandControls,
    rightHandControls,
    versusControls,
    handMoveDuration,
    laserBuildUp,
    laserFire,
    resultReveal,
    onAnimationComplete,
  ])

  // Reset to original transforms at end of round
  useEffect(() => {
    if (!isPlaying && !showResult) {
      leftHandControls.start({ scale: 1, x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 0 } })
      rightHandControls.start({ scale: 1, x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 0 } })
    }
  }, [isPlaying, showResult, leftHandControls, rightHandControls])

  // Scale hands based on result
  useEffect(() => {
    if (showResult && playerChoice && computerChoice) {
      const isWin =
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')

      const isLoss =
        (computerChoice === 'rock' && playerChoice === 'scissors') ||
        (computerChoice === 'paper' && playerChoice === 'rock') ||
        (computerChoice === 'scissors' && playerChoice === 'paper')

      if (isWin) {
        leftHandControls.start({ scale: 1.1 })
        rightHandControls.start({ scale: 0.9 })
      } else if (isLoss) {
        leftHandControls.start({ scale: 0.9 })
        rightHandControls.start({ scale: 1.1 })
      }
    }
  }, [showResult, playerChoice, computerChoice, leftHandControls, rightHandControls])

  return (
    <AnimationContainer ref={containerRef} $gap={handSpacing}>
      <HandContainer $size={containerSize} animate={leftHandControls}>
        <HandIcon
          choice={playerChoice}
          // Keep base icon animation disabled; laser uses borders + beams
          isPlaying={false}
          sizePx={handSize}
          glow={glowEffect}
          glowColor={primaryColor}
          idle={!playerChoice}
          useCustomIcons={useCustomIcons}
          customRockImage={customRockImage}
          customPaperImage={customPaperImage}
          customScissorsImage={customScissorsImage}
        />
        <HandBorder
          // Enable border pulse to emphasize laser effect
          isPlaying={isPlaying}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          size={handSize}
          timing={{ traceSpeed: speedSec * 0.35, delay: 0 }}
        />
      </HandContainer>

      <LaserEffects
        isPlaying={showLaser}
        showResult={showLaser && showResult}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        winColor={winColor}
        loseColor={loseColor}
        isWin={isWin ?? undefined}
        startPosition={lineRange.start}
        endPosition={lineRange.end}
        durationSec={speedSec * 0.25}
        delaySec={speedSec * 0.35}
      />

      <HandContainer $size={containerSize} animate={rightHandControls}>
        <HandIcon
          choice={showComputerChoice ? computerChoice : null}
          // Keep base icon animation disabled; laser uses borders + beams
          isPlaying={false}
          isRight
          flipped
          sizePx={handSize}
          glow={glowEffect}
          glowColor={secondaryColor}
          idle={!showComputerChoice}
          useCustomIcons={useCustomIcons}
          customRockImage={customRockImage}
          customPaperImage={customPaperImage}
          customScissorsImage={customScissorsImage}
        />
        <HandBorder
          // Enable border pulse to emphasize laser effect
          isPlaying={isPlaying}
          isRight
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          size={handSize}
          timing={{ traceSpeed: speedSec * 0.35, delay: (speedSec * 0.35) + (speedSec * 0.25) }}
        />
      </HandContainer>
    </AnimationContainer>
  )
}
