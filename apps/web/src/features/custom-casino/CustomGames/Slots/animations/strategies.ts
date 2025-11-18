// @ts-nocheck
/**
 * Animation strategies for multi-reel slots
 * Defines how reels should animate based on game results
 */

export type AnimationType = 'steady' | 'basic' | 'turbo' | 'tease'
export type SpecialEffect = 'nearMiss' | 'cascade' | 'simultaneous' | 'alternating' | 'buildUp'
export type DirectionMode = 'forward' | 'backward' | 'random' | 'alternating'
export type ReelOrder =
  | 'sequential'
  | 'reverse'
  | 'random'
  | 'center-out'
  | 'edges-in'
  | 'alternating'

/**
 * Strategy for animating multiple reels
 */
export interface AnimationStrategy {
  name: string
  description: string
  reelAnimations: AnimationType[] // Animation type for each reel
  stopDelays: number[] // Milliseconds before stopping each reel
  transitionDelays: number[] // When to transition from steady state
  specialEffect?: SpecialEffect
  directionMode?: DirectionMode // How to assign directions to reels
  reelOrder?: ReelOrder // Order in which reels stop
}

/**
 * Orchestrator command sent to individual reels
 */
export interface ReelCommand {
  reelIndex: number
  type: 'start' | 'transition' | 'stop' | 'reset'
  animation?: AnimationType
  targetPosition?: number
  delay?: number
}

/**
 * State of an individual reel
 */
export interface ReelState {
  index: number
  isSpinning: boolean
  currentAnimation: AnimationType
  targetPosition: number | null
  hasTransitioned: boolean
  hasStopped: boolean
}

/**
 * Result analysis for strategy selection
 */
export interface ResultAnalysis {
  isWin: boolean
  isJackpot: boolean
  isNearMiss: boolean
  winMultiplier: number
  matchingSymbols: number
  nearMissReels: number[] // Which reels are one symbol away
}

/**
 * Import probability configuration
 */
import {
  type AnimationContext,
  DEFAULT_ANIMATION_WEIGHTS,
  selectWeightedAnimation,
  createInitialContext,
} from './animationProbabilities'

/**
 * Helper to randomly choose between basic and turbo for standard games
 */
function getRandomStandardAnimation(): AnimationType {
  return Math.random() < 0.5 ? 'basic' : 'turbo'
}

/**
 * Predefined animation strategies
 */
