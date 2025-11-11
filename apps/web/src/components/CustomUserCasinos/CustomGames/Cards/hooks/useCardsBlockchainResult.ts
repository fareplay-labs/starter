// @ts-nocheck
import { useCallback } from 'react'
import { useCardsGameStore } from '../store/CardsGameStore'
import { useCustomGameResolveEvent, type CustomGameResolvePayload } from '../../shared/hooks/useCustomGameResolveEvent'
import { AppGameName } from '@/chains/types'
import useSUContractStore from '@/components/CustomUserCasinos/store/useSUContractStore'

/**
 * Hook to listen for blockchain results when not in demo mode
 * Uses custom event dispatching from the socket layer
 */
export const useCardsBlockchainResult = () => {
  const store = useCardsGameStore()
  const { isDemoMode } = store

  const handleGameResult = useCallback((payload: CustomGameResolvePayload) => {
    // Mark contract flow as in-progress (guards submit button) before unsetting submitting
    const suStore = useSUContractStore.getState()
    if (!suStore.inProgressEntry) {
      suStore.setInProgressEntry({ requestId: payload.trialId, timestamp: Date.now() })
    }
    // Reset the GameButton's submitting state now that we're safely in progress
    suStore.setIsSubmitting(false)
    
    // Parse the blockchain result for Cards
    // The server returns resultSides as card slot indices
    const cardIndices = payload.resultSides
    
    // Call showResult with the blockchain card indices
    // The store will handle creating the result and transitioning to PLAYING for animation
    useCardsGameStore.getState().showResult(cardIndices)
  }, [])

  // Only listen when not in demo mode
  const shouldListen = !isDemoMode

  // Listen for cards_1 which is what the backend sends for custom Cards games
  useCustomGameResolveEvent({
    gameName: AppGameName.Cards_1,
    onResolve: handleGameResult,
    enabled: shouldListen,
  })
}
