// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react'
import { styled } from 'styled-components'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { type RouletteLayoutProps } from '../types'
import { ROULETTE_NUMBERS } from '../utils/spinUtils'

const WHEEL_NUMBERS = ROULETTE_NUMBERS
const ITEM_WIDTH = 120
const VISIBLE_ITEMS = 7

const Wrapper = styled.div`
  position: relative;
  width: ${ITEM_WIDTH * VISIBLE_ITEMS}px;
  height: ${ITEM_WIDTH}px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const Strip = styled(motion.div)`
  display: flex;
  height: 100%;
  will-change: transform;
`

const Slot = styled.div<{ blur: number; isCenter: boolean }>`
  flex-shrink: 0;
  width: ${ITEM_WIDTH}px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => (props.isCenter ? '56px' : '48px')};
  font-weight: ${props => (props.isCenter ? '600' : '500')};
  color: ${props => (props.isCenter ? '#ffffff' : '#e0e0e0')};
  font-family: 'Gohu', 'Courier New', monospace;
  filter: blur(${props => props.blur}px);
  opacity: ${props => Math.max(0.3, 1 - props.blur * 0.3)};
  user-select: none;
  text-shadow: ${props => (props.isCenter ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none')};
`

const CenterIndicator = styled.div`
  position: absolute;
  left: 50%;
  top: 10%;
  bottom: 10%;
  width: 3px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: translateX(-50%);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  z-index: 10;
`

const EXTENDED_WHEEL = [
  ...WHEEL_NUMBERS,
  ...WHEEL_NUMBERS,
  ...WHEEL_NUMBERS,
  ...WHEEL_NUMBERS,
  ...WHEEL_NUMBERS,
]

export const RouletteScrollLayout: React.FC<RouletteLayoutProps> = props => {
  const { winningNumber, isSpinning: isSpinningProp, onSpinComplete } = props
  const travel = useMotionValue(0) // absolute distance travelled
  const x = useTransform(
    travel, // visible shift ≡ travel mod ITEM_WIDTH
    v => ((v % ITEM_WIDTH) + ITEM_WIDTH) % ITEM_WIDTH
  )
  const [isSpinning, setIsSpinning] = useState(false)

  const getVisibleNumbers = (offset: number) => {
    const centerIndex = Math.round(-offset / ITEM_WIDTH)
    const startIndex = centerIndex - Math.floor(VISIBLE_ITEMS / 2)

    return Array.from({ length: VISIBLE_ITEMS }, (_, i) => {
      const wheelIndex = startIndex + i
      const arrayIndex =
        ((wheelIndex % EXTENDED_WHEEL.length) + EXTENDED_WHEEL.length) % EXTENDED_WHEEL.length
      const distanceFromCenter = Math.abs(i - Math.floor(VISIBLE_ITEMS / 2))

      return {
        number: EXTENDED_WHEEL[arrayIndex],
        blur: distanceFromCenter * 1.2,
        isCenter: distanceFromCenter === 0,
        key: i, // 0-6 : stable identities
      }
    })
  }

  const [visibleNumbers, setVisibleNumbers] = useState(() => {
    const initialOffset = 0 // Keep strip in view
    return getVisibleNumbers(initialOffset)
  })

  useEffect(() => {
    const initialOffset = 0
    travel.set(initialOffset)
  }, [travel])

  useEffect(() => {
    let rafId: number

    const unsubscribe = travel.onChange(latest => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setVisibleNumbers(getVisibleNumbers(latest))
      })
    })

    return () => {
      unsubscribe()
      cancelAnimationFrame(rafId)
    }
  }, [isSpinning, travel]) // Add isSpinning as dependency

  const spinTo = useCallback(
    async (targetNumber: number) => {
      if (isSpinning) return
      setIsSpinning(true)

      const targetIndex = WHEEL_NUMBERS.indexOf(targetNumber)
      if (targetIndex === -1) {
        console.error(`Target number ${targetNumber} not found`)
        setIsSpinning(false)
        return
      }

      const targetPosition = WHEEL_NUMBERS.length * 2 + targetIndex
      const targetOffset = -targetPosition * ITEM_WIDTH

      const laps = 0.5 + Math.random() * 1 // 0.5-1.5 revolutions only
      const finalOffset = targetOffset - laps * WHEEL_NUMBERS.length * ITEM_WIDTH

      const duration = 3 + laps * 1

      console.log(
        `Spinning: ${laps.toFixed(1)} laps, duration: ${duration.toFixed(1)}s, distance: ${Math.abs(finalOffset - travel.get())}px`
      )

      try {
        await animate(travel, finalOffset, {
          duration,
          ease: [0.1, 0.5, 0.2, 1], // very slow accel, very long ease-out
        })

        setIsSpinning(false)
        onSpinComplete?.(targetNumber)
      } catch (error) {
        console.error('Animation failed:', error)
        setIsSpinning(false)
      }
    },
    [travel, isSpinning, onSpinComplete]
  )

  useEffect(() => {
    if (isSpinningProp && winningNumber !== null && !isSpinning) {
      spinTo(winningNumber)
    }
  }, [isSpinningProp, winningNumber, spinTo, isSpinning])

  return (
    <Wrapper>
      <Strip style={{ x }}>
        {visibleNumbers.map(item => (
          <Slot key={item.key} blur={item.blur} isCenter={item.isCenter}>
            {item.number}
          </Slot>
        ))}
      </Strip>
      <CenterIndicator />
    </Wrapper>
  )
}
