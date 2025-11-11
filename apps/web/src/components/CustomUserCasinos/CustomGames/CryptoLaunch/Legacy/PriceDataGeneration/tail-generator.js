/**
 * Tail Generator - Redesigned for realism but preserves function names and params
 *
 * - The tail starts at `startValue` and ends at `endValue` (or a generated one if null).
 * - No ceiling constraint, so it can exceed the sell line.
 * - Stays above a minimum floor to avoid negative or near-zero values.
 * - Uses a forward/backward pass with optional drift and a final smoothing step.
 */

import { randNormal, randBetween } from './math-utils'

/**
 * Generates a tail (random walk) from `startDay` to `endDay`.
 *
 * @param {number} startDay - Day index at which the tail starts.
 * @param {number} endDay - Day index at which the tail ends.
 * @param {number} startValue - The price at the start of the tail.
 * @param {number} [endValue=null] - The price at which the tail ends (or null => auto-generate).
 * @param {number} minSellPrice - Used only for setting a floor (e.g., 5% of sell price).
 * @param {string} [direction="down"] - If endValue is null, determines up/down multiplier.
 * @param {number} [volatility=0.05] - Average daily price movement factor.
 */
export function generateTail({
  startDay,
  endDay,
  startValue,
  endValue = null,
  minSellPrice,
  direction = 'down', // 'up' or 'down'
  volatility = 0.05,
}) {
  const daysCount = endDay - startDay + 1
  if (daysCount <= 1) {
    return {
      prices: [startValue],
      metadata: {
        startDay,
        endDay,
        lowestValue: startValue,
        highestValue: startValue,
      },
    }
  }

  // If no endValue is provided, pick one based on direction
  if (endValue === null) {
    const multiplier = direction === 'up' ? 2 : 0.5
    endValue = startValue * multiplier
  }

  const prices = new Array(daysCount).fill(0)
  prices[0] = startValue
  prices[daysCount - 1] = endValue

  // We'll keep a small floor (e.g. 5% of minSellPrice) so we never drop to zero
  const floorValue = minSellPrice ? minSellPrice * 0.05 : 0.01

  // Reflection if below floor
  function reflectFloor(price) {
    if (price < floorValue) {
      // Partial reflection
      const undershoot = floorValue - price
      return floorValue + undershoot * 0.5
    }
    return price
  }

  // Forward pass: from startValue up to midpoint
  let currentPrice = startValue
  let prevChange = 0
  const midpoint = Math.floor(daysCount / 2)

  for (let i = 1; i < midpoint; i++) {
    const progress = i / midpoint
    // Move roughly toward halfway between start & end
    const midTarget = (startValue + endValue) / 2
    const targetPrice = startValue * (1 - progress) + midTarget * progress

    // Reduce target influence, increase randomness
    const momentum = prevChange * 0.3
    const targetGap = targetPrice - currentPrice
    const bias = targetGap * 0.1 // Reduced from 0.4 to 0.1 to allow more random movement

    // Increased base volatility and add random spikes
    const baseVolatility = volatility * currentPrice * 2 // Doubled base volatility
    const randomSpike = Math.random() < 0.15 ? randBetween(1, 3) : 1 // 15% chance of volatility spike
    const stepVolatility = baseVolatility * randomSpike

    const change = randNormal(momentum + bias, stepVolatility)
    prevChange = change

    currentPrice += change
    currentPrice = reflectFloor(currentPrice)
    prices[i] = currentPrice
  }

  // Backward pass: from endValue down to midpoint
  currentPrice = endValue
  prevChange = 0
  for (let i = daysCount - 2; i >= midpoint; i--) {
    const progress = (daysCount - 1 - i) / (daysCount - 1 - midpoint)
    const midTarget = (startValue + endValue) / 2
    const targetPrice = endValue * (1 - progress) + midTarget * progress

    const momentum = prevChange * 0.3
    const targetGap = targetPrice - currentPrice
    const bias = targetGap * 0.1 // Reduced from 0.4 to 0.1

    // Same volatility approach as forward pass
    const baseVolatility = volatility * currentPrice * 2
    const randomSpike = Math.random() < 0.15 ? randBetween(1, 3) : 1
    const stepVolatility = baseVolatility * randomSpike

    const change = randNormal(momentum + bias, stepVolatility)
    prevChange = change

    currentPrice += change
    currentPrice = reflectFloor(currentPrice)
    prices[i] = currentPrice
  }

  // Smoothing pass around the midpoint - reduced window size
  const smoothingWindow = Math.max(2, Math.floor(daysCount * 0.05)) // Reduced from 0.1 to 0.05
  const midStart = Math.max(1, midpoint - smoothingWindow)
  const midEnd = Math.min(daysCount - 2, midpoint + smoothingWindow)

  for (let i = midStart; i <= midEnd; i++) {
    const winStart = Math.max(0, i - 2)
    const winEnd = Math.min(daysCount - 1, i + 2)
    const segment = prices.slice(winStart, winEnd + 1)

    // Less aggressive smoothing weights
    const weights = segment.map(
      (_, idx) => 1 - Math.pow(Math.abs(idx - Math.floor(segment.length / 2)) / segment.length, 0.5)
    )
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    const smoothed = segment.reduce((sum, val, idx) => sum + val * weights[idx], 0) / totalWeight

    // Only apply 50% of the smoothing
    prices[i] = prices[i] * 0.5 + smoothed * 0.5
  }

  // Final slight nudge so we land exactly on endValue
  prices[daysCount - 1] = endValue

  // Evaluate stats
  let lowestValue = Infinity
  let highestValue = -Infinity
  for (const p of prices) {
    if (p < lowestValue) lowestValue = p
    if (p > highestValue) highestValue = p
  }

  return {
    prices,
    metadata: {
      startDay,
      endDay,
      lowestValue,
      highestValue,
    },
  }
}

