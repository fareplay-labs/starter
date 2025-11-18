// @ts-nocheck
import { useState, useCallback, useEffect, useRef } from 'react'

// Constants
const ANIMATION_DELAY = 2000 // 2 second delay
const ANIMATION_DURATION = 8000 // 8 seconds of animation
const REWIND_DURATION = 1000 // 1 second rewind

interface UseCarouselProps {
  itemCount: number
  initialIndex?: number
  duration?: number
  autoAdvance?: boolean
  onSlideChange?: (index: number) => void
}

export const useCarousel = ({
  itemCount,
  initialIndex = 0,
  duration = 10000,
  autoAdvance = true,
  onSlideChange,
}: UseCarouselProps) => {
  // Store the previous itemCount to detect changes
  const itemCountRef = useRef(itemCount)

  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [previousIndex, setPreviousIndex] = useState(initialIndex)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [isRewinding, setIsRewinding] = useState(false)
  const [rewindStartWidth, setRewindStartWidth] = useState(0)
  const progressRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  // Reset indices if itemCount changes (e.g., when featuredItems loads)
  useEffect(() => {
    if (itemCountRef.current !== itemCount) {
      // Only reset if the number of items changed
      setCurrentIndex(0)
      setPreviousIndex(0)
      itemCountRef.current = itemCount
    }
  }, [itemCount])

  const goToSlide = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= itemCount || newIndex === currentIndex) {
        return
      }

      setPreviousIndex(currentIndex)
      setCurrentIndex(newIndex)

      if (onSlideChange) {
        onSlideChange(newIndex)
      }
    },
    [currentIndex, itemCount, onSlideChange]
  )

  const pauseTimer = useCallback(() => {
    if (!progressRef.current) return

    // Calculate the current width percentage
    const computedWidth =
      (progressRef.current.offsetWidth / progressRef.current.parentElement!.offsetWidth) * 100

    setRewindStartWidth(computedWidth)
    setIsTimerPaused(true)
    setIsRewinding(true)

    // Reset rewinding state after animation completes
    const timeout = window.setTimeout(() => {
      setIsRewinding(false)
    }, REWIND_DURATION)

    return () => window.clearTimeout(timeout)
  }, [])

  const resumeTimer = useCallback(() => {
    setIsTimerPaused(false)
  }, [])

  // Auto-advance timer
  useEffect(() => {
    if (!autoAdvance || isTimerPaused || itemCount <= 1) return

    timerRef.current = window.setTimeout(() => {
      const newIndex = (currentIndex + 1) % itemCount
      goToSlide(newIndex)
    }, duration)

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [currentIndex, isTimerPaused, goToSlide, itemCount, autoAdvance, duration])

  return {
    currentIndex,
    previousIndex,
    isTimerPaused,
    isRewinding,
    rewindStartWidth,
    progressRef,
    goToSlide,
    pauseTimer,
    resumeTimer,
    constants: {
      ANIMATION_DELAY,
      ANIMATION_DURATION,
      REWIND_DURATION,
    },
  }
}
