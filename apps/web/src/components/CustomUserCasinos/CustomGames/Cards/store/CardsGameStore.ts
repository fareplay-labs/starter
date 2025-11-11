// @ts-nocheck
import { createGameStore } from '../../shared/gameStoreFactory'
import {
  type CardsParameters,
  type CardsResult,
  type CardsEntry,
  type CardsRuntimeState,
  type CardsActions,
  DEFAULT_CARDS_PARAMETERS,
  type CardDraw,
} from '../types'
import { CardsGameLogic } from '../logic/CardsGameLogic'
import { entryEvent } from '@/components/CustomUserCasinos/events/entryEvent'

const RESET_DELAY = 5000 // 5 seconds before auto-reset

export const useCardsGameStore = createGameStore<
  CardsParameters,
  CardsResult,
  CardsEntry,
  CardsRuntimeState,
  CardsActions
>(
  'cards',
  DEFAULT_CARDS_PARAMETERS,
  (set, get) => ({
    // Runtime state
    selectedPack: 0, // Default to Explorer pack (0)
    isPackOpening: false,
    revealedCards: [],
    currentRevealIndex: -1,
    autoOpen: true,

    // Actions
    selectPack: (packType: number) => {
      set({
        selectedPack: packType,
      })
      get().setEntry({ side: packType })
    },

    // Pure animation function - just shows the given result
    async showResult(cardIndices: number[]) {
      const state = get()
      const { entry, submittedEntry, parameters } = state
      const selectedPack = state.selectedPack ?? 0
      // Use the submitted entry amount (multiplier) to prevent UI drift
      const betAmount = (submittedEntry?.entryAmount ?? entry.entryAmount) || 1
      
      // Generate cards from blockchain indices
      const cards = CardsGameLogic.generateCardsFromBlockchainResult(
        cardIndices,
        selectedPack,
        parameters,
        betAmount
      )
      
      // Start the animation sequence - same as demo mode
      set({
        gameState: 'PLAYING',
        isPackOpening: true,  // Start with pack opening animation
        revealedCards: cards, // Store the cards
        currentRevealIndex: -1, // But don't reveal them yet
      })
      
      // Simulate pack opening animation delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Pack opening complete, now cards are ready to be revealed
      set({
        isPackOpening: false, // Pack is now open, shows card stack
      })
      
      // The normal card reveal flow (clicks or auto-open) will handle revealing cards
      // and transitioning to SHOWING_RESULT when all cards are revealed
      
      // Return a result for consistency with other games
      const totalPayout = cards.reduce((sum, card) => sum + card.value, 0)
      const packPrice = CardsGameLogic.getPackInfo(selectedPack, parameters).price
      
      return {
        timestamp: Date.now(),
        entryAmount: packPrice * betAmount,
        numberOfEntries: 1,
        payout: totalPayout,
        isWin: totalPayout > (packPrice * betAmount),
        packType: selectedPack,
        cardsDrawn: cards,
        totalPayout,
      } as CardsResult
    },

    startGame: async () => {
      const state = get()

      // Check if already playing
      if (state.gameState !== 'IDLE') return

      // Validate entry
      const validation = CardsGameLogic.validateEntry(state.selectedPack, state.entry.entryAmount)

      if (!validation.isValid) {
        return
      }

      // Submit entry and start game
      state.submitEntry()
      set({
        gameState: 'PLAYING',
        isPackOpening: true,
      })

      // Simulate pack opening animation delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate cards based on probabilities
      try {
        // Prefer submitted multiplier if already set, fallback to current entry
        const betAmount = (state.submittedEntry?.entryAmount ?? state.entry.entryAmount) || 1
        const result = await CardsGameLogic.generateCardDraws(
          state.selectedPack!, 
          state.parameters,
          betAmount
        )

        set({
          revealedCards: result.cardsDrawn,
          currentRevealIndex: -1,
          isPackOpening: false,
        })
      } catch (error) {
        set({
          gameState: 'IDLE',
          isPackOpening: false,
        })
      }
    },

    revealNextCard: () => {
      const state = get()

      // Can only reveal during playing state
      if (state.gameState !== 'PLAYING') return

      const nextIndex = state.currentRevealIndex + 1

      // If committing the last card's reveal, finalize and show results
      const isLastReveal = nextIndex >= state.revealedCards.length - 1
      if (isLastReveal) {
        // Get bet amount from entry
        const betAmount = (state.submittedEntry?.entryAmount ?? state.entry.entryAmount) || 1
        const packPrice = CardsGameLogic.getPackInfo(state.selectedPack!, state.parameters).price
        
        // Calculate total payout: cards already have scaled values
        const totalPayout = state.revealedCards.reduce(
          (sum: number, card: CardDraw) => sum + card.value,
          0
        )

        // Set final result and advance reveal index to final card
        set((s: any) => ({
          gameState: 'SHOWING_RESULT',
          currentRevealIndex: Math.max(nextIndex, -1),
          lastResult: {
            timestamp: Date.now(),
            entryAmount: packPrice * betAmount, // Use full entry amount
            numberOfEntries: 1,
            payout: totalPayout,
            isWin: totalPayout > (packPrice * betAmount),
            packType: state.selectedPack!,
            cardsDrawn: s.revealedCards, // Cards already have correct values
            totalPayout,
          } as CardsResult,
        }))

        // Update wallet balance immediately when showing result
        entryEvent.pub('updateBalance')

        // Auto-reset after delay
        setTimeout(() => {
          const currentState = get()
          if (currentState.gameState === 'SHOWING_RESULT') {
            currentState.reset()
          }
        }, RESET_DELAY)
      } else {
        // Reveal next card
        set({ currentRevealIndex: nextIndex })
      }
    },

    reset: () => {
      // Announce completion to unlock submit button in blockchain mode
      entryEvent.pub('gameFinished')
      
      // First set to RESETTING state
      set({ gameState: 'RESETTING' })
      
      // Then after a brief delay, complete the reset
      setTimeout(() => {
        const currentPack = get().selectedPack
        set({
          gameState: 'IDLE',
          selectedPack: currentPack, // Keep the selected pack
          revealedCards: [],
          currentRevealIndex: -1,
          isPackOpening: false,
          lastResult: null,
          isLoading: false,
          error: undefined,
          submittedEntry: null,
          validation: { isValid: true, errors: {} },
        })
        
        // Don't reset entry to preserve pack selection
      }, 400)
    },

    // Override validation to use our logic
    validateEntry: () => {
      const { selectedPack, entry } = get()
      return CardsGameLogic.validateEntry(selectedPack, entry.entryAmount)
    },

    // Initialize with proper defaults
    resetGameSpecificState: () => {
      set({
        selectedPack: 0, // Default to Explorer pack
        isPackOpening: false,
        revealedCards: [],
        currentRevealIndex: -1,
        autoOpen: false,
      })
    },
  }),
  // Default entry (Explorer pack selected by default)
  {
    entryAmount: 0,
    entryCount: 1,
    side: 0, // Explorer pack
  } as CardsEntry
)