export const ANIMATION_STRATEGIES = {
  // Standard spin - randomly mix basic and turbo per reel
  standard: {
    name: 'standard',
    description: 'Mixed standard spin animation',
    get reelAnimations() {
      // Each reel gets its own random animation type
      return [
        getRandomStandardAnimation(),
        getRandomStandardAnimation(),
        getRandomStandardAnimation(),
        getRandomStandardAnimation(),
        getRandomStandardAnimation(),
      ]
    },
    stopDelays: [1500, 2200, 3000, 3800, 4600],
    transitionDelays: [500, 500, 500, 500, 500],
  } as AnimationStrategy,

  // Basic standard - all basic animations, simple and clean
  basicStandard: {
    name: 'basicStandard',
    description: 'Simple basic animation for standard spins',
    reelAnimations: ['basic', 'basic', 'basic', 'basic', 'basic'],
    stopDelays: [1500, 2200, 3000, 3800, 4600],
    transitionDelays: [500, 500, 500, 500, 500],
  } as AnimationStrategy,

  // Turbo standard - all turbo animations, fast but not special
  turboStandard: {
    name: 'turboStandard',
    description: 'Fast turbo animation for standard spins',
    reelAnimations: ['turbo', 'turbo', 'turbo', 'turbo', 'turbo'],
    stopDelays: [1400, 2000, 2600, 3200, 3800],
    transitionDelays: [400, 400, 400, 400, 400],
  } as AnimationStrategy,

  // Near miss - tease on the last reel
  nearMiss: {
    name: 'nearMiss',
    description: 'Tease animation on last reel for near wins',
    reelAnimations: ['turbo', 'turbo', 'turbo', 'turbo', 'tease'],
    stopDelays: [1500, 2300, 3200, 4100, 5800], // Last reel takes much longer
    transitionDelays: [500, 600, 700, 800, 900],
    specialEffect: 'nearMiss',
  } as AnimationStrategy,

  // Big win - all turbo with simultaneous stop
  bigWin: {
    name: 'bigWin',
    description: 'Fast turbo animation for big wins',
    reelAnimations: ['turbo', 'turbo', 'turbo', 'turbo', 'turbo'],
    stopDelays: [2500, 2650, 2800, 2950, 3100], // Almost simultaneous but slightly delayed
    transitionDelays: [400, 400, 400, 400, 400],
    specialEffect: 'simultaneous',
  } as AnimationStrategy,

  // Jackpot - dramatic build up
  jackpot: {
    name: 'jackpot',
    description: 'Dramatic animation for jackpot wins',
    reelAnimations: ['basic', 'basic', 'turbo', 'turbo', 'tease'],
    stopDelays: [1800, 3000, 4300, 5700, 7500], // Increasing drama with longer delays
    transitionDelays: [500, 700, 900, 1100, 1300],
    specialEffect: 'buildUp',
  } as AnimationStrategy,

  // Cascade - reels stop in quick succession
  cascade: {
    name: 'cascade',
    description: 'Cascading stop effect',
    reelAnimations: ['turbo', 'turbo', 'turbo', 'turbo', 'turbo'],
    stopDelays: [1500, 1900, 2300, 2700, 3100], // Rapid succession with more spacing
    transitionDelays: [500, 500, 500, 500, 500],
    specialEffect: 'cascade',
  } as AnimationStrategy,

  // Loss - quick and simple, randomly basic or turbo (legacy)
  loss: {
    name: 'loss',
    description: 'Quick animation for losses',
    get reelAnimations() {
      const animType = getRandomStandardAnimation()
      return [animType, animType, animType, animType, animType]
    },
    stopDelays: [1200, 1700, 2200, 2700, 3200],
    transitionDelays: [400, 400, 400, 400, 400],
  } as AnimationStrategy,

  // Loss with flourish - dramatic loss animation with mixed speeds
  lossWithFlourish: {
    name: 'lossWithFlourish',
    description: 'Quick but dramatic animation for losses',
    reelAnimations: ['turbo', 'basic', 'turbo', 'basic', 'turbo'],
    stopDelays: [1100, 1500, 1900, 2300, 2700], // Quick stops with rhythm
    transitionDelays: [300, 350, 400, 450, 500],
    specialEffect: 'alternating',
  } as AnimationStrategy,
}

/**
 * Global animation context for tracking history
 * This should ideally be managed by the ReelOrchestrator
 */
let globalAnimationContext: AnimationContext | null = null

/**
 * Get or create animation context
 */
export function getAnimationContext(): AnimationContext {
  if (!globalAnimationContext) {
    globalAnimationContext = createInitialContext()
  }
  return globalAnimationContext
}

/**
 * Update animation context after a spin
 */
export function updateAnimationContext(strategyUsed: string, isWin: boolean): void {
  const context = getAnimationContext()
  globalAnimationContext = {
    consecutiveWins: isWin ? context.consecutiveWins + 1 : 0,
    consecutiveLosses: !isWin ? context.consecutiveLosses + 1 : 0,
    spinsSinceSpecial: !strategyUsed.includes('standard') ? 0 : context.spinsSinceSpecial + 1,
    lastAnimations: [strategyUsed, ...context.lastAnimations.slice(0, 9)],
    betMultiplier: context.betMultiplier,
  }
}

/**
 * Select animation strategy based on result analysis
 * Now uses weighted probability selection for more controlled excitement
 */
export function selectStrategy(
  analysis: ResultAnalysis,
  context?: AnimationContext,
  allowedStrategies?: string[]
): AnimationStrategy {
  // Use provided context or get global
  const animContext = context || getAnimationContext()

  // If constraints are provided, filter the available strategies
  let availableStrategies = Object.keys(ANIMATION_STRATEGIES)
  if (allowedStrategies && allowedStrategies.length > 0) {
    // Filter to only allowed strategies that actually exist
    availableStrategies = allowedStrategies.filter(strategy => strategy in ANIMATION_STRATEGIES)

    // If no valid strategies in the allowed list, fall back to all strategies
    if (availableStrategies.length === 0) {
      console.warn('[Orchestrator] No valid strategies in allowed list, using all strategies')
      availableStrategies = Object.keys(ANIMATION_STRATEGIES)
    }
  }

  // Select strategy name using probability system with constraints
  const strategyName = selectWeightedAnimation(
    DEFAULT_ANIMATION_WEIGHTS,
    analysis,
    animContext,
    availableStrategies
  )

  // Log the animation choice and outcome
  const outcomeDescription =
    analysis.isJackpot ? 'JACKPOT'
    : analysis.isWin ? `WIN (${analysis.winMultiplier.toFixed(1)}x)`
    : analysis.isNearMiss ? 'NEAR MISS'
    : 'LOSS'

  console.log(`[Slots] ${outcomeDescription} → Animation: ${strategyName}`)

  // Update context for next spin
  if (!context) {
    updateAnimationContext(strategyName, analysis.isWin)
  }

  // Return the strategy object
  const strategy = ANIMATION_STRATEGIES[strategyName as keyof typeof ANIMATION_STRATEGIES]

  // Fallback to basicStandard if strategy not found
  if (!strategy) {
    console.warn(`Strategy ${strategyName} not found, falling back to basicStandard`)
    return ANIMATION_STRATEGIES.basicStandard
  }

  return strategy
}

