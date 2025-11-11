// @ts-nocheck
import { type CryptoLaunchParameters, type CryptoLaunchResult } from '../types'
import { generateMultiPeriodSeries } from '@/components/CustomUserCasinos/CustomGames/CryptoLaunch/Legacy/PriceDataGeneration/multi-period-orchestrator'
import { DEFAULT_CURVE_PARAMS } from '@/components/CustomUserCasinos/CustomGames/CryptoLaunch/Legacy/GameConfig'
import { validateCryptoLaunchParameters as zodValidateCryptoLaunchParameters } from '../config/schema'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface ValidationResultWithSafeParams extends ValidationResult {
  safeParams?: {
    sellDuration: number
    safeMinSellPrice: number
  }
}

/**
 * Comprehensive validation of CryptoLaunch parameters
 * Combines schema validation with business logic
 */
export function validateCryptoLaunchParameters(parameters: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // First run Zod schema validation
  const zodResult = zodValidateCryptoLaunchParameters(parameters)
  if (!zodResult.success) {
    zodResult.error.issues.forEach(issue => {
      errors.push(`${issue.path.join('.')}: ${issue.message}`)
    })
    return { isValid: false, errors, warnings }
  }

  // TypeScript now knows zodResult.success is true
  const params = (zodResult as { success: true; data: any }).data

  // Additional business logic validation
  if (params.minSellPrice <= params.startPrice) {
    warnings.push(
      'Min sell price should typically be higher than start price for meaningful gameplay'
    )
  }

  if (params.minSellPrice > params.startPrice * 10) {
    warnings.push(
      'Min sell price is very high compared to start price - this may make winning extremely difficult'
    )
  }

  const sellWindow = params.endDay - params.startDay
  if (sellWindow > 200) {
    warnings.push('Very long sell window may make gameplay less engaging')
  }

  if (params.betAmount > 100) {
    warnings.push('High bet amounts may pose risk management concerns')
  }

  return { isValid: true, errors: [], warnings }
}

/**
 * Validates gameplay-specific parameters at runtime
 */
export function validateGameplayParameters(parameters: CryptoLaunchParameters): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (parameters.startDay >= parameters.endDay) {
    errors.push('Start day must be before end day')
  }

  if (parameters.endDay - parameters.startDay < 30) {
    errors.push('Sell window must be at least 30 days')
  }

  if (parameters.startPrice <= 0) {
    errors.push('Start price must be positive')
  }

  if (parameters.minSellPrice <= 0) {
    errors.push('Min sell price must be positive')
  }

  if (parameters.betAmount <= 0) {
    errors.push('Bet amount must be positive')
  }

  // Performance warnings
  if (parameters.endDay > 300) {
    warnings.push('Late end days may impact chart performance')
  }

  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * Validates visual/UI parameters
 */
export function validateVisualParameters(parameters: CryptoLaunchParameters): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate hex colors
  const hexColorRegex = /^#[0-9A-F]{6}$/i

  if (!hexColorRegex.test(parameters.chartColor || '')) {
    errors.push('Chart color must be a valid hex color')
  }

  if (!hexColorRegex.test(parameters.backgroundColor || '')) {
    errors.push('Background color must be a valid hex color')
  }

  if (!hexColorRegex.test(parameters.gridColor || '')) {
    errors.push('Grid color must be a valid hex color')
  }

  if (!hexColorRegex.test(parameters.textColor || '')) {
    errors.push('Text color must be a valid hex color')
  }

  // Validate opacity
  if (typeof parameters.highlightOpacity === 'number') {
    if (parameters.highlightOpacity < 0 || parameters.highlightOpacity > 1) {
      errors.push('Highlight opacity must be between 0 and 1')
    }
  }

  // Validate particle intensity
  if (typeof parameters.particleIntensity === 'number') {
    if (parameters.particleIntensity < 1 || parameters.particleIntensity > 10) {
      errors.push('Particle intensity must be between 1 and 10')
    }
  }

  // Validate animation duration
  if (typeof parameters.animationDuration === 'number') {
    if (parameters.animationDuration < 1000 || parameters.animationDuration > 60000) {
      errors.push('Animation duration must be between 1000ms and 60000ms')
    }
  }

  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * Validates price data generation parameters (legacy function, kept for compatibility)
 */
