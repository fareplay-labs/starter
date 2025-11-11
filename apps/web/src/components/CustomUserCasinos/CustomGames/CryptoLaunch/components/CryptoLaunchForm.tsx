// @ts-nocheck
import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import {
  StandardFormLayout,
  LabelledNumberSliderInput,
  DemoSubmitButton,
  DemoModeToggle,
  FormErrorDisplay,
} from '../../shared/formComponents'
import { GameButton } from '@/components/CustomUserCasinos/shared/Button/GameButton'
import { useGameContract } from '@/components/CustomUserCasinos/Singletons/useGameContract'
import { useCryptoLaunchGameStore } from '../store/CryptoLaunchGameStore'
import { useMaxBetAmount } from '../../shared/hooks/useMaxBetAmount'
import { useIsLoading } from '../../shared/hooks/useIsLoading'
import { useIsDisabled } from '../../shared/hooks/useIsDisabled'
import { CRYPTO_LAUNCH_CONSTRAINTS } from '../types'
import { utils } from 'ethers'
import { useActiveWallet } from '@/lib/privy/hooks'
import useUserDataStore from '@/components/CustomUserCasinos/store/useUserDataStore'
import {
  CRYPTO_LAUNCH_1_FIRST_HIGH_BOUND_2_EXPONENT,
  CRYPTO_LAUNCH_1_QK_LENGTH,
  CRYPTO_LAUNCH_1_FIRST_LOW_BOUND_IS_ZERO,
  CRYPTO_LAUNCH_1_EV_STRING,
  CRYPTO_LAUNCH_1_K_DECIMALS,
} from '@/components/CustomUserCasinos/lib/crypto/cryptoLaunch_1'
import { useIsGameAnimating } from '@/components/CustomUserCasinos/hooks/useIsGameAnimating'

