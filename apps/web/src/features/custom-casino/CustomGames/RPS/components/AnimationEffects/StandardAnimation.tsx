// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { type RPSChoice } from '../../types'
import { HandIcon } from '../HandIcon'
import { styled } from 'styled-components'

interface StandardAnimationProps {
  playerChoice: RPSChoice | null
  computerChoice: RPSChoice | null
  isPlaying: boolean
  handSize: number
  handSpacing: number
  glowEffect?: boolean
  primaryColor: string
  secondaryColor: string
  animationSpeed: number
  onAnimationComplete?: () => void
  onBeat?: (count: number) => void
  onFinalBeat?: () => void
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


// Removed countdown text - not needed

export const StandardAnimation: React.FC<StandardAnimationProps> = ({
  playerChoice,
  computerChoice,
  isPlaying,
  handSize,
  handSpacing,
  glowEffect = true,
  primaryColor,
  secondaryColor,
  animationSpeed,
  onAnimationComplete,
  onBeat,
  onFinalBeat,
  showResult,
  showVsText = true,
  useCustomIcons = false,
  customRockImage,
  customPaperImage,
  customScissorsImage,
}) => {
  const leftHandControls = useAnimationControls()
  const rightHandControls = useAnimationControls()
  const [displayedPlayerChoice, setDisplayedPlayerChoice] = useState<RPSChoice>('rock')
  const [displayedComputerChoice, setDisplayedComputerChoice] = useState<RPSChoice>('rock')
  const animationStartedRef = useRef(false)

  // Calculate timing based on animation speed (convert ms → seconds for framer-motion)
  const speedSec = Math.max(0.2, (animationSpeed || 1200) / 1000)
  const pumpDuration = speedSec * 0.2
  const pumpCount = 3
  const revealDuration = speedSec * 0.25

  // Amplitudes: y1 for first 3 pumps, y2 slightly larger for final reveal pump
  const y1 = Math.max(20, Math.min(40, handSize * 0.25))
  const y2 = Math.min(60, y1 * 1.4)
  // Keep spacing between hand containers from parameter; scale only icons
  const containerSize = 220

  useEffect(() => {
    if (isPlaying && playerChoice && computerChoice && !animationStartedRef.current) {
      animationStartedRef.current = true
      
      // Reset to rock for pumping animation
      setDisplayedPlayerChoice('rock')
      setDisplayedComputerChoice('rock')
      
      const runAnimation = async () => {
        // Ensure clean baseline: no scale, neutral Y before starting
        await Promise.all([
          leftHandControls.start({ scale: 1, x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 0 } }),
          rightHandControls.start({ scale: 1, x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 0 } })
        ])
        // Pump animation (3x up to y1 then back to neutral)
        for (let i = 0; i < pumpCount; i++) {

          // Pump up
          await Promise.all([
            leftHandControls.start({
              y: -y1,
              transition: { duration: pumpDuration / 2, ease: 'easeOut' }
            }),
            rightHandControls.start({
              y: -y1,
              transition: { duration: pumpDuration / 2, ease: 'easeOut' }
            })
          ])

          // Pump down
          await Promise.all([
            leftHandControls.start({
              y: 0,
              transition: { duration: pumpDuration / 2, ease: 'easeIn' }
            }),
            rightHandControls.start({
              y: 0,
              transition: { duration: pumpDuration / 2, ease: 'easeIn' }
            })
          ])

          // Play beat sound on neutral (downbeat)
          onBeat?.(i)
        }

        // Final (4th) pump: go a bit higher to y2, then slam back to neutral and reveal
        // Final up

        await Promise.all([
          leftHandControls.start({ y: -y2, transition: { duration: revealDuration / 2, ease: 'easeOut' } }),
          rightHandControls.start({ y: -y2, transition: { duration: revealDuration / 2, ease: 'easeOut' } })
        ])

        // Transform hands to final choices at the slam to neutral
        await Promise.all([
          leftHandControls.start({ y: 0, transition: { duration: revealDuration / 2, ease: 'easeIn' } }),
          rightHandControls.start({ y: 0, transition: { duration: revealDuration / 2, ease: 'easeIn' } })
        ])

        // Final coin on slam
        onFinalBeat?.()

        setDisplayedPlayerChoice(playerChoice)
        if (computerChoice) setDisplayedComputerChoice(computerChoice)

        // Reveal callback right after slam to neutral
        onAnimationComplete?.()
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
    pumpDuration, 
    revealDuration,
    onAnimationComplete,
    onBeat,
    onFinalBeat
  ])

  // When not playing, keep the displayed player hand in sync with the current selection from the form
  useEffect(() => {
    if (!isPlaying && playerChoice) {
      setDisplayedPlayerChoice(playerChoice)
    }
  }, [isPlaying, playerChoice])

  // Reset to original transforms at end of round
  useEffect(() => {
    if (!isPlaying && !showResult) {
      leftHandControls.start({ scale: 1, x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 0 } })
      rightHandControls.start({ scale: 1, x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 0 } })
    }
  }, [isPlaying, showResult, leftHandControls, rightHandControls])

  // Scale only the winning hand at the very end (after reveal)
  useEffect(() => {
    if (showResult && playerChoice && computerChoice) {
      const isPlayerWin =
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')

      // Reset both to 1 to ensure no accumulation
      leftHandControls.start({ scale: 1 })
      rightHandControls.start({ scale: 1 })

      if (isPlayerWin) {
        leftHandControls.start({ scale: 1.12, transition: { duration: 0.2 } })
      } else {
        rightHandControls.start({ scale: 1.12, transition: { duration: 0.2 } })
      }
    }
  }, [showResult, playerChoice, computerChoice, leftHandControls, rightHandControls])

  return (
    <AnimationContainer $gap={handSpacing}>
      <HandContainer 
        $size={containerSize}
        animate={leftHandControls}
      >
        <HandIcon 
          choice={displayedPlayerChoice} 
          // Disable base icon scale animation for Standard preset
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
      </HandContainer>


      <HandContainer 
        $size={containerSize}
        animate={rightHandControls}
      >
        <HandIcon 
          choice={displayedComputerChoice} 
          // Disable base icon scale animation for Standard preset
          isPlaying={false}
          isRight
          flipped
          sizePx={handSize}
          glow={glowEffect}
          glowColor={secondaryColor}
          idle={!isPlaying}
          useCustomIcons={useCustomIcons}
          customRockImage={customRockImage}
          customPaperImage={customPaperImage}
          customScissorsImage={customScissorsImage}
        />
      </HandContainer>
    </AnimationContainer>
  )
}
