// @ts-nocheck
import { parseGradient } from './colorUtils'
import { isGradientValue } from '../../shared/utils/backgroundUtils'

// European roulette numbers in wheel order
export const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
  31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
]

// Red numbers in roulette
export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

// Helper function to extract first color from gradient or return solid color
export const extractSolidColor = (colorValue: string): string => {
  if (isGradientValue(colorValue)) {
    // Extract first color from gradient for SVG use
    const { colors } = parseGradient(colorValue)
    return colors.length > 0 ? colors[0] : colorValue
  }
  return colorValue
}

export const getNumberColor = (
  num: number,
  parameters: { neutralColor?: string; rouletteColor1: string; rouletteColor2: string }
): string => {
  let baseColor: string
  if (num === 0) {
    baseColor = parameters.neutralColor || '#00AA00'
  } else if (RED_NUMBERS.includes(num)) {
    baseColor = parameters.rouletteColor1
  } else {
    baseColor = parameters.rouletteColor2
  }

  // Extract solid color from gradient if needed (SVG segments can't use CSS gradients)
  return extractSolidColor(baseColor)
}

export const getSegmentFill = (
  num: number,
  parameters: { neutralColor?: string; rouletteColor1: string; rouletteColor2: string }
): string => {
  // Check if we have gradients and use unique SVG gradient references for each segment
  if (num === 0 && isGradientValue(parameters.neutralColor || '#00AA00')) {
    return `url(#gradient-${num})`
  } else if (RED_NUMBERS.includes(num) && isGradientValue(parameters.rouletteColor1)) {
    return `url(#gradient-${num})`
  } else if (
    !RED_NUMBERS.includes(num) &&
    num !== 0 &&
    isGradientValue(parameters.rouletteColor2)
  ) {
    return `url(#gradient-${num})`
  }

  // Fallback to solid color
  return getNumberColor(num, parameters)
}

export const calculateSpinRotation = (
  targetNumber: number,
  currentRotation: number,
  numbers: number[] = ROULETTE_NUMBERS
): number => {
  const targetIndex = numbers.indexOf(targetNumber)
  if (targetIndex === -1) return currentRotation

  const segmentAngle = 360 / numbers.length
  const targetAngle = targetIndex * segmentAngle

  // Add multiple full rotations for dramatic effect
  const fullRotations = 5 + Math.random() * 3 // 5-8 full rotations
  const finalRotation = currentRotation + fullRotations * 360 + (360 - targetAngle)

  return finalRotation
}

export const getTextColor = (parameters: { textColor: string }): string => {
  return parameters.textColor
}

export const formatNumber = (num: number): string => {
  return num.toString()
}

export { parseGradient }
export { isGradientValue }
