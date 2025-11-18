// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { usePlinkoGameStore } from '../store/PlinkoGameStore'
import {
  StandardFormLayout,
  LabelledNumberSliderInput,
  DemoSubmitButton,
  DemoModeToggle,
  SimulationControl,
} from '../../shared/formComponents'
import { useMaxBetAmount } from '../../shared/hooks/useMaxBetAmount'
import { PLINKO_CONSTRAINTS } from '../types'
import { ensureRowLoaded } from '../runtime/animationManager'
import {
  SChoiceButton,
  SChoiceLabel,
  SChoicesContainer,
  SLabel,
} from '../../shared/formComponents/styled'
import { useIsLoading } from '../../shared/hooks/useIsLoading'
import { useIsDisabled } from '../../shared/hooks/useIsDisabled'
import { getMaxCountForPlinko } from '@/features/custom-casino/lib/crypto/plinko'
import { GameButton } from '@/features/custom-casino/shared/Button/GameButton'
import { useGameContract } from '@/features/custom-casino/Singletons/useGameContract'
import { useIsGameAnimating } from '@/features/custom-casino/hooks/useIsGameAnimating'

interface PlinkoFormProps {
  editMode?: boolean
}

// Risk level button component
const RiskLevelButtons: React.FC<{
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  primaryColor: string
}> = ({ value, onChange, disabled = false, primaryColor }) => {
  const riskLevels = [
    { value: 0, label: 'LOW' },
    { value: 1, label: 'MED' },
    { value: 2, label: 'HIGH' },
  ]

  return (
    <>
      <SLabel>RISK LEVEL</SLabel>
      <SChoicesContainer>
        {riskLevels.map(risk => (
          <SChoiceButton
            key={risk.value}
            $selected={value === risk.value}
            onClick={() => onChange(risk.value)}
            disabled={disabled}
            $primaryColor={primaryColor}
          >
            <SChoiceLabel>{risk.label}</SChoiceLabel>
          </SChoiceButton>
        ))}
      </SChoicesContainer>
    </>
  )
}

