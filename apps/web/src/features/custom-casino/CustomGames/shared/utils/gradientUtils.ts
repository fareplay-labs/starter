// @ts-nocheck
/**
 * Shared gradient parsing utilities for all custom games
 * Eliminates duplication across renderer files
 */

/**
 * Robust token-safe splitter that respects nested parentheses
 */
export function splitGradientArgs(str: string): string[] {
  const out: string[] = []
  let buf = ''
  let depth = 0
  for (const ch of str) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(buf.trim())
      buf = ''
      continue
    }
    buf += ch
  }
  if (buf) out.push(buf.trim())
  return out
}

/**
 * Parses color stop with optional position
 */
export function parseColorStop(colorStop: string): { color: string; position: number | null } {
  const match = colorStop.match(/^(.*?)(?:\s+([\d.]+%?))?$/)
  if (!match) return { color: colorStop.trim(), position: null }

  const color = match[1].trim()
  const posStr = match[2]

  let position: number | null = null
  if (posStr) {
    if (posStr.endsWith('%')) {
      position = parseFloat(posStr) / 100
    } else {
      position = parseFloat(posStr)
    }
    position = Math.max(0, Math.min(1, position))
  }

  return { color, position }
}

/**
 * Distributes color stops with missing positions
 */
export function distributeColorStops(
  colorStops: string[]
): Array<{ color: string; position: number }> {
  const parsed = colorStops.map(parseColorStop)

  // If no positions are specified, distribute evenly
  const hasAnyPositions = parsed.some(stop => stop.position !== null)
  if (!hasAnyPositions) {
    return parsed.map((stop, index) => ({
      color: stop.color,
      position: parsed.length === 1 ? 0 : index / (parsed.length - 1),
    }))
  }

  // Handle mixed positioned/non-positioned stops
  const result: Array<{ color: string; position: number }> = []

  for (let i = 0; i < parsed.length; i++) {
    const current = parsed[i]

    if (current.position !== null) {
      result.push({ color: current.color, position: current.position })
    } else {
      // Find the range this position falls within
      let prevPos = 0
      let nextPos = 1

      // Find previous positioned stop
      for (let j = i - 1; j >= 0; j--) {
        if (parsed[j].position !== null) {
          prevPos = parsed[j].position!
          break
        }
      }

      // Find next positioned stop
      for (let j = i + 1; j < parsed.length; j++) {
        if (parsed[j].position !== null) {
          nextPos = parsed[j].position!
          break
        }
      }

      // Find how many unpositioned stops are in this range
      let startIndex = i
      let endIndex = i

      // Find start of unpositioned range
      while (startIndex > 0 && parsed[startIndex - 1].position === null) {
        startIndex--
      }

      // Find end of unpositioned range
      while (endIndex < parsed.length - 1 && parsed[endIndex + 1].position === null) {
        endIndex++
      }

      // Distribute within the range
      const rangeSize = endIndex - startIndex + 1
      const rangeStep = (nextPos - prevPos) / (rangeSize + 1)
      const positionInRange = i - startIndex + 1
      const position = prevPos + rangeStep * positionInRange

      result.push({ color: current.color, position })
    }
  }

  return result
}

/**
 * Converts CSS gradient direction to canvas coordinates
 */
export function getLinearGradientCoords(
  direction: string,
  bounds: { x: number; y: number; width: number; height: number }
): { x0: number; y0: number; x1: number; y1: number } | null {
  const { x, y, width, height } = bounds

  // Handle angle values
  let angleCSS: number | null = null
  if (/[-\d.]+deg/.test(direction)) {
    angleCSS = parseFloat(direction)
  } else if (/[-\d.]+rad/.test(direction)) {
    angleCSS = (parseFloat(direction) * 180) / Math.PI
  } else if (/[-\d.]+turn/.test(direction)) {
    angleCSS = parseFloat(direction) * 360
  }

  if (angleCSS !== null) {
    // Convert CSS angle to radians
    const rad = ((90 - angleCSS) * Math.PI) / 180

    const halfLen = Math.sqrt(width * width + height * height) / 2
    const centerX = width / 2
    const centerY = height / 2

    const x0l = centerX - halfLen * Math.cos(rad)
    const y0l = centerY - halfLen * Math.sin(rad)
    const x1l = centerX + halfLen * Math.cos(rad)
    const y1l = centerY + halfLen * Math.sin(rad)

    return { x0: x + x0l, y0: y + y0l, x1: x + x1l, y1: y + y1l }
  }

  // Named directions
  const dir = direction.toLowerCase().trim()

  if (dir === 'to right' || dir === 'right')
    return { x0: x, y0: y + height / 2, x1: x + width, y1: y + height / 2 }

  if (dir === 'to left' || dir === 'left')
    return { x0: x + width, y0: y + height / 2, x1: x, y1: y + height / 2 }

  if (dir === 'to bottom' || dir === 'bottom' || dir === '')
    return { x0: x + width / 2, y0: y, x1: x + width / 2, y1: y + height }

  if (dir === 'to top' || dir === 'top')
    return { x0: x + width / 2, y0: y + height, x1: x + width / 2, y1: y }

  // Diagonal directions
  if (dir === 'to bottom right' || dir === 'bottom right')
    return { x0: x, y0: y, x1: x + width, y1: y + height }

  if (dir === 'to bottom left' || dir === 'bottom left')
    return { x0: x + width, y0: y, x1: x, y1: y + height }

  if (dir === 'to top right' || dir === 'top right')
    return { x0: x, y0: y + height, x1: x + width, y1: y }

  if (dir === 'to top left' || dir === 'top left')
    return { x0: x + width, y0: y + height, x1: x, y1: y }

  return null
}

