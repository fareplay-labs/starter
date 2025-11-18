// @ts-nocheck
import { useCallback } from 'react'
import { useCrashGameStore } from '../CrashGameStore'
import { useCustomGameResolveEvent, type CustomGameResolvePayload } from '../../shared/hooks/useCustomGameResolveEvent'
import { AppGameName } from '@/chains/types'
import useSUContractStore from '@/features/custom-casino/store/useSUContractStore'

/**
 * Hook to listen for blockchain results when not in demo mode
 * Uses custom event dispatching from the socket layer
 */
export const useCrashBlockchainResult = () => {
  const store = useCrashGameStore()
  const { isDemoMode } = store

  const handleGameResult = useCallback((payload: CustomGameResolvePayload) => {
    // Mark contract flow as in-progress (guards submit button) before unsetting submitting
    const suStore = useSUContractStore.getState()
    if (!suStore.inProgressEntry) {
      suStore.setInProgressEntry({ requestId: payload.trialId, timestamp: Date.now() })
    }
    // Reset the GameButton's submitting state now that we're safely in progress
    suStore.setIsSubmitting(false)
    
    // Parse the blockchain result for Crash
    // The server returns resultSides[0] as the crash multiplier (x100)
    const blockchainCrash = Number(payload.resultSides[0] ?? 100) / 100 // Convert to decimal multiplier
    
    // Call showResult with the blockchain crash point
    // The store will handle creating the result and transitioning to PLAYING for animation
    useCrashGameStore.getState().showResult(blockchainCrash)
  }, [])

  // Only listen when not in demo mode
  const shouldListen = !isDemoMode

  useCustomGameResolveEvent({
    gameName: AppGameName.Crash,
    onResolve: handleGameResult,
    enabled: shouldListen,
  })
}