export const PlinkoForm: React.FC<PlinkoFormProps> = ({ editMode = false }) => {
  const { maxBetAmount, sliderStep } = useMaxBetAmount()
  const { isGameAnimating } = useIsGameAnimating()
  const [_error, setError] = useState<string>('')
  const [maxCountForSide, setMaxCountForSide] = useState<number>(20)

  const {
    gameState,
    playRandom,
    simulateWin,
    simulateLoss,
    entry,
    setEntry,
    setEntryAmount,
    validation,
    isDemoMode,
    submitEntry,
  } = usePlinkoGameStore(state => ({
    parameters: state.parameters,
    gameState: state.gameState,
    playRandom: state.playRandom,
    simulateWin: state.simulateWin,
    simulateLoss: state.simulateLoss,
    entry: state.entry,
    setEntry: state.setEntry,
    setEntryAmount: state.setEntryAmount,
    validation: state.validation,
    isDemoMode: state.isDemoMode,
    setDemoMode: state.setDemoMode,
    submitEntry: state.submitEntry,
  }))

  const accentColor = '#00ff88'

  // Derived values
  const { ballCount, rowCount, riskLevel } = entry.side
  const animLoading = useIsLoading({
    gameState,
    loadingStates: ['PLAYING'],
  })

  const isDisabled = useIsDisabled({
    gameState,
    animLoading,
    betAmount: entry.entryAmount,
  })

  // Risk level buttons should only be disabled during animation, not based on bet amount
  const isRiskDisabled = gameState !== 'IDLE' || animLoading

  // Load animations when rowCount changes
  useEffect(() => {
    ensureRowLoaded(rowCount)
  }, [rowCount])

  // Update max count based on risk level and row count
  useEffect(() => {
    const maxCount = getMaxCountForPlinko({
      riskLevel: riskLevel,
      rowCount: rowCount,
    })

    setMaxCountForSide(maxCount)

    // If current ball count exceeds new max, adjust it
    if (ballCount > maxCount) {
      setEntry({ side: { ...entry.side, ballCount: maxCount } })
    }
    // If user had maxed out the slider and new max is higher, auto-increase
    else if (maxCountForSide > 0 && maxCountForSide === ballCount && maxCount > maxCountForSide) {
      setEntry({ side: { ...entry.side, ballCount: maxCount } })
    }
  }, [riskLevel, rowCount])

  const handleBallCountChange = (val: number) => {
    if (val >= PLINKO_CONSTRAINTS.ballCount.min && val <= maxCountForSide) {
      setEntry({ side: { ...entry.side, ballCount: val } })
      setError('')
    }
  }

  const handleRowCountChange = (val: number) => {
    if (val >= PLINKO_CONSTRAINTS.rowCount.min && val <= PLINKO_CONSTRAINTS.rowCount.max) {
      setEntry({ side: { ...entry.side, rowCount: val } })
    }
  }

  const handleRiskLevelChange = (val: number) => {
    if (val >= PLINKO_CONSTRAINTS.riskLevel.min && val <= PLINKO_CONSTRAINTS.riskLevel.max) {
      setEntry({ side: { ...entry.side, riskLevel: val } })
    }
  }

  const handlePlay = async () => {
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0] || 'Invalid entry data')
      return
    }

    setError('')

    try {
      await playRandom()
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to drop balls'
      console.error('Plinko game error:', err)
      setError(errorMessage)
    }
  }

  // Prepare formData for GameButton
  // Plinko sends risk level and rows configuration
  const formData = useMemo(
    () => ({
      side: {
        riskLevel: riskLevel, // 0=Low, 1=Medium, 2=High (match IPlinkoSide interface)
        rowCount: rowCount, // Number of rows (match IPlinkoSide interface)
      },
      entryAmount: entry.entryAmount,
      numberOfEntries: ballCount, // Ball count maps to number of entries
      stopLoss: 0,
      stopGain: 0,
    }),
    [riskLevel, rowCount, ballCount, entry.entryAmount]
  )

  const handleSimulateWin = async () => {
    setError('')

    try {
      await simulateWin()
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to simulate win'
      console.error('Simulation error:', err)
      setError(errorMessage)
    }
  }

  const handleSimulateLoss = async () => {
    setError('')

    try {
      await simulateLoss()
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to simulate loss'
      console.error('Simulation error:', err)
      setError(errorMessage)
    }
  }

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
      <RiskLevelButtons
        value={riskLevel}
        onChange={handleRiskLevelChange}
        disabled={isRiskDisabled}
        primaryColor={accentColor}
      />

      <LabelledNumberSliderInput
        label='ROW COUNT'
        value={rowCount}
        onChange={handleRowCountChange}
        min={PLINKO_CONSTRAINTS.rowCount.min}
        max={PLINKO_CONSTRAINTS.rowCount.max}
        sliderMax={PLINKO_CONSTRAINTS.rowCount.max}
        disabled={isRiskDisabled}
      />

      <LabelledNumberSliderInput
        label='BET AMOUNT'
        value={entry.entryAmount}
        onChange={setEntryAmount}
        min={0}
        max={maxBetAmount}
        incrementAmount={sliderStep}
        disabled={isGameAnimating}
      />

      <LabelledNumberSliderInput
        label='NUMBER OF ENTRIES'
        value={ballCount}
        onChange={handleBallCountChange}
        min={PLINKO_CONSTRAINTS.ballCount.min}
        max={maxCountForSide}
        sliderMax={maxCountForSide}
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
          loading={animLoading}
        />
      : <GameButton entryAmountNum={entry.entryAmount} formData={formData} />}

      {!editMode && <DemoModeToggle />}
      {/* <FormErrorDisplay message={error || validation.errors.ballCount || validation.errors.rowCount} /> */}
    </StandardFormLayout>
  )
}
