// @ts-nocheck
import React, { useMemo, useRef, useEffect } from 'react'
import { useGameStore } from '@/features/custom-casino/CustomGames/shared/CustomGamePage/GameStoreContext'
import { type SlotsParameters, type SlotsResult } from '../types'
import { useMaxBetAmount } from '@/features/custom-casino/CustomGames/shared/hooks/useMaxBetAmount'
import { useGameContract } from '@/features/custom-casino/Singletons/useGameContract'
import {
  LabelledNumberSliderInput,
  StandardFormLayout,
  SimulationControl,
  FormErrorDisplay,
  GameStats,
  DemoSubmitButton,
  DemoModeToggle,
} from '@/features/custom-casino/CustomGames/shared/formComponents'
import { useIsLoading } from '@/features/custom-casino/CustomGames/shared/hooks/useIsLoading'
import { useIsDisabled } from '@/features/custom-casino/CustomGames/shared/hooks/useIsDisabled'
import { GameButton } from '@/features/custom-casino/shared/Button/GameButton'
import { useIsGameAnimating } from '@/features/custom-casino/hooks/useIsGameAnimating'

interface SlotsFormProps {
  onSpin?: (result: SlotsResult) => void
  editMode?: boolean
}

export const SlotsForm: React.FC<SlotsFormProps> = ({ onSpin, editMode = false }) => {
  const { maxBetAmount, sliderStep } = useMaxBetAmount()
const { isGameAnimating } = useIsGameAnimating()
  const store = useGameStore(state => ({
    parameters: state.parameters as SlotsParameters,
    entry: state.entry,
    validation: state.validation,
    setEntryAmount: state.setEntryAmount,
    setEntryCount: state.setEntryCount,
    validateEntry: state.validateEntry,
    playRandom: state.playRandom,
    simulateWin: state.simulateWin,
    simulateLoss: state.simulateLoss,
    gameState: state.gameState,
    isDemoMode: state.isDemoMode,
    setDemoMode: state.setDemoMode,
    submitEntry: state.submitEntry,
    isSpinning: (state as any).isSpinning,
  }))

  const {
    entry,
    validation,
    setEntryAmount,
    validateEntry,
    playRandom,
    simulateWin,
    simulateLoss,
    gameState,
    isDemoMode,
    submitEntry,
    isSpinning,
  } = store

  const animLoading = useIsLoading({
    gameState,
    loadingStates: ['PLAYING'],
  })

  const isDisabled = useIsDisabled({
    gameState,
    animLoading,
    betAmount: entry?.entryAmount ?? 0,
  })

  // Validate entry when it changes
  useEffect(() => {
    if (validateEntry) {
      validateEntry()
    }
  }, [entry?.entryAmount, entry?.entryCount, validateEntry])

  // Add defensive check for entry
  if (!entry) {
    console.error('[SlotsForm] Entry is undefined!')
    return <div>Error: Game state not initialized</div>
  }

  // Add defensive check for validation
  if (!validation) {
    console.error('[SlotsForm] Validation is undefined!')
    return <div>Error: Validation state not initialized</div>
  }

  const handleSpin = async () => {
    if (isSpinning || animLoading) return
    if (!validation.isValid) return

    try {
      const result = await playRandom()
      if (onSpin) {
        onSpin(result)
      }
    } catch (err: any) {
      console.error('Slots spin error:', err)
    }
  }

  const handleSimulateWin = async () => {
    if (isSpinning || animLoading) return

    try {
      const result = await simulateWin()
      if (onSpin) {
        onSpin(result)
      }
    } catch (err: any) {
      console.error('Simulation error:', err)
    }
  }

  const handleSimulateLoss = async () => {
    if (isSpinning || animLoading) return

    try {
      const result = await simulateLoss()
      if (onSpin) {
        onSpin(result)
      }
    } catch (err: any) {
      console.error('Simulation error:', err)
    }
  }

  // Prepare formData for GameButton
  const formData = useMemo(
    () => ({
      // Slots uses numeric side (variant). Always 0 for now.
      side: (entry as any).side ?? 0,
      entryAmount: entry.entryAmount,
      numberOfEntries: entry.entryCount,
      stopLoss: 0, // Slots doesn't use stop loss
      stopGain: 0, // Slots doesn't use stop gain
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

  // Calculate total bet
  const totalBet = entry.entryAmount * entry.entryCount

  return (
    <StandardFormLayout>
      <LabelledNumberSliderInput
        label='BET AMOUNT'
        value={entry.entryAmount}
        onChange={setEntryAmount}
        min={0}
        max={maxBetAmount}
        incrementAmount={sliderStep}
        accentColor='#667eea'
        disabled={isGameAnimating}
      />

      {/*TODO: Add multiple entry support*/}
      {/* <LabelledNumberSliderInput
        label='NUMBER OF SPINS'
        value={entry.entryCount}
        onChange={setEntryCount}
        min={1}
        max={100}
        accentColor='#667eea'
        disabled={isGameAnimating}
      /> */}

      <GameStats
        stats={[
          { label: 'BET PER SPIN', value: entry.entryAmount.toFixed(2) },
          { label: 'NUMBER OF SPINS', value: entry.entryCount.toString() },
          { label: 'MAX WIN', value: `${(entry.entryAmount * 100).toFixed(2)}x` },
        ]}
      />

      {editMode ?
        <SimulationControl
          onSimulateWin={handleSimulateWin}
          onSimulateLoss={handleSimulateLoss}
          disabled={isDisabled || !validation.isValid}
        />
      : isDemoMode ?
        <DemoSubmitButton
          onClick={handleSpin}
          disabled={isDisabled || !validation.isValid}
          loading={isSpinning || animLoading}
        >
          SPIN
        </DemoSubmitButton>
      : <GameButton entryAmountNum={totalBet} formData={formData} />}

      {!editMode && <DemoModeToggle />}

      <FormErrorDisplay
        message={!validation.isValid ? (Object.values(validation.errors)[0] as string) : undefined}
      />
    </StandardFormLayout>
  )
}
