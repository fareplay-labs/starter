// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useRPSGameStore } from '../RPSGameStore'
import { useGameContract } from '@/components/CustomUserCasinos/Singletons/useGameContract'
import {
  DemoSubmitButton,
  DemoModeToggle,
  GameStats,
  FormErrorDisplay,
  SimulationControl,
  StandardFormLayout,
  LabelledNumberSliderInput,
} from '../../shared/formComponents'
import { GameButton } from '@/components/CustomUserCasinos/shared/Button/GameButton'

// Images
import rockIconAlt from '@/components/CustomUserCasinos/assets/svg/rps-rock-icon-alt.svg'
import paperIconAlt from '@/components/CustomUserCasinos/assets/svg/rps-paper-icon-alt.svg'
import scissorsIconAlt from '@/components/CustomUserCasinos/assets/svg/rps-scissors-icon-alt.svg'
import { useIsLoading } from '../../shared/hooks/useIsLoading'
import { useIsDisabled } from '../../shared/hooks/useIsDisabled'
import { useMaxBetAmount } from '../../shared/hooks/useMaxBetAmount'
import {
  SChoiceButton,
  SChoiceIcon,
  SChoicesContainer,
  SLabel,
} from '../../shared/formComponents/styled'
import type { RPSChoice } from '../types'
import { useIsGameAnimating } from '@/components/CustomUserCasinos/hooks/useIsGameAnimating'

interface RPSFormProps {
  onPlay?: () => void
  accentColor?: string
  textColor?: string
  editMode?: boolean
}

const ChoiceButtons: React.FC<{
  playerChoice: RPSChoice | null
  setPlayerChoice: (choice: RPSChoice) => void
  isPlaying: boolean
  primaryColor: string
}> = ({ playerChoice, setPlayerChoice, isPlaying, primaryColor }) => {
  const choices: { value: RPSChoice; icon: string; label: string }[] = [
    { value: 'rock', icon: rockIconAlt, label: 'Rock' },
    { value: 'paper', icon: paperIconAlt, label: 'Paper' },
    { value: 'scissors', icon: scissorsIconAlt, label: 'Scissors' },
  ]

  return (
    <>
      <SLabel>SELECTION CHOICE</SLabel>
      <SChoicesContainer>
        {choices.map(choice => (
          <SChoiceButton
            key={choice.value}
            $selected={playerChoice === choice.value}
            onClick={() => setPlayerChoice(choice.value)}
            disabled={isPlaying}
            title={choice.label}
            $primaryColor={primaryColor}
          >
            <SChoiceIcon src={choice.icon} alt={choice.label} />
          </SChoiceButton>
        ))}
      </SChoicesContainer>
    </>
  )
}

export const RPSForm: React.FC<RPSFormProps> = ({
  onPlay,
  accentColor = '#3498db',
  editMode = false,
}) => {
  const { maxBetAmount, sliderStep } = useMaxBetAmount()
  const { isGameAnimating } = useIsGameAnimating()
  const {
    entry,
    setEntryAmount,
    playerChoice,
    gameState,
    setPlayerChoice,
    playRandom,
    simulateWin,
    simulateLoss,
    parameters,
    validation,
    isDemoMode,
    submitEntry,
  } = useRPSGameStore()
  const { primaryColor = '#3498db' } = parameters

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const animLoading = useIsLoading({
    gameState,
    loadingStates: ['PLAYING', 'SHOWING_RESULT'],
  })

  const isPlaying = gameState === 'PLAYING'

  const isDisabled = useIsDisabled({
    gameState,
    animLoading,
    betAmount: entry.entryAmount,
    playerChoice: entry.side,
    isProcessing,
  })

  // Calculate multiplier - always 2.0 for RPS
  const multiplier = 2.0

  const handlePlay = async () => {
    if (isProcessing) return
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0] || 'Invalid entry data')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const result = await playRandom()
      if (onPlay) onPlay()
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to play game'
      console.error('RPS game error:', err)
      setError(errorMessage)
    } finally {
      setTimeout(() => {
        setIsProcessing(false)
      }, 1000)
    }
  }

  // Prepare formData for GameButton
  // RPS uses numeric enum for choices
  const formData = useMemo(() => {
    const choiceToNumber = (choice: RPSChoice): number => {
      const map = { rock: 0, paper: 1, scissors: 2 }
      return map[choice] ?? 0
    }

    return {
      side: choiceToNumber(entry.side),
      entryAmount: entry.entryAmount,
      numberOfEntries: entry.entryCount,
      stopLoss: 0,
      stopGain: 0,
    }
  }, [entry])

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

  const handleSimulateWin = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    setError('')

    try {
      await simulateWin()
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to simulate win'
      console.error('Simulation error:', err)
      setError(errorMessage)
    } finally {
      setTimeout(() => {
        setIsProcessing(false)
      }, 1000)
    }
  }

  const handleSimulateLoss = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    setError('')

    try {
      await simulateLoss()
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to simulate loss'
      console.error('Simulation error:', err)
      setError(errorMessage)
    } finally {
      setTimeout(() => {
        setIsProcessing(false)
      }, 1000)
    }
  }

  return (
    <StandardFormLayout>
      <ChoiceButtons
        playerChoice={playerChoice}
        setPlayerChoice={setPlayerChoice}
        isPlaying={isPlaying}
        primaryColor={primaryColor}
      />

      <GameStats
        stats={[
          { label: 'WIN CHANCE', value: entry.side ? '33.33' : '0.00' },
          { label: 'MULTIPLIER', value: multiplier.toFixed(2) },
        ]}
      />

      <LabelledNumberSliderInput
        label='BET AMOUNT'
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
        max={10}
        sliderMax={10}
        accentColor={accentColor}
        disabled={isGameAnimating}
      /> */}

      {editMode ?
        <SimulationControl
          onSimulateWin={handleSimulateWin}
          onSimulateLoss={handleSimulateLoss}
          disabled={isDisabled}
        />
      : isDemoMode ?
        <DemoSubmitButton
          onClick={handlePlay}
          disabled={isDisabled}
          loading={isProcessing || animLoading}
          accentColor={accentColor}
        >
          PLAY DEMO
        </DemoSubmitButton>
      : <GameButton entryAmountNum={entry.entryAmount} formData={formData} />}

      {!editMode && <DemoModeToggle />}

      <FormErrorDisplay message={error} />
    </StandardFormLayout>
  )
}
