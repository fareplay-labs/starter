// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useCrashGameStore } from './CrashGameStore'
import { type CrashResult, CRASH_GAME_CONSTANTS } from './types'
import { useGameContract } from '@/components/CustomUserCasinos/Singletons/useGameContract'
import { useMaxBetAmount } from '../shared/hooks/useMaxBetAmount'
import {
  LabelledNumberSliderInput,
  StandardFormLayout,
  SimulationControl,
  FormErrorDisplay,
  GameStats,
  DemoSubmitButton,
  DemoModeToggle,
} from '../shared/formComponents'
import { useIsLoading } from '../shared/hooks/useIsLoading'
import { useIsDisabled } from '../shared/hooks/useIsDisabled'
import { GameButton } from '@/components/CustomUserCasinos/shared/Button/GameButton'
import { useIsGameAnimating } from '@/components/CustomUserCasinos/hooks/useIsGameAnimating'

interface CrashFormProps {
  onPlay?: (result: CrashResult) => void
  editMode?: boolean
}

const CrashForm: React.FC<CrashFormProps> = ({ onPlay, editMode = false }) => {
  const { maxBetAmount, sliderStep } = useMaxBetAmount()
  const { isGameAnimating } = useIsGameAnimating()
  const {
    playRandom,
    simulateWin,
    simulateLoss,
    animationState,
    gameState,
    entry,
    setEntry,
    setEntryAmount,
    validation,
    isDemoMode,
    submitEntry,
  } = useCrashGameStore()

  const accentColor = '#00ff88'

  const [error, setError] = useState<string>('')

  const animLoading = useIsLoading({
    gameState,
    loadingStates: ['PLAYING'],
  })

  const isDisabled = useIsDisabled({
    gameState,
    animLoading,
    betAmount: entry.entryAmount,
  })

  // Calculate if game is currently active (not idle)
  const isGameActive = animationState !== 'idle'
  const isPlaying = gameState === 'PLAYING'

  const handleCashOutChange = (value: number) => {
    if (
      value >= CRASH_GAME_CONSTANTS.cashOutMultiplier.min &&
      value <= CRASH_GAME_CONSTANTS.cashOutMultiplier.max
    ) {
      setEntry({ side: { cashOutMultiplier: value } })
      setError('')
    } else {
      setError(
        `Cash out multiplier must be between ${CRASH_GAME_CONSTANTS.cashOutMultiplier.min} and ${CRASH_GAME_CONSTANTS.cashOutMultiplier.max}`
      )
    }
  }

  const handlePlay = async () => {
    if (isGameActive) return
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0] || 'Invalid entry data')
      return
    }

    setError('')

    try {
      const result = await playRandom()

      if (onPlay) {
        onPlay(result)
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to play crash game'
      console.error('Crash game error:', err)
      setError(errorMessage)
    }
  }

  const handleSimulateWin = async () => {
    if (isGameActive) return
    setError('')

    try {
      const result = await simulateWin()

      if (onPlay) {
        onPlay(result)
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to simulate win'
      console.error('Simulation error:', err)
      setError(errorMessage)
    }
  }

  const handleSimulateLoss = async () => {
    if (isGameActive) return
    setError('')

    try {
      const result = await simulateLoss()

      if (onPlay) {
        onPlay(result)
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to simulate loss'
      console.error('Simulation error:', err)
      setError(errorMessage)
    }
  }

  // Calculate potential payout (with 1% house edge)
  const potentialPayout = (entry.entryAmount * entry.side.cashOutMultiplier * 0.99).toFixed(2)

  // Prepare formData for GameButton
  // IMPORTANT: Crash expects cashout target multiplied by 100
  const formData = useMemo(
    () => ({
      side: Math.round((entry.side?.cashOutMultiplier || 2.0) * 100), // e.g., 2.5 -> 250 (using Math.round to match legacy)
      entryAmount: entry.entryAmount,
      numberOfEntries: entry.entryCount || 1,
      stopLoss: 0, // TODO: Add stop loss support to match legacy
      stopGain: 0, // TODO: Add stop gain support to match legacy
    }),
    [entry]
  )

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
        label='AUTO CASH OUT AT'
        value={entry.side.cashOutMultiplier}
        onChange={handleCashOutChange}
        min={CRASH_GAME_CONSTANTS.cashOutMultiplier.min}
        max={CRASH_GAME_CONSTANTS.cashOutMultiplier.max}
        sliderMax={CRASH_GAME_CONSTANTS.cashOutMultiplier.max}
        accentColor={accentColor}
      />

      <GameStats
        stats={[
          { label: 'CASH OUT', value: `${entry.side.cashOutMultiplier.toFixed(2)}x` },
          { label: 'POTENTIAL PAYOUT', value: potentialPayout },
        ]}
      />

      <LabelledNumberSliderInput
        label='AMOUNT'
        value={entry.entryAmount}
        onChange={setEntryAmount}
        min={0}
        max={maxBetAmount}
        incrementAmount={sliderStep}
        accentColor={accentColor}
        disabled={isGameAnimating}
      />

      {editMode ?
        <SimulationControl
          onSimulateWin={handleSimulateWin}
          onSimulateLoss={handleSimulateLoss}
          disabled={isDisabled}
        />
      : isDemoMode ?
        <DemoSubmitButton
          onClick={handlePlay}
          disabled={isDisabled || !validation.isValid}
          loading={isPlaying || animLoading}
        >
          PLAY DEMO
        </DemoSubmitButton>
      : <GameButton entryAmountNum={entry.entryAmount} formData={formData} />}

      {!editMode && <DemoModeToggle />}

      <FormErrorDisplay message={error || validation.errors.cashOutMultiplier} />
    </StandardFormLayout>
  )
}

export default CrashForm
