/**
 * beta-curve-utils.js
 *
 * Contains low-level logic for creating beta curves + a single hump
 * (Beta-based) price series.
 */

import { randNormal, randBetween, betaPdf } from './math-utils'

/**
 * Generate multiple Beta curves with progressive scaling.
 * Used as building blocks for a single "hump."
 */
function generateBetaCurves(params) {
  const curves = []
  for (let i = 0; i < params.curveCount; i++) {
    // Calculate progressive ranges based on curve index
    const progressFactor = (i + 1) / params.curveCount
    const curveMinAlpha = params.minAlpha
    const curveMaxAlpha = params.minAlpha + (params.maxAlpha - params.minAlpha) * progressFactor
    const curveMinBeta = params.minBeta
    const curveMaxBeta = params.minBeta + (params.maxBeta - params.minBeta) * progressFactor

    // Generate alpha/beta values within progressive ranges
    const alpha = randBetween(curveMinAlpha, curveMaxAlpha)
    const beta = randBetween(curveMinBeta, curveMaxBeta)

    // Weight inversely proportional to curve index, emphasizing earlier curves
    const weight = randBetween(0.2, 1) * (1 - (i / params.curveCount) * 0.5)
    curves.push({ alpha, beta, weight })
  }

  // Sort by alpha+beta to ensure layering in ascending order
  return curves.sort((a, b) => a.alpha + a.beta - (b.alpha + b.beta))
}

/**
 * Generate a single price series (one "hump") using multiple Beta curves + noise,
 * scaled to match a specified total area (curveParams.totalArea).
 */
export function generatePriceSeries({ curveParams }) {
  const betaCurves = generateBetaCurves(curveParams)
  const rawValues = []

  // Step 1: Base Beta-curve sum
  for (let i = 0; i < curveParams.daysCount; i++) {
    const t = curveParams.daysCount > 1 ? i / (curveParams.daysCount - 1) : 0
    let val = 0

    // Sum of weighted Beta PDFs
    for (const curve of betaCurves) {
      val += curve.weight * betaPdf(t, curve.alpha, curve.beta)
    }

    // Step 2: Optional noise
    if (curveParams.noiseLevel > 0) {
      const stdDev = (curveParams.noiseLevel / 100) * val
      val += randNormal(0, stdDev)
      if (val < 0) val = 0
    }

    rawValues.push(val)
  }

  // Step 3: Scale to match totalArea
  const totalSum = rawValues.reduce((sum, p) => sum + p, 0)
  const scaleFactor = totalSum === 0 ? 1 : curveParams.totalArea / totalSum
  const scaledValues = rawValues.map(v => v * scaleFactor)

  // Step 4: Clean up invalid values
  const validValues = scaledValues.map(v => (isNaN(v) || !isFinite(v) ? 0 : Math.max(0, v)))

  // Step 5: Stats
  const finalSum = validValues.reduce((sum, p) => sum + p, 0)
  const tradingStats = {
    totalReturn: finalSum,
    targetReturn: curveParams.totalArea,
    maxPrice: Math.max(...validValues),
    minPrice: Math.min(...validValues),
    avgPrice: finalSum / validValues.length,
    startPrice: validValues[0],
    totalSum: finalSum,
  }

  return {
    prices: validValues,
    stats: tradingStats,
    metadata: {
      tradingPeriod: { start: 0, end: curveParams.daysCount - 1 },
      curves: betaCurves,
    },
  }
}
