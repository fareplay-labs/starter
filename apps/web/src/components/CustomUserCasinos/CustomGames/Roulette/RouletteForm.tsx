// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useRouletteGameStore } from './RouletteGameStore'
import { type RouletteResult } from './types'
import { useGameContract } from '@/components/CustomUserCasinos/Singletons/useGameContract'
import {
  LabelledNumberSliderInput,
  SimulationControl,
  FormErrorDisplay,
  DemoSubmitButton,
  DemoModeToggle,
  StandardFormLayout,
} from '../shared/formComponents'
import { GameButton } from '@/components/CustomUserCasinos/shared/Button/GameButton'
import {
  ChipSection,
  ChipTitle,
  ChipButtonsContainer,
  ChipButton,
  CurrentEntriesSection,
  EntryListHeader,
  EntryList,
  EntryItemContainer,
  EntryItemInner,
  EntryItem,
  EntryChip,
  EntryDescription,
  RemoveButton,
  EmptyStateContainer,
  EmptyStateContent,
  EmptyStateText,
  ClearAllButton,
} from './styles/RouletteFormStyles'
import {
  formatEntryDescription,
  isBetWinning,
  calculateWinIntensity,
  createBetKey,
} from './utils/bettingUtils'
import numeral from 'numeral'
import { AnimatePresence } from 'framer-motion'
import { ChipBorder } from '@/components/CustomUserCasinos/CustomGames/Roulette/RouletteLegacyStyles'
import { SVGS } from '@/assets'
import { useIsLoading } from '../shared/hooks/useIsLoading'
import { useIsDisabled } from '../shared/hooks/useIsDisabled'
import { useMaxBetAmount } from '../shared/hooks/useMaxBetAmount'
import {
  convertRouletteUIRepresentationToRouletteNumberToBetFraction,
  type IUISingleRouletteSide,
} from '@/components/CustomUserCasinos/lib/crypto/roulette'
import { type BetType } from '@/components/CustomUserCasinos/store/useRouletteGameStore'
import { CheckboxContainer, CheckboxLabel, StyledCheckbox } from '@/components/CustomUserCasinos/shared/KeepSelectionCheckbox/styles'
import { useIsGameAnimating } from '@/components/CustomUserCasinos/hooks/useIsGameAnimating'

interface RouletteFormProps {
  onSpin?: (result: RouletteResult) => void
  editMode?: boolean
}

