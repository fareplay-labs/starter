// @ts-nocheck
/**
 * Animation Probability Configuration
 *
 * Controls the likelihood of different animation strategies being selected
 * during slot spins. Designed to maintain excitement by making special
 * animations genuinely rare.
 */

import { type AnimationStrategy, type ResultAnalysis } from './strategies'

/**
 * Animation weight configuration
 * Weights are relative - they don't need to sum to 100
 */
export interface AnimationWeight {
  strategyName: string
  baseWeight: number
  description: string
  conditions?: {
    minWinMultiplier?: number
    maxWinMultiplier?: number
    requiresWin?: boolean
    requiresLoss?: boolean
    requiresNearMiss?: boolean
    requiresJackpot?: boolean
  }
}

/**
 * Animation selection context for smarter decisions
 */
export interface AnimationContext {
  consecutiveWins: number
  consecutiveLosses: number
  spinsSinceSpecial: number
  lastAnimations: string[]
  betMultiplier: number // Higher bets might warrant more excitement
}

/**
 * Default probability weights for animations
 * Total weights: 100 for easy percentage reading
 */
export const DEFAULT_ANIMATION_WEIGHTS: AnimationWeight[] = [
  {
    strategyName: 'basicStandard',
    baseWeight: 30,
    description: 'Simple basic animation for standard spins',
    // No conditions - can be used for any result
  },
  {
    strategyName: 'turboStandard',
    baseWeight: 30,
    description: 'Fast turbo animation for standard spins',
    // No conditions - can be used for any result
  },
  {
    strategyName: 'cascade',
    baseWeight: 12,
    description: 'Cascading effect for moderate wins',
    conditions: {
      requiresWin: true,
      minWinMultiplier: 3,
      maxWinMultiplier: 10,
    },
  },
  {
    strategyName: 'lossWithFlourish',
    baseWeight: 15,
    description: 'Quick but dramatic animation for losses',
    conditions: {
      requiresLoss: true,
    },
  },
  {
    strategyName: 'nearMiss',
    baseWeight: 8,
    description: 'Tease animation when almost winning',
    conditions: {
      requiresNearMiss: true,
    },
  },
  {
    strategyName: 'bigWin',
    baseWeight: 5,
    description: 'Exciting simultaneous stop for big wins',
    conditions: {
      requiresWin: true,
      minWinMultiplier: 10,
      maxWinMultiplier: 50,
    },
  },
  {
    strategyName: 'jackpot',
    baseWeight: 3,
    description: 'Ultra-rare dramatic buildup for massive wins',
    conditions: {
      requiresJackpot: true,
    },
  },
]

/**
 * Cooldown configuration for special animations
 */
export const ANIMATION_COOLDOWNS = {
  jackpot: 10, // Don't show another jackpot animation for 10 spins
  bigWin: 5, // 5 spin cooldown after big win
  nearMiss: 3, // 3 spin cooldown for near miss
  cascade: 2, // 2 spin cooldown for cascade
  default: 0, // No cooldown for standard animations
}

/**
 * Adjust weights based on context
 */
export function adjustWeightsForContext(
  weights: AnimationWeight[],
  context: AnimationContext
): AnimationWeight[] {
  return weights.map(weight => {
    let adjustedWeight = weight.baseWeight

    // Reduce special animation chances if we just showed one
    if (
      context.spinsSinceSpecial < 3 &&
      ['jackpot', 'bigWin', 'nearMiss', 'cascade'].includes(weight.strategyName)
    ) {
      adjustedWeight *= 0.5 // 50% reduction
    }

    // Slightly increase drama chance after many losses
    if (context.consecutiveLosses > 5 && weight.strategyName === 'lossWithFlourish') {
      adjustedWeight *= 1.5
    }

    // Increase special animation chance for high rollers
    if (context.betMultiplier > 10) {
      if (['bigWin', 'jackpot', 'cascade'].includes(weight.strategyName)) {
        adjustedWeight *= 1.2
      }
    }

    // Prevent same special animation twice in a row
    if (
      context.lastAnimations[0] === weight.strategyName &&
      !weight.strategyName.includes('standard')
    ) {
      adjustedWeight *= 0.1 // 90% reduction
    }

    return { ...weight, baseWeight: adjustedWeight }
  })
}

/**
 * Check if animation conditions are met
 */
export function meetsConditions(weight: AnimationWeight, analysis: ResultAnalysis): boolean {
  const conditions = weight.conditions
  if (!conditions) return true

  // Fixed: Check for loss condition properly
  if (conditions.requiresLoss === true && analysis.isWin) {
    return false
  }

  // Fixed: Check for win condition properly
  if (conditions.requiresWin === true && !analysis.isWin) {
    return false
  }

  if (conditions.requiresNearMiss && !analysis.isNearMiss) return false
  if (conditions.requiresJackpot && !analysis.isJackpot) return false

  if (conditions.minWinMultiplier !== undefined) {
    if (analysis.winMultiplier < conditions.minWinMultiplier) return false
  }

  if (conditions.maxWinMultiplier !== undefined) {
    if (analysis.winMultiplier > conditions.maxWinMultiplier) return false
  }

  return true
}

/**
 * Select animation using weighted random selection
 */
