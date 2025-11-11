// @ts-nocheck
/**
 * Grid and axes rendering utilities
 * Extracted from CrashScene.tsx for better separation of concerns
 */

import { type ViewportParams } from './CanvasRenderer'
import {
  calculateGridIntervals,
  getSmoothNormalizedMultiplier,
  calculateTimeIntervals,
} from '../utils'

export interface GridConfig {
  showGridlines: boolean
  showAxes: boolean
  gridColor: string
  axesColor: string
  height: number
}

/**
 * Draw gridlines on the canvas with adaptive intervals
 */
export const drawGridlines = (
  ctx: CanvasRenderingContext2D,
  viewportParams: ViewportParams,
  config: GridConfig
): void => {
  if (!config.showGridlines) return

  const { viewportWidth, viewportHeight, marginLeft, marginBottom, maxCurveMultiplier } =
    viewportParams

  ctx.strokeStyle = config.gridColor
  ctx.lineWidth = 0.5
  // ctx.setLineDash([2, 2])
  ctx.setLineDash([])

  // Vertical grid lines (time-based) - now using dynamic intervals that scale with Y-axis
  const timeIntervals = calculateTimeIntervals(maxCurveMultiplier, 1.2) // Use scene curve sharpness

  for (const timeProgress of timeIntervals) {
    const x = marginLeft + timeProgress * viewportWidth
    ctx.beginPath()
    ctx.moveTo(x, config.height - marginBottom)
    ctx.lineTo(x, config.height - marginBottom - viewportHeight)
    ctx.stroke()
  }

  // Horizontal grid lines (multiplier-based) - use adaptive intervals
  const gridIntervals = calculateGridIntervals(maxCurveMultiplier)

  for (const multiplier of gridIntervals) {
    // Don't skip any lines - we want to show the 1x line too

    // Calculate Y position using the same normalization as the curve
    const normalizedY = getSmoothNormalizedMultiplier(multiplier, maxCurveMultiplier)
    const y = config.height - marginBottom - normalizedY * viewportHeight

    // Only draw if line is within visible area
    if (y >= config.height - marginBottom - viewportHeight && y <= config.height - marginBottom) {
      ctx.beginPath()
      ctx.moveTo(marginLeft, y)
      ctx.lineTo(marginLeft + viewportWidth, y)
      ctx.stroke()
    }
  }
}

/**
 * Draw axes on the canvas
 */
export const drawAxes = (
  ctx: CanvasRenderingContext2D,
  viewportParams: ViewportParams,
  config: GridConfig
): void => {
  if (!config.showAxes) return

  const { viewportWidth, viewportHeight, marginLeft, marginBottom } = viewportParams

  ctx.setLineDash([]) // Solid lines for axes
  ctx.strokeStyle = config.axesColor
  ctx.lineWidth = 2

  // Y-axis (left border)
  ctx.beginPath()
  ctx.moveTo(marginLeft, config.height - marginBottom)
  ctx.lineTo(marginLeft, config.height - marginBottom - viewportHeight)
  ctx.stroke()

  // X-axis (bottom border)
  ctx.beginPath()
  ctx.moveTo(marginLeft, config.height - marginBottom)
  ctx.lineTo(marginLeft + viewportWidth, config.height - marginBottom)
  ctx.stroke()
}
