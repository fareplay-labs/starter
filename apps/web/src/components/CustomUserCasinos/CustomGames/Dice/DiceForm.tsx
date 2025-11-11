// @ts-nocheck
import React, { useMemo, useRef, useEffect } from 'react'
import { useGameStore } from '@/components/CustomUserCasinos/CustomGames/shared/CustomGamePage/GameStoreContext'
import { type DiceParameters, type DiceResult } from './types'
import { useMaxBetAmount } from '../shared/hooks/useMaxBetAmount'
import { useGameContract } from '@/components/CustomUserCasinos/Singletons/useGameContract'
import {
  TargetRollSlider,
  LabelledNumberSliderInput,
  StandardFormLayout,
  SimulationControl,
  FormErrorDisplay,
  GameStats,
  DemoSubmitButton,
  DemoModeToggle,
} from '../shared/formComponents'
import { calculateDiceMultiplier } from './logic/DiceGameLogic'
import { useIsLoading } from '../shared/hooks/useIsLoading'
import { useIsDisabled } from '../shared/hooks/useIsDisabled'
import { GameButton } from '@/components/CustomUserCasinos/shared/Button/GameButton'
import { useIsGameAnimating } from '@/components/CustomUserCasinos/hooks/useIsGameAnimating'
interface DiceFormProps {
  onRoll?: (result: DiceResult) => void
  editMode?: boolean
}

const DiceForm: React.FC<DiceFormProps> = ({ onRoll, editMode = false }) => {
  const { maxBetAmount, sliderStep } = useMaxBetAmount()
const { isGameAnimating } = useIsGameAnimating()
  const store = useGameStore(state => ({
    parameters: state.parameters as DiceParameters,
    entry: state.entry,
    validation: state.validation,
    setEntry: state.setEntry,
    setEntryAmount: state.setEntryAmount,
    setEntryCount: state.setEntryCount,
    playRandom: state.playRandom,
    simulateWin: state.simulateWin,
    simulateLoss: state.simulateLoss,
    isRolling: state.isLoading,
    gameState: state.gameState,
    updateParameters: state.updateParameters,
    isDemoMode: state.isDemoMode,
    setDemoMode: state.setDemoMode,
    submitEntry: state.submitEntry,
  }))

  const {
    parameters,
    entry,
    validation,
    setEntry,
    setEntryAmount,
    playRandom,
    simulateWin,
    simulateLoss,
    isRolling,
    gameState,
    updateParameters,
    isDemoMode,
    submitEntry,
  } = store

  const accentColor = '#5f5fff'
  const textColor = parameters?.textColor ?? '#ffffff'

  // Use store entry for target number in play mode, parameters in edit mode
  const targetNumber = editMode ? (parameters?.targetNumber ?? 50) : (entry?.side ?? 50)

  // Derived values
  const multiplier = calculateDiceMultiplier(targetNumber)
  const winChance = 100 - targetNumber

  const animLoading = useIsLoading({
    gameState,
    loadingStates: ['PLAYING'],
  })

  const isDisabled = useIsDisabled({
    gameState,
    animLoading,
    betAmount: entry?.entryAmount ?? 0,
  })

  // Add defensive check for entry
  if (!entry) {
    console.error('[DiceForm] Entry is undefined!')
    return <div>Error: Game state not initialized</div>
  }

  // Add defensive check for validation
  if (!validation) {
    console.error('[DiceForm] Validation is undefined!')
    return <div>Error: Validation state not initialized</div>
  }

  const handleTargetChange = (value: number) => {
    if (value >= 5 && value <= 99.9) {
      if (editMode) {
        // In edit mode, update the parameters directly
        updateParameters({ targetNumber: value })
      } else {
        // In play mode, update the entry
        setEntry({ side: value })
      }
    }
  }

  const handleRoll = async () => {
    if (isRolling) return
    if (!validation.isValid) return

    try {
      const result = await playRandom()
      if (onRoll) {
        onRoll(result)
      }
    } catch (err: any) {
      console.error('Dice rolling error:', err)
    }
  }

  const handleSimulateWin = async () => {
    if (isRolling) return

    try {
      const result = await simulateWin()
      if (onRoll) {
        onRoll(result)
      }
    } catch (err: any) {
      console.error('Simulation error:', err)
    }
  }

  const handleSimulateLoss = async () => {
    if (isRolling) return

    try {
      const result = await simulateLoss()
      if (onRoll) {
        onRoll(result)
      }
    } catch (err: any) {
      console.error('Simulation error:', err)
    }
  }

  // Prepare formData for GameButton
  // IMPORTANT: Dice expects side to be multiplied by 100 for blockchain
  // The legacy validation expects values between 500-9990 (5-99.9 * 100)
  const formData = useMemo(
    () => ({
      side: Math.round(entry.side * 100), // Convert to blockchain format (e.g., 50 -> 5000)
      entryAmount: entry.entryAmount,
      numberOfEntries: entry.entryCount,
      stopLoss: 0, // Dice doesn't use stop loss
      stopGain: 0, // Dice doesn't use stop gain
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
      <TargetRollSlider
        value={targetNumber}
        onChange={handleTargetChange}
        min={5}
        max={99.9}
        accentColor={accentColor}
        textColor={textColor}
      />

      <GameStats
        stats={[
          { label: 'ROLL OVER', value: targetNumber.toFixed(2) },
          { label: 'WIN CHANCE', value: winChance.toFixed(2) },
          { label: 'MULTIPLIER', value: multiplier.toFixed(2) },
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

      {/*TODO: Add multiple entry support*/}
      {/* <LabelledNumberSliderInput
        label='NUMBER OF ENTRIES'
        value={entry.entryCount}
        onChange={setEntryCount}
        min={1}
        max={100}
        accentColor={accentColor}
        disabled={isGameAnimating}
      /> */}

      {editMode ?
        <SimulationControl
          onSimulateWin={handleSimulateWin}
          onSimulateLoss={handleSimulateLoss}
          disabled={isDisabled || !validation.isValid}
        />
      : isDemoMode ?
        <DemoSubmitButton
          onClick={handleRoll}
          disabled={isDisabled || !validation.isValid}
          loading={isRolling || animLoading}
        >
          PLAY DEMO
        </DemoSubmitButton>
      : <GameButton entryAmountNum={entry.entryAmount} formData={formData} />}

      {!editMode && <DemoModeToggle />}

      <FormErrorDisplay
        message={!validation.isValid ? (Object.values(validation.errors)[0] as string) : undefined}
      />
    </StandardFormLayout>
  )
}

export default DiceForm
