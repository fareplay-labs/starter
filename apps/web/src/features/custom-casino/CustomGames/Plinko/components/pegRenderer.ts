// @ts-nocheck
import { type PlinkoParameters } from '../types'
import { parseGradient } from '../../shared/utils/gradientUtils'

/**
 * Interface for peg grid bounds
 */
export interface PegGridBounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Interface for individual peg
 */
export interface Peg {
  x: number
  y: number
  radius: number
}

/**
 * Calculates the bounding box of all pegs for gradient application
 */
export function calculatePegGridBounds(pegs: Peg[]): PegGridBounds {
  if (pegs.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  let minX = pegs[0].x
  let maxX = pegs[0].x
  let minY = pegs[0].y
  let maxY = pegs[0].y

  pegs.forEach(peg => {
    minX = Math.min(minX, peg.x - peg.radius)
    maxX = Math.max(maxX, peg.x + peg.radius)
    minY = Math.min(minY, peg.y - peg.radius)
    maxY = Math.max(maxY, peg.y + peg.radius)
  })

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

/**
 * Helper that returns a fillStyle (string | CanvasGradient | CanvasPattern)
 * based on pegColor parameter. Handles:
 *   • solid color string  (#rrggbb or rgb())
 *   • linear-gradient(…)
 *   • radial-gradient(…)
 *
 * Results are memoised inside the provided cache Map so expensive gradient
 * creation only occurs once per unique key.
 *
 * NOTE: For gradients, the gradient spans across all pegs as a single gradient,
 * not individual per-peg gradients.
 */
export function resolvePegFill(
  ctx: CanvasRenderingContext2D,
  params: PlinkoParameters,
  pegGridBounds: PegGridBounds,
  cache: Map<string, CanvasGradient | CanvasPattern | string>
): string | CanvasGradient | CanvasPattern {
  const pegColor = params.pegColor

  // Include peg grid bounds in cache key for gradients since each grid needs its own gradient
  const boundsKey = `${pegGridBounds.x}-${pegGridBounds.y}-${pegGridBounds.width}-${pegGridBounds.height}`
  const key = pegColor.includes('gradient') ? `${pegColor}-${boundsKey}` : pegColor

  if (cache.has(key)) {
    return cache.get(key) as string | CanvasGradient | CanvasPattern
  }

  let result: string | CanvasGradient | CanvasPattern = pegColor

  // Handle gradient strings
  if (pegColor.includes('gradient')) {
    const gradient = parseGradient(pegColor, ctx, pegGridBounds)
    if (gradient) {
      cache.set(key, gradient)
      return gradient
    } else {
      // Fallback to solid color if gradient parsing fails
      result = '#8B5CF6' // Default purple color
    }
  }

  // Solid color string or fallback
  cache.set(key, result)
  return result
}

/**
 * Draws all pegs using the resolved fill style
 * This applies a single gradient across all pegs rather than individual gradients per peg
 */
export function drawPegGrid(
  ctx: CanvasRenderingContext2D,
  pegs: Peg[],
  params: PlinkoParameters,
  cache: Map<string, CanvasGradient | CanvasPattern | string>
): void {
  if (pegs.length === 0) return

  // Calculate bounds for the entire peg grid
  const pegGridBounds = calculatePegGridBounds(pegs)

  // Resolve the fill style for all pegs
  const fillStyle = resolvePegFill(ctx, params, pegGridBounds, cache)

  // Apply the fill style and draw all pegs
  ctx.fillStyle = fillStyle as any

  pegs.forEach(peg => {
    ctx.beginPath()
    ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2)
    ctx.fill()
  })
}
