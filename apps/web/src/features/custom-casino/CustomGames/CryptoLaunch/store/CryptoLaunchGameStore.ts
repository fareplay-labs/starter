// @ts-nocheck
import { createGameStore } from '../../shared/gameStoreFactory'
import {
  type CryptoLaunchParameters,
  type CryptoLaunchResult,
  type CryptoLaunchEntry,
  type CryptoLaunchGameData,
  DEFAULT_CRYPTO_LAUNCH_PARAMETERS,
  DEFAULT_CRYPTO_LAUNCH_ENTRY,
} from '../types'
import { generatePriceData, validateGameplayParameters } from '../logic'

// Game state for CryptoLaunch
interface CryptoLaunchRuntimeState {
  // Game data
  gameData: CryptoLaunchGameData | null

  // Results
  hasWon: boolean
  finalResult: CryptoLaunchResult | null
  predeterminedResult: CryptoLaunchResult | null

  // Error handling
  lastError: string | null
  validationErrors: string[]
  isGeneratingData: boolean

  // Animation state (managed by UI components using hooks)
  currentDay: number
}

// Game actions for CryptoLaunch
interface CryptoLaunchActions {
  // Game control
  playCryptoLaunch: () => void
  resetGame: () => void
  showResult: (priceData: number[], payoutMultiplier?: number) => Promise<CryptoLaunchResult>  // For blockchain integration

  // Simulation methods (following Dice pattern)
  simulateWin: () => void
  simulateLoss: () => void
  simulateTargetPrice: (targetPrice: number) => void

  // Data generation
  generateGameData: () => void

  // Error handling
  clearErrors: () => void
  validateAndGenerateData: () => boolean
  validateEntry: () => { isValid: boolean; errors: Record<string, string> }
  resetGameSpecificState: (state: any) => void
}

export const useCryptoLaunchGameStore = createGameStore<
  CryptoLaunchParameters,
  CryptoLaunchResult,
  CryptoLaunchEntry,
  CryptoLaunchRuntimeState,
  CryptoLaunchActions
