// @ts-nocheck
import { type CardsParameters, type CardsResult, type CardDraw } from '../types'
import {
  packIndexToPackQKForACardDraw,
  cardDrawCountToOpenAPack,
  isValidCardsSide,
} from '@/features/custom-casino/lib/crypto/cards'
import { formatEther } from 'viem'

export class CardsGameLogic {
  // Live game constants
  private static readonly CARDS_DRAWN_PER_PACK = cardDrawCountToOpenAPack // Always 6 cards

  // Pack prices from live game
  private static readonly PACK_PRICES = [1, 5, 15] // Explorer, Challenger, Cryptonaught

  // Live game expected values
  private static readonly EXPECTED_VALUES = {
    0: 0.71175, // Explorer
    1: 0.831549, // Challenger
    2: 0.986271527, // Cryptonaught
  }

  /**
   * Generate card draws for a pack opening using live game logic
   * Always draws exactly 6 cards regardless of pack type
   */
  static async generateCardDraws(
    packType: number,
    parameters: CardsParameters,
    betAmount = 1
  ): Promise<CardsResult> {
    // Validate pack type
    if (packType < 0 || packType > 2) {
      throw new Error(`Invalid pack type: ${packType}`)
    }

    // Validate bet amount
    if (betAmount < 0 || !isFinite(betAmount)) {
      throw new Error(`Invalid bet amount: ${betAmount}`)
    }

    // Get pack price and q/k arrays for this pack type with validation
    const packPrice = this.PACK_PRICES[packType]
    if (!packPrice || packPrice <= 0) {
      throw new Error(`Invalid pack price for pack type: ${packType}`)
    }

    const packData = packIndexToPackQKForACardDraw[packType]
    if (!packData || !packData.q || !packData.k) {
      throw new Error(`Invalid pack data for pack type: ${packType}`)
    }

    const { q, k } = packData

    // Validate q and k arrays
    if (q.length === 0 || k.length === 0) {
      throw new Error(`Empty probability arrays for pack type: ${packType}`)
    }

    const catalog = parameters.cardsCatalog || []

    // Filter catalog to get cards for this specific pack
    const packCards = catalog.filter(card => card.packId === packType)

    if (packCards.length === 0) {
      throw new Error(`No cards found for pack type: ${packType}`)
    }

    const cardsDrawn: CardDraw[] = []

    // Draw exactly 6 cards using live game probability logic
    for (let i = 0; i < this.CARDS_DRAWN_PER_PACK; i++) {
      // Select card index based on cumulative probabilities
      const selectedCardIndex = this.selectCardIndexFromProbabilities(q)

      // Validate selected index
      if (selectedCardIndex < 0 || selectedCardIndex >= q.length) {
        throw new Error(`Invalid card index selected: ${selectedCardIndex}`)
      }

      // Get the card from our pack's card list
      // Note: selectedCardIndex corresponds to indexInsidePack in live game
      const selectedCard = packCards.find(card => card.indexInsidePack === selectedCardIndex)

      // Use the centralized calculation method
      const cardValue = this.calculateCardValue(selectedCardIndex, packType, betAmount)

      // Get multiplier for the card (needed for result data)
      const kIndex = Math.min(selectedCardIndex, k.length - 1)
      const kValueInWei = k[kIndex] || k[0]
      const kValue = Number(formatEther(kValueInWei))

      if (!selectedCard) {
        // Fallback to card by modulo if exact index doesn't match
        const fallbackIndex = selectedCardIndex % packCards.length
        const fallbackCard = packCards[fallbackIndex]

        if (!fallbackCard) {
          throw new Error(`No fallback card found at index ${fallbackIndex}`)
        }

        cardsDrawn.push({
          catalogId: fallbackCard.id,
          slotIndex: i + 1,
          multiplier: kValue,
          value: cardValue,
        })
      } else {
        cardsDrawn.push({
          catalogId: selectedCard.id,
          slotIndex: i + 1,
          multiplier: kValue,
          value: cardValue,
        })
      }
    }

    const totalPayout = cardsDrawn.reduce((sum, card) => sum + card.value, 0)

    return {
      packType,
      cardsDrawn,
      totalPayout,
      timestamp: Date.now(),
      entryAmount: packPrice * betAmount,
      numberOfEntries: 1,
      payout: totalPayout,
      isWin: totalPayout > packPrice * betAmount,
    }
  }

  /**
   * Select card index based on cumulative probabilities (q array)
   * This matches the live game's probability selection logic
   */
  private static selectCardIndexFromProbabilities(q: bigint[]): number {
    const random = Math.random()
    let cumulative = 0

    for (let i = 0; i < q.length; i++) {
      // Convert bigint probability to number (q values are stored with 60 decimal precision)
      const probability = Number(q[i]) / Math.pow(10, 60)
      cumulative += probability

      if (random < cumulative) {
        return i
      }
    }

    // Fallback to last index if rounding errors occur
    return q.length - 1
  }