/**
 * Generates a full price series for the zero-return case.
 * (Signature unchanged; simplified logic for a "failed token".)
 */
export function generateZeroReturnSeries({
  totalDays,
  startPrice,
  minSellPrice,
  volatility = 0.03,
}) {
  // We'll create a simple down-sloping random walk that stays below minSellPrice
  // and tapers off somewhere between 20-60% of minSellPrice.

  const prices = new Array(totalDays).fill(0)
  prices[0] = Math.min(startPrice, minSellPrice * 0.8)

  let currentPrice = prices[0]
  let prevChange = 0

  const targetEndRatio = randBetween(0.2, 0.6) // end at 20-60% of minSellPrice
  const endTarget = minSellPrice * targetEndRatio

  // Forward pass random walk
  for (let i = 1; i < totalDays; i++) {
    // A slight downward bias
    const targetGap = endTarget - currentPrice
    const driftBias = targetGap * 0.02 // small push toward end
    const momentum = prevChange * 0.3

    // Volatility scales with currentPrice
    const stepVolatility = volatility * currentPrice * 0.5
    const change = randNormal(driftBias + momentum, stepVolatility)

    currentPrice += change
    prevChange = change

    // Reflect if above minSellPrice * 0.9 => forcibly push back down
    if (currentPrice > minSellPrice * 0.9) {
      const overshoot = currentPrice - minSellPrice * 0.9
      currentPrice = minSellPrice * 0.9 - overshoot * 0.7
    }

    // Don't let price go below 10% of minSellPrice
    currentPrice = Math.max(currentPrice, minSellPrice * 0.1)

    prices[i] = currentPrice
  }

  // Final nudge to ensure we finish near endTarget
  prices[totalDays - 1] = endTarget

  // Collect stats
  let highestValue = -Infinity
  let lowestValue = Infinity
  for (const p of prices) {
    if (p > highestValue) highestValue = p
    if (p < lowestValue) lowestValue = p
  }

  return {
    prices,
    metadata: {
      startDay: 0,
      endDay: totalDays - 1,
      lowestValue,
      highestValue,
    },
  }
}