export function validatePriceDataParams(
  parameters: CryptoLaunchParameters
): ValidationResultWithSafeParams {
  const errors: string[] = []

  if (parameters.startPrice <= 0) {
    errors.push('Start price must be greater than 0')
  }

  if (parameters.minSellPrice <= 0) {
    errors.push('Min sell price must be greater than 0')
  }

  if (parameters.endDay <= parameters.startDay) {
    errors.push('End day must be greater than start day')
  }

  if (parameters.startDay < 0) {
    errors.push('Start day must be non-negative')
  }

  // Calculate safe parameters
  const sellDuration = Math.max(60, parameters.endDay - parameters.startDay)
  const safeMinSellPrice = Math.max(
    0.01,
    Math.min(parameters.minSellPrice, parameters.startPrice * 5)
  )

  return {
    isValid: errors.length === 0,
    errors,
    safeParams: {
      sellDuration,
      safeMinSellPrice,
    },
  }
}

/**
 * Scales raw price data to start at the specified start price
 */
export function scalePriceData(rawPrices: number[], targetStartPrice: number): number[] {
  if (!rawPrices || rawPrices.length === 0) {
    return []
  }

  const firstPrice = rawPrices[0]
  if (firstPrice === 0) {
    return Array(rawPrices.length).fill(targetStartPrice)
  }

  return rawPrices.map(price => (price / firstPrice) * targetStartPrice)
}

/**
 * Generates fallback price data for error cases
 */
export function generateFallbackPriceData(parameters: CryptoLaunchParameters): number[] {
  console.warn('Using fallback price data generation')
  return Array(365).fill(parameters.startPrice)
}

/**
 * Generates price data for CryptoLaunch game with error handling and retry logic
 * Equivalent to generateDiceRoll for Dice game
 */
export function generatePriceData(parameters: CryptoLaunchParameters, maxRetries = 3): number[] {
  const validation = validatePriceDataParams(parameters)

  if (!validation.isValid) {
    console.warn('Invalid parameters for price generation:', validation.errors)
    return generateFallbackPriceData(parameters)
  }

  if (!validation.safeParams) {
    console.warn('No safe parameters available, using fallback')
    return generateFallbackPriceData(parameters)
  }

  const { sellDuration, safeMinSellPrice } = validation.safeParams

  // Compute totalArea similar to original game logic
  const INVESTMENT_AMOUNT = 500
  const returnMultiplier = safeMinSellPrice / parameters.startPrice
  const totalArea = INVESTMENT_AMOUNT * returnMultiplier

  const curveParams = {
    ...DEFAULT_CURVE_PARAMS,
    totalArea,
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const generationResult = generateMultiPeriodSeries({
        curveParams,
        tradingParams: {
          startDay: parameters.startDay,
          sellDuration: sellDuration,
          startPrice: parameters.startPrice,
          minSellPrice: safeMinSellPrice,
        },
      })

      if (!generationResult.combinedPrices || generationResult.combinedPrices.length === 0) {
        throw new Error('Generated empty price data')
      }

      return scalePriceData(generationResult.combinedPrices, parameters.startPrice)
    } catch (error) {
      console.error(`Price generation attempt ${attempt + 1} failed:`, error)

      if (attempt === maxRetries) {
        console.error('All price generation attempts failed, using fallback')
        return generateFallbackPriceData(parameters)
      }
    }
  }

  return generateFallbackPriceData(parameters)
}

/**
 * Calculates payout for a winning CryptoLaunch game
 */
