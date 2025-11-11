// @ts-nocheck
import { useCallback } from 'react'
import { useCoinFlipGameStore } from '../CoinFlipGameStore'
import { type CoinSide } from '../types'
import { CoinFlipSelection } from '@/components/CustomUserCasinos/lib/crypto/coinFlip'
import { useCustomGameResolveEvent, type CustomGameResolvePayload } from '../../shared/hooks/useCustomGameResolveEvent'
import { AppGameName } from '@/chains/types'
import useSUContractStore from '@/components/CustomUserCasinos/store/useSUContractStore'

/**
 * Hook to listen for blockchain results when not in demo mode
 * Uses custom event dispatching from the socket layer
 */
export const useCoinFlipBlockchainResult = () => {
  const store = useCoinFlipGameStore()
  const { isDemoMode } = store

  const handleGameResult = useCallback((payload: CustomGameResolvePayload) => {
    // Mark contract flow as in-progress (guards submit button) before unsetting submitting
    const suStore = useSUContractStore.getState()
    if (!suStore.inProgressEntry) {
      suStore.setInProgressEntry({ requestId: payload.trialId, timestamp: Date.now() })
    }
    // Reset the GameButton's submitting state now that we're safely in progress
    suStore.setIsSubmitting(false)
    
    // Parse the blockchain result for CoinFlip
    // The server returns resultSides[0] as 0 for heads, 1 for tails
    const flipResultNum = payload.resultSides[0] ?? 0
    const flipResult: CoinSide = flipResultNum === 0 ? CoinFlipSelection.Heads : CoinFlipSelection.Tails
    
    // Call showResult with the blockchain flip result
    // The store will handle creating the result and transitioning to PLAYING for animation
    useCoinFlipGameStore.getState().showResult(flipResult)
    
    // Note: Animation completion is handled by the CoinFlipGame component
    // via the onFlipComplete callback
  }, [])

  // Only listen when not in demo mode
  // We need to listen always when not in demo mode, not just when in START state
  const shouldListen = !isDemoMode

  useCustomGameResolveEvent({
    gameName: AppGameName.CoinFlip,
    onResolve: handleGameResult,
    enabled: shouldListen,
  })
}