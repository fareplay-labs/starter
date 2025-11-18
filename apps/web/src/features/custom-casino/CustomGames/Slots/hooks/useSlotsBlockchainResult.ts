// @ts-nocheck
import { useCallback } from 'react'
import { useSlotsGameStore } from '../store/SlotsGameStore'
import { formatUnits } from 'viem'
import { AppGameName } from '@/chains/types'
import { useCustomGameResolveEvent, type CustomGameResolvePayload } from '@/features/custom-casino/CustomGames/shared/hooks/useCustomGameResolveEvent'
import { getAppCurrencyDecimals } from '@/features/custom-casino/chains/lib'
import useSUContractStore from '@/features/custom-casino/store/useSUContractStore'
import { mapPayoutToReelPositions, getClosestValidPayout } from '../utils/payoutMapping'

/**
 * Hook that listens for blockchain results and updates the game state
 */
export const useSlotsBlockchainResult = () => {
  const store = useSlotsGameStore()
  const { isDemoMode, showResult, startSpin } = store

  const handleGameResult = useCallback((payload: CustomGameResolvePayload) => {
    console.log('[SlotsBlockchain] Received resolve event:', payload)

    try {
      // Mark contract flow as in-progress (guards submit button) before unsetting submitting
      const suStore = useSUContractStore.getState()
      if (!suStore.inProgressEntry) {
        suStore.setInProgressEntry({ requestId: payload.trialId, timestamp: Date.now() })
      }
      // Reset the GameButton's submitting state now that we're safely in progress
      suStore.setIsSubmitting(false)
      
      // Parse the blockchain result for Slots
      // resultSides contains the payout values
      const payouts = payload.resultSides.map((rs: any) =>
        Number(formatUnits(rs, getAppCurrencyDecimals()))
      )
      
      // Get the payout multiplier from the blockchain result
      const payoutValue = payouts && payouts.length > 0 ? payouts[0] : 0
      
      // Map the payout to the closest valid multiplier in our system
      const targetMultiplier = getClosestValidPayout(payoutValue)
      
      // Generate reel positions that will produce this exact payout
      const seed = BigInt(payload.trialId || '0').toString()
      const reelCount = 5 // Standard 5-reel slot machine
      const reelPositions = mapPayoutToReelPositions(targetMultiplier, seed, reelCount)

      console.log('[SlotsBlockchain] Mapping payout:', payoutValue, '→', targetMultiplier, 'positions:', reelPositions)

      // Start the spin first so reels begin moving
      startSpin()

      // Call showResult with BOTH reel positions AND the actual blockchain multiplier
      // This ensures win celebrations match the actual payout, not a recalculated value
      useSlotsGameStore.getState().showResult(reelPositions, targetMultiplier)
    } catch (error) {
      console.error('[SlotsBlockchain] Error processing blockchain result:', error)
    }
  }, [showResult, startSpin])

  // Only listen when not in demo mode
  const shouldListen = !isDemoMode

  useCustomGameResolveEvent({
    gameName: AppGameName.Slots_1,
    onResolve: handleGameResult,
    enabled: shouldListen,
  })
}
