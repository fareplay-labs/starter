// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { type RPSChoice } from '../../types'
import { HandIcon } from '../HandIcon'
import { styled } from 'styled-components'

interface ClashAnimationProps {
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
  onImpact?: () => void
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



// Flash overlay removed per spec

const ParticleBurst = styled(motion.div)<{ $color: string }>`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${props => props.$color};
  border-radius: 50%;
  pointer-events: none;
`

export const ClashAnimation: React.FC<ClashAnimationProps> = ({
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
  onImpact,
  showResult,
  showVsText = true,
  useCustomIcons,
  customRockImage,
  customPaperImage,
  customScissorsImage,
}) => {
  const leftHandControls = useAnimationControls()
  const rightHandControls = useAnimationControls()
  const impactControls = useAnimationControls()
  const [showParticles, setShowParticles] = useState(false)
  const animationStartedRef = useRef(false)

  // Calculate timing based on animation speed (convert ms → seconds)
  const speedSec = Math.max(0.2, (animationSpeed || 1200) / 1000)
  const pullBackDuration = speedSec * 0.3
  const slamDuration = speedSec * 0.2
  const impactPause = speedSec * 0.1
  const revealDuration = speedSec * 0.4
  // Derived timings for KO / draw sequences
  const emphasisDuration = speedSec * 0.2
  const loserLaunchDuration = speedSec * 0.3
  const winnerReturnDelay = speedSec * 0.1
  const winnerReturnDuration = speedSec * 0.25
  const loserFlickerDuration = speedSec * 0.3
  const particleHideDelay = speedSec * 0.2
  const drawScaleDuration = speedSec * 0.3
  const drawReturnDuration = speedSec * 0.25

  // Spacing between hand containers from parameter; scale only icons
  const containerSize = 220

  // Determine winner for KO sequence
  const isPlayerWin =
    playerChoice &&
    computerChoice &&
    ((playerChoice === 'rock' && computerChoice === 'scissors') ||
      (playerChoice === 'paper' && computerChoice === 'rock') ||
      (playerChoice === 'scissors' && computerChoice === 'paper'))

  useEffect(() => {
    if (isPlaying && playerChoice && computerChoice && !animationStartedRef.current) {
      animationStartedRef.current = true
      
      const runAnimation = async () => {
        // Ensure clean baseline before starting
        await Promise.all([
          leftHandControls.start({ scale: 1, x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 0 } }),
          rightHandControls.start({ scale: 1, x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 0 } })
        ])
        // Pull back phase
        await Promise.all([
          leftHandControls.start({
            x: -50,
            rotate: -10,
            transition: { duration: pullBackDuration, ease: 'easeOut' }
          }),
          rightHandControls.start({
            x: 50,
            rotate: 10,
            transition: { duration: pullBackDuration, ease: 'easeOut' }
          })
        ])

        // Slam forward to center
        await Promise.all([
          leftHandControls.start({
            x: 100,
            rotate: 0,
            transition: { duration: slamDuration, ease: 'easeIn' }
          }),
          rightHandControls.start({
            x: -100,
            rotate: 0,
            transition: { duration: slamDuration, ease: 'easeIn' }
          })
        ])

        // Impact effects
        if (onImpact) {
          onImpact()
        }
        
        // Particles only (no flashbang)
        setShowParticles(true)

        // Impact ring effect
        impactControls.start({
          scale: [0, 2],
          opacity: [1, 0],
          transition: { duration: 0.3 }
        })

        // Pause at impact
        await new Promise(resolve => setTimeout(resolve, impactPause * 1000))

        // Draw case: both hands scale up together, then down, then return home
        const isDraw = playerChoice === computerChoice
        if (isDraw) {
          await Promise.all([
            leftHandControls.start({ scale: [1, 1.15, 1], transition: { duration: drawScaleDuration, times: [0, 0.5, 1] } }),
            rightHandControls.start({ scale: [1, 1.15, 1], transition: { duration: drawScaleDuration, times: [0, 0.5, 1] } }),
          ])

          await Promise.all([
            leftHandControls.start({ x: 0, rotate: 0, transition: { duration: drawReturnDuration, ease: 'easeOut' } }),
            rightHandControls.start({ x: 0, rotate: 0, transition: { duration: drawReturnDuration, ease: 'easeOut' } }),
          ])

          // Hide particles shortly after
          setTimeout(() => setShowParticles(false), particleHideDelay * 1000)
          onAnimationComplete?.()
          return
        }

        // KO sequence: winner hits, loser flies off, then flickers back home
        const winnerControls = isPlayerWin ? leftHandControls : rightHandControls
        const loserControls = isPlayerWin ? rightHandControls : leftHandControls
        const loserExitX = isPlayerWin ? 600 : -600

        // Brief winner emphasis
        await winnerControls.start({ scale: [1, 1.15, 1], transition: { duration: emphasisDuration } })

        // Launch loser
        await loserControls.start({
          x: loserExitX,
          y: -200,
          rotate: isPlayerWin ? 25 : -25,
          opacity: [1, 1, 0],
          transition: { duration: loserLaunchDuration, ease: 'easeIn' },
        })

        // Winner returns home after a brief pause
        await new Promise(resolve => setTimeout(resolve, winnerReturnDelay * 1000))
        await winnerControls.start({
          x: 0,
          rotate: 0,
          transition: { duration: winnerReturnDuration, ease: 'easeOut' },
        })

        // After winner arrives, reset loser to home invisible
        await loserControls.start({ x: 0, y: 0, rotate: 0, opacity: 0, transition: { duration: 0 } })

        // Then flicker loser back into place
        await loserControls.start({
          opacity: [0, 1, 0, 1],
          transition: { duration: loserFlickerDuration, times: [0, 0.3, 0.6, 1], ease: 'easeInOut' },
        })

        // Hide particles
        setTimeout(() => {
          setShowParticles(false)
        }, particleHideDelay * 1000)

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
    computerChoice,
    leftHandControls,
    rightHandControls,
    impactControls,
    pullBackDuration,
    slamDuration,
    impactPause,
    revealDuration,
    onAnimationComplete,
    onImpact
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
        leftHandControls.start({ scale: 1.15 })
        rightHandControls.start({ scale: 0.85 })
      } else if (isLoss) {
        leftHandControls.start({ scale: 0.85 })
        rightHandControls.start({ scale: 1.15 })
      }
    }
  }, [showResult, playerChoice, computerChoice, leftHandControls, rightHandControls])

  // Generate particles
  const particles = showParticles ? Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2
    const distance = 100
    return (
      <ParticleBurst
        key={i}
        $color={primaryColor}
        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        animate={{
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          scale: 0,
          opacity: 0
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginLeft: -4,
          marginTop: -4
        }}
      />
    )
  }) : null

  return (
    <AnimationContainer $gap={handSpacing}>
      <HandContainer 
        $size={containerSize}
        animate={leftHandControls}
      >
        <HandIcon 
          choice={playerChoice} 
          isPlaying={isPlaying}
          sizePx={handSize}
          glow={glowEffect}
          glowColor={primaryColor}
          idle={!playerChoice}
          useCustomIcons={useCustomIcons}
          customRockImage={customRockImage}
          customPaperImage={customPaperImage}
          customScissorsImage={customScissorsImage}
        />
      </HandContainer>

      {particles}

      <HandContainer 
        $size={containerSize}
        animate={rightHandControls}
      >
        <HandIcon 
          choice={computerChoice} 
          isPlaying={isPlaying}
          isRight
          flipped
          sizePx={handSize}
          glow={glowEffect}
          glowColor={secondaryColor}
          idle={!computerChoice}
          useCustomIcons={useCustomIcons}
          customRockImage={customRockImage}
          customPaperImage={customPaperImage}
          customScissorsImage={customScissorsImage}
        />
      </HandContainer>

      {/* No flash overlay */}
    </AnimationContainer>
  )
}
  
