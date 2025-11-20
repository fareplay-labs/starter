// @ts-nocheck
import { useCallback } from 'react'
import { usePlinkoGameStore } from '../store/PlinkoGameStore'
import { useCustomGameResolveEvent, type CustomGameResolvePayload } from '../../shared/hooks/useCustomGameResolveEvent'
import { AppGameName } from '@/chains/types'
import useSUContractStore from '@/features/custom-casino/store/useSUContractStore'

/**
 * Hook to listen for blockchain results when not in demo mode
 * Uses custom event dispatching from the socket layer
 */
export const usePlinkoBlockchainResult = () => {
  const store = usePlinkoGameStore()
  const { isDemoMode } = store

  const handleGameResult = useCallback((payload: CustomGameResolvePayload) => {
    // Mark contract flow as in-progress (guards submit button) before unsetting submitting
    const suStore = useSUContractStore.getState()
    if (!suStore.inProgressEntry) {
      suStore.setInProgressEntry({ requestId: payload.trialId, timestamp: Date.now() })
    }
    // Reset the GameButton's submitting state now that we're safely in progress
    suStore.setIsSubmitting(false)
    
    // Parse the blockchain result for Plinko
    // The server returns resultSides as an array of bucket indexes for each ball
    const bucketIndexes = payload.resultSides.map(val => Number(val))
    
    // Call showResult with the blockchain bucket indexes
    // The store will handle creating the result and transitioning to PLAYING for animation
    usePlinkoGameStore.getState().showResult(bucketIndexes)
  }, [])

  // Only listen when not in demo mode
  const shouldListen = !isDemoMode

  useCustomGameResolveEvent({
    gameName: AppGameName.Plinko,
    onResolve: handleGameResult,
    enabled: shouldListen,
  })
}
