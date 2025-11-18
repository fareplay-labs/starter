// @ts-nocheck
/**
 * Crash curve rendering utilities
 * Extracted from CrashScene.tsx for better maintainability
 */

import { type ViewportParams } from './CanvasRenderer'
import { getMultiplierAtTime, getSmoothNormalizedMultiplier } from '../utils'

export interface CurvePoint {
  x: number
  y: number
  multiplier: number
  timeProgress: number
}

export interface CurveConfig {
  lineColor: string
  lineThickness: number
  showTargetLine: boolean
  winColor: string
  height: number
}

/**
 * Generate curve points for smooth drawing
 */
export const generateCurvePoints = (
  currentTimeProgress: number,
  viewportParams: ViewportParams,
  height: number
): CurvePoint[] => {
  const points: CurvePoint[] = []

  // Generate more points for smoother curve, especially for longer animations
  const steps = Math.min(200, Math.max(50, currentTimeProgress * 300)) // More points for smoother curve

  for (let i = 0; i <= steps; i++) {
    const timeProgress = (i / Math.max(steps, 1)) * currentTimeProgress
    const multiplier = getMultiplierAtTime(timeProgress, viewportParams.maxCurveMultiplier, 1.2)

    // Calculate coordinates
    const { viewportWidth, viewportHeight, marginLeft, marginBottom, maxCurveMultiplier } =
      viewportParams

    // X position based on time progress (0 to 1) - always linear
    const x = marginLeft + timeProgress * viewportWidth

    // Y position based on multiplier with extended curve scaling
    const normalizedMultiplier = getSmoothNormalizedMultiplier(multiplier, maxCurveMultiplier)
    const y = height - marginBottom - normalizedMultiplier * viewportHeight

    points.push({ x, y, multiplier, timeProgress })
  }

  return points
}

/**
 * Draw the crash curve
 */
export const drawCrashCurve = (
  ctx: CanvasRenderingContext2D,
  points: CurvePoint[],
  config: CurveConfig
): void => {
  if (points.length <= 1) return

  // Draw the curve line
  ctx.strokeStyle = config.lineColor
  ctx.lineWidth = config.lineThickness
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.setLineDash([])

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  // Use quadratic curves for smoother line
  for (let i = 1; i < points.length - 1; i++) {
    const currentPoint = points[i]
    const nextPoint = points[i + 1]
    const controlX = (currentPoint.x + nextPoint.x) / 2
    const controlY = (currentPoint.y + nextPoint.y) / 2
    ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY)
  }

  // Draw to the last point
  if (points.length > 1) {
    const lastPoint = points[points.length - 1]
    ctx.lineTo(lastPoint.x, lastPoint.y)
  }

  ctx.stroke()
}

/**
 * Draw target cash out line
 */
export const drawTargetLine = (
  ctx: CanvasRenderingContext2D,
  cashOutMultiplier: number,
  viewportParams: ViewportParams,
  config: CurveConfig
): void => {
  if (!config.showTargetLine || !cashOutMultiplier || cashOutMultiplier <= 1.0) return

  const { viewportWidth, viewportHeight, marginLeft, marginBottom, maxCurveMultiplier } =
    viewportParams

  // Calculate Y position for the target multiplier
  const normalizedTargetMultiplier = getSmoothNormalizedMultiplier(
    cashOutMultiplier,
    maxCurveMultiplier
  )
  const targetY = config.height - marginBottom - normalizedTargetMultiplier * viewportHeight

  // Only draw if the target line is within the visible area
  if (
    targetY >= config.height - marginBottom - viewportHeight &&
    targetY <= config.height - marginBottom
  ) {
    ctx.strokeStyle = config.winColor
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(marginLeft, targetY)
    ctx.lineTo(marginLeft + viewportWidth, targetY)
    ctx.stroke()
  }
}
