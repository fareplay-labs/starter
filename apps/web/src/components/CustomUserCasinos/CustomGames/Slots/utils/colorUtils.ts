// @ts-nocheck
/**
 * Extract alpha value from a color string
 * Returns a value between 0 and 1
 */
export function extractAlpha(color: string): number {
  if (!color) return 1

  // Handle rgba (e.g., "rgba(26, 26, 46, 0.5)")
  const rgbaMatch = color.match(/rgba\s*\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/)
  if (rgbaMatch) {
    return parseFloat(rgbaMatch[1])
  }

  // Handle rgb (no alpha = fully opaque)
  if (color.match(/rgb\s*\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)/)) {
    return 1
  }

  // Handle hsla
  const hslaMatch = color.match(
    /hsla\s*\(\s*[\d.]+\s*,\s*[\d.%]+\s*,\s*[\d.%]+\s*,\s*([\d.]+)\s*\)/
  )
  if (hslaMatch) {
    return parseFloat(hslaMatch[1])
  }

  // Handle hsl (no alpha = fully opaque)
  if (color.match(/hsl\s*\(\s*[\d.]+\s*,\s*[\d.%]+\s*,\s*[\d.%]+\s*\)/)) {
    return 1
  }

  // Handle hex with alpha (#RRGGBBAA or #RGBA)
  if (color.startsWith('#')) {
    if (color.length === 9) {
      const alpha = parseInt(color.slice(7, 9), 16) / 255
      return alpha
    } else if (color.length === 5) {
      const alphaHex = color.slice(4, 5)
      const alpha = parseInt(alphaHex + alphaHex, 16) / 255
      return alpha
    }
    // Regular hex without alpha
    return 1
  }

  // Handle transparent keyword
  if (color.toLowerCase() === 'transparent') {
    return 0
  }

  // Default to fully opaque for solid colors
  return 1
}

/**
 * Generate box shadow with intensity based on alpha
 * @param alpha - Alpha value between 0 and 1
 * @param isContainer - Whether this is for the container (larger shadow) or reel (smaller shadow)
 */
export function generateBoxShadow(alpha: number, isContainer = false): string {
  if (alpha <= 0.01) {
    return 'none'
  }

  if (isContainer) {
    // Container shadow - larger and more pronounced
    const insetOpacity = 0.6 * alpha
    const outerOpacity = 0.4 * alpha
    const shadow = `inset 0 2px 10px rgba(0, 0, 0, ${insetOpacity.toFixed(3)}), 0 4px 20px rgba(0, 0, 0, ${outerOpacity.toFixed(3)})`
    return shadow
  } else {
    // Reel shadow - more visible depth effect
    const insetOpacity = 0.5 * alpha
    const outerOpacity = 0.3 * alpha
    const shadow = `inset 0 2px 5px rgba(0, 0, 0, ${insetOpacity.toFixed(3)}), 0 3px 10px rgba(0, 0, 0, ${outerOpacity.toFixed(3)})`
    return shadow
  }
}
