// @ts-nocheck
/**
 * Scaling utilities for responsive roulette layouts
 * Handles proper centering and scaling within available container space
 */

export interface ScalingParams {
  containerWidth: number
  containerHeight: number
  baseSize: number
  padding?: number
  minScale?: number
  maxScale?: number
}

export interface ScalingResult {
  scaledSize: number
  scaleFactor: number
  offsetX: number
  offsetY: number
  paddingX: number
  paddingY: number
}

/**
 * Calculate responsive scaling for roulette layouts
 */
export const calculateResponsiveScaling = ({
  containerWidth,
  containerHeight,
  baseSize,
  padding = 20,
  minScale = 0.3,
  maxScale = 2.0,
}: ScalingParams): ScalingResult => {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return {
      scaledSize: baseSize,
      scaleFactor: 1,
      offsetX: 0,
      offsetY: 0,
      paddingX: padding,
      paddingY: padding,
    }
  }

  // Calculate available space after padding
  const availableWidth = containerWidth - padding * 2
  const availableHeight = containerHeight - padding * 2

  // Calculate scale factor to fit within available space
  const scaleX = availableWidth / baseSize
  const scaleY = availableHeight / baseSize

  // Use the smaller scale to ensure content fits in both dimensions
  let scaleFactor = Math.min(scaleX, scaleY)

  // Clamp to min/max scale
  scaleFactor = Math.max(minScale, Math.min(maxScale, scaleFactor))

  const scaledSize = baseSize * scaleFactor

  // Calculate centering offsets
  const remainingWidth = containerWidth - scaledSize
  const remainingHeight = containerHeight - scaledSize

  const offsetX = remainingWidth / 2
  const offsetY = remainingHeight / 2

  // Calculate actual padding used (may be more than requested due to centering)
  const paddingX = Math.max(padding, offsetX)
  const paddingY = Math.max(padding, offsetY)

  return {
    scaledSize,
    scaleFactor,
    offsetX,
    offsetY,
    paddingX,
    paddingY,
  }
}

/**
 * Calculate wheel-specific scaling parameters
 * The wheelRadius parameter controls the desired wheel size
 */
export const calculateWheelScaling = (
  containerWidth: number,
  containerHeight: number,
  wheelRadius: number,
  padding = 20
): ScalingResult => {
  const wheelDiameter = wheelRadius * 2

  return calculateResponsiveScaling({
    containerWidth,
    containerHeight,
    baseSize: wheelDiameter,
    padding,
    minScale: 0.1, // Allow smaller scaling
    maxScale: 5.0, // Allow larger scaling for bigger wheel size parameters
  })
}

/**
 * Calculate tiles grid scaling parameters
 * Uses actual user-specified tile dimensions for accurate scaling
 */
export const calculateTilesScaling = (
  containerWidth: number,
  containerHeight: number,
  tileSize: number,
  tileSpacing: number,
  padding = 20
): ScalingResult => {
  // Calculate total grid size: 6 tiles wide, 7 tiles tall (including zero row)
  const gridWidth = tileSize * 6 + tileSpacing * 5
  const gridHeight = tileSize * 7 + tileSpacing * 7 // Extra spacing for zero tile

  // Use the larger dimension as the base size for scaling
  const baseSize = Math.max(gridWidth, gridHeight)

  return calculateResponsiveScaling({
    containerWidth,
    containerHeight,
    baseSize,
    padding,
    minScale: 0.4, // Increased minimum to prevent tiles from becoming too small
    maxScale: 1.5, // Reduced maximum to prevent over-scaling when user wants specific sizes
  })
}
