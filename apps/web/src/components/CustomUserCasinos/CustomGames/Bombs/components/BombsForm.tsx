// @ts-nocheck
import React, { useRef, useEffect, useMemo } from 'react'
import { useBombsGameStore } from '../store/BombsGameStore'
import {
  StandardFormLayout,
  LabelledNumberSliderInput,
  DemoSubmitButton,
  DemoModeToggle,
  GameStats,
  SimulationControl,
} from '../../shared/formComponents'
import { GameButton } from '@/components/CustomUserCasinos/shared/Button/GameButton'
import { useGameContract } from '@/components/CustomUserCasinos/Singletons/useGameContract'
import { useMaxBetAmount } from '../../shared/hooks/useMaxBetAmount'
import { bombCountToRevealCountToMultiplier } from '@/components/CustomUserCasinos/lib/crypto/bombs'
import { formatEther } from 'viem'
import { useIsLoading } from '../../shared/hooks/useIsLoading'
import { useIsDisabled } from '../../shared/hooks/useIsDisabled'
import { CheckboxContainer, CheckboxLabel, StyledCheckbox } from '@/components/CustomUserCasinos/shared/KeepSelectionCheckbox/styles'
import { calculateWinChance } from '../logic/BombsGameLogic'
import { useIsGameAnimating } from '@/components/CustomUserCasinos/hooks/useIsGameAnimating'

interface BombsFormProps {
  editMode?: boolean
}

export const BombsForm: React.FC<BombsFormProps> = ({ editMode = false }) => {
  const { maxBetAmount, sliderStep } = useMaxBetAmount()
  const { isGameAnimating } = useIsGameAnimating()
  const {
    gameState,
    playRandom,
    simulateWin,
    simulateLoss,
    entry,
    setEntry,
    setEntryAmount,
    keepSelection,
    validation,
    isDemoMode,
    submitEntry,
  } = useBombsGameStore((state: any) => ({
    gameState: state.gameState,
    playRandom: state.playRandom,
    simulateWin: state.simulateWin,
    simulateLoss: state.simulateLoss,
    entry: state.entry,
    setEntry: state.setEntry,
    setEntryAmount: state.setEntryAmount,
    setEntryCount: state.setEntryCount,
    keepSelection: state.keepSelection,
    validation: state.validation,
    isDemoMode: state.isDemoMode,
    setDemoMode: state.setDemoMode,
    submitEntry: state.submitEntry,
  }))

  // Calculate multiplier based on bomb count and selected tiles using lookup table
  const multiplier = useMemo(() => {
    // Get reveal count (number of selected tiles)
    const revealCount = entry.side.selectedTiles.length
    const bombCount = entry.side.bombCount

    // Show placeholder when no tiles are selected
    if (revealCount === 0) {
      return '0.00x'
    }

    // Validate bomb count is within lookup table range
    if (!bombCount || bombCount < 1 || bombCount > 24) {
      return '0.00x'
    }

    // Get multiplier from lookup table
    const multiplierBigInt = bombCountToRevealCountToMultiplier[bombCount]?.[revealCount]

    // If no multiplier found for this combination, use fallback
    if (!multiplierBigInt) {
      return (bombCount > 0 ? (1 + bombCount / 5).toFixed(2) : '0.00') + 'x'
    }

    // Convert bigint to decimal string (formatEther converts wei to ether, giving us 18 decimals)
    const multiplierValue = Number(formatEther(multiplierBigInt)).toFixed(2)
    return multiplierValue + 'x'
  }, [entry.side.bombCount, entry.side.selectedTiles])

  const animLoading = useIsLoading({
    gameState,
    loadingStates: ['SHOWING_RESULT'],
  })

  const isDisabled = useIsDisabled({
    gameState,
    animLoading,
    betAmount: entry.entryAmount,
    selectedTiles: entry.side.selectedTiles,
  })

  const handleBombCountChange = (value: number) => {
    if (value >= 1 && value <= 24) {
      const maxSelectableTiles = 25 - value
      const currentSelectedTiles = entry.side.selectedTiles

      // If current selection exceeds new limit, trim it
      const trimmedSelectedTiles =
        currentSelectedTiles.length > maxSelectableTiles ?
          currentSelectedTiles.slice(0, maxSelectableTiles)
        : currentSelectedTiles

      setEntry({
        side: {
          ...entry.side,
          bombCount: value,
          selectedTiles: trimmedSelectedTiles,
        },
      })
    }
  }

  const handlePlay = async () => {
    try {
      await playRandom()
    } catch (err: any) {
      console.error('Play error:', err)
    }
  }

  const handleSimulateWin = async () => {
    try {
      await simulateWin()
    } catch (err: any) {
      console.error('Simulation error:', err)
    }
  }

  const handleSimulateLoss = async () => {
    try {
      await simulateLoss()
    } catch (err: any) {
      console.error('Simulation error:', err)
    }
  }

  const toggleKeepSelection = () => {
    useBombsGameStore.setState({ keepSelection: !keepSelection })
  }

  const winChance = calculateWinChance(entry.side.bombCount, entry.side.selectedTiles)

  // Prepare formData for GameButton
  // Bombs uses a complex side object with bombCount and selected tiles
  const formData = useMemo(
    () => ({
      side: {
        bombCount: entry.side.bombCount,
        revealCount: entry.side.selectedTiles.length,
        revealIndexes: entry.side.selectedTiles,
      },
      entryAmount: entry.entryAmount,
      numberOfEntries: entry.entryCount,
      stopLoss: 0,
      stopGain: 0,
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
        label='BOMB COUNT'
        value={entry.side.bombCount}
        onChange={handleBombCountChange}
        min={1}
        max={24}
        incrementAmount={1}
        disabled={isGameAnimating}
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

      {/*TODO: Add multiple entry support*/}
      {/* <LabelledNumberSliderInput
        label='NUMBER OF ENTRIES'
        value={entry.entryCount}
        onChange={setEntryCount}
        min={1}
        max={100}
        disabled={isGameAnimating}
      /> */}

      <GameStats
        stats={[
          { label: 'TILES SELECTED', value: entry.side.selectedTiles.length.toString() },
          { label: 'WIN CHANCE', value: winChance + '%' },
          { label: 'MULTIPLIER', value: multiplier },
        ]}
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
        >
          {!validation.isValid && entry.side.selectedTiles.length === 0 ?
            'SELECT TILES TO PLAY'
          : 'PLAY DEMO'}
        </DemoSubmitButton>
      : <GameButton entryAmountNum={entry.entryAmount} formData={formData} />}

      {!editMode && <DemoModeToggle />}

      <CheckboxContainer>
        <CheckboxLabel>
          <StyledCheckbox
            type='checkbox'
            checked={keepSelection}
            onChange={toggleKeepSelection}
            disabled={isGameAnimating}
          />
          Keep Selection
        </CheckboxLabel>
      </CheckboxContainer>
    </StandardFormLayout>
  )
}

export default BombsForm