const RouletteForm: React.FC<RouletteFormProps> = ({ onSpin, editMode = false }) => {
  const { maxBetAmount, sliderStep } = useMaxBetAmount()
  const { isGameAnimating } = useIsGameAnimating()
  const {
    parameters,
    playRandom,
    simulateWin,
    simulateLoss,
    removeBet,
    clearAllBets,
    entry,
    selectedChip,
    setSelectedChip,
    isSpinning,
    gameState,
    lastResult,
    updateParameters,
    keepSelection,
    isDemoMode,
    submitEntry,
  } = useRouletteGameStore()

  const accentColor = parameters?.accentColor ?? '#ffd700'
  const textColor = parameters?.textColor ?? '#ffffff'
  const minBetAmount = parameters?.minBetAmount ?? 1
  const [error, setError] = useState<string>('')
  const chipMultipliers = [1, 5, 25, 100] // Static multipliers

  const animLoading = useIsLoading({
    gameState,
    loadingStates: ['PLAYING'],
  })

  // Ensure entry.side is an array
  const placedBets = Array.isArray(entry.side) ? entry.side : []
  const totalBetAmount = placedBets.reduce((sum, bet) => sum + bet.amount, 0)

  const isDisabled = useIsDisabled({
    gameState,
    animLoading,
    betAmount: totalBetAmount,
    placedBets,
  })

  const handleChipSelect = (multiplier: number) => {
    setSelectedChip(multiplier)
  }

  const handleSpin = async () => {
    if (isSpinning) return
    if (placedBets.length === 0) {
      setError('Please place at least one bet')
      return
    }

    setError('')

    try {
      const result = await playRandom()
      if (onSpin) {
        onSpin(result)
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to spin the roulette'
      console.error('Roulette spinning error:', err)
      setError(errorMessage)
    }
  }

  const handleSimulateWin = async () => {
    if (isSpinning) return
    if (placedBets.length === 0) {
      setError('Please place at least one bet')
      return
    }
    setError('')

    try {
      const result = await simulateWin()
      if (onSpin) {
        onSpin(result)
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to simulate win'
      console.error('Simulation error:', err)
      setError(errorMessage)
    }
  }

  const handleSimulateLoss = async () => {
    if (isSpinning) return
    if (placedBets.length === 0) {
      setError('Please place at least one bet')
      return
    }
    setError('')

    try {
      const result = await simulateLoss()
      if (onSpin) {
        onSpin(result)
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to simulate loss'
      console.error('Simulation error:', err)
      setError(errorMessage)
    }
  }

  const toggleKeepSelection = () => {
    useRouletteGameStore.setState({ keepSelection: !keepSelection })
  }

  // Prepare formData for GameButton
  // Convert bets to blockchain format
  const formData = useMemo(() => {
    // Convert our RouletteBet format to IUISingleRouletteSide format
    const uiRepresentation: IUISingleRouletteSide[] = placedBets.map(bet => ({
      type: bet.type as BetType, // Cast to BetType for compatibility
      numbers: bet.numbers,
      amount: bet.amount,
    }))

    // Calculate the rouletteNumberToBetFraction from the UI representation
    const rouletteNumberToBetFraction =
      convertRouletteUIRepresentationToRouletteNumberToBetFraction(uiRepresentation)

    return {
      side: {
        uiRepresentation,
        rouletteNumberToBetFraction,
      },
      entryAmount: totalBetAmount,
      numberOfEntries: entry.entryCount,
      stopLoss: 0,
      stopGain: 0,
    }
  }, [placedBets, totalBetAmount, entry.entryCount])

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
        label='MINIMUM BET AMOUNT'
        value={minBetAmount}
        onChange={value => updateParameters({ minBetAmount: value })}
        min={0}
        max={maxBetAmount}
        incrementAmount={sliderStep}
        accentColor={accentColor}
        disabled={isGameAnimating}
      />

      <ChipSection>
        <ChipTitle $textColor={textColor}>SELECTED CHIP</ChipTitle>
        <ChipButtonsContainer>
          {chipMultipliers.map((multiplier, _index) => {
            const chipValue = minBetAmount * multiplier
            return (
              <ChipButton
                key={multiplier}
                type='button'
                $isActive={selectedChip === multiplier}
                $value={chipValue}
                $minBetAmount={minBetAmount}
                onClick={() => handleChipSelect(multiplier)}
                disabled={isSpinning}
              >
                {_index === 0 ?
                  <ChipBorder src={SVGS.level4Icon} />
                : <ChipBorder src={SVGS.chipBorder} />}
                {Math.round(chipValue).toLocaleString()}
              </ChipButton>
            )
          })}
        </ChipButtonsContainer>
      </ChipSection>

      <CurrentEntriesSection>
        <EntryListHeader $textColor={textColor}>
          <span>CURRENT ENTRIES</span>
          <span>TOTAL: {numeral(totalBetAmount).format('0,0.00')}</span>
        </EntryListHeader>
        <EntryList>
          <AnimatePresence mode='popLayout'>
            {placedBets.length === 0 ?
              <EmptyStateContainer
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <EmptyStateContent>
                  <EmptyStateText>No entries placed</EmptyStateText>
                </EmptyStateContent>
              </EmptyStateContainer>
            : placedBets.map((bet, index) => (
                <EntryItemContainer
                  key={createBetKey(bet, index)}
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    mass: 1,
                  }}
                  layout
                >
                  <EntryItemInner
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                      mass: 0.8,
                    }}
                    style={{ originX: 0 }}
                  >
                    <EntryItem
                      $isWinning={isBetWinning(bet, gameState, lastResult || undefined)}
                      $intensity={calculateWinIntensity(bet)}
                    >
                      <EntryChip $value={bet.amount} $minBetAmount={minBetAmount}>
                        {numeral(bet.amount).format('0,0')}
                      </EntryChip>
                      <EntryDescription>{formatEntryDescription(bet)}</EntryDescription>
                      <RemoveButton
                        type='button'
                        onClick={() => removeBet(index)}
                        $disabled={isDisabled}
                        disabled={isDisabled}
                      >
                        ×
                      </RemoveButton>
                    </EntryItem>
                  </EntryItemInner>
                </EntryItemContainer>
              ))
            }
          </AnimatePresence>
        </EntryList>
        {placedBets.length > 0 && (
          <ClearAllButton
            type='button'
            onClick={clearAllBets}
            $accentColor={accentColor}
            $textColor={textColor}
            disabled={isDisabled}
          >
            CLEAR ALL
          </ClearAllButton>
        )}
      </CurrentEntriesSection>

      {editMode ?
        <SimulationControl
          onSimulateWin={handleSimulateWin}
          onSimulateLoss={handleSimulateLoss}
          disabled={isDisabled}
        />
      : isDemoMode ?
        <DemoSubmitButton
          onClick={handleSpin}
          disabled={isDisabled}
          accentColor={accentColor}
          loading={isSpinning || animLoading}
        />
      : <GameButton entryAmountNum={totalBetAmount} formData={formData} />}

      {!editMode && <DemoModeToggle />}

      <CheckboxContainer>
        <CheckboxLabel>
          <StyledCheckbox
            type='checkbox'
            checked={keepSelection}
            onChange={toggleKeepSelection}
            disabled={isGameAnimating}
          />
          Keep Selections
        </CheckboxLabel>
      </CheckboxContainer>

      <FormErrorDisplay message={error} />
    </StandardFormLayout>
  )
}

export default RouletteForm
