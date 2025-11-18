// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import { WinAmountDisplay } from './WinAmountDisplay'
import { WinParticles } from './WinParticles'
import { ScreenEffects } from './ScreenEffects'
import { spinSoundManager } from '../utils/SpinSoundManager'
// Sound effects are provided from parent to avoid duplicate hook instances
import type { WinLineResult } from '../utils/winDetection'
import { calculateWinTier } from '../utils/winTiers'

interface WinCelebrationOrchestratorProps {
  winningLines: WinLineResult[]
  totalPayout: number
  betAmount: number
  isActive: boolean
  onComplete?: () => void
  soundEnabled?: boolean
  sfx?: {
    playWinSound: (multiplier: number, betAmount: number) => void
    playCoinsCollecting: (duration: number, intensity?: number) => void
    stopAllWinSounds: () => void
  }
}

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 40;
`

export const WinCelebrationOrchestrator: React.FC<WinCelebrationOrchestratorProps> = ({
  totalPayout,
  betAmount,
  isActive,
  onComplete,
  soundEnabled = true,
  sfx,
}) => {
  const [showAmount, setShowAmount] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [showScreenEffects, setShowScreenEffects] = useState(false)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const celebrationKeyRef = useRef<string>('')

  // Calculate win tier using centralized function
  const winTier = calculateWinTier(totalPayout, betAmount)
  const multiplier = betAmount > 0 ? totalPayout / betAmount : 0

  useEffect(() => {
    // Clear previous timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []

    // Require sfx to be ready
    if (!sfx) {
      return
    }

    // Create a unique key for this celebration based on activation and payout
    // Round values to avoid floating point precision issues
    const roundedPayout = Math.round(totalPayout * 100) / 100
    const roundedBet = Math.round(betAmount * 100) / 100
    const celebrationKey = `${isActive}-${roundedPayout}-${roundedBet}`

    if (!isActive || !winTier || totalPayout === 0) {
      // Reset state
      setShowAmount(false)
      setShowParticles(false)
      setShowScreenEffects(false)
      celebrationKeyRef.current = ''
      return
    }

    // Check if this is the same celebration we already played
    if (celebrationKeyRef.current === celebrationKey) {
      return // Skip if we already played this exact celebration
    }
    
    // Mark this celebration as played
    celebrationKeyRef.current = celebrationKey

    // Celebration sequence timeline
    const timeline = async () => {
      // 1. Brief pause for anticipation (200ms)
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 200)
        timeoutsRef.current.push(timeout)
      })

      // 2. Fade out spinning sounds for win celebration
      spinSoundManager.fadeOut(500)

      // 3. Screen effects start (for larger wins)
      if (winTier === 'large' || winTier === 'mega') {
        setShowScreenEffects(true)
      }

      // 4. Win amount appears with sound (400ms)
      await new Promise(resolve => {
        const timeout = setTimeout(() => {
          setShowAmount(true)

          // Play win sounds using file-based system
          if (soundEnabled && sfx) {
            // File-based sounds handle all win tiers appropriately
            sfx.playWinSound(multiplier, betAmount)
          }

          resolve(undefined)
        }, 200)
        timeoutsRef.current.push(timeout)
      })

      // 5. Particles start (500ms)
      await new Promise(resolve => {
        const timeout = setTimeout(() => {
          setShowParticles(true)

          // Play coin collection sounds for medium+ wins
          if (soundEnabled && sfx && (winTier === 'medium' || winTier === 'large' || winTier === 'mega')) {
            // File-based coin sounds with duration matching tier
            const duration =
              winTier === 'mega' ? 3000
              : winTier === 'large' ? 2000
              : 1000
            const intensity =
              winTier === 'mega' ? 2.0
              : winTier === 'large' ? 1.5
              : 1.0
            sfx.playCoinsCollecting(duration, intensity)
          }

          resolve(undefined)
        }, 100)
        timeoutsRef.current.push(timeout)
      })

      // 6. Keep particles and effects going for a while
      const effectsDuration =
        winTier === 'mega' ? 5000
        : winTier === 'large' ? 4000
        : winTier === 'medium' ? 3000
        : 2000

      await new Promise(resolve => {
        const timeout = setTimeout(resolve, effectsDuration)
        timeoutsRef.current.push(timeout)
      })

      // 7. Fade out particles and screen effects
      setShowParticles(false)
      setShowScreenEffects(false)
    }

    timeline().then(() => {
      // Stop any lingering win sounds and signal completion
      try { sfx?.stopAllWinSounds() } catch {}
      onComplete?.()
    })

    return () => {
      // Cleanup timeouts on unmount
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current = []
    }
  }, [isActive, winTier, totalPayout, multiplier, soundEnabled, onComplete, betAmount, sfx])

  // Don't render if no win
  if (!winTier || totalPayout === 0) return null

  return (
    <Container>
      <ScreenEffects winTier={winTier} isActive={showScreenEffects} />
      <WinParticles
        winTier={winTier}
        isActive={showParticles}
        originY={50} // Center payline
      />
      <WinAmountDisplay
        amount={totalPayout}
        betAmount={betAmount}
        isVisible={showAmount}
        onComplete={() => {
          // Amount display completed its animation
          setShowAmount(false)
        }}
      />
    </Container>
  )
}
