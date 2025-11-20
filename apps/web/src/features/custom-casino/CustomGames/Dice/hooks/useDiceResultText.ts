// @ts-nocheck
import { useEffect, useRef } from 'react'
import { type AnimationControls } from 'framer-motion'
import { ANIMATION_TIMINGS, ANIMATION_EASINGS } from '../animations'

interface UseDiceResultTextOptions {
  rolledNumber: number | null
  isRolling: boolean
  resultControls: AnimationControls
}

/**
 * Manages the dice result text lifecycle and fade-out timing
 * Extracted from DiceScene for better separation of concerns
 */
export const useDiceResultText = ({
  rolledNumber,
  isRolling,
  resultControls,
}: UseDiceResultTextOptions) => {
  const resultTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any existing timers
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current)
      resultTimerRef.current = null
    }

    // If we have a rolled number and we're not currently rolling, start a timer to fade it out
    if (rolledNumber !== null && !isRolling) {
      resultTimerRef.current = setTimeout(() => {
        resultControls.start({
          opacity: 0,
          scale: 0,
          transition: {
            duration: 0.5,
            ease: ANIMATION_EASINGS.RESULT_DISAPPEAR,
          },
        })
      }, ANIMATION_TIMINGS.RESULT_DISPLAY) // Use constant instead of hardcoded value
    }

    // Clean up on unmount
    return () => {
      if (resultTimerRef.current) {
        clearTimeout(resultTimerRef.current)
      }
    }
  }, [rolledNumber, isRolling, resultControls])

  // Format the result number
  const formattedResult = rolledNumber !== null ? rolledNumber.toFixed(2) : ''

  return { formattedResult }
}
