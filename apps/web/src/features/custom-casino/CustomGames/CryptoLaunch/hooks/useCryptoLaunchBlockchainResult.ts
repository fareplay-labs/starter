// @ts-nocheck
import { useCallback } from 'react'
import { useCryptoLaunchGameStore } from '../store/CryptoLaunchGameStore'
import { useCustomGameResolveEvent, type CustomGameResolvePayload } from '../../shared/hooks/useCustomGameResolveEvent'
import { AppGameName } from '@/chains/types'
import {
  generateMultiPeriodSeries,
  type GenerationParams,
} from '@/features/custom-casino/CustomGames/CryptoLaunch/logic/PriceDataGeneration/multi-period-orchestrator.js'
import useSUContractStore from '@/features/custom-casino/store/useSUContractStore'

/**
 * Hook to listen for blockchain results when not in demo mode
 * Uses custom event dispatching from the socket layer
 */
export const useCryptoLaunchBlockchainResult = () => {
  const store = useCryptoLaunchGameStore()
  const { isDemoMode } = store

  const handleGameResult = useCallback((payload: CustomGameResolvePayload) => {
    // Mark contract flow as in-progress (guards submit button) before unsetting submitting
    const suStore = useSUContractStore.getState()
    if (!suStore.inProgressEntry) {
      suStore.setInProgressEntry({ requestId: payload.trialId, timestamp: Date.now() })
    }
    // Reset the GameButton's submitting state now that we're safely in progress
    suStore.setIsSubmitting(false)
    
    // Parse the blockchain result for CryptoLaunch
    // The server returns resultSides[0] as the payout multiplier
    const payoutMultiplier = Number(payload.resultSides[0] ?? 1)
    
    // Get the current entry parameters from the store
    const { submittedEntry } = useCryptoLaunchGameStore.getState()
    
    if (!submittedEntry) {
      console.error('No submitted entry found for blockchain result')
      return
    }
    
    // Generate price data based on payout multiplier and trade params
    const priceData = generatePriceDataFromPayout(
      payoutMultiplier,
      submittedEntry.side.startPrice,
      submittedEntry.side.minSellPrice,
      submittedEntry.side.startDay,
      submittedEntry.side.endDay,
      submittedEntry.entryAmount
    )
    
    // Call showResult with the blockchain price data AND the payout info
    // The store will handle creating the result and transitioning to PLAYING for animation
    useCryptoLaunchGameStore.getState().showResult(priceData, payoutMultiplier)
  }, [])

  // Only listen when not in demo mode
  const shouldListen = !isDemoMode

  useCustomGameResolveEvent({
    gameName: AppGameName.CryptoLaunch_1,
    onResolve: handleGameResult,
    enabled: shouldListen,
  })
}

/**
 * Generate price data from payout multiplier using the legacy algorithm
 * This ensures the visual graph matches the actual payout
 */
function generatePriceDataFromPayout(
  payoutMultiplier: number,
  startPrice: number,
  minSellPrice: number,
  startDay: number,
  endDay: number,
  betAmount: number
): number[] {
  // Calculate total area under the curve needed to achieve the payout
  // The area represents the total return, so we need to work backwards from the multiplier
  const investmentAmount = betAmount * 100 // Scale up for calculation
  const totalArea = investmentAmount * payoutMultiplier
  
  // Generate parameters matching the legacy pattern
  const params: GenerationParams = {
    curveParams: {
      totalDays: 365,
      curveCount: 8,
      minAlpha: 1.5,
      maxAlpha: 3,
      minBeta: 1.5,
      maxBeta: 4,
      noiseLevel: 12,
      totalArea: totalArea, // This controls the payout
    },
    tradingParams: {
      startDay: startDay,
      sellDuration: endDay - startDay,
      startPrice: startPrice,
      minSellPrice: minSellPrice,
    },
  }
  
  try {
    // Use the legacy price generation algorithm
    const result = generateMultiPeriodSeries(params)
    return result.combinedPrices || generateFallbackPriceData(payoutMultiplier, startPrice, minSellPrice)
  } catch (error) {
    console.error('Failed to generate price data:', error)
    // Fallback to simple generation if the complex algorithm fails
    return generateFallbackPriceData(payoutMultiplier, startPrice, minSellPrice)
  }
}

/**
 * Fallback price generation if the complex algorithm fails
 */
function generateFallbackPriceData(
  payoutMultiplier: number,
  startPrice: number,
  minSellPrice: number
): number[] {
  const PRICE_POINTS = 365
  const priceData: number[] = []
  
  // Create a simple curve that reaches the target price
  const targetPrice = minSellPrice * (1 + payoutMultiplier)
  
  for (let i = 0; i < PRICE_POINTS; i++) {
    const progress = i / PRICE_POINTS
    
    // Use a sine wave to create a bubble pattern
    const bubblePhase = Math.sin(progress * Math.PI)
    
    // Interpolate from start to target with bubble shape
    const basePrice = startPrice + (targetPrice - startPrice) * progress
    const price = basePrice + bubblePhase * (targetPrice - startPrice) * 0.5
    
    // Add some noise
    const noise = (Math.random() - 0.5) * price * 0.05
    
    priceData.push(Math.max(0.01, price + noise))
  }
  
  return priceData
}
