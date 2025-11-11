// @ts-nocheck
import React, { useEffect, useState, useRef, useCallback } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { calculateWinTier, getWinLabel, getWinAnimationDuration } from '../utils/winTiers'

interface WinAmountDisplayProps {
  amount: number
  betAmount: number
  isVisible: boolean
  onComplete?: () => void
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const bounce = keyframes`
  0% {
    transform: translateY(20px) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translateY(-10px) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`

const continuousPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
`

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`

const glow = keyframes`
  0%, 100% {
    text-shadow: 
      0 0 10px rgba(255, 215, 0, 0.8),
      0 0 20px rgba(255, 215, 0, 0.6),
      0 0 30px rgba(255, 215, 0, 0.4);
  }
  50% {
    text-shadow: 
      0 0 15px rgba(255, 215, 0, 1),
      0 0 30px rgba(255, 215, 0, 0.8),
      0 0 45px rgba(255, 215, 0, 0.6);
  }
`

const Container = styled.div`
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
`

const WinAmount = styled.div<{ $tier: 'small' | 'medium' | 'large' | 'mega' }>`
  font-size: ${props => {
    switch (props.$tier) {
      case 'small':
        return '36px'
      case 'medium':
        return '48px'
      case 'large':
        return '64px'
      case 'mega':
        return '80px'
    }
  }};
  font-weight: bold;
  color: ${props => {
    switch (props.$tier) {
      case 'small':
        return '#FFD700'
      case 'medium':
        return '#FFA500'
      case 'large':
        return '#FF6347'
      case 'mega':
        return '#FF1493'
    }
  }};
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  ${props => {
    switch (props.$tier) {
      case 'small':
        return css`
          animation: ${fadeIn} 0.3s ease-out;
        `
      case 'medium':
        return css`
          animation:
            ${bounce} 0.5s ease-out,
            ${pulse} 1s ease-in-out 0.5s infinite;
        `
      case 'large':
        return css`
          animation:
            ${bounce} 0.6s ease-out,
            ${pulse} 0.8s ease-in-out 0.6s infinite,
            ${glow} 2s ease-in-out infinite;
        `
      case 'mega':
        return css`
          animation:
            ${bounce} 0.8s ease-out,
            ${pulse} 0.6s ease-in-out 0.8s infinite,
            ${glow} 1s ease-in-out infinite;
        `
    }
  }}
`

const WinLabel = styled.div<{ $tier: 'small' | 'medium' | 'large' | 'mega' }>`
  font-size: ${props => {
    switch (props.$tier) {
      case 'small':
        return '18px'
      case 'medium':
        return '24px'
      case 'large':
        return '32px'
      case 'mega':
        return '40px'
    }
  }};
  font-weight: bold;
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  background: ${props =>
    props.$tier === 'mega' ? 'linear-gradient(90deg, #FFD700, #FFA500, #FF6347, #FFD700)' : 'none'};
  background-size: 200% auto;
  background-clip: ${props => (props.$tier === 'mega' ? 'text' : 'initial')};
  -webkit-background-clip: ${props => (props.$tier === 'mega' ? 'text' : 'initial')};
  -webkit-text-fill-color: ${props => (props.$tier === 'mega' ? 'transparent' : 'white')};
  animation:
    ${fadeIn} 0.5s ease-out 0.2s both,
    ${props => (props.$tier === 'mega' ? shimmer : float)}
      ${props => (props.$tier === 'mega' ? '2s' : '2s')} ease-in-out 0.7s infinite;
`

const MultiplierText = styled.div<{ $tier: 'small' | 'medium' | 'large' | 'mega' }>`
  font-size: ${props => {
    switch (props.$tier) {
      case 'small':
        return '16px'
      case 'medium':
        return '20px'
      case 'large':
        return '24px'
      case 'mega':
        return '28px'
    }
  }};
  color: ${props => (props.$tier === 'mega' ? '#FFD700' : 'rgba(255, 255, 255, 0.8)')};
  margin-top: 5px;
  font-weight: ${props => (props.$tier === 'mega' || props.$tier === 'large' ? 'bold' : 'normal')};
  animation:
    ${fadeIn} 0.5s ease-out 0.3s both,
    ${continuousPulse}
      ${props => {
        switch (props.$tier) {
          case 'mega':
            return '0.8s'
          case 'large':
            return '1.2s'
          case 'medium':
            return '1.5s'
          default:
            return '2s'
        }
      }}
      ease-in-out 0.8s infinite;
`

export const WinAmountDisplay: React.FC<WinAmountDisplayProps> = ({
  amount,
  betAmount,
  isVisible,
  onComplete,
}) => {
  const [displayAmount, setDisplayAmount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<{
    timer?: NodeJS.Timeout
    interval?: NodeJS.Timeout
    animationId?: number
    isRunning?: boolean
  }>({})
  const renderTimerRef = useRef<{ start?: number; end?: number }>({})
  const animationIdCounter = useRef(0)
  const lastTriggerRef = useRef<{ amount: number; timestamp: number }>({ amount: 0, timestamp: 0 })

  // Track render timing
  useEffect(() => {
    if (isAnimating && !renderTimerRef.current.start) {
      renderTimerRef.current.start = performance.now()
      console.log('[WinAmountDisplay] First render at:', renderTimerRef.current.start)
    } else if (!isAnimating && renderTimerRef.current.start && !renderTimerRef.current.end) {
      renderTimerRef.current.end = performance.now()
      const duration = renderTimerRef.current.end - renderTimerRef.current.start
      console.log(
        `[WinAmountDisplay] ⏱️ Total display duration: ${duration.toFixed(0)}ms (${(duration / 1000).toFixed(1)}s)`
      )
      // Reset for next animation
      renderTimerRef.current = {}
    }
  }, [isAnimating])

  // Calculate multiplier and determine tier using centralized function
  const multiplier = betAmount > 0 ? amount / betAmount : 0
  const tier = calculateWinTier(amount, betAmount) || 'small'

  // Debug logging
  useEffect(() => {
    if (isVisible && amount > 0) {
      console.log('[WinAmountDisplay] Win details:', {
        amount,
        betAmount,
        multiplier,
        tier,
        expectedDuration:
          tier === 'small' ? 4000
          : tier === 'medium' ? 6000
          : tier === 'large' ? 8000
          : 10000,
      })
    }
  }, [isVisible, amount, betAmount, multiplier, tier])
  // Use centralized win label function
  const winLabel = getWinLabel(tier)

  // Function to start animation
  const startAnimation = useCallback(() => {
    // Generate unique ID for this animation
    const animationId = ++animationIdCounter.current

    // Clear any existing animation
    if (animationRef.current.isRunning) {
      console.log(
        '[WinAmountDisplay] Clearing existing animation',
        animationRef.current.animationId
      )
      if (animationRef.current.timer) {
        clearTimeout(animationRef.current.timer)
      }
      if (animationRef.current.interval) {
        clearInterval(animationRef.current.interval)
      }
    }

    // Reset display amount immediately to prevent flicker
    setDisplayAmount(0)

    // Mark new animation as running
    animationRef.current.animationId = animationId
    animationRef.current.isRunning = true

    console.log('[WinAmountDisplay] Starting animation', animationId)
    setIsAnimating(true)

    // Capture current values for this animation
    const currentTier = tier
    const currentAmount = amount
    const currentMultiplier = multiplier

    // Use centralized duration function
    const totalDuration = getWinAnimationDuration(currentTier)

    console.log('[WinAmountDisplay] Animation config:', {
      animationId,
      tier: currentTier,
      totalDuration,
      amount: currentAmount,
      multiplier: currentMultiplier,
    })

    // For small wins, show immediately
    if (currentTier === 'small') {
      setDisplayAmount(currentAmount)
    } else {
      // Count-up animation for larger wins
      const countUpDuration =
        currentTier === 'mega' ? 3000
        : currentTier === 'large' ? 2000
        : 1500
      const steps = 50
      let step = 0

      animationRef.current.interval = setInterval(() => {
        // Check if this animation is still current
        if (animationRef.current.animationId !== animationId) {
          console.log('[WinAmountDisplay] Animation', animationId, 'cancelled (interval)')
          clearInterval(animationRef.current.interval!)
          return
        }

        step++
        const easedProgress = 1 - Math.pow(1 - step / steps, 3)
        const current = currentAmount * easedProgress
        setDisplayAmount(current)

        if (step >= steps) {
          clearInterval(animationRef.current.interval!)
          animationRef.current.interval = undefined
          setDisplayAmount(currentAmount)
        }
      }, countUpDuration / steps)
    }

    // Set timer for total display duration
    animationRef.current.timer = setTimeout(() => {
      // Check if this animation is still current
      if (animationRef.current.animationId !== animationId) {
        console.log('[WinAmountDisplay] Animation', animationId, 'cancelled (timer)')
        return
      }

      console.log(
        '[WinAmountDisplay] Animation',
        animationId,
        'complete after',
        totalDuration,
        'ms'
      )
      animationRef.current.isRunning = false
      animationRef.current.timer = undefined
      animationRef.current.interval = undefined
      setIsAnimating(false)
      setDisplayAmount(0)
      onComplete?.()
    }, totalDuration)
  }, [amount, tier, multiplier, onComplete])

  // Effect to handle visibility changes with debouncing
  useEffect(() => {
    if (isVisible && amount > 0) {
      const now = Date.now()

      // Check if this is the same win being re-triggered rapidly
      // If same amount and less than 100ms since last trigger, ignore it
      if (
        lastTriggerRef.current.amount === amount &&
        now - lastTriggerRef.current.timestamp < 100
      ) {
        console.log('[WinAmountDisplay] Ignoring rapid re-trigger for same amount:', amount)
        return
      }

      // Update last trigger reference
      lastTriggerRef.current = { amount, timestamp: now }

      // Small delay to let any rapid state changes settle
      const debounceTimer = setTimeout(() => {
        startAnimation()
      }, 50)

      return () => clearTimeout(debounceTimer)
    }
  }, [isVisible, amount, startAnimation])

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (animationRef.current.timer) {
        clearTimeout(animationRef.current.timer)
      }
      if (animationRef.current.interval) {
        clearInterval(animationRef.current.interval)
      }
    }
  }, [])

  // Calculate scale based on tier
  const getScale = () => {
    switch (tier) {
      case 'mega':
        return 1.3
      case 'large':
        return 1.15
      case 'medium':
        return 1.0
      case 'small':
        return 0.9
    }
  }

  return (
    <AnimatePresence>
      {isAnimating && (
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: getScale() }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {tier !== 'small' && <WinLabel $tier={tier}>{winLabel}</WinLabel>}
            <WinAmount $tier={tier}>+{displayAmount.toFixed(2)}</WinAmount>
            {tier !== 'small' && (
              <MultiplierText $tier={tier}>{multiplier.toFixed(1)}x</MultiplierText>
            )}
          </motion.div>
        </Container>
      )}
    </AnimatePresence>
  )
}