  /**
   * Calculate the value of a card based on its slot index and pack information
   */
  static calculateCardValue(slotIndex: number, packType: number, betAmount = 1): number {
    const packPrice = this.PACK_PRICES[packType] || 1
    const { k } = packIndexToPackQKForACardDraw[packType as 0 | 1 | 2]

    // Safe array access with boundary checks
    const kIndex = Math.min(slotIndex, k.length - 1)
    const kValueInWei = k[kIndex] || k[0]

    if (!kValueInWei) {
      return 0
    }

    const multiplier = Number(formatEther(kValueInWei))

    // Safe division with boundary check
    return this.CARDS_DRAWN_PER_PACK > 0 ?
        (packPrice * multiplier * betAmount) / this.CARDS_DRAWN_PER_PACK
      : 0
  }

  /**
   * Calculate expected value for a pack type using live game values
   */
  static calculateExpectedValue(packType: number): number {
    return this.EXPECTED_VALUES[packType as 0 | 1 | 2] || 0
  }

  /**
   * Get the house edge for a pack type
   */
  static getHouseEdge(packType: number): number {
    const ev = this.calculateExpectedValue(packType)
    return (1 - ev) * 100 // Return as percentage
  }

  /**
   * Get pack info using live game data
   */
  static getPackInfo(packType: number, params: CardsParameters) {
    // Use customizable pack names from parameters, fallback to defaults
    const defaultNames = ['Explorer Pack', 'Challenger Pack', 'Cryptonaught Pack']
    const names = params.packNames || defaultNames
    const prices = this.PACK_PRICES
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b']
    const distinctCards = [3, 6, 9] // Number of distinct cards per pack type

    return {
      id: packType,
      name: names[packType] || defaultNames[packType] || 'Unknown',
      price: prices[packType] || 1,
      slots: this.CARDS_DRAWN_PER_PACK, // Always 6 cards drawn
      distinctCards: distinctCards[packType] || 3, // Distinct cards available
      color: colors[packType] || '#ffffff',
      ev: this.calculateExpectedValue(packType),
      houseEdge: this.getHouseEdge(packType),
    }
  }

  /**
   * Generate cards from blockchain result indices
   * Used when processing blockchain results
   */
  static generateCardsFromBlockchainResult(
    resultSides: any[],
    selectedPack: number,
    parameters: CardsParameters,
    betAmount: number
  ): CardDraw[] {
    const drawCount = cardDrawCountToOpenAPack

    // Validate pack selection
    if (!isValidCardsSide(selectedPack)) {
      throw new Error(`[Cards] Invalid pack selection: ${selectedPack}`)
    }

    // Normalize result sides (treat as slot indices). If fewer than drawCount
    // are provided, repeat the sequence to fill the required length.
    const provided = Array.isArray(resultSides) ? resultSides.map(Number) : []
    if (provided.length === 0) {
      throw new Error('[Cards] No blockchain result received')
    }
    const slotIndices: number[] = []
    for (let i = 0; i < drawCount; i++) {
      slotIndices.push(provided[i % provided.length])
    }

    // Get catalog for this pack and sort by indexInsidePack to map indices
    const catalog = parameters.cardsCatalog || []
    const packCards = catalog.filter(c => c.packId === selectedPack)
    packCards.sort((a: any, b: any) => (a.indexInsidePack || 0) - (b.indexInsidePack || 0))
    const distinctCount = Math.max(packCards.length, 1)

    // Use k values for multipliers
    const { k } = packIndexToPackQKForACardDraw[selectedPack]

    const cards: CardDraw[] = []
    for (let i = 0; i < drawCount; i++) {
      const rawIdx = Number(slotIndices[i])
      const normalizedSlotIndex = ((rawIdx % distinctCount) + distinctCount) % distinctCount

      // Find card by slot index; fallback to index in bounds
      const card = packCards.find((c: any) => c.indexInsidePack === normalizedSlotIndex)
      const fallbackCard = packCards[normalizedSlotIndex]
      const cardId = (card || fallbackCard)?.id ?? 1

      // Multiplier and value via centralized helpers
      const kIndex = Math.min(normalizedSlotIndex, Math.max(k.length - 1, 0))
      const multiplier = Number(formatEther(k[kIndex]))
      const value = this.calculateCardValue(normalizedSlotIndex, selectedPack, betAmount)

      cards.push({
        catalogId: cardId,
        slotIndex: normalizedSlotIndex,
        multiplier,
        value,
      })
    }

    return cards
  }

  /**
   * Validate entry
   */
  static validateEntry(
    packType: number | null,
    entryAmount: number
  ): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    if (packType === null || packType === undefined) {
      errors.side = 'Please select a pack'
    } else if (!isValidCardsSide(packType)) {
      errors.side = 'Invalid pack selection'
    }

    if (entryAmount < 0) {
      errors.entryAmount = 'Entry amount cannot be negative'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }
}
