// @ts-nocheck
import { useCallback } from 'react'
import { useDiceGameStore } from '../DiceGameStore'
import { useCustomGameResolveEvent, type CustomGameResolvePayload } from '../../shared/hooks/useCustomGameResolveEvent'
import { AppGameName } from '@/chains/types'
import useSUContractStore from '@/features/custom-casino/store/useSUContractStore'

/**
 * Hook to listen for blockchain results when not in demo mode
 * Uses custom event dispatching from the socket layer
 */
export const useDiceBlockchainResult = () => {
  const store = useDiceGameStore()
  const { isDemoMode } = store

  const handleGameResult = useCallback((payload: CustomGameResolvePayload) => {
    // Mark contract flow as in-progress (guards submit button) before unsetting submitting
    const suStore = useSUContractStore.getState()
    if (!suStore.inProgressEntry) {
      suStore.setInProgressEntry({ requestId: payload.trialId, timestamp: Date.now() })
    }
    // Reset the GameButton's submitting state now that we're safely in progress
    suStore.setIsSubmitting(false)
    
    // Parse the blockchain result for Dice
    // The server returns resultSides[0] as a number between 0-10000
    const blockchainRoll = Number(payload.resultSides[0] ?? 0)
    const rolledNumber = Math.floor(blockchainRoll / 100) // Convert to 0-100 range
    
    // Call showResult with the blockchain roll value
    // The store will handle creating the result and transitioning to PLAYING for animation
    useDiceGameStore.getState().showResult(rolledNumber)
  }, [])

  // Only listen when not in demo mode
  const shouldListen = !isDemoMode

  useCustomGameResolveEvent({
    gameName: AppGameName.Dice,
    onResolve: handleGameResult,
    enabled: shouldListen,
  })
}
