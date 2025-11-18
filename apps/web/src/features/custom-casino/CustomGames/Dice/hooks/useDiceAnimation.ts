// @ts-nocheck
import { useEffect, useState } from 'react'
import { useAnimationControls } from 'framer-motion'
import { DICE_ANIMATIONS, ANIMATION_TIMINGS, ANIMATION_EASINGS } from '../animations'
import { type DiceAnimationPreset } from '../types'

interface UseDiceAnimationOptions {
  isRolling: boolean
  rolledNumber: number | null
  isWinningRoll: boolean
  animationPreset: DiceAnimationPreset
  animationDuration: number
  diceSize: number
  onRollComplete: () => void
}

interface DiceAnimationControls {
  diceControls: ReturnType<typeof useAnimationControls>
  resultControls: ReturnType<typeof useAnimationControls>
  showParticles: boolean
}

/**
 * Manages dice animation sequences with proper cleanup and error handling
 * Extracted from DiceScene for better separation of concerns
 */
export const useDiceAnimation = ({
  isRolling,
  rolledNumber,
  isWinningRoll,
  animationPreset,
  animationDuration,
  diceSize,
  onRollComplete,
}: UseDiceAnimationOptions): DiceAnimationControls => {
  const diceControls = useAnimationControls()
  const resultControls = useAnimationControls()
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    if (!isRolling) return

    let isMounted = true

    const runAnimationSequence = async () => {
      try {
        // Step 1: Reset particle effects
        setShowParticles(false)

        // Step 2: Hide previous result
        await resultControls.start({
          opacity: 0,
          scale: 0,
          y: 0,
          transition: { duration: ANIMATION_TIMINGS.RESULT_HIDE_INITIAL },
        })

        if (!isMounted) return

        // Step 3: Get animation configuration
        const animation = DICE_ANIMATIONS[animationPreset]
        const duration = animationDuration || animation.duration

        // Step 4: Play dice rolling animation
        await diceControls.start({
          y: animation.y,
          rotate: animation.rotate,
          scale: animation.scale,
          transition: {
            duration,
            times: animation.times,
            ease: animation.ease,
          },
        })

        if (!isMounted) return

        // Step 5: Show result if available
        if (rolledNumber !== null) {
          await resultControls.start({
            opacity: 1,
            scale: 1,
            y: -(diceSize / 2 + 50),
            transition: {
              duration: ANIMATION_TIMINGS.RESULT_SHOW,
              ease: ANIMATION_EASINGS.RESULT_APPEAR,
            },
          })

          if (!isMounted) return

          // Step 6: Trigger particle effects for wins
          if (isWinningRoll) {
            setShowParticles(true)
            await new Promise(resolve => setTimeout(resolve, ANIMATION_TIMINGS.PARTICLE_DURATION))
            if (isMounted) {
              setShowParticles(false)
            }
          }

          // Step 7: Brief pause to show result
          await new Promise(resolve => setTimeout(resolve, ANIMATION_TIMINGS.RESULT_DISPLAY))
        }

        if (isMounted) {
          onRollComplete()
        }
      } catch (error) {
        console.error('[useDiceAnimation] Animation sequence error:', error)
        if (isMounted) {
          onRollComplete()
        }
      }
    }

    runAnimationSequence()

    return () => {
      isMounted = false
    }
  }, [
    isRolling,
    rolledNumber,
    isWinningRoll,
    animationPreset,
    animationDuration,
    diceSize,
    onRollComplete,
    diceControls,
    resultControls,
  ])

  return {
    diceControls,
    resultControls,
    showParticles,
  }
}
