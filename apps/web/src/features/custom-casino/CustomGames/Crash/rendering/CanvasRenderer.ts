// @ts-nocheck
/**
 * Core canvas rendering utilities
 * Extracted from CrashScene.tsx to improve maintainability
 */

export interface CanvasConfig {
  width: number
  height: number
  backgroundColor?: string
}

export interface ViewportParams {
  viewportWidth: number
  viewportHeight: number
  marginLeft: number
  marginBottom: number
  maxCurveMultiplier: number
  crashTimeProgress: number
}

/**
 * Initialize canvas with proper dimensions and settings
 */
export const setupCanvas = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig
): void => {
  // Set canvas size only if changed
  if (canvas.width !== config.width || canvas.height !== config.height) {
    canvas.width = config.width
    canvas.height = config.height
  }

  // Clear canvas with single operation
  ctx.clearRect(0, 0, config.width, config.height)
}

/**
 * Calculate viewport parameters for rendering
 */
export const calculateViewportParams = (
  width: number,
  height: number,
  displayMax: number,
  crashMultiplier: number | null,
  scaleFactor: number
): ViewportParams => {
  // Scale margins based on scaleFactor (base margin is 10%)
  const marginRatio = 0.1 * scaleFactor
  // Add extra top margin to account for multiplier text display (12.5% for top to account for text)
  const topMarginRatio = 0.125 * scaleFactor

  const marginLeft = width * marginRatio
  const marginRight = width * marginRatio
  const marginTop = height * topMarginRatio
  const marginBottom = height * marginRatio

  const viewportWidth = width - marginLeft - marginRight
  const viewportHeight = height - marginTop - marginBottom

  // Use the smoothly animated displayMax for visual scaling
  // This allows the graph bounds to expand smoothly
  const maxCurveMultiplier = displayMax

  // Calculate crash time position with consistent curve sharpness
  const crashTimeProgress =
    crashMultiplier ? getTimeAtMultiplier(crashMultiplier, maxCurveMultiplier, 1.2) : 1.0

  return {
    viewportWidth,
    viewportHeight,
    marginLeft,
    marginBottom,
    maxCurveMultiplier,
    crashTimeProgress,
  }
}

/**
 * Convert time/multiplier to canvas coordinates
 */
export const getCanvasCoordinates = (
  timeProgress: number,
  multiplier: number,
  viewportParams: ViewportParams,
  height: number
) => {
  const { viewportWidth, viewportHeight, marginLeft, marginBottom, maxCurveMultiplier } =
    viewportParams

  // X position based on time progress (0 to 1) - always linear
  const x = marginLeft + timeProgress * viewportWidth

  // Y position based on multiplier with extended curve scaling
  const normalizedMultiplier = getSmoothNormalizedMultiplier(multiplier, maxCurveMultiplier)
  const y = height - marginBottom - normalizedMultiplier * viewportHeight

  return { x, y }
}

/**
 * Reset canvas line styling to defaults
 */
export const resetLineStyle = (ctx: CanvasRenderingContext2D): void => {
  ctx.setLineDash([])
  ctx.lineCap = 'butt'
  ctx.lineJoin = 'miter'
}

// Import these functions from utils (they'll be available when this file is used)
import { getTimeAtMultiplier, getSmoothNormalizedMultiplier } from '../utils'