/**
 * Legacy function for backward compatibility
 * Selects strategy using simple rules (original logic)
 */
export function selectStrategyLegacy(analysis: ResultAnalysis): AnimationStrategy {
  if (analysis.isJackpot) {
    return ANIMATION_STRATEGIES.jackpot
  }

  if (analysis.isNearMiss) {
    return ANIMATION_STRATEGIES.nearMiss
  }

  if (analysis.isWin) {
    if (analysis.winMultiplier >= 10) {
      return ANIMATION_STRATEGIES.bigWin
    }
    if (analysis.winMultiplier >= 5) {
      return ANIMATION_STRATEGIES.cascade
    }
    return ANIMATION_STRATEGIES.standard
  }

  return ANIMATION_STRATEGIES.loss
}

/**
 * Generate directions for each reel based on mode
 */
export function generateReelDirections(
  reelCount: number,
  mode: DirectionMode = 'forward'
): Array<'forward' | 'backward'> {
  const directions: Array<'forward' | 'backward'> = []

  for (let i = 0; i < reelCount; i++) {
    switch (mode) {
      case 'forward':
        directions.push('forward')
        break
      case 'backward':
        directions.push('backward')
        break
      case 'random':
        directions.push(Math.random() < 0.5 ? 'forward' : 'backward')
        break
      case 'alternating':
        directions.push(i % 2 === 0 ? 'forward' : 'backward')
        break
    }
  }

  return directions
}

/**
 * Generate stop order indices based on pattern
 */
export function generateStopOrder(reelCount: number, pattern: ReelOrder = 'sequential'): number[] {
  const indices = Array.from({ length: reelCount }, (_, i) => i)

  switch (pattern) {
    case 'sequential':
      return indices // [0, 1, 2, 3, 4]

    case 'reverse':
      return indices.reverse() // [4, 3, 2, 1, 0]

    case 'random':
      // Fisher-Yates shuffle
      const shuffled = [...indices]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled

    case 'center-out':
      // Start from center, move outward
      // For 5 reels: [2, 1, 3, 0, 4]
      const centerOut: number[] = []
      const center = Math.floor(reelCount / 2)
      centerOut.push(center)
      for (let offset = 1; offset <= center; offset++) {
        if (center - offset >= 0) centerOut.push(center - offset)
        if (center + offset < reelCount) centerOut.push(center + offset)
      }
      return centerOut

    case 'edges-in':
      // Start from edges, move inward
      // For 5 reels: [0, 4, 1, 3, 2]
      const edgesIn: number[] = []
      let left = 0
      let right = reelCount - 1
      while (left <= right) {
        if (left === right) {
          edgesIn.push(left)
        } else {
          edgesIn.push(left)
          edgesIn.push(right)
        }
        left++
        right--
      }
      return edgesIn

    case 'alternating':
      // Alternate between first half and second half
      // For 5 reels: [0, 3, 1, 4, 2]
      const alternating: number[] = []
      const mid = Math.ceil(reelCount / 2)
      for (let i = 0; i < mid; i++) {
        alternating.push(i)
        if (i + mid < reelCount) {
          alternating.push(i + mid)
        }
      }
      return alternating

    default:
      return indices
  }
}

/**
 * Apply stop order to delays array
 */
export function applyStopOrder(delays: number[], order: number[]): number[] {
  const orderedDelays = new Array(delays.length)

  // Map original delays to new order
  order.forEach((reelIndex, orderPosition) => {
    if (reelIndex < delays.length && orderPosition < delays.length) {
      orderedDelays[reelIndex] = delays[orderPosition]
    }
  })

  return orderedDelays
}
