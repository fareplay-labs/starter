// @ts-nocheck
import { useMemo } from 'react'
import type { FareGameState } from '../types'

interface UseIsDisabledProps {
  gameState: FareGameState
  animLoading: boolean
  betAmount: number
  // Optional fields for different game types
  selectedTiles?: Array<any> // For Bombs game
  playerChoice?: any // For RPS game
  placedBets?: Array<any> // For Roulette game
  isProcessing?: boolean // For any additional processing state
  customConditions?: boolean // For any game-specific conditions
}

export const useIsDisabled = ({
  gameState,
  animLoading,
  betAmount,
  selectedTiles,
  playerChoice,
  placedBets,
  isProcessing = false,
  customConditions = true, // Default to true (enabled)
}: UseIsDisabledProps) => {
  return useMemo(() => {
    const isIdle = gameState === 'IDLE'

    // Base conditions that apply to all games
    const baseDisabled = !isIdle || animLoading || betAmount <= 0 || isProcessing

    // Game-specific conditions
    let gameSpecificDisabled = false

    // For Bombs game - needs tile selection
    if (selectedTiles !== undefined) {
      gameSpecificDisabled = selectedTiles.length === 0
    }

    // For RPS game - needs player choice
    if (playerChoice !== undefined) {
      gameSpecificDisabled = !playerChoice
    }

    // For Roulette game - needs placed bets
    if (placedBets !== undefined) {
      gameSpecificDisabled = placedBets.length === 0
    }

    // Custom conditions for any additional game-specific logic
    const customDisabled = !customConditions

    return baseDisabled || gameSpecificDisabled || customDisabled
  }, [
    gameState,
    animLoading,
    betAmount,
    selectedTiles,
    playerChoice,
    placedBets,
    isProcessing,
    customConditions,
  ])
}
