// @ts-nocheck
import { PlinkoProbabilitiesAndMultipliers } from '@/components/CustomUserCasinos/lib/crypto/plinko'
import { formatEther } from 'viem'
import { type PlinkoParameters, type PlinkoEntry } from '../types'

/**
 * Interface for multiplier area bounds for hover detection
 */
export interface MultiplierArea {
  x: number
  y: number
  width: number
  height: number
  bucketIndex: number
  multiplier: string
  probability: number
}

/**
 * Formats a multiplier BigInt value to a human-readable decimal string
 */
export function formatMultiplier(multiplierBigInt: bigint): string {
  const decimal = Number(formatEther(multiplierBigInt))

  // Round to 1 decimal place for all values
  const rounded = Math.round(decimal * 10) / 10

  if (rounded >= 1) {
    return `${rounded}x`
  } else {
    // Remove leading zero for values less than 1 (e.g., ".5x" instead of "0.5x")
    return `${rounded.toString().replace(/^0/, '')}x`
  }
}

/**
 * Formats a multiplier with full precision for tooltips
 */
export function formatMultiplierPrecise(multiplierBigInt: bigint): string {
  const decimal = Number(formatEther(multiplierBigInt))
  return `${decimal.toFixed(4)}x`
}

/**
 * Gets probability for a specific bucket position
 */
export function getProbabilityForBucket(
  riskLevel: number,
  rowCount: number,
  bucketIndex: number
): number {
  try {
    const probabilityBigInt =
      PlinkoProbabilitiesAndMultipliers.getProbabilityForRowCountAndPosition(rowCount, bucketIndex)
    // Convert from BigInt to percentage
    const probability =
      Number(probabilityBigInt) /
      Number(
        PlinkoProbabilitiesAndMultipliers.getProbabilitesForRowCount(rowCount).reduce(
          (a, b) => a + b,
          0n
        )
      )
    return probability * 100 // Return as percentage
  } catch (error) {
    console.warn('Failed to get probability:', error)
    return 0 // Placeholder
  }
}

/**
 * Gets all multipliers for the current risk level and row count
 */
export function getMultipliersForGame(riskLevel: number, rowCount: number): string[] {
  try {
    const multipliersBigInt =
      PlinkoProbabilitiesAndMultipliers.getMultipliersForRiskLevelAndRowCount(riskLevel, rowCount)
    return multipliersBigInt.map(formatMultiplier)
  } catch (error) {
    console.warn('Failed to get multipliers:', error)
    // Return default multipliers for fallback
    const bucketCount = rowCount + 1
    return Array.from({ length: bucketCount }, () => '1.0x')
  }
}

/**
 * Parses radial gradient for multiplier text
 */
function parseRadialGradientForMultipliers(
  gradientStr: string,
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  maxRadius: number
): CanvasGradient | null {
  // Extract contents between parentheses
  const match = gradientStr.match(/radial-gradient\(([^)]+)\)/)
  if (!match) return null

  const contents = match[1]
  const parts = contents.split(',').map(s => s.trim())

  // Filter out radial gradient keywords that aren't colors
  const radialKeywords = [
    'circle',
    'ellipse',
    'closest-side',
    'closest-corner',
    'farthest-side',
    'farthest-corner',
    'at',
    'center',
  ]

  const colorStops = parts.filter(part => {
    const cleanPart = part.toLowerCase().trim()
    return (
      !radialKeywords.some(keyword => cleanPart.includes(keyword)) &&
      !/^[\d.]+(%|px|em|rem)$/.test(cleanPart)
    )
  })

  // Create radial gradient from center outward
  const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius)

  if (colorStops.length === 0) {
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(1, '#ffffff')
  } else if (colorStops.length === 1) {
    grad.addColorStop(0, colorStops[0])
    grad.addColorStop(1, colorStops[0])
  } else {
    colorStops.forEach((color, index) => {
      const position = index / (colorStops.length - 1)
      grad.addColorStop(position, color)
    })
  }

  return grad
}

/**
 * Calculates multiplier areas for hover detection
 */
export function getMultiplierAreas(
  params: PlinkoParameters,
  entry: PlinkoEntry,
  layout: {
    bucketCount: number
    bucketWidth: number
    bucketY: number
    bucketHeight: number
  },
  boardMargin: number
): MultiplierArea[] {
  const rowCount = entry.side.rowCount
  const riskLevel = entry.side.riskLevel
  const multipliers = getMultipliersForGame(riskLevel, rowCount)
  // Font size: starts at 12px but reduces more aggressively at higher row counts
  const baseFontSize = Math.max(8, 12 - (rowCount - 8) * 0.2)
  // Constrain by bucket width to prevent overflow (more aggressive constraint)
  const maxFontForBucket = layout.bucketWidth * 0.5
  const fontSize = Math.max(7, Math.min(12, Math.min(baseFontSize, maxFontForBucket)))
  // Move text up as row count increases to compensate for smaller bucket heights
  const verticalOffset = Math.max(1, 5 - (rowCount - 8) * 0.3)
  const textY = layout.bucketY + layout.bucketHeight + verticalOffset

  const areas: MultiplierArea[] = []

  for (let i = 0; i < layout.bucketCount; i++) {
    const x = boardMargin + i * layout.bucketWidth
    const centerX = x + layout.bucketWidth / 2
    const multiplier = multipliers[i] || '1.0x'
    const probability = getProbabilityForBucket(riskLevel, rowCount, i)

    // Create hover area around the text
    const textWidth = layout.bucketWidth * 0.8
    const textHeight = fontSize + 8

    areas.push({
      x: centerX - textWidth / 2,
      y: textY - fontSize / 2,
      width: textWidth,
      height: textHeight,
      bucketIndex: i,
      multiplier,
      probability,
    })
  }

  return areas
}