export function calculatePayout(isWin: boolean, betAmount: number, profitLoss: number): number {
  return isWin ? betAmount + profitLoss : 0
}

/**
 * Determines if the player wins based on current conditions
 */
export function determineWinCondition(
  currentPrice: number,
  day: number,
  parameters: CryptoLaunchParameters
): boolean {
  const isInSellWindow = day >= parameters.startDay && day <= parameters.endDay
  const isAboveMinSell = currentPrice >= parameters.minSellPrice
  return isInSellWindow && isAboveMinSell
}

/**
 * Calculates multiplier and profit/loss for CryptoLaunch
 */
export function calculateMultiplier(
  startPrice: number,
  sellPrice: number,
  betAmount: number
): {
  multiplier: number
  profitLoss: number
  payout: number
} {
  const multiplier = sellPrice / startPrice
  const profitLoss = (sellPrice - startPrice) * betAmount
  const payout = betAmount + profitLoss

  return { multiplier, profitLoss, payout }
}

/**
 * Creates a standardized CryptoLaunch result following Dice's createDiceResult pattern
 */
export function createCryptoLaunchResult(
  parameters: CryptoLaunchParameters,
  currentDay: number,
  currentPrice: number,
  maxPrice: number,
  isWin: boolean
): CryptoLaunchResult {
  const multiplier = currentPrice / parameters.startPrice
  const profitLoss = parameters.betAmount * (multiplier - 1)
  // Always calculate full payout for display purposes, win/loss logic handled elsewhere
  const payout = parameters.betAmount + profitLoss

  return {
    timestamp: Date.now(),
    entryAmount: parameters.betAmount,
    numberOfEntries: 1,
    payout,
    isWin,
    finalPrice: currentPrice,
    maxPrice,
    sellPrice: currentPrice,
    soldOnDay: currentDay,
    profitLoss,
    multiplier,
  }
}

/**
 * Determines the outcome of a CryptoLaunch game
 */
export function determineCryptoOutcome(
  currentPrice: number,
  day: number,
  parameters: CryptoLaunchParameters
): {
  isWin: boolean
  isInSellWindow: boolean
  isAboveMinSell: boolean
  shouldSell: boolean
} {
  const isInSellWindow = day >= parameters.startDay && day <= parameters.endDay
  const isAboveMinSell = currentPrice >= parameters.minSellPrice
  const shouldSell = isInSellWindow && isAboveMinSell
  const isWin = shouldSell

  return { isWin, isInSellWindow, isAboveMinSell, shouldSell }
}

/**
 * Validates CryptoLaunch game result
 */
export function validateCryptoRoll(
  result: CryptoLaunchResult,
  parameters: CryptoLaunchParameters
): boolean {
  // Basic validation checks
  if (!result) return false
  if (result.entryAmount !== parameters.betAmount) return false
  if (result.numberOfEntries !== 1) return false
  if (typeof result.isWin !== 'boolean') return false
  if (typeof result.finalPrice !== 'number' || result.finalPrice < 0) return false
  if (typeof result.sellPrice !== 'number' || result.sellPrice < 0) return false
  if (typeof result.maxPrice !== 'number' || result.maxPrice < 0) return false
  if (typeof result.soldOnDay !== 'number' || result.soldOnDay < 0) return false
  if (typeof result.multiplier !== 'number' || result.multiplier < 0) return false

  // Validate payout calculation
  const expectedMultiplier = result.sellPrice / parameters.startPrice
  const expectedProfitLoss = (result.sellPrice - parameters.startPrice) * parameters.betAmount
  const expectedPayout = result.isWin ? parameters.betAmount + expectedProfitLoss : 0

  if (Math.abs(result.multiplier - expectedMultiplier) > 0.001) return false
  if (Math.abs(result.profitLoss - expectedProfitLoss) > 0.001) return false
  if (Math.abs(result.payout - expectedPayout) > 0.001) return false

  return true
}