>(
  'cryptoLaunch_1',
  DEFAULT_CRYPTO_LAUNCH_PARAMETERS,

  // game-specific slice
  (set, get) => ({
    // Initial state
    gameData: null,
    hasWon: false,
    finalResult: null,
    predeterminedResult: null,
    lastError: null,
    validationErrors: [],
    isGeneratingData: false,
    currentDay: 0,

    // Actions
    playCryptoLaunch: async () => {
      const { clearErrors, validateAndGenerateData, showResult, resetGame } = get()

      // Reset game state first to clear any previous game data
      resetGame()

      // Small delay to ensure UI updates with cleared state
      await new Promise(resolve => setTimeout(resolve, 50))

      // Clear any previous errors and results
      clearErrors()

      // Clear previous predetermined result to force new generation
      set((state: any) => {
        state.predeterminedResult = null
      })

      // Validate parameters before playing
      if (!validateAndGenerateData()) {
        return // Validation failed, errors are set in state
      }

      // Get fresh state after data generation
      const freshState = get()
      const gameData = freshState.gameData

      if (gameData) {
        // Use showResult for consistent visual feedback
        await showResult(gameData.priceData)
      }
    },

    resetGame: () => {
      // Call the base reset which publishes gameFinished event
      get().reset()
      // Also reset CryptoLaunch-specific state
      set((state: any) => {
        state.gameData = null
        state.hasWon = false
        state.finalResult = null
        state.predeterminedResult = null
        state.currentDay = 0
        state.lastError = null
        state.validationErrors = []
        state.isGeneratingData = false
        // Don't call reset() as it would reset the entry values
      })
    },

    // Pure animation function for blockchain results
    async showResult(priceData: number[], payoutMultiplier?: number) {
      const { entry } = get()
      
      // Set up the game data and trigger animation
      set((state: any) => {
        state.submittedEntry = { ...entry }
        state.gameState = 'PLAYING'
        state.gameData = {
          priceData,
          startIndex: 0,
          endIndex: priceData.length - 1
        }
      })

      // Pre-calculate the expected result for consistency
      const maxPrice = Math.max(...priceData)
      
      // Find the first day price exceeds minSellPrice within the window
      let sellDay = -1
      let sellPrice = 0
      for (let i = entry.side.startDay; i <= entry.side.endDay && i < priceData.length; i++) {
        if (priceData[i] >= entry.side.minSellPrice) {
          sellDay = i
          sellPrice = priceData[i]
          break
        }
      }
      
      // If never exceeded, sell at end day
      if (sellDay === -1) {
        sellDay = Math.min(entry.side.endDay, priceData.length - 1)
        sellPrice = priceData[sellDay]
      }
      
      // Use the provided payout multiplier from blockchain, or calculate from price
      const actualMultiplier = payoutMultiplier ?? (sellPrice / entry.side.startPrice)
      const actualPayout = entry.entryAmount * actualMultiplier
      const isWin = actualMultiplier > 1
      const profitLoss = actualPayout - entry.entryAmount
      
      const result: CryptoLaunchResult = {
        timestamp: Date.now(),
        entryAmount: entry.entryAmount,
        numberOfEntries: entry.entryCount,
        payout: actualPayout,
        isWin,
        finalPrice: priceData[priceData.length - 1],
        maxPrice,
        sellPrice,
        soldOnDay: sellDay,
        profitLoss,
        multiplier: actualMultiplier,
      }
      
      // Store the predetermined result but don't change game state yet
      // The animation completion will handle the state transition
      set((state: any) => {
        state.predeterminedResult = result
      })
      
      // Return the result for consistency with other games
      return result
    },

    simulateWin: async () => {
      const { entry, showResult } = get()

      // Generate winning price data with a winning multiplier
      const winMultiplier = 1.5 + Math.random() * 2 // Random between 1.5x and 3.5x
      const mockWinData = generateMockWinData(entry.side)
      
      // Use showResult for consistent visual feedback with the multiplier
      await showResult(mockWinData.priceData, winMultiplier)
    },

    simulateLoss: async () => {
      const { entry, showResult } = get()

      // Generate losing price data with a losing multiplier
      const lossMultiplier = 0.1 + Math.random() * 0.4 // Random between 0.1x and 0.5x
      const mockLossData = generateMockLossData(entry.side)
      
      // Use showResult for consistent visual feedback with the multiplier
      await showResult(mockLossData.priceData, lossMultiplier)
    },

    simulateTargetPrice: async (targetPrice: number) => {
      const { entry, showResult } = get()

      // Calculate multiplier from target price
      const targetMultiplier = targetPrice / entry.side.minSellPrice
      const mockData = generateMockTargetData(entry.side, targetPrice)
      
      // Use showResult for consistent visual feedback with the multiplier
      await showResult(mockData.priceData, targetMultiplier)
    },

    generateGameData: () => {
      const { entry, parameters } = get()

      // Create a parameters object using entry values for gameplay params
      const priceGenParams = {
        ...parameters, // Keep visual parameters from config
        // Use entry values for gameplay parameters
        startPrice: entry.side.startPrice,
        minSellPrice: entry.side.minSellPrice,
        startDay: entry.side.startDay,
        endDay: entry.side.endDay,
        betAmount: entry.entryAmount, // Also use entry amount
      }

      const priceData = generatePriceData(priceGenParams)

      const gameData: CryptoLaunchGameData = {
        priceData,
        currentDay: 0,
        currentPrice: entry.side.startPrice,
        isInSellWindow: false,
        isAboveMinSell: false,
        hasWon: false,
      }

      set((state: any) => {
        state.gameData = gameData
        state.isGeneratingData = false
      })
    },

    clearErrors: () => {
      set((state: any) => {
        state.lastError = null
        state.validationErrors = []
      })
    },

    validateAndGenerateData: () => {
      const { entry, generateGameData, parameters } = get()

      const validationResult = validateGameplayParameters({
        ...parameters,
        startPrice: entry.side.startPrice,
        minSellPrice: entry.side.minSellPrice,
        startDay: entry.side.startDay,
        endDay: entry.side.endDay,
      })
      const errors = validationResult.errors

      if (errors.length > 0) {
        set((state: any) => {
          state.validationErrors = errors
          state.lastError = errors[0]
        })
        return false
      }

      set((state: any) => {
        state.isGeneratingData = true
      })

      generateGameData()
      return true
    },

    validateEntry: () => {
      const { entry, parameters } = get()
      const errors: Record<string, string> = {}

      if (entry.entryAmount < 0) {
        errors.entryAmount = 'Entry amount cannot be negative'
      }

      if (entry.entryCount < 1) {
        errors.entryCount = 'Entry count must be at least 1'
      }

      const validationResult = validateGameplayParameters({
        ...parameters,
        startPrice: entry.side.startPrice,
        minSellPrice: entry.side.minSellPrice,
        startDay: entry.side.startDay,
        endDay: entry.side.endDay,
      })

      if (validationResult.errors.length > 0) {
        errors.side = validationResult.errors[0]
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      }
    },

    resetGameSpecificState: (state: any) => {
      state.gameData = null
      state.hasWon = false
      state.finalResult = null
      state.predeterminedResult = null
      state.currentDay = 0
      state.lastError = null
      state.validationErrors = []
      state.isGeneratingData = false
    },
  }),

  DEFAULT_CRYPTO_LAUNCH_ENTRY
)

