// @ts-nocheck
/**
 * Effects system for crash game visual effects
 * Extracted from CrashScene.tsx for better separation of concerns
 */

export interface FadeConfig {
  duration: number
  startOpacity: number
  endOpacity: number
}

export interface ScalingConfig {
  multiplierFactor: number
  targetFactor: number
  baseRange: number
  interpolationRate: number
  significantThreshold: number
}

export interface FadeCallbacks {
  onOpacityChange: (opacity: number) => void
  onFadeComplete: () => void
}

export interface ScalingCallbacks {
  onDisplayMaxChange: (displayMax: number) => void
  onRocketSizeChange?: (scaledSize: number) => void
}

const DEFAULT_FADE_CONFIG: FadeConfig = {
  duration: 1000, // 1 second
  startOpacity: 1,
  endOpacity: 0,
}

const DEFAULT_SCALING_CONFIG: ScalingConfig = {
  multiplierFactor: 1.3,
  targetFactor: 1.1,
  baseRange: 5,
  interpolationRate: 0.08,
  significantThreshold: 0.1,
}

/**
 * Start fade out animation
 */
export const startFadeOut = (
  callbacks: FadeCallbacks,
  config: Partial<FadeConfig> = {}
): (() => void) => {
  const finalConfig = { ...DEFAULT_FADE_CONFIG, ...config }
  const startTime = Date.now()
  let animationFrameId: number

  const fadeStep = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / finalConfig.duration, 1)
    const newOpacity =
      finalConfig.startOpacity + (finalConfig.endOpacity - finalConfig.startOpacity) * progress

    callbacks.onOpacityChange(newOpacity)

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(fadeStep)
    } else {
      callbacks.onFadeComplete()
    }
  }

  animationFrameId = requestAnimationFrame(fadeStep)

  // Return cleanup function
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}

/**
 * Calculate required display range based on current state
 */
export const calculateRequiredRange = (
  currentMultiplier: number,
  cashOutMultiplier: number | null,
  config: Partial<ScalingConfig> = {}
): number => {
  const finalConfig = { ...DEFAULT_SCALING_CONFIG, ...config }

  return Math.max(
    currentMultiplier * finalConfig.multiplierFactor,
    cashOutMultiplier ? cashOutMultiplier * finalConfig.targetFactor : 0,
    finalConfig.baseRange
  )
}

/**
 * Update display max with throttling to prevent excessive updates
 */
export const updateDisplayMaxThrottled = (
  currentDisplayMax: number,
  requiredRange: number,
  callbacks: ScalingCallbacks,
  config: Partial<ScalingConfig> = {}
): void => {
  const finalConfig = { ...DEFAULT_SCALING_CONFIG, ...config }

  const diff = Math.abs(requiredRange - currentDisplayMax)
  if (diff > finalConfig.significantThreshold) {
    const newDisplayMax =
      currentDisplayMax + (requiredRange - currentDisplayMax) * finalConfig.interpolationRate
    callbacks.onDisplayMaxChange(newDisplayMax)
  }
}

/**
 * Fade effect manager class
 */
export class FadeEffect {
  private cleanup: (() => void) | null = null
  private isActive = false

  constructor(private callbacks: FadeCallbacks) {}

  /**
   * Start fade effect
   */
  start(config: Partial<FadeConfig> = {}): void {
    if (this.isActive) return

    this.isActive = true
    this.cleanup = startFadeOut(
      {
        ...this.callbacks,
        onFadeComplete: () => {
          this.isActive = false
          this.callbacks.onFadeComplete()
        },
      },
      config
    )
  }

  /**
   * Stop fade effect
   */
  stop(): void {
    if (this.cleanup) {
      this.cleanup()
      this.cleanup = null
    }
    this.isActive = false
  }

  /**
   * Reset opacity to start value
   */
  reset(opacity = 1): void {
    this.stop()
    this.callbacks.onOpacityChange(opacity)
  }

  /**
   * Check if fade is active
   */
  isRunning(): boolean {
    return this.isActive
  }
}

/**
 * Dynamic scaling manager class
 */
export class DynamicScaling {
  private baseRocketSize = 1

  constructor(
    private callbacks: ScalingCallbacks,
    private config: Partial<ScalingConfig> = {}
  ) {}

  /**
   * Set the base rocket size for scaling calculations
   */
  setBaseRocketSize(size: number): void {
    this.baseRocketSize = size
  }

  /**
   * Update scaling based on current game state
   */
  update(
    currentDisplayMax: number,
    currentMultiplier: number,
    cashOutMultiplier: number | null
  ): void {
    const requiredRange = calculateRequiredRange(currentMultiplier, cashOutMultiplier, this.config)

    updateDisplayMaxThrottled(currentDisplayMax, requiredRange, this.callbacks, this.config)

    // Also update rocket size scaling if callback is provided
    if (this.callbacks.onRocketSizeChange) {
      const scaledRocketSize = calculateScaledRocketSize(
        this.baseRocketSize,
        currentDisplayMax,
        this.config.baseRange
      )
      this.callbacks.onRocketSizeChange(scaledRocketSize)
    }
  }

  /**
   * Reset scaling to initial range
   */
  reset(cashOutMultiplier: number | null): void {
    const initialRange = Math.max(
      this.config.baseRange || DEFAULT_SCALING_CONFIG.baseRange,
      cashOutMultiplier ?
        cashOutMultiplier * (this.config.targetFactor || DEFAULT_SCALING_CONFIG.targetFactor)
      : 0
    )
    this.callbacks.onDisplayMaxChange(initialRange)

    // Reset rocket size to base size if callback is provided
    if (this.callbacks.onRocketSizeChange) {
      this.callbacks.onRocketSizeChange(this.baseRocketSize)
    }
  }
}

/**
 * Calculate scaled rocket size based on current display range
 * As the view zooms out (displayMax increases), rocket should get smaller
 */
export const calculateScaledRocketSize = (
  baseRocketSize: number,
  currentDisplayMax: number,
  baseRange: number = DEFAULT_SCALING_CONFIG.baseRange
): number => {
  // Calculate base scale factor - inverse relationship with display max
  const baseScaleFactor = Math.max(0.3, baseRange / currentDisplayMax)

  // Apply damping to make scaling less aggressive (30% of the rate)
  // This interpolates between full size (1.0) and the calculated scale factor
  const dampingFactor = 0.3
  const scaleFactor = 1 + (baseScaleFactor - 1) * dampingFactor

  return baseRocketSize * scaleFactor
}
