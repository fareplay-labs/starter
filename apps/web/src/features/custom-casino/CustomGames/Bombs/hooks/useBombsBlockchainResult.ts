// @ts-nocheck
import { useCallback } from 'react'
import { useBombsGameStore } from '../store/BombsGameStore'
import { useCustomGameResolveEvent, type CustomGameResolvePayload } from '../../shared/hooks/useCustomGameResolveEvent'
import { AppGameName } from '@/chains/types'
import useSUContractStore from '@/features/custom-casino/store/useSUContractStore'
import { generateWinningBombPositions, generateLosingBombPositions } from '../logic/BombsGameLogic'

/**
 * Hook to listen for blockchain results when not in demo mode
 * Uses custom event dispatching from the socket layer
 */
export const useBombsBlockchainResult = () => {
  const store = useBombsGameStore()
  const { isDemoMode } = store

  const handleGameResult = useCallback((payload: CustomGameResolvePayload) => {
    // Mark contract flow as in-progress (guards submit button) before unsetting submitting
    const suStore = useSUContractStore.getState()
    if (!suStore.inProgressEntry) {
      suStore.setInProgressEntry({ requestId: payload.trialId, timestamp: Date.now() })
    }
    // Reset the GameButton's submitting state now that we're safely in progress
    suStore.setIsSubmitting(false)
    
    // Get the submitted entry data to know selected tiles and bomb count
    const { submittedEntry } = useBombsGameStore.getState()
    if (!submittedEntry) return
    
    const selectedTiles = submittedEntry.side.selectedTiles
    const bombCount = submittedEntry.side.bombCount
    
    // Determine if it's a win or loss based on payout
    // Positive totalDeltaAmount means win, negative or zero means loss
    const isWin = payload.totalDeltaAmount > 0
    
    // Generate appropriate bomb positions based on result
    let bombPositions: number[]
    if (isWin) {
      // Win: all selected tiles are safe, bombs only in unselected tiles
      bombPositions = generateWinningBombPositions(bombCount, selectedTiles)
    } else {
      // Loss: at least one selected tile must be a bomb
      bombPositions = generateLosingBombPositions(bombCount, selectedTiles)
    }
    
    // Call showResult with the generated bomb positions
    // The store will handle creating the result and transitioning to PLAYING for animation
    useBombsGameStore.getState().showResult(bombPositions)
  }, [])

  // Only listen when not in demo mode
  const shouldListen = !isDemoMode

  useCustomGameResolveEvent({
    gameName: AppGameName.Bombs,
    onResolve: handleGameResult,
    enabled: shouldListen,
  })
}