export const CryptoLaunchForm: React.FC = () => {
  // Derive a reproducible, per-user seed following core game pattern
  const { walletAddress } = useActiveWallet()
  const { latestSUEntries } = useUserDataStore()

  // Generate a valid 256-bit hex string seed
  const [seed, setSeed] = useState<string>(() => {
    // utils.id returns a 256-bit hex string with 0x prefix
    if (walletAddress) {
      return utils.id(walletAddress)
    }
    // Fallback seed that's a valid 256-bit hex string with 0x prefix
    return '0x' + '0'.repeat(64)
  })

  useEffect(() => {
    if (latestSUEntries[0]?.resolvementTxHash) {
      // Use the resolvement tx hash if available (should already be 0x prefixed)
      setSeed(latestSUEntries[0].resolvementTxHash)
    } else if (walletAddress) {
      // Generate from wallet address
      setSeed(utils.id(walletAddress))
    } else {
      // Use a default valid seed
      setSeed('0x' + '0'.repeat(64))
    }
  }, [latestSUEntries, walletAddress])
  const { maxBetAmount, sliderStep } = useMaxBetAmount()
  const { isGameAnimating } = useIsGameAnimating()
  const {
    entry,
    setEntry,
    setEntryAmount,
    playCryptoLaunch,
    gameState,
    isGeneratingData,
    resetGame,
    lastError,
    validationErrors,
    validation,
    isDemoMode,
    submitEntry,
  } = useCryptoLaunchGameStore(state => ({
    entry: state.entry,
    setEntry: state.setEntry,
    setEntryAmount: state.setEntryAmount,
    playCryptoLaunch: state.playCryptoLaunch,
    gameState: state.gameState,
    isGeneratingData: state.isGeneratingData,
    resetGame: state.resetGame,
    lastError: state.lastError,
    validationErrors: state.validationErrors,
    validation: state.validation,
    isDemoMode: state.isDemoMode,
    setDemoMode: state.setDemoMode,
    submitEntry: state.submitEntry,
  }))

  const animLoading = useIsLoading({
    gameState,
    loadingStates: ['PLAYING'],
  })

  const isDisabled = useIsDisabled({
    gameState,
    animLoading,
    betAmount: entry.entryAmount,
    isProcessing: isGeneratingData,
  })

  const invalidDaySpread = entry.side.endDay - entry.side.startDay < 60

  const dynamicStartPriceMax = Math.min(
    CRYPTO_LAUNCH_CONSTRAINTS.startPrice.max,
    entry.side.minSellPrice - 0.1
  )

  // Only validate game-specific constraints, not bet amount (handled by useIsDisabled)
  const isValidConfiguration =
    entry.side.startPrice >= CRYPTO_LAUNCH_CONSTRAINTS.startPrice.min &&
    entry.side.startPrice <= entry.side.minSellPrice - 0.1 &&
    entry.side.minSellPrice >=
      Math.max(CRYPTO_LAUNCH_CONSTRAINTS.minSellPrice.min, entry.side.startPrice + 0.1) &&
    entry.side.minSellPrice <= CRYPTO_LAUNCH_CONSTRAINTS.minSellPrice.max &&
    entry.side.startDay >= CRYPTO_LAUNCH_CONSTRAINTS.startDay.min &&
    entry.side.startDay <= CRYPTO_LAUNCH_CONSTRAINTS.startDay.max &&
    entry.side.endDay >= CRYPTO_LAUNCH_CONSTRAINTS.endDay.min &&
    entry.side.endDay <= CRYPTO_LAUNCH_CONSTRAINTS.endDay.max &&
    !invalidDaySpread

  const handleStartPriceChange = useCallback(
    (value: number) => {
      const clamped = Math.min(value, dynamicStartPriceMax)
      setEntry({
        side: {
          ...entry.side,
          startPrice: clamped,
        },
      })
      resetGame() // Reset graph when start price changes
    },
    [setEntry, entry.side, dynamicStartPriceMax, resetGame]
  )

  const handleMinSellPriceChange = useCallback(
    (value: number) => {
      const minAllowed = Math.max(
        CRYPTO_LAUNCH_CONSTRAINTS.minSellPrice.min,
        entry.side.startPrice + 0.1
      )
      setEntry({
        side: {
          ...entry.side,
          minSellPrice: Math.max(value, minAllowed),
        },
      })
      resetGame() // Reset graph when sell price changes
    },
    [setEntry, entry.side, resetGame]
  )

  const handleStartDayChange = useCallback(
    (value: number) => {
      const newEndDay = Math.max(entry.side.endDay, value + 60)
      setEntry({
        side: {
          ...entry.side,
          startDay: value,
          endDay: newEndDay,
        },
      })
      resetGame() // Reset graph when start day changes
    },
    [entry.side, setEntry, resetGame]
  )

  const handleEndDayChange = useCallback(
    (value: number) => {
      const minEndDay = entry.side.startDay + 60
      setEntry({
        side: {
          ...entry.side,
          endDay: Math.max(value, minEndDay),
        },
      })
      resetGame() // Reset graph when end day changes
    },
    [entry.side, setEntry, resetGame]
  )

  const handleSubmit = () => {
    if (!validation.isValid || !isValidConfiguration) return
    playCryptoLaunch()
  }

  const errorMessage = validationErrors.length > 0 ? validationErrors[0] : lastError

  // Prepare formData for GameButton
  // The seed is used to reproduce curve generation on server for validation, not for game outcomes
  // Using a static seed is fine - the actual win/loss comes from the smart contract
  const formData = useMemo(() => {
    const data = {
      side: {
        qkBuildParameters: {
          seed, // Match core game: use latest resolvementTxHash or wallet-based seed
          kDecimals: CRYPTO_LAUNCH_1_K_DECIMALS,
          qkLen: CRYPTO_LAUNCH_1_QK_LENGTH,
          firstHighBounds2sExponent: CRYPTO_LAUNCH_1_FIRST_HIGH_BOUND_2_EXPONENT,
          firstLowBoundShouldBeZero: CRYPTO_LAUNCH_1_FIRST_LOW_BOUND_IS_ZERO,
          targetEVString: CRYPTO_LAUNCH_1_EV_STRING,
        },
        tradingParameters: {
          startPrice: entry.side.startPrice,
          minSellPrice: entry.side.minSellPrice,
          dayToStartSelling: entry.side.startDay, // Legacy uses dayToStartSelling
          daysToSell: entry.side.endDay - entry.side.startDay, // Legacy uses duration, not end day
        },
      },
      entryAmount: entry.entryAmount,
      numberOfEntries: 1,
      stopLoss: 0,
      stopGain: 0,
    }

    return data
  }, [entry, seed])

  // Watch for game contract submission
  const { isSubmitting } = useGameContract()
  const prevIsSubmitting = useRef(isSubmitting)

  useEffect(() => {
    // When submission starts, update our custom store
    if (isSubmitting && !prevIsSubmitting.current && !isDemoMode) {
      submitEntry()
    }
    prevIsSubmitting.current = isSubmitting
  }, [isSubmitting, isDemoMode, submitEntry])

  return (
    <StandardFormLayout>
      <LabelledNumberSliderInput
        label='Bet Amount'
        value={entry.entryAmount}
        onChange={setEntryAmount}
        min={0}
        max={maxBetAmount}
        incrementAmount={sliderStep}
        disabled={isGameAnimating}
      />

      <LabelledNumberSliderInput
        label='Start Price ($)'
        value={entry.side.startPrice}
        onChange={handleStartPriceChange}
        min={CRYPTO_LAUNCH_CONSTRAINTS.startPrice.min}
        max={dynamicStartPriceMax}
        disabled={isGameAnimating}
      />

      <LabelledNumberSliderInput
        label='Minimum Sell Price ($)'
        value={entry.side.minSellPrice}
        onChange={handleMinSellPriceChange}
        min={Math.max(CRYPTO_LAUNCH_CONSTRAINTS.minSellPrice.min, entry.side.startPrice + 0.1)}
        max={CRYPTO_LAUNCH_CONSTRAINTS.minSellPrice.max}
        disabled={isGameAnimating}
      />

      <LabelledNumberSliderInput
        label='Start Day'
        value={entry.side.startDay}
        onChange={handleStartDayChange}
        min={CRYPTO_LAUNCH_CONSTRAINTS.startDay.min}
        max={CRYPTO_LAUNCH_CONSTRAINTS.startDay.max}
        disabled={isGameAnimating}
      />

      <LabelledNumberSliderInput
        label='End Day'
        value={entry.side.endDay}
        onChange={handleEndDayChange}
        min={Math.max(CRYPTO_LAUNCH_CONSTRAINTS.endDay.min, entry.side.startDay + 60)}
        max={CRYPTO_LAUNCH_CONSTRAINTS.endDay.max}
        disabled={isGameAnimating}
      />

      <FormErrorDisplay message={errorMessage || validation.errors.side} />

      {isDemoMode ?
        <DemoSubmitButton
          onClick={handleSubmit}
          disabled={isDisabled || !isValidConfiguration || !validation.isValid}
          loading={animLoading}
        />
      : <GameButton entryAmountNum={entry.entryAmount} formData={formData} />}

      <DemoModeToggle />
    </StandardFormLayout>
  )
}

export default CryptoLaunchForm
