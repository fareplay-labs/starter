// @ts-nocheck
import { useCallback } from 'react'
import { useRouletteGameStore } from '../RouletteGameStore'
import { useCustomGameResolveEvent, type CustomGameResolvePayload } from '../../shared/hooks/useCustomGameResolveEvent'
import { AppGameName } from '@/chains/types'
import useSUContractStore from '@/components/CustomUserCasinos/store/useSUContractStore'

/**
 * Hook to listen for blockchain results when not in demo mode
 * Uses custom event dispatching from the socket layer
 */
export const useRouletteBlockchainResult = () => {
  const store = useRouletteGameStore()
  const { isDemoMode } = store

  const handleGameResult = useCallback((payload: CustomGameResolvePayload) => {
    // Mark contract flow as in-progress (guards submit button) before unsetting submitting
    const suStore = useSUContractStore.getState()
    if (!suStore.inProgressEntry) {
      suStore.setInProgressEntry({ requestId: payload.trialId, timestamp: Date.now() })
    }
    // Reset the GameButton's submitting state now that we're safely in progress
    suStore.setIsSubmitting(false)
    
    // Parse the blockchain result for Roulette
    // The server returns resultSides[0] as a number between 0-36
    const winningNumber = Number(payload.resultSides[0] ?? 0)
    
    // Call showResult with the blockchain winning number
    // The store will handle creating the result and transitioning to PLAYING for animation
    useRouletteGameStore.getState().showResult(winningNumber)
  }, [])

  // Only listen when not in demo mode
  const shouldListen = !isDemoMode

  useCustomGameResolveEvent({
    gameName: AppGameName.Roulette,
    onResolve: handleGameResult,
    enabled: shouldListen,
  })
}