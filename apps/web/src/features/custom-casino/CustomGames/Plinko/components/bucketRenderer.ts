// @ts-nocheck
import { type PlinkoParameters } from '../types'
import { PlinkoProbabilitiesAndMultipliers } from '@/features/custom-casino/lib/crypto/plinko'
import { parseGradient } from '../../shared/utils/gradientUtils'

/**
 * Animation state for individual bucket bounce effects
 */
export interface BucketAnimationState {
  bucketIndex: number
  startTime: number
  duration: number
  maxOffset: number
  isActive: boolean
}

/**
 * Global bucket animation manager
 */
export class BucketAnimationManager {
  private animations: Map<number, BucketAnimationState> = new Map()
  private animationFrameId?: number

  /**
   * Starts a bounce animation for the specified bucket
   */
  startBucketAnimation(bucketIndex: number, intensity = 1.0): void {
    const animation: BucketAnimationState = {
      bucketIndex,
      startTime: performance.now(),
      duration: 400, // 400ms animation duration
      maxOffset: 2 * intensity, // Maximum bounce offset in pixels (subtle 4px)
      isActive: true,
    }

    this.animations.set(bucketIndex, animation)
  }

  /**
   * Gets the current vertical offset for a bucket's animation
   */
  getBucketOffset(bucketIndex: number): number {
    const animation = this.animations.get(bucketIndex)
    if (!animation || !animation.isActive) {
      return 0
    }

    const elapsed = performance.now() - animation.startTime
    const progress = Math.min(elapsed / animation.duration, 1)

    if (progress >= 1) {
      // Animation complete
      this.animations.delete(bucketIndex)
      return 0
    }

    // Spring-damped oscillation formula
    // Creates a bounce effect that goes down first, then springs back up
    const dampingFactor = 0.7
    const frequency = 3.5
    const springValue =
      Math.exp(-dampingFactor * progress) * Math.cos(frequency * Math.PI * progress)

    // Invert and scale to create downward initial bounce
    return -springValue * animation.maxOffset * (1 - progress * 0.3)
  }

  /**
   * Checks if any buckets are currently animating
   */
  hasActiveAnimations(): boolean {
    return this.animations.size > 0
  }

  /**
   * Clears all animations
   */
  clearAll(): void {
    this.animations.clear()
  }
}

// Global instance for bucket animations
export const bucketAnimationManager = new BucketAnimationManager()

/**
 * Convenience function to trigger a bucket animation
 * Useful for testing or manual triggering
 */
export function triggerBucketAnimation(bucketIndex: number, intensity = 1.0): void {
  bucketAnimationManager.startBucketAnimation(bucketIndex, intensity)
}

/**
 * Helper that returns a fillStyle (string | CanvasGradient | CanvasPattern)
 * based on bucketColor parameter. Handles:
 *   • solid color string  (#rrggbb or rgb())
 *   • linear-gradient(…)
 *   • ImageData object  { url }
 *
 * Results are memoised inside the provided cache Map so expensive pattern/gradient
 * creation only occurs once per unique key.
 */
export function resolveBucketFill(
  ctx: CanvasRenderingContext2D,
  params: PlinkoParameters,
  bucketIndex: number,
  bucketBounds: { x: number; y: number; width: number; height: number },
  cache: Map<string, CanvasGradient | CanvasPattern | string>
): string | CanvasGradient | CanvasPattern {
  // If a custom bucketColor is provided, use it otherwise fall back to multiplier based palette
  const custom = params.bucketColor as any

  // Include bucket bounds in cache key for gradients since each bucket needs its own gradient
  const bucketKey = `${bucketBounds.x}-${bucketBounds.y}-${bucketBounds.width}-${bucketBounds.height}`
  const key =
    custom && typeof custom === 'object' && 'url' in custom ? `${custom.url}-${bucketKey}`
    : custom && typeof custom === 'string' && custom.includes('gradient') ? `${custom}-${bucketKey}`
    : custom || `auto-${bucketIndex}`

  if (cache.has(key)) return cache.get(key) as any

  let result: string | CanvasGradient | CanvasPattern = '#4B5563'

  // Handle none provided -> auto palette based on multiplier
  if (!custom) {
    try {
      const multiplierBigInt =
        PlinkoProbabilitiesAndMultipliers.getMultiplierForRiskLevelRowCountAndPosition(
          params.riskLevel,
          params.rowCount,
          bucketIndex
        )
      const multiplier = Number(multiplierBigInt) / 1e18 // Convert from wei to decimal

      if (multiplier >= 10)
        result = '#EF4444' // Red for high multipliers
      else if (multiplier >= 5)
        result = '#F59E0B' // Orange for medium-high multipliers
      else if (multiplier >= 2)
        result = '#10B981' // Green for good multipliers
      else if (multiplier >= 1)
        result = '#6B7280' // Gray for neutral multipliers
      else result = '#DC2626' // Dark red for loss multipliers
    } catch (error) {
      result = '#6B7280' // Default gray if multiplier lookup fails
    }
    cache.set(key, result)
    return result
  }

  // Custom provided
  if (typeof custom === 'string') {
    if (custom.includes('gradient')) {
      const gradient = parseGradient(custom, ctx, bucketBounds)
      if (gradient) {
        cache.set(key, gradient)
        return gradient
      }
    }
    // Solid color string
    cache.set(key, custom)
    return custom
  }

  // ImageData object
  if (custom && typeof custom === 'object' && 'url' in custom) {
    const img = new Image()
    img.src = (custom as any).url as string
    // Initially return solid until image loads
    result = '#4B5563'
    img.onload = () => {
      const pattern = ctx.createPattern(img, 'repeat')
      if (pattern) {
        cache.set(key, pattern)
      }
    }
    cache.set(key, result)
    return result
  }

  cache.set(key, result)
  return result
}