// Helper functions to generate mock data for simulations using legacy algorithm
import {
  generateMultiPeriodSeries,
  type GenerationParams,
} from '@/features/custom-casino/CustomGames/CryptoLaunch/logic/PriceDataGeneration/multi-period-orchestrator.js'

function generateMockWinData(side: CryptoLaunchEntry['side']): CryptoLaunchGameData {
  // Use a winning multiplier (e.g., 2x return)
  const winMultiplier = 1.5 + Math.random() * 2 // Random between 1.5x and 3.5x
  const priceData = generatePriceDataWithMultiplier(
    winMultiplier,
    side.startPrice,
    side.minSellPrice,
    side.startDay,
    side.endDay
  )

  return {
    priceData,
    currentDay: 0,
    currentPrice: side.startPrice,
    isInSellWindow: false,
    isAboveMinSell: false,
    hasWon: false,
  }
}

function generateMockLossData(side: CryptoLaunchEntry['side']): CryptoLaunchGameData {
  // Use a losing multiplier (e.g., 0.5x return)
  const lossMultiplier = 0.1 + Math.random() * 0.4 // Random between 0.1x and 0.5x
  const priceData = generatePriceDataWithMultiplier(
    lossMultiplier,
    side.startPrice,
    side.minSellPrice,
    side.startDay,
    side.endDay
  )

  return {
    priceData,
    currentDay: 0,
    currentPrice: side.startPrice,
    isInSellWindow: false,
    isAboveMinSell: false,
    hasWon: false,
  }
}

function generateMockTargetData(
  side: CryptoLaunchEntry['side'],
  targetPrice: number
): CryptoLaunchGameData {
  // Calculate multiplier from target price
  const targetMultiplier = targetPrice / side.minSellPrice
  const priceData = generatePriceDataWithMultiplier(
    targetMultiplier,
    side.startPrice,
    side.minSellPrice,
    side.startDay,
    side.endDay
  )

  return {
    priceData,
    currentDay: 0,
    currentPrice: side.startPrice,
    isInSellWindow: false,
    isAboveMinSell: false,
    hasWon: false,
  }
}

/**
 * Generate price data using the legacy algorithm with a specific multiplier
 */
function generatePriceDataWithMultiplier(
  multiplier: number,
  startPrice: number,
  minSellPrice: number,
  startDay: number,
  endDay: number
): number[] {
  // Calculate total area for the given multiplier
  const investmentAmount = 100 // Base investment for calculation
  const totalArea = investmentAmount * multiplier
  
  // Generate parameters matching the legacy pattern
  const params: GenerationParams = {
    curveParams: {
      totalDays: 365,
      curveCount: 8,
      minAlpha: 1.5,
      maxAlpha: 3,
      minBeta: 1.5,
      maxBeta: 4,
      noiseLevel: 12,
      totalArea: totalArea, // This controls the payout
    },
    tradingParams: {
      startDay: startDay,
      sellDuration: endDay - startDay,
      startPrice: startPrice,
      minSellPrice: minSellPrice,
    },
  }
  
  try {
    const result = generateMultiPeriodSeries(params)
    return result.combinedPrices || generateSimplePriceData(multiplier, startPrice, minSellPrice)
  } catch (error) {
    console.error('Failed to generate mock price data:', error)
    return generateSimplePriceData(multiplier, startPrice, minSellPrice)
  }
}

/**
 * Simple fallback price generation
 */
function generateSimplePriceData(
  multiplier: number,
  startPrice: number,
  minSellPrice: number
): number[] {
  const priceData = new Array(365).fill(0)
  const targetPrice = minSellPrice * (1 + multiplier)
  
  for (let i = 0; i < 365; i++) {
    const progress = i / 365
    const bubblePhase = Math.sin(progress * Math.PI)
    const basePrice = startPrice + (targetPrice - startPrice) * progress
    const price = basePrice + bubblePhase * (targetPrice - startPrice) * 0.5
    const noise = (Math.random() - 0.5) * price * 0.05
    priceData[i] = Math.max(0.01, price + noise)
  }
  
  return priceData
}
