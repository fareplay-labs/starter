// @ts-nocheck
import React, { useMemo, useRef, useEffect } from 'react'
import { useGameStore } from '@/components/CustomUserCasinos/CustomGames/shared/CustomGamePage/GameStoreContext'
import { type CoinFlipParameters, type CoinFlipResult, type CoinSide } from './types'
import { type FareGameState } from '../shared/types'
import { CoinFlipSelection } from '@/components/CustomUserCasinos/lib/crypto/coinFlip'
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
import { calculateCoinFlipMultiplier, calculateWinChance } from './logic/CoinFlipGameLogic'
import { useIsLoading } from '../shared/hooks/useIsLoading'
import { useIsDisabled } from '../shared/hooks/useIsDisabled'
import { styled } from 'styled-components'
import { GameButton } from '@/components/CustomUserCasinos/shared/Button/GameButton'
import { useGameContract } from '@/components/CustomUserCasinos/Singletons/useGameContract'
import { useIsGameAnimating } from '@/components/CustomUserCasinos/hooks/useIsGameAnimating'

interface CoinFlipFormProps {
  onFlip?: (result: CoinFlipResult) => void
  editMode?: boolean
}

const ChoiceContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`

const ChoiceButton = styled.button<{
  $isSelected: boolean
  $color: string
}>`
  flex: 1;
  padding: 16px;
  border: 2px solid ${props => (props.$isSelected ? props.$color : 'rgba(255, 255, 255, 0.2)')};
  border-radius: 12px;
  background: ${props => (props.$isSelected ? props.$color : 'rgba(255, 255, 255, 0.05)')};
  color: ${props => (props.$isSelected ? 'white' : 'rgba(255, 255, 255, 0.8)')};
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: ${props => (props.$isSelected ? props.$color : 'rgba(255, 255, 255, 0.1)')};
    border-color: ${props => props.$color};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const CoinFlipForm: React.FC<CoinFlipFormProps> = ({ onFlip, editMode = false }) => {
  const { maxBetAmount, sliderStep } = useMaxBetAmount()
  const { isGameAnimating } = useIsGameAnimating()
  const store = useGameStore(state => ({
    parameters: state.parameters as CoinFlipParameters,
    playRandom: state.playRandom,
    simulateWin: state.simulateWin,
    simulateLoss: state.simulateLoss,
    entry: state.entry,
    setEntry: state.setEntry,
    setEntryAmount: state.setEntryAmount,
    setEntryCount: state.setEntryCount,
    isFlipping: state.isLoading,
    gameState: state.gameState,
    validation: state.validation,
    isDemoMode: state.isDemoMode,
    setDemoMode: state.setDemoMode,
  }))

  const {
    playRandom,
    simulateWin,
    simulateLoss,
    entry,
    setEntry,
    setEntryAmount,
    isFlipping,
    gameState,
    validation,
    isDemoMode,
  } = store

  const accentColor = '#ffd700'
  // Use default colors since headsColor/tailsColor were removed
  const headsColor = '#4a90e2'
  const tailsColor = '#e74c3c'

  const multiplier = calculateCoinFlipMultiplier()
  const winChance = calculateWinChance()

  const animLoadingStates: FareGameState[] = useMemo(() => ['PLAYING'], [])

  const animLoading = useIsLoading({
    gameState,
    loadingStates: animLoadingStates,
  })

  const isDisabled = useIsDisabled({
    gameState,
    animLoading,
    betAmount: entry.entryAmount,
  })

  const handleChoiceChange = (choice: CoinSide) => {
    if (isDisabled) return
    setEntry({ side: choice })
  }

  const handlePlay = async () => {
    if (isFlipping) return

    try {
      const result = await playRandom()

      if (onFlip) {
        onFlip(result)
      }
    } catch (err: any) {
      console.error('Coin flip error:', err)
    }
  }

  const handleSimulateWin = async () => {
    if (isFlipping) return

    try {
      const result = await simulateWin()

      if (onFlip) {
        onFlip(result)
      }
    } catch (err: any) {
      console.error('Simulation error:', err)
    }
  }

  const handleSimulateLoss = async () => {
    if (isFlipping) return

    try {
      const result = await simulateLoss()

      if (onFlip) {
        onFlip(result)
      }
    } catch (err: any) {
      console.error('Simulation error:', err)
    }
  }

  // Prepare formData for GameButton
  const formData = useMemo(
    () => ({
      side: entry.side, // Now using numeric enum directly
      entryAmount: entry.entryAmount,
      numberOfEntries: entry.entryCount,
      stopLoss: 0, // CoinFlip doesn't use stop loss
      stopGain: 0, // CoinFlip doesn't use stop gain
    }),
    [entry]
  )

  // Import submitEntry to track blockchain submissions
  const submitEntry = useGameStore(state => state.submitEntry)

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

  // Note: isSubmitting state is properly reset in useCoinFlipBlockchainResult
  // when the blockchain result arrives, matching the original game behavior

  return (
    <StandardFormLayout>
      <ChoiceContainer>
        <ChoiceButton
          $isSelected={entry.side === CoinFlipSelection.Heads}
          $color={headsColor}
          onClick={() => handleChoiceChange(CoinFlipSelection.Heads)}
          disabled={isDisabled}
        >
          HEADS
        </ChoiceButton>
        <ChoiceButton
          $isSelected={entry.side === CoinFlipSelection.Tails}
          $color={tailsColor}
          onClick={() => handleChoiceChange(CoinFlipSelection.Tails)}
          disabled={isDisabled}
        >
          TAILS
        </ChoiceButton>
      </ChoiceContainer>

      <GameStats
        stats={[
          {
            label: 'YOUR CHOICE',
            value:
              entry.side === CoinFlipSelection.Heads ? 'HEADS'
              : entry.side === CoinFlipSelection.Tails ? 'TAILS'
              : 'NONE',
          },
          { label: 'WIN CHANCE', value: winChance.toFixed(1) + '%' },
          { label: 'MULTIPLIER', value: multiplier.toFixed(2) + 'x' },
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

      <FormErrorDisplay message={validation.errors.entryAmount || validation.errors.side || ''} />

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
          loading={isFlipping || animLoading}
        />
      : <GameButton entryAmountNum={entry.entryAmount} formData={formData} />}
      {!editMode && <DemoModeToggle />}
    </StandardFormLayout>
  )
}

export default CoinFlipForm
