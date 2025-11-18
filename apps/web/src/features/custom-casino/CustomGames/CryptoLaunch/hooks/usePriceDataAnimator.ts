// @ts-nocheck
import { useState, useEffect, useCallback, useMemo } from 'react'
import { CRYPTO_LAUNCH_TIMINGS } from '../animations'

export interface PriceDataPoint {
  day: number
  price: number
  isInSellWindow: boolean
  isAboveMinSell: boolean
}

export interface PriceAnimatorConfig {
  startDay: number
  endDay: number
  minSellPrice: number
  animationDuration: number
  autoPlay?: boolean
  onDayChange?: (day: number, point: PriceDataPoint) => void
  onComplete?: (finalPoint: PriceDataPoint) => void
}

export interface PriceAnimatorControls {
  play: () => void
  pause: () => void
  reset: () => void
  seekToDay: (day: number) => void
  setSpeed: (multiplier: number) => void
}

export interface PriceAnimatorState {
  isPlaying: boolean
  currentDay: number
  currentPoint: PriceDataPoint | null
  hasCompleted: boolean
  speed: number
}

export function usePriceDataAnimator(
  priceData: number[],
  config: PriceAnimatorConfig
): [PriceAnimatorState, PriceAnimatorControls] {
  const [state, setState] = useState<PriceAnimatorState>({
    isPlaying: false,
    currentDay: 0,
    currentPoint: null,
    hasCompleted: false,
    speed: 1,
  })

  // Memoize processed price data points
  const processedData = useMemo(() => {
    return priceData.map(
      (price, index): PriceDataPoint => ({
        day: index,
        price,
        isInSellWindow: index >= config.startDay && index <= config.endDay,
        isAboveMinSell: price >= config.minSellPrice,
      })
    )
  }, [priceData, config.startDay, config.endDay, config.minSellPrice])

  // Calculate current point
  const currentPoint = useMemo(() => {
    return processedData[state.currentDay] || null
  }, [processedData, state.currentDay])

  // Update current point in state when it changes
  useEffect(() => {
    setState(prev => {
      if (prev.currentPoint === currentPoint) return prev
      return { ...prev, currentPoint }
    })
  }, [currentPoint])

  const seekToDay = useCallback(
    (day: number) => {
      const clampedDay = Math.max(0, Math.min(day, processedData.length - 1))
      const point = processedData[clampedDay]

      setState(prev => ({
        ...prev,
        currentDay: clampedDay,
        currentPoint: point,
        hasCompleted: clampedDay >= processedData.length - 1,
      }))

      // Defer callbacks to avoid setState during render
      setTimeout(() => {
        config.onDayChange?.(clampedDay, point)
      }, CRYPTO_LAUNCH_TIMINGS.CALLBACK_DEFER_TIMEOUT)
    },
    [processedData, config]
  )

  const play = useCallback(() => {
    setState(prev => {
      if (prev.hasCompleted) return prev
      return { ...prev, isPlaying: true }
    })
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }))
  }, [])

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentDay: 0,
      hasCompleted: false,
      currentPoint: processedData[0] || null,
    }))
    // Defer callback to avoid setState during render
    setTimeout(() => {
      config.onDayChange?.(0, processedData[0])
    }, CRYPTO_LAUNCH_TIMINGS.CALLBACK_DEFER_TIMEOUT)
  }, [processedData, config])

  const setSpeed = useCallback((multiplier: number) => {
    setState(prev => ({
      ...prev,
      speed: Math.max(
        CRYPTO_LAUNCH_TIMINGS.MIN_SPEED_MULTIPLIER,
        Math.min(CRYPTO_LAUNCH_TIMINGS.MAX_SPEED_MULTIPLIER, multiplier)
      ),
    }))
  }, [])

  // Animation loop
  useEffect(() => {
    if (!state.isPlaying || state.hasCompleted || processedData.length === 0) return

    const baseInterval = config.animationDuration / processedData.length
    const interval = baseInterval / state.speed

    const timer = setInterval(() => {
      setState(prev => {
        const nextDay = prev.currentDay + 1

        if (nextDay >= processedData.length) {
          const finalPoint = processedData[processedData.length - 1]
          // Defer callback to avoid setState during render
          setTimeout(
            () => config.onComplete?.(finalPoint),
            CRYPTO_LAUNCH_TIMINGS.CALLBACK_DEFER_TIMEOUT
          )
          return { ...prev, isPlaying: false, hasCompleted: true }
        }

        const nextPoint = processedData[nextDay]
        // Defer callback to avoid setState during render
        setTimeout(
          () => config.onDayChange?.(nextDay, nextPoint),
          CRYPTO_LAUNCH_TIMINGS.CALLBACK_DEFER_TIMEOUT
        )

        return {
          ...prev,
          currentDay: nextDay,
          currentPoint: nextPoint,
        }
      })
    }, interval)

    return () => clearInterval(timer)
  }, [state.isPlaying, state.hasCompleted, state.speed, processedData, config])

  // Auto-play effect
  useEffect(() => {
    if (config.autoPlay && !state.isPlaying && !state.hasCompleted) {
      setState(prev => {
        if (prev.hasCompleted) return prev
        return { ...prev, isPlaying: true }
      })
    }
  }, [config.autoPlay, state.isPlaying, state.hasCompleted])

  const controls = useMemo(
    (): PriceAnimatorControls => ({
      play,
      pause,
      reset,
      seekToDay,
      setSpeed,
    }),
    [play, pause, reset, seekToDay, setSpeed]
  )

  return [state, controls]
}
