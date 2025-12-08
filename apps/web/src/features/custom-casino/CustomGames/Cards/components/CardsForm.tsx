// @ts-nocheck
import React, { useRef, useEffect, useMemo } from 'react'
import { useCardsGameStore } from '../store/CardsGameStore'
import { CardsGameLogic } from '../logic/CardsGameLogic'
import { formatCardValue } from '../utils/formatUtils'
import { useCardsSound } from '../hooks/useCardsSound'
import {
  StandardFormLayout,
  FormGroup,
  DemoSubmitButton,
  DemoModeToggle,
  LabelledNumberSliderInput,
  BannerSelect,
} from '../../shared/formComponents/tailwind'
import { useMaxBetAmount } from '../../shared/hooks/useMaxBetAmount'
import { useIsLoading } from '../../shared/hooks/useIsLoading'
import { cn } from '@/lib/utils'
import { GameButton } from '@/features/custom-casino/shared/Button/GameButton'
import { useGameContract } from '@/features/custom-casino/Singletons/useGameContract'
import { cardDrawCountToOpenAPack } from '@/features/custom-casino/lib/crypto/cards'
import { KeepSelectionCheckbox } from '@/features/custom-casino/shared/KeepSelectionCheckbox'

// TotalCostDisplay component with Tailwind
const TotalCostDisplay: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    className={cn(
      'p-3 rounded-lg text-center',
      'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5',
      'border border-emerald-500/30'
    )}
  >
    <div className="text-xs text-white/60 mb-1">{label}</div>
    <div className="text-2xl font-bold text-emerald-500">{value}</div>
  </div>
)

export const CardsForm: React.FC = () => {
  const { maxBetAmount, sliderStep, balance } = useMaxBetAmount()
  const { playSound } = useCardsSound()
  const {
    entry,
    setEntry,
    selectedPack,
    selectPack,
    startGame,
    gameState,
    parameters,
    validateEntry,
    autoOpen,
    isDemoMode,
    submitEntry,
  } = useCardsGameStore()

  const validation = validateEntry()

  // Use proper animation tracking - include RESETTING state
  const animLoading = useIsLoading({
    gameState,
    loadingStates: ['PLAYING', 'SHOWING_RESULT', 'RESETTING'],
  })

  // Simple disable check that includes animation state
  const isDisabled = gameState !== 'IDLE' || animLoading

  const packs = [
    {
      id: 0,
      icon: '📦',
      badge: 'popular' as const,
      description: '3 cards • Beginner friendly',
    },
    {
      id: 1,
      icon: '🎁',
      badge: 'best-value' as const,
      description: '6 cards • Balanced odds',
    },
    {
      id: 2,
      icon: '💎',
      badge: 'high-roller' as const,
      description: '9 cards • Best RTP',
    },
  ].map(pack => ({
    ...pack,
    ...CardsGameLogic.getPackInfo(pack.id, parameters),
  }))

  // selectedPack defaults to 0 now, should never be null
  const currentPackIndex = selectedPack ?? 0
  const currentPack = packs[currentPackIndex]
  const totalCost = currentPack.price * entry.entryAmount

  // Calculate the actual max bet multiplier based on pack price
  // Allow fractional multipliers for cases where wallet balance < pack price
  const adjustedMaxBet = useMemo(() => {
    return maxBetAmount / currentPack.price
  }, [maxBetAmount, currentPack.price])

  // Calculate more precise step for the multiplier slider
  // Use finer steps for tier 2/3 packs when wallet balance is small
  const adjustedSliderStep = useMemo(() => {
    const packPrice = currentPack.price
    const effectiveMax = adjustedMaxBet

    // For tier 2/3 packs (5x and 15x multipliers) with small balances
    // use more precise steps to give better control
    if (packPrice >= 5 && balance <= 50) {
      if (effectiveMax <= 1) {
        return 0.01
      } else if (effectiveMax <= 2) {
        return 0.05
      } else if (effectiveMax <= 5) {
        return 0.1
      }
    }

    // Default step calculation for other cases
    if (effectiveMax <= 1) {
      return 0.01
    } else if (effectiveMax < 5) {
      return 0.1
    } else if (effectiveMax < 25) {
      return 0.25
    } else if (effectiveMax < 50) {
      return 0.5
    } else if (effectiveMax < 100) {
      return 1
    } else if (effectiveMax < 250) {
      return 5
    } else {
      return 10
    }
  }, [adjustedMaxBet, currentPack.price, balance])

  const toggleAutoOpen = () => {
    useCardsGameStore.setState({ autoOpen: !autoOpen })
  }

  // Adjust bet multiplier when switching packs if it exceeds the new maximum
  const handlePackSelect = (packId: number) => {
    playSound('packSelect')
    selectPack(packId)
    const newPack = packs[packId]
    const newMaxBet = maxBetAmount / newPack.price

    // If current bet multiplier exceeds the new maximum, adjust it
    if (entry.entryAmount > newMaxBet) {
      setEntry({ entryAmount: newMaxBet })
    }
  }

  // Prepare formData for GameButton - Cards uses packId instead of side
  const formData = useMemo(
    () => ({
      packId: selectedPack, // Pack ID (0, 1, or 2)
      side: selectedPack, // Also include as side for compatibility
      entryAmount: totalCost, // Total cost based on pack price × multiplier
      numberOfEntries: cardDrawCountToOpenAPack, // Draws per pack must match live game
      stopLoss: 0, // TODO: Add stop loss support to match legacy
      stopGain: 0, // TODO: Add stop gain support to match legacy
    }),
    [selectedPack, totalCost]
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
      <FormGroup label='SELECT PACK'>
        <BannerSelect
          options={packs.map(pack => ({
            id: pack.id,
            title: `${pack.icon} ${pack.name}`,
            details: `$${formatCardValue(pack.price * entry.entryAmount)} • ${pack.slots} cards`,
            accentColor: pack.color,
          }))}
          selectedId={selectedPack}
          onSelect={id => handlePackSelect(Number(id))}
          disabled={isDisabled}
        />
      </FormGroup>

      <LabelledNumberSliderInput
        label='BET MULTIPLIER'
        value={entry.entryAmount}
        onChange={value => setEntry({ entryAmount: value })}
        min={0}
        max={adjustedMaxBet}
        incrementAmount={adjustedSliderStep}
        disabled={isDisabled}
      />

      <TotalCostDisplay label="TOTAL BET" value={`$${formatCardValue(totalCost)}`} />

      {isDemoMode ?
        <DemoSubmitButton
          onClick={startGame}
          disabled={!validation.isValid || isDisabled}
          loading={gameState === 'PLAYING'}
        >
          {gameState === 'PLAYING' ? 'Opening Pack...' : 'Open Pack'}
        </DemoSubmitButton>
      : <GameButton entryAmountNum={totalCost} formData={formData} />}

      <DemoModeToggle />

      <KeepSelectionCheckbox
        checked={autoOpen}
        onChange={toggleAutoOpen}
        disabled={gameState !== 'IDLE'}
      >
        AUTO OPEN
      </KeepSelectionCheckbox>
    </StandardFormLayout>
  )
}