/**
 * Parses linear gradient and creates canvas linear gradient
 */
export function parseLinearGradient(
  gradientStr: string,
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number }
): CanvasGradient | null {
  const match = gradientStr.match(/linear-gradient\(([^)]+)\)/)
  if (!match) return null

  const contents = match[1]
  const parts = splitGradientArgs(contents)

  // Parse direction and colors
  let direction = 'to bottom'
  let colorStops: string[] = []

  const firstPart = parts[0]
  if (
    firstPart.startsWith('to ') ||
    firstPart.includes('deg') ||
    firstPart.includes('rad') ||
    firstPart.includes('turn')
  ) {
    direction = firstPart
    colorStops = parts.slice(1)
  } else {
    colorStops = parts
  }

  const coords = getLinearGradientCoords(direction, bounds)
  if (!coords) return null

  const grad = ctx.createLinearGradient(coords.x0, coords.y0, coords.x1, coords.y1)

  const distributedStops = distributeColorStops(colorStops)
  distributedStops.forEach(({ color, position }) => {
    grad.addColorStop(position, color)
  })

  return grad
}

/**
 * Parses radial gradient and creates canvas radial gradient
 */
export function parseRadialGradient(
  gradientStr: string,
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number },
  options?: {
    centerXOffset?: number
    centerYOffset?: number
    radiusMultiplier?: number
    innerRadiusRatio?: number
  }
): CanvasGradient | null {
  const match = gradientStr.match(/radial-gradient\(([^)]+)\)/)
  if (!match) return null

  const contents = match[1]
  const parts = splitGradientArgs(contents)

  // Extract colors (skip shape/position specifications)
  let colorStops: string[] = []
  const firstPart = parts[0]
  if (firstPart.includes('circle') || firstPart.includes('ellipse') || firstPart.includes('at ')) {
    colorStops = parts.slice(1)
  } else {
    colorStops = parts
  }

  // Calculate gradient center and radius
  const centerX = bounds.x + bounds.width / 2 + (options?.centerXOffset || 0)
  const centerY = bounds.y + bounds.height / 2 + (options?.centerYOffset || 0)
  const radius = (Math.min(bounds.width, bounds.height) / 2) * (options?.radiusMultiplier || 1)
  const innerRadius = radius * (options?.innerRadiusRatio || 0)

  const grad = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, radius)

  const distributedStops = distributeColorStops(colorStops)
  distributedStops.forEach(({ color, position }) => {
    grad.addColorStop(position, color)
  })

  return grad
}

/**
 * General gradient parser that handles both linear and radial gradients
 */
export function parseGradient(
  gradientStr: string,
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number },
  radialOptions?: {
    centerXOffset?: number
    centerYOffset?: number
    radiusMultiplier?: number
    innerRadiusRatio?: number
  }
): CanvasGradient | null {
  const cleaned = gradientStr.replace(/\s+/g, ' ').trim()

  if (cleaned.startsWith('radial-gradient(')) {
    return parseRadialGradient(cleaned, ctx, bounds, radialOptions)
  }

  if (cleaned.startsWith('linear-gradient(')) {
    return parseLinearGradient(cleaned, ctx, bounds)
  }

  return null
}

/**
 * Extracts color values from a gradient string
 * Returns an array of colors in order, useful for getting final colors for effects
 */
export function extractColorsFromGradient(colorInput: string): string[] {
  // If it's a solid color, return it as-is
  if (!colorInput.includes('gradient')) {
    return [colorInput]
  }

  // Extract gradient content
  const gradientMatch = colorInput.match(/gradient\(([^)]+)\)/)
  if (!gradientMatch) return [colorInput]

  const contents = gradientMatch[1]
  const args = splitGradientArgs(contents)

  // Skip direction (first arg for linear, or size/position for radial)
  let colorStops: string[]
  if (colorInput.includes('linear-gradient')) {
    // First arg might be direction, skip if it's not a color
    const firstArg = args[0]
    const isDirection =
      firstArg.includes('deg') ||
      firstArg.includes('rad') ||
      firstArg.includes('turn') ||
      firstArg.includes('to ') ||
      ['right', 'left', 'top', 'bottom'].some(d => firstArg.includes(d))
    colorStops = isDirection ? args.slice(1) : args
  } else {
    // For radial gradients, first arg might be size/position
    const firstArg = args[0]
    const isRadialConfig =
      firstArg.includes('circle') ||
      firstArg.includes('ellipse') ||
      firstArg.includes('at ') ||
      firstArg.includes('%') ||
      firstArg.includes('px')
    colorStops = isRadialConfig ? args.slice(1) : args
  }

  // Extract just the color values (without positions)
  const colors = colorStops.map(stop => {
    const { color } = parseColorStop(stop)
    return color
  })

  return colors
}

/**
 * Gets the final color from a gradient (useful for trails, outlines, etc.)
 */
export function getFinalColorFromGradient(colorInput: string): string {
  const colors = extractColorsFromGradient(colorInput)
  return colors[colors.length - 1] || colorInput
}
