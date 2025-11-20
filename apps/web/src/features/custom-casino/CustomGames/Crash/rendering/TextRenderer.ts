// @ts-nocheck
/**
 * Text and label rendering utilities
 * Extracted from CrashScene.tsx for better organization
 */

import { type ViewportParams } from './CanvasRenderer'
import { getSmoothNormalizedMultiplier, calculateLabelIntervals } from '../utils'

export interface TextConfig {
  showGridLabels: boolean
  gridTextColor: string
  textColor: string
  crashColor: string
  winColor: string
  width: number
  height: number
}

export interface GameTextConfig {
  winText: string
  lossText: string
  animationState: string
}

/**
 * Draw grid labels (Y-axis multiplier labels) with adaptive intervals
 */
export const drawGridLabels = (
  ctx: CanvasRenderingContext2D,
  viewportParams: ViewportParams,
  cashOutMultiplier: number | null,
  config: TextConfig
): void => {
  if (!config.showGridLabels) return

  const { viewportHeight, marginLeft, marginBottom, maxCurveMultiplier } = viewportParams

  // Y-axis labels - use specific label intervals (2, 5, 10, 20, 30, etc.)
  ctx.fillStyle = config.gridTextColor
  ctx.font = 'bold 16px gohu, monospace'
  ctx.textAlign = 'right'

  // Get specific label intervals that show only key values
  const labelValues = calculateLabelIntervals(maxCurveMultiplier)

  labelValues.forEach(multiplierValue => {
    // Skip 1x label (shown on axis)
    if (multiplierValue <= 1) return

    const normalizedMultiplier = getSmoothNormalizedMultiplier(multiplierValue, maxCurveMultiplier)
    const y = config.height - marginBottom - normalizedMultiplier * viewportHeight

    // Only draw if label is within visible area
    if (y >= config.height - marginBottom - viewportHeight && y <= config.height - marginBottom) {
      // Format label as whole number without decimals
      const multiplierLabel = `${Math.round(multiplierValue)}x`

      ctx.fillText(multiplierLabel, marginLeft - 5, y + 6)
    }
  })

  // Show cash out target indicator if present and visible
  if (cashOutMultiplier && cashOutMultiplier > 1.0) {
    const normalizedTargetMultiplier = getSmoothNormalizedMultiplier(
      cashOutMultiplier,
      maxCurveMultiplier
    )
    const targetY = config.height - marginBottom - normalizedTargetMultiplier * viewportHeight

    if (
      targetY >= config.height - marginBottom - viewportHeight &&
      targetY <= config.height - marginBottom
    ) {
      ctx.fillStyle = config.winColor
      ctx.font = 'bold 12px gohu, monospace'
      ctx.textAlign = 'left'
    }
  }
}

/**
 * Draw current multiplier display with dynamic colors and scaling
 */
export const drawCurrentMultiplier = (
  ctx: CanvasRenderingContext2D,
  currentMultiplier: number,
  gameConfig: GameTextConfig,
  config: TextConfig
): void => {
  // Determine color based on game state
  let textColor = config.textColor // Default color
  if (gameConfig.animationState === 'cashedOut') {
    textColor = config.winColor // Green for successful cash out
  } else if (gameConfig.animationState === 'crashed') {
    textColor = config.crashColor // Red for crash
  }

  // Apply scaling effect for crash emphasis
  const isEmphasisState =
    gameConfig.animationState === 'crashed' || gameConfig.animationState === 'cashedOut'
  const scale = isEmphasisState ? 1.2 : 1.0 // 20% larger for emphasis

  // Save context for transform
  ctx.save()

  // Apply scaling transform centered on the text position
  const textX = config.width / 2
  const textY = 10
  ctx.translate(textX, textY)
  ctx.scale(scale, scale)
  ctx.translate(-textX, -textY)

  // Draw text with dynamic color and scaling
  ctx.fillStyle = textColor
  ctx.font = 'bold 36px gohu, monospace'
  ctx.textAlign = 'center'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.strokeText(`${currentMultiplier.toFixed(2)}x`, textX, textY)
  ctx.fillText(`${currentMultiplier.toFixed(2)}x`, textX, textY)

  // Restore context
  ctx.restore()
}

/**
 * Draw game state text (crash/win messages)
 */
export const drawGameStateText = (
  ctx: CanvasRenderingContext2D,
  gameConfig: GameTextConfig,
  config: TextConfig
): void => {
  // Draw crash text ONLY for direct crashes (not cash-out scenarios)
  if (gameConfig.animationState === 'crashed') {
    ctx.fillStyle = config.crashColor
    ctx.font = 'bold 32px gohu, monospace'
    ctx.textAlign = 'center'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.strokeText(gameConfig.lossText, config.width / 2, config.height / 2 - 130)
    ctx.fillText(gameConfig.lossText, config.width / 2, config.height / 2 - 130)
  }

  // Cash out effects - only show text if fully cashed out (not continuing)
  if (gameConfig.animationState === 'cashedOut') {
    ctx.fillStyle = config.winColor
    ctx.font = 'bold 32px gohu, monospace'
    ctx.textAlign = 'center'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.strokeText(gameConfig.winText, config.width / 2, config.height / 2 - 130)
    ctx.fillText(gameConfig.winText, config.width / 2, config.height / 2 - 130)
  }
}
