// @ts-nocheck
import { type PlinkoParameters } from '../types'
import { parseRadialGradient, getFinalColorFromGradient } from '../../shared/utils/gradientUtils'

/**
 * Ball trail management for individual balls
 */
export class BallTrailManager {
  private trails: Map<number, { x: number; y: number }[]> = new Map()
  private lastPositions: Map<number, { x: number; y: number }> = new Map()
  private maxTrailLength = 12
  private minUpdateDistance = 2 // Minimum distance before updating trail

  /**
   * Updates the trail for a specific ball
   */
  updateTrail(ballId: number, position: { x: number; y: number }): void {
    // Only update if ball moved enough distance for better performance
    const lastPos = this.lastPositions.get(ballId)
    if (lastPos) {
      const distance = Math.sqrt(
        Math.pow(position.x - lastPos.x, 2) + Math.pow(position.y - lastPos.y, 2)
      )
      if (distance < this.minUpdateDistance) {
        return // Skip update if ball didn't move enough
      }
    }

    this.lastPositions.set(ballId, position)
    const currentTrail = this.trails.get(ballId) || []

    // Add position and limit trail length
    const updatedTrail = [position, ...currentTrail].slice(0, this.maxTrailLength)
    this.trails.set(ballId, updatedTrail)
  }

  /**
   * Gets the trail positions for a ball
   */
  getTrail(ballId: number): { x: number; y: number }[] {
    return this.trails.get(ballId) || []
  }

  /**
   * Clears the trail for a specific ball
   */
  clearTrail(ballId: number): void {
    this.trails.delete(ballId)
    this.lastPositions.delete(ballId)
  }

  /**
   * Clears all trails
   */
  clearAllTrails(): void {
    this.trails.clear()
    this.lastPositions.clear()
  }

  /**
   * Checks if a ball has a trail
   */
  hasTrail(ballId: number): boolean {
    return this.trails.has(ballId) && this.trails.get(ballId)!.length > 0
  }
}

/**
 * Ball fill creation supporting solid colors and radial gradients only
 */
export function createBallFill(
  ctx: CanvasRenderingContext2D,
  ballColor: string,
  position: { x: number; y: number },
  radius: number
): string | CanvasGradient {
  // Check if it's a radial gradient string (balls only support radial gradients)
  if (ballColor.includes('radial-gradient(')) {
    const bounds = {
      x: position.x - radius,
      y: position.y - radius,
      width: radius * 2,
      height: radius * 2,
    }

    const gradient = parseRadialGradient(ballColor, ctx, bounds)
    if (gradient) {
      return gradient
    }
  }

  // Return solid color
  return ballColor
}

/**
 * Resolves ball fill with caching support
 */
export function resolveBallFill(
  ctx: CanvasRenderingContext2D,
  ballColor: string,
  position: { x: number; y: number },
  radius: number,
  cache: Map<string, CanvasGradient | CanvasPattern | string>
): string | CanvasGradient {
  // For gradients, we need to create fresh ones since they're position-dependent
  if (ballColor.includes('radial-gradient(')) {
    return createBallFill(ctx, ballColor, position, radius)
  }

  // Cache solid colors
  const cacheKey = `solid-${ballColor}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)! as string
  }
  cache.set(cacheKey, ballColor)
  return ballColor
}

/**
 * Draws a ball trail with fading effect
 */
export function drawBallTrail(
  ctx: CanvasRenderingContext2D,
  trail: { x: number; y: number }[],
  ballColor: string,
  radius: number
): void {
  if (trail.length <= 1) return

  // Get base trail color once
  const trailColor =
    ballColor.includes('gradient(') ? getFinalColorFromGradient(ballColor) : ballColor

  // Skip the first position (current ball position)
  const trailPositions = trail.slice(1)

  // Batch draw all trail positions to reduce save/restore calls
  let lastAlpha = -1
  trailPositions.forEach((trailPos, index) => {
    const actualIndex = index + 1 // Adjust for skipped first position
    const alpha = Math.max(0.15, 1 - (actualIndex / trail.length) * 0.8)
    const trailRadius = radius * (1 - (actualIndex / trail.length) * 0.4)
    const currentAlpha = alpha * 0.7

    // Only save/restore if alpha changed
    if (currentAlpha !== lastAlpha) {
      if (lastAlpha !== -1) ctx.restore()
      ctx.save()
      ctx.globalAlpha = currentAlpha
      ctx.fillStyle = trailColor
      lastAlpha = currentAlpha
    }

    ctx.beginPath()
    ctx.arc(trailPos.x, trailPos.y, trailRadius, 0, Math.PI * 2)
    ctx.fill()
  })

  // Restore the context once at the end
  if (trailPositions.length > 0) {
    ctx.restore()
  }
}

/**
 * Main ball drawing function with trail support
 */
export function drawBall(
  ctx: CanvasRenderingContext2D,
  position: { x: number; y: number },
  params: PlinkoParameters,
  layout: { ballRadius: number },
  ballFillCache: Map<string, CanvasGradient | CanvasPattern | string>,
  trailManager: BallTrailManager,
  ballId?: number,
  scale = 1.0
): void {
  const baseRadius = layout.ballRadius
  const scaledRadius = baseRadius * scale

  // Draw ball trail if enabled (always use full-size radius for trails)
  if (params.ballTrail && ballId && trailManager.hasTrail(ballId)) {
    const trail = trailManager.getTrail(ballId)
    drawBallTrail(ctx, trail, params.ballColor, baseRadius)
  }

  // Draw main ball
  ctx.save()

  // Get ball fill (supports radial gradients and solid colors)
  const ballFill = resolveBallFill(ctx, params.ballColor, position, scaledRadius, ballFillCache)
  ctx.fillStyle = ballFill

  // Thinner outline (1px instead of 2px) or no outline
  if (params.ballColor !== 'transparent') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 1 * scale // Scale the line width too
  }

  ctx.beginPath()
  ctx.arc(position.x, position.y, scaledRadius, 0, Math.PI * 2)
  ctx.fill()

  // Only add stroke if not transparent
  if (params.ballColor !== 'transparent') {
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * Utility function to get cache key for ball fills
 */
export function getBallFillCacheKey(ballColor: string, radius: number): string {
  if (ballColor.includes('gradient(')) {
    // Don't cache gradients as they're position-dependent
    return `gradient-${Date.now()}-${Math.random()}`
  }
  return `solid-${ballColor}-${radius}`
}

/**
 * Clears ball fill cache when parameters change
 */
export function clearBallFillCache(
  cache: Map<string, CanvasGradient | CanvasPattern | string>
): void {
  cache.clear()
}
