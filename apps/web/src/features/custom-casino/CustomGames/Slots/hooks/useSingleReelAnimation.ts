// @ts-nocheck
// TODO: DELETE THIS FILE - Single reel mode is only used for debugging
// and adds unnecessary complexity. The debug panel and SimpleReel component
// should also be evaluated for removal.
import { useEffect, useRef, useState } from 'react'

interface UseSingleReelAnimationProps {
  isSpinning: boolean
  reelPositions: number[] | null
  animationType?: string
  enabled: boolean
}

interface UseSingleReelAnimationReturn {
  reelSpinning: boolean
  targetPosition: number | null
  steadySpinning: boolean
  handleReelStop: () => void
  handleStartSteadySpin: () => void
  handleForceOutcome: (position: number) => void
  setReelSpinning: (spinning: boolean) => void
  setSteadySpinning: (steady: boolean) => void
  setTargetPosition: (position: number | null) => void
}

/**
 * Hook to manage single reel animation state and logic
 */
export function useSingleReelAnimation({
  isSpinning,
  reelPositions,
  animationType,
  enabled,
}: UseSingleReelAnimationProps): UseSingleReelAnimationReturn {
  const [reelSpinning, setReelSpinning] = useState(false)
  const [targetPosition, setTargetPosition] = useState<number | null>(null)
  const [steadySpinning, setSteadySpinning] = useState(false)
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle spinning state for single reel mode
  useEffect(() => {
    if (!enabled || !isSpinning) return

    // Clear any previous timeout
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current)
      spinTimeoutRef.current = null
    }

    // Start with steady state animation
    setSteadySpinning(true)
    setTargetPosition(null)
    setReelSpinning(true)

    // Check if we have a target position to stop at
    if (reelPositions && reelPositions.length > 0) {
      const position = reelPositions[0] // Just use the first position

      // Simulate blockchain delay - transition to final animation after 1 second
      setTimeout(() => {
        setSteadySpinning(false)
      }, 1000)

      // Schedule stop after 2 seconds total
      spinTimeoutRef.current = setTimeout(() => {
        setTargetPosition(position)
        setReelSpinning(false) // Signal that we want to stop
      }, 2000)
    }

    // Cleanup timeout on unmount
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current)
      }
    }
  }, [isSpinning, reelPositions, animationType, enabled])

  const handleReelStop = () => {
    setTargetPosition(null) // Reset for next spin
    setReelSpinning(false) // Reset spinning state
    setSteadySpinning(false) // Reset steady state flag
  }

  const handleStartSteadySpin = () => {
    setSteadySpinning(true)
    setTargetPosition(null)
    setReelSpinning(true)
  }

  const handleForceOutcome = (position: number) => {
    if (steadySpinning && reelSpinning) {
      // We're in steady state - transition to selected animation and stop
      setSteadySpinning(false)

      // Schedule stop after a brief delay to see the transition
      setTimeout(() => {
        setTargetPosition(position)
        setReelSpinning(false)
      }, 1500)
    } else if (reelSpinning) {
      // Already spinning with a non-steady animation, just stop at position
      setTimeout(() => {
        setTargetPosition(position)
        setReelSpinning(false)
      }, 500)
    } else {
      // Not spinning - start a spin to that position
      setTargetPosition(null)
      setReelSpinning(true)

      setTimeout(() => {
        setTargetPosition(position)
        setReelSpinning(false)
      }, 1000)
    }
  }

  return {
    reelSpinning,
    targetPosition,
    steadySpinning,
    handleReelStop,
    handleStartSteadySpin,
    handleForceOutcome,
    setReelSpinning,
    setSteadySpinning,
    setTargetPosition,
  }
}