/**
 * Draws multiplier values below the buckets
 */
export function drawMultiplierLabels(
  ctx: CanvasRenderingContext2D,
  params: PlinkoParameters,
  entry: PlinkoEntry,
  layout: {
    bucketCount: number
    bucketWidth: number
    bucketY: number
    bucketHeight: number
  },
  boardMargin: number
): void {
  const rowCount = entry.side.rowCount
  const riskLevel = entry.side.riskLevel
  const multipliers = getMultipliersForGame(riskLevel, rowCount)

  // Font size: starts at 12px but reduces more aggressively at higher row counts
  const baseFontSize = Math.max(8, 12 - (rowCount - 8) * 0.2)
  // Constrain by bucket width to prevent overflow (more aggressive constraint)
  const maxFontForBucket = layout.bucketWidth * 0.5
  const fontSize = Math.max(7, Math.min(12, Math.min(baseFontSize, maxFontForBucket)))
  // Move text up as row count increases to compensate for smaller bucket heights
  const verticalOffset = Math.max(1, 5 - (rowCount - 8) * 0.3)
  const textY = layout.bucketY + layout.bucketHeight + verticalOffset

  // Use Gohu font as the default site font
  ctx.font = `${fontSize}px Gohu, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  // Add text shadow for better visibility
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
  ctx.shadowBlur = 2
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1

  // Calculate center point for radial gradient (middle of all multipliers)
  const totalWidth = layout.bucketCount * layout.bucketWidth
  const centerX = boardMargin + totalWidth / 2
  const maxRadius = totalWidth / 2

  // Determine fill style based on multiplierColor parameter
  let fillStyle: string | CanvasGradient = params.multiplierColor || '#ffffff'

  if (params.multiplierColor && params.multiplierColor.includes('radial-gradient(')) {
    const gradient = parseRadialGradientForMultipliers(
      params.multiplierColor,
      ctx,
      centerX,
      textY,
      maxRadius
    )
    if (gradient) {
      fillStyle = gradient
    }
  }

  // Draw all multipliers with the same fill style
  ctx.fillStyle = fillStyle as any

  for (let i = 0; i < layout.bucketCount; i++) {
    const x = boardMargin + i * layout.bucketWidth + layout.bucketWidth / 2
    const multiplier = multipliers[i] || '1.0x'
    ctx.fillText(multiplier, x, textY)
  }

  // Reset shadow
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

/**
 * Draws tooltip for multiplier hover
 */
export function drawMultiplierTooltip(
  ctx: CanvasRenderingContext2D,
  params: PlinkoParameters,
  entry: PlinkoEntry,
  area: MultiplierArea
): void {
  try {
    // Get precise multiplier value
    const multiplierBigInt =
      PlinkoProbabilitiesAndMultipliers.getMultiplierForRiskLevelRowCountAndPosition(
        entry.side.riskLevel,
        entry.side.rowCount,
        area.bucketIndex
      )
    const preciseMultiplier = formatMultiplierPrecise(multiplierBigInt)

    // Tooltip content
    const line1 = `Multiplier: ${preciseMultiplier}`
    const line2 = `Probability: ${area.probability.toFixed(2)}%`

    // Tooltip styling
    const padding = 8
    const lineHeight = 14
    const fontSize = 11

    ctx.font = `${fontSize}px Gohu, monospace`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    // Measure text for tooltip size
    const line1Width = ctx.measureText(line1).width
    const line2Width = ctx.measureText(line2).width
    const tooltipWidth = Math.max(line1Width, line2Width) + padding * 2
    const tooltipHeight = lineHeight * 2 + padding * 2

    // Position tooltip below the multiplier area (fixed position)
    const tooltipX = area.x + area.width / 2 - tooltipWidth / 2
    const tooltipY = area.y + area.height + 5

    // Draw tooltip background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight)
    ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight)

    // Draw tooltip text
    ctx.fillStyle = '#ffffff'
    ctx.fillText(line1, tooltipX + padding, tooltipY + padding)
    ctx.fillText(line2, tooltipX + padding, tooltipY + padding + lineHeight)
  } catch (error) {
    console.warn('Failed to draw tooltip:', error)

    // Fallback tooltip
    const fallbackText = `Bucket ${area.bucketIndex + 1}`
    ctx.font = '11px Gohu, monospace'
    const textWidth = ctx.measureText(fallbackText).width
    const tooltipX = area.x + area.width / 2 - textWidth / 2 - 4
    const tooltipY = area.y + area.height + 5

    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
    ctx.fillRect(tooltipX, tooltipY, textWidth + 8, 20)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(fallbackText, tooltipX + 4, tooltipY + 6)
  }
}
