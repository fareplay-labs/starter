// @ts-nocheck
import { useMemo } from 'react'
import useCurrencyStore from '@/components/CustomUserCasinos/store/useCurrencyStore'
import { calculateSliderStep, getMaxBetAmount } from '../utils/sliderUtils'

/**
 * Hook to get the maximum bet amount and step value for sliders
 * Matches the legacy implementation's behavior
 */
export function useMaxBetAmount() {
  const balanceInUsdc = useCurrencyStore(state => state.balances.balanceInUsdc)
  
  const maxBetAmount = useMemo(() => {
    const balance = Number(balanceInUsdc) || 0
    return getMaxBetAmount(balance)
  }, [balanceInUsdc])
  
  const sliderStep = useMemo(() => {
    return calculateSliderStep(maxBetAmount)
  }, [maxBetAmount])
  
  return {
    maxBetAmount,
    sliderStep,
    balance: Number(balanceInUsdc) || 0
  }
}