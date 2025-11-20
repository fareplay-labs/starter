// @ts-nocheck
import { isGradientValue } from '../../shared/utils/backgroundUtils'

export const parseGradient = (
  gradientString: string
): { colors: string[]; angle?: string; isRadial: boolean } => {
  const linearMatch = gradientString.match(/linear-gradient\(([^)]+)\)/)
  const radialMatch = gradientString.match(/radial-gradient\(([^)]+)\)/)

  if (!linearMatch && !radialMatch) return { colors: [], isRadial: false }

  const isRadial = !!radialMatch
  const parts = (linearMatch || radialMatch)![1].split(',').map(p => p.trim())
  const colors: string[] = []
  let angle = '0deg'

  parts.forEach((part, index) => {
    if (
      !isRadial &&
      index === 0 &&
      (part.includes('deg') || part.includes('turn') || part.includes('rad'))
    ) {
      angle = part
    } else if (isRadial && index === 0 && !part.startsWith('#') && !part.startsWith('rgb')) {
      return
    } else {
      const colorMatch = part.match(/^(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)|[a-zA-Z]+)/)
      if (colorMatch) {
        colors.push(colorMatch[1])
      }
    }
  })

  return { colors, angle, isRadial }
}

export const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ?
      [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export const extractBorderColor = (colorValue: string): string => {
  if (isGradientValue(colorValue)) {
    const { colors } = parseGradient(colorValue)
    if (colors.length === 0) return colorValue

    if (colors.length === 1) {
      const [r, g, b] = hexToRgb(colors[0])
      const factor = 0.7
      return rgbToHex(Math.round(r * factor), Math.round(g * factor), Math.round(b * factor))
    }

    let totalR = 0,
      totalG = 0,
      totalB = 0

    colors.forEach(color => {
      const [r, g, b] = hexToRgb(color)
      totalR += r
      totalG += g
      totalB += b
    })

    const avgR = Math.round(totalR / colors.length)
    const avgG = Math.round(totalG / colors.length)
    const avgB = Math.round(totalB / colors.length)

    const contrastFactor = 0.8
    return rgbToHex(
      Math.round(avgR * contrastFactor),
      Math.round(avgG * contrastFactor),
      Math.round(avgB * contrastFactor)
    )
  }

  const [r, g, b] = hexToRgb(colorValue)
  const factor = 0.7
  return rgbToHex(Math.round(r * factor), Math.round(g * factor), Math.round(b * factor))
}

export const getTileBackground = (
  number: number,
  parameters: {
    neutralColor?: string
    rouletteColor1: string
    rouletteColor2: string
  },
  redNumbers: number[]
): string => {
  const isZero = number === 0
  const isRed = redNumbers.includes(number)

  let color: string
  if (isZero) {
    color = parameters.neutralColor || '#00AA00'
  } else if (isRed) {
    color = parameters.rouletteColor1
  } else {
    color = parameters.rouletteColor2
  }

  if (isGradientValue(color)) {
    return color
  }

  return color
}

export const getTileBorderColor = (
  number: number,
  parameters: {
    neutralColor?: string
    rouletteColor1: string
    rouletteColor2: string
  },
  redNumbers: number[]
): string => {
  const isZero = number === 0
  const isRed = redNumbers.includes(number)

  let color: string
  if (isZero) {
    color = parameters.neutralColor || '#00AA00'
  } else if (isRed) {
    color = parameters.rouletteColor1
  } else {
    color = parameters.rouletteColor2
  }

  return extractBorderColor(color)
}
