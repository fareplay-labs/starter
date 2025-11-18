// @ts-nocheck
/**
 * ReelOrchestrator - Centralized controller for multi-reel animations
 * Manages timing, transitions, and coordination between multiple slot reels
 */

import {
  type AnimationStrategy,
  type ReelCommand,
  type ReelState,
  type ResultAnalysis,
  type AnimationType,
  ANIMATION_STRATEGIES,
  selectStrategy,
  selectStrategyLegacy,
} from './strategies'
import {
  type AnimationContext,
  createInitialContext,
  updateContext,
} from './animationProbabilities'
import {
  type TimingConfig,
  DEFAULT_TIMING,
  DRAMATIC_TIMING,
  calculateNearMissTimings,
  calculateCascadeTimings,
  calculateSimultaneousTimings,
} from './timing'

export interface OrchestratorConfig {
  reelCount: number
  timing?: TimingConfig
  onReelCommand?: (command: ReelCommand) => void
  onStateChange?: (states: ReelState[]) => void
}

export interface OrchestratorState {
  isActive: boolean
  currentStrategy: AnimationStrategy | null
  reelStates: ReelState[]
  pendingCommands: ReelCommand[]
  startTime: number | null
  animationContext: AnimationContext
}

export class ReelOrchestrator {
  private config: OrchestratorConfig
  private state: OrchestratorState
  private commandTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: OrchestratorConfig) {
    this.config = {
      timing: DEFAULT_TIMING,
      ...config,
    }

    // Initialize reel states
    const reelStates: ReelState[] = []
    for (let i = 0; i < config.reelCount; i++) {
      reelStates.push({
        index: i,
        isSpinning: false,
        currentAnimation: 'steady',
        targetPosition: null,
        hasTransitioned: false,
        hasStopped: false,
      })
    }

    this.state = {
      isActive: false,
      currentStrategy: null,
      reelStates,
      pendingCommands: [],
      startTime: null,
      animationContext: createInitialContext(),
    }
  }

  /**
   * Start all reels with steady state animation
   */
  startSpin(): void {
    this.clearAllTimers()
    this.state.isActive = true
    this.state.startTime = Date.now()

    // Reset all reel states
    this.state.reelStates.forEach(reel => {
      reel.isSpinning = true
      reel.currentAnimation = 'steady'
      reel.targetPosition = null
      reel.hasTransitioned = false
      reel.hasStopped = false
    })

    // Send start commands to all reels
    for (let i = 0; i < this.config.reelCount; i++) {
      this.sendCommand({
        reelIndex: i,
        type: 'start',
        animation: 'steady',
      })
    }

    this.notifyStateChange()
  }

  /**
   * Process result and orchestrate reel animations
   */
  processResult(
    positions: number[],
    analysis: ResultAnalysis,
    options?: {
      animationType?: AnimationType
      stopOrder?: number[]
      forcedStrategy?: string
      // Constraint arrays - orchestrator chooses intelligently within these
      allowedStrategies?: string[]
      allowedDirections?: string[]
      allowedStopOrders?: string[]
    }
  ): void {
    if (!this.state.isActive) {
      console.warn('[Orchestrator] Not active, ignoring result')
      return
    }

    // Select strategy - use forced strategy if provided, otherwise based on analysis
    let strategy: AnimationStrategy

    if (
      options?.forcedStrategy &&
      options.forcedStrategy !== 'auto' &&
      options.forcedStrategy in ANIMATION_STRATEGIES
    ) {
      strategy = ANIMATION_STRATEGIES[options.forcedStrategy as keyof typeof ANIMATION_STRATEGIES]
      console.log(`[Orchestrator] Using forced strategy: ${options.forcedStrategy}`)
    } else {
      // Use the new probability-based selection with context and constraints
      strategy = selectStrategy(analysis, this.state.animationContext, options?.allowedStrategies)

      // Update context for next spin
      this.state.animationContext = updateContext(
        this.state.animationContext,
        strategy.name,
        analysis.isWin
      )
    }

    this.state.currentStrategy = strategy

    // Only log overrides if they're actually set
    if (options?.animationType) {
      console.log(`[Orchestrator] Override animation type: ${options.animationType}`)
    }
    if (options?.stopOrder && options.stopOrder.some((v, i) => v !== i)) {
      console.log(`[Orchestrator] Non-sequential stop order: ${options.stopOrder}`)
    }

    // Apply special timing adjustments
    let stopDelays = [...strategy.stopDelays]

    if (strategy.specialEffect === 'nearMiss' && analysis.nearMissReels.length > 0) {
      stopDelays = calculateNearMissTimings(
        this.config.reelCount,
        analysis.nearMissReels,
        this.config.timing
      )
    } else if (strategy.specialEffect === 'cascade') {
      stopDelays = calculateCascadeTimings(this.config.reelCount, this.config.timing)
    } else if (strategy.specialEffect === 'simultaneous') {
      stopDelays = calculateSimultaneousTimings(this.config.reelCount, this.config.timing)
    }

    // Apply stop order if provided
    if (options?.stopOrder) {
      // Reorder the stop delays based on the stop order
      const orderedDelays = new Array(stopDelays.length)
      options.stopOrder.forEach((reelIndex, orderPosition) => {
        if (reelIndex < stopDelays.length) {
          orderedDelays[reelIndex] = stopDelays[orderPosition]
        }
      })
      stopDelays = orderedDelays
      // Applied stop order
    }

    // Determine animation type for each reel
    const animationTypes =
      options?.animationType ?
        new Array(this.config.reelCount).fill(options.animationType)
      : strategy.reelAnimations

    // Animation types assigned per reel

    // Schedule transitions from steady to result animations
    strategy.transitionDelays.forEach((delay, index) => {
      this.scheduleTransition(index, animationTypes[index], delay)
    })

    // Schedule stops
    stopDelays.forEach((delay, index) => {
      this.scheduleStop(index, positions[index], delay)
    })
  }

  /**
   * Schedule a reel to transition to a new animation
   */
  private scheduleTransition(reelIndex: number, animation: AnimationType, delay: number): void {
    const timerId = `transition-${reelIndex}`

    // Clear any existing timer for this reel
    this.clearTimer(timerId)

    const timer = setTimeout(() => {
      // Transitioning reel to new animation

      this.state.reelStates[reelIndex].currentAnimation = animation
      this.state.reelStates[reelIndex].hasTransitioned = true

      this.sendCommand({
        reelIndex,
        type: 'transition',
        animation,
      })

      this.notifyStateChange()
      this.commandTimers.delete(timerId)
    }, delay)

    this.commandTimers.set(timerId, timer)
  }

  /**
   * Schedule a reel to stop at a position
   */
  private scheduleStop(reelIndex: number, position: number, delay: number): void {
    const timerId = `stop-${reelIndex}`

    // Clear any existing timer for this reel
    this.clearTimer(timerId)

    const timer = setTimeout(() => {
      // Stopping reel at target position

      this.state.reelStates[reelIndex].targetPosition = position
      this.state.reelStates[reelIndex].hasStopped = true

      this.sendCommand({
        reelIndex,
        type: 'stop',
        targetPosition: position,
      })

      this.notifyStateChange()
      this.commandTimers.delete(timerId)

      // Check if all reels have stopped
      if (this.state.reelStates.every(reel => reel.hasStopped)) {
        this.onAllReelsStopped()
      }
    }, delay)

    this.commandTimers.set(timerId, timer)
  }

  /**
   * Send command to reel
   */
  private sendCommand(command: ReelCommand): void {
    this.state.pendingCommands.push(command)

    if (this.config.onReelCommand) {
      this.config.onReelCommand(command)
    }
  }

  /**
   * Notify about state changes
   */
  private notifyStateChange(): void {
    if (this.config.onStateChange) {
      this.config.onStateChange([...this.state.reelStates])
    }
  }

  /**
   * Handle all reels stopped
   */
  private onAllReelsStopped(): void {
    // All reels have stopped
    this.state.isActive = false
    this.state.currentStrategy = null
    this.clearAllTimers()
  }

  /**
   * Force stop all reels immediately
   */
  forceStopAll(positions: number[]): void {
    // Force stopping all reels

    this.clearAllTimers()

    positions.forEach((position, index) => {
      this.state.reelStates[index].targetPosition = position
      this.state.reelStates[index].hasStopped = true

      this.sendCommand({
        reelIndex: index,
        type: 'stop',
        targetPosition: position,
      })
    })

    this.state.isActive = false
    this.notifyStateChange()
  }

  /**
   * Reset orchestrator state
   */
  reset(): void {
    // Resetting orchestrator state

    this.clearAllTimers()

    this.state.reelStates.forEach(reel => {
      reel.isSpinning = false
      reel.currentAnimation = 'steady'
      reel.targetPosition = null
      reel.hasTransitioned = false
      reel.hasStopped = false
    })

    this.state.isActive = false
    this.state.currentStrategy = null
    this.state.pendingCommands = []
    this.state.startTime = null

    // Send reset commands
    for (let i = 0; i < this.config.reelCount; i++) {
      this.sendCommand({
        reelIndex: i,
        type: 'reset',
      })
    }

    this.notifyStateChange()
  }

  /**
   * Clear a specific timer
   */
  private clearTimer(timerId: string): void {
    const timer = this.commandTimers.get(timerId)
    if (timer) {
      clearTimeout(timer)
      this.commandTimers.delete(timerId)
    }
  }

  /**
   * Clear all timers
   */
  private clearAllTimers(): void {
    this.commandTimers.forEach(timer => clearTimeout(timer))
    this.commandTimers.clear()
  }

  /**
   * Get current state
   */
  getState(): OrchestratorState {
    return { ...this.state }
  }

  /**
   * Get reel state by index
   */
  getReelState(index: number): ReelState | null {
    return this.state.reelStates[index] || null
  }

  /**
   * Set bet multiplier for context (affects animation selection)
   */
  setBetMultiplier(multiplier: number): void {
    this.state.animationContext.betMultiplier = multiplier
  }

  /**
   * Get current animation context
   */
  getAnimationContext(): AnimationContext {
    return { ...this.state.animationContext }
  }

  /**
   * Reset animation context
   */
  resetAnimationContext(): void {
    this.state.animationContext = createInitialContext()
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.clearAllTimers()
  }
}
