// @ts-nocheck
import { useCallback } from 'react'
import { useRPSGameStore } from '../RPSGameStore'
import { type RPSChoice } from '../types'
import { useCustomGameResolveEvent, type CustomGameResolvePayload } from '../../shared/hooks/useCustomGameResolveEvent'
import { AppGameName } from '@/chains/types'
import useSUContractStore from '@/features/custom-casino/store/useSUContractStore'

/**
 * Hook to listen for blockchain results when not in demo mode
 * Uses custom event dispatching from the socket layer
 */
export const useRPSBlockchainResult = () => {
  const store = useRPSGameStore()
  const { isDemoMode } = store

  const handleGameResult = useCallback((payload: CustomGameResolvePayload) => {
    // Mark contract flow as in-progress (guards submit button) before unsetting submitting
    const suStore = useSUContractStore.getState()
    if (!suStore.inProgressEntry) {
      suStore.setInProgressEntry({ requestId: payload.trialId, timestamp: Date.now() })
    }
    // Reset the GameButton's submitting state now that we're safely in progress
    suStore.setIsSubmitting(false)
    
    // Parse the blockchain result for RPS
    // The server returns resultSides[0] as: 0=rock, 1=paper, 2=scissors
    const computerChoiceNum = Number(payload.resultSides[0] ?? 0)
    
    // Convert numeric value to RPSChoice type
    const choiceMap: { [key: number]: RPSChoice } = {
      0: 'rock',
      1: 'paper',
      2: 'scissors'
    }
    
    const computerChoice = choiceMap[computerChoiceNum] || 'rock'
    
    // Call showResult with the blockchain computer choice
    // The store will handle creating the result and transitioning to PLAYING for animation
    useRPSGameStore.getState().showResult(computerChoice)
  }, [])

  // Only listen when not in demo mode
  const shouldListen = !isDemoMode

  useCustomGameResolveEvent({
    gameName: AppGameName.RPS,
    onResolve: handleGameResult,
    enabled: shouldListen,
  })
}