export function selectWeightedAnimation(
  weights: AnimationWeight[],
  analysis: ResultAnalysis,
  context?: AnimationContext,
  availableStrategies?: string[]
): string {
  // Helper function to check if a strategy is available
  const isStrategyAvailable = (strategy: string): boolean => {
    if (!availableStrategies || availableStrategies.length === 0) {
      return true // No constraints, all strategies available
    }
    return availableStrategies.includes(strategy)
  }

  // VALUE-BASED OVERRIDE: High value wins get special treatment
  if (analysis.isWin && analysis.winMultiplier > 0) {
    // For high-value wins, dramatically increase special animation chances
    const multiplierBoost = Math.min(analysis.winMultiplier / 10, 5) // Cap at 5x boost

    // 80x+ = Always jackpot animation (if available)
    if (analysis.winMultiplier >= 80 && isStrategyAvailable('jackpot')) {
      return 'jackpot'
    }

    // 30x-80x = 80% chance of bigWin, 20% cascade (if available)
    if (analysis.winMultiplier >= 30) {
      const canUseBigWin = isStrategyAvailable('bigWin')
      const canUseCascade = isStrategyAvailable('cascade')

      if (canUseBigWin && canUseCascade) {
        return Math.random() < 0.8 ? 'bigWin' : 'cascade'
      } else if (canUseBigWin) {
        return 'bigWin'
      } else if (canUseCascade) {
        return 'cascade'
      }
      // Fall through if neither available
    }

    // 10x-30x = 60% chance of bigWin, 30% cascade, 10% standard (if available)
    if (analysis.winMultiplier >= 10) {
      const roll = Math.random()
      if (roll < 0.6 && isStrategyAvailable('bigWin')) return 'bigWin'
      if (roll < 0.9 && isStrategyAvailable('cascade')) return 'cascade'
      // Fall through to normal selection for remaining cases
    }

    // 5x-10x = 70% chance of cascade (if available)
    if (analysis.winMultiplier >= 5) {
      if (Math.random() < 0.7 && isStrategyAvailable('cascade')) return 'cascade'
      // Fall through to normal selection for remaining 30%
    }
  }

  // NEAR MISS OVERRIDE: High-value near misses get special treatment
  if (analysis.isNearMiss && !analysis.isWin) {
    // Check if it's a high-value near miss (would have been big win)
    // This is a simplified check - in reality you'd check the actual symbol values
    if (analysis.matchingSymbols === 4) {
      // 70% chance of nearMiss animation for 4-symbol near misses (if available)
      if (Math.random() < 0.7 && isStrategyAvailable('nearMiss')) return 'nearMiss'
    }
  }

  // Filter weights by conditions AND availability
  const eligibleWeights = weights.filter(
    w => meetsConditions(w, analysis) && isStrategyAvailable(w.strategyName)
  )

  if (eligibleWeights.length === 0) {
    // Try to find any available fallback strategy
    const fallbackStrategies = ['basicStandard', 'standard', 'turboStandard']
    for (const fallback of fallbackStrategies) {
      if (isStrategyAvailable(fallback)) {
        console.warn(`[Weight Selection] No eligible weights, falling back to ${fallback}`)
        return fallback
      }
    }

    // Last resort: return first available strategy
    if (availableStrategies && availableStrategies.length > 0) {
      console.warn(`[Weight Selection] Using first available strategy: ${availableStrategies[0]}`)
      return availableStrategies[0]
    }

    // Ultimate fallback
    console.warn('[Weight Selection] No strategies available, using basicStandard')
    return 'basicStandard'
  }

  // Apply context adjustments if provided
  const adjustedWeights =
    context ? adjustWeightsForContext(eligibleWeights, context) : eligibleWeights

  // Calculate total weight
  const totalWeight = adjustedWeights.reduce((sum, w) => sum + w.baseWeight, 0)

  // Generate random number
  let random = Math.random() * totalWeight

  // Select based on cumulative weights
  for (const weight of adjustedWeights) {
    random -= weight.baseWeight
    if (random <= 0) {
      return weight.strategyName
    }
  }

  // Fallback (should never reach here)
  return adjustedWeights[0].strategyName
}

/**
 * Get cooldown duration for a strategy
 */
export function getCooldownDuration(strategyName: string): number {
  return (
    ANIMATION_COOLDOWNS[strategyName as keyof typeof ANIMATION_COOLDOWNS] ||
    ANIMATION_COOLDOWNS.default
  )
}

/**
 * Create initial animation context
 */
export function createInitialContext(): AnimationContext {
  return {
    consecutiveWins: 0,
    consecutiveLosses: 0,
    spinsSinceSpecial: 0,
    lastAnimations: [],
    betMultiplier: 1,
  }
}

/**
 * Update context after spin
 */
export function updateContext(
  context: AnimationContext,
  strategyUsed: string,
  isWin: boolean
): AnimationContext {
  const isSpecial = !strategyUsed.includes('standard')

  return {
    consecutiveWins: isWin ? context.consecutiveWins + 1 : 0,
    consecutiveLosses: !isWin ? context.consecutiveLosses + 1 : 0,
    spinsSinceSpecial: isSpecial ? 0 : context.spinsSinceSpecial + 1,
    lastAnimations: [strategyUsed, ...context.lastAnimations.slice(0, 9)], // Keep last 10
    betMultiplier: context.betMultiplier, // Preserved from previous
  }
}
