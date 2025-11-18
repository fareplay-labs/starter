// @ts-nocheck
import { useEffect, useState } from 'react'
import { useSlotsGameStore } from '../store/SlotsGameStore'
import { calculateWinTier, type WinTier } from '../utils/winTiers'

interface WinCelebrationState {
  isActive: boolean
  winTier: WinTier | null
  multiplier: number
}

export const useWinCelebration = () => {
  const [celebrationState, setCelebrationState] = useState<WinCelebrationState>({
    isActive: false,
    winTier: null,
    multiplier: 0,
  })

  const { gameState, winningLines, entry, isSpinning } = useSlotsGameStore(state => ({
    gameState: state.gameState,
    winningLines: state.winningLines,
    entry: state.entry,
    isSpinning: state.isSpinning,
  }))

  useEffect(() => {
    // Trigger celebration when showing result with wins
    if (gameState === 'SHOWING_RESULT' && winningLines.length > 0 && !isSpinning) {
      // Sum of per-line multipliers
      const totalMultiplier = winningLines.reduce((sum, line) => sum + line.payout, 0)
      const betAmount = entry?.entryAmount || 0
      // Convert to payout amount for tiering, while keeping multiplier for SFX
      const payoutAmount = totalMultiplier * betAmount
      const winTier = calculateWinTier(payoutAmount, betAmount)

      setCelebrationState({
        isActive: true,
        winTier,
        multiplier: totalMultiplier,
      })
    } else if (gameState === 'IDLE' || gameState === 'PLAYING') {
      // Reset celebration when starting new spin or idle
      setCelebrationState({
        isActive: false,
        winTier: null,
        multiplier: 0,
      })
    }
  }, [gameState, winningLines, entry, isSpinning])

  const handleCelebrationComplete = () => {
    setCelebrationState(prev => ({ ...prev, isActive: false }))
  }

  return {
    ...celebrationState,
    onComplete: handleCelebrationComplete,
  }
}
