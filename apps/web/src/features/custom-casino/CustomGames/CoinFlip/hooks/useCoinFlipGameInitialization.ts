// @ts-nocheck
import { useEffect } from 'react'
import { useCoinFlipGameStore } from '../CoinFlipGameStore'
import { type CoinFlipParameters } from '../types'

/**
 * Hook for initializing the CoinFlip game
 * This could be expanded to handle specific initialization logic
 */
export const useCoinFlipGameInitialization = (initialParameters?: Partial<CoinFlipParameters>) => {
  const store = useCoinFlipGameStore()

  useEffect(() => {
    if (initialParameters) {
      store.initializeParameters(initialParameters as any)
    }
  }, [initialParameters, store])

  return {
    isInitialized: !!store.parameters,
    parameters: store.parameters,
    error: store.error,
  }
}
