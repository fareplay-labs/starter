/**
 * Valley Generator - Creates realistic price movements between two points
 * using a controlled random walk that never exceeds the sell price
 * and never gets pinned to zero.
 */

import { randNormal, randBetween } from "./math-utils";

/**
 * Generate a valley between two points using a random walk,
 * ensuring prices never rise above `minSellPrice` and never get stuck at 0.
 */
export function generateValley({
  startDay,
  startValue,
  endDay,
  endValue,
  // Sell line: price can't exceed this
  minSellPrice = 10,
  // Average daily price movement
  volatility = 0.03,
  // Deeper valleys if you increase this
  valleyDepth = 0.4,
  // True for extended dips at boundaries (e.g., first or last valley)
  isEdgeValley = false,
  // Partial reflection factor when overshooting ceiling or undershooting floor
  reflectionStrength = 0.5,
}) {
  const daysCount = endDay - startDay + 1;
  if (daysCount <= 1) {
    return {
      prices: [startValue],
      metadata: {
        startDay,
        endDay,
        lowestValue: startValue,
        highestValue: startValue,
      },
    };
  }

  // --------------------------------------------------------
  // 1) Define the "ceiling" as the sell line.
  // --------------------------------------------------------
  const valleyCeiling = minSellPrice;

  // --------------------------------------------------------
  // 2) Determine a reasonable floor so we don't get stuck at 0.
  //    For edge valleys, allow a deeper floor, but not below a
  //    small fraction of start/end if they're both near zero.
  // --------------------------------------------------------
  const baseFloor = Math.min(startValue, endValue) * (1 - valleyDepth);
  const extendedFloor = isEdgeValley ? baseFloor * 0.5 : baseFloor;
  // If startValue/endValue are near zero, shift the floor slightly above 0
  // so we have some room to move up/down in the random walk.
  const minimalFloor = Math.min(startValue, endValue) < 0.01 ? 0.01 : 0;
  // Final floor:
  const lowestAllowedPrice = Math.max(extendedFloor, minimalFloor);

  // --------------------------------------------------------
  // 3) Initialize the random walk array
  // --------------------------------------------------------
  const prices = new Array(daysCount).fill(0);
  prices[0] = startValue;
  prices[daysCount - 1] = endValue;

  // Pick a "valley center" somewhere in the middle third
  const midPoint = Math.floor(daysCount / 2);
  const valleyCenter =
    midPoint + Math.floor(randBetween(-daysCount / 6, daysCount / 6));

  // We'll aim for a target low near the valley floor
  const targetLow = lowestAllowedPrice * randBetween(1, 1.2);

  // Helper function to apply partial reflection
  function reflectIfNeeded(price) {
    // Reflect if above the sell line
    if (price > valleyCeiling) {
      const overshoot = price - valleyCeiling;
      return valleyCeiling - overshoot * reflectionStrength;
    }
    // Reflect if below the floor
    if (price < lowestAllowedPrice) {
      const undershoot = lowestAllowedPrice - price;
      return lowestAllowedPrice + undershoot * reflectionStrength;
    }
    return price;
  }

  // --------------------------------------------------------
  // 4) FORWARD PASS (start -> valley center)
  // --------------------------------------------------------
  let currentPrice = startValue;
  let prevChange = 0;

  for (let i = 1; i < valleyCenter; i++) {
    const progress = i / valleyCenter;
    // Interpolate between startValue and target low
    const targetPrice = startValue * (1 - progress) + targetLow * progress;

    // Downward bias if near or above the ceiling
    const ceilingGap = currentPrice - valleyCeiling;
    const ceilingBias =
      ceilingGap > 0
        ? -Math.pow(ceilingGap / valleyCeiling, 0.5) * currentPrice * 0.5
        : 0;

    // Bias toward the target low
    const targetGap = currentPrice - targetPrice;
    const targetBias =
      -Math.pow(progress, 0.5) * targetGap * (isEdgeValley ? 0.2 : 0.15);

    // Momentum from previous step
    const momentum = prevChange * (isEdgeValley ? 0.4 : 0.3);

    // Combine biases
    const downwardBias = targetBias + ceilingBias + momentum;

    // Volatility: smaller if near the ceiling
    const ceilingFactor =
      ceilingGap > 0 ? Math.max(0.2, 1 - ceilingGap / valleyCeiling) : 1;
    const baseVolatility =
      Math.max(isEdgeValley ? 0.01 : 0.005, volatility) *
      currentPrice *
      ceilingFactor;
    const distanceVolatility =
      Math.abs(targetGap) * (isEdgeValley ? 0.15 : 0.1) * ceilingFactor;
    const currentVolatility = Math.max(baseVolatility, distanceVolatility);

    // Step
    const change = randNormal(downwardBias, currentVolatility);
    prevChange = change;
    let newPrice = currentPrice + change;
    newPrice = reflectIfNeeded(newPrice);

    currentPrice = newPrice;
    prices[i] = currentPrice;
  }

  // --------------------------------------------------------
  // 5) BACKWARD PASS (end -> valley center)
  // --------------------------------------------------------
  currentPrice = endValue;
  prevChange = 0;

  for (let i = daysCount - 2; i >= valleyCenter; i--) {
    const progress = (daysCount - 1 - i) / (daysCount - 1 - valleyCenter);
    // Interpolate between endValue and targetLow
    const targetPrice = endValue * (1 - progress) + targetLow * progress;

    // Downward bias if near or above the ceiling
    const ceilingGap = currentPrice - valleyCeiling;
    const ceilingBias =
      ceilingGap > 0
        ? -Math.pow(ceilingGap / valleyCeiling, 0.5) * currentPrice * 0.5
        : 0;

    // Bias toward the target low
    const targetGap = currentPrice - targetPrice;
    const targetBias =
      -Math.pow(progress, 0.5) * targetGap * (isEdgeValley ? 0.2 : 0.15);

    // Momentum from previous step
    const momentum = prevChange * (isEdgeValley ? 0.4 : 0.3);

    // Combine biases
    const downwardBias = targetBias + ceilingBias + momentum;

    // Volatility: smaller if near the ceiling
    const ceilingFactor =
      ceilingGap > 0 ? Math.max(0.2, 1 - ceilingGap / valleyCeiling) : 1;
    const baseVolatility =
      Math.max(isEdgeValley ? 0.01 : 0.005, volatility) *
      currentPrice *
      ceilingFactor;
    const distanceVolatility =
      Math.abs(targetGap) * (isEdgeValley ? 0.15 : 0.1) * ceilingFactor;
    const currentVolatility = Math.max(baseVolatility, distanceVolatility);

    // Step
    const change = randNormal(downwardBias, currentVolatility);
    prevChange = change;
    let newPrice = currentPrice + change;
    newPrice = reflectIfNeeded(newPrice);

    currentPrice = newPrice;
    prices[i] = currentPrice;
  }

  // --------------------------------------------------------
  // 6) SMOOTHING AROUND THE VALLEY CENTER
  // --------------------------------------------------------
  const smoothingWindow = Math.max(2, Math.floor(daysCount * 0.1));
  for (
    let i = Math.max(1, valleyCenter - smoothingWindow);
    i < Math.min(daysCount - 1, valleyCenter + smoothingWindow);
    i++
  ) {
    const windowStart = Math.max(0, i - 2);
    const windowEnd = Math.min(daysCount - 1, i + 2);
    const windowPrices = prices.slice(windowStart, windowEnd + 1);

    // Weight center points more
    const weights = windowPrices.map(
      (_, idx) =>
        1 -
        Math.abs(idx - Math.floor(windowPrices.length / 2)) /
          windowPrices.length
    );
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    prices[i] =
      windowPrices.reduce((sum, val, idx) => sum + val * weights[idx], 0) /
      totalWeight;
  }

  // --------------------------------------------------------
  // 7) COLLECT METADATA
  // --------------------------------------------------------
  let highestValue = -Infinity;
  let lowestValue = Infinity;
  for (const price of prices) {
    if (price > highestValue) highestValue = price;
    if (price < lowestValue) lowestValue = price;
  }

  return {
    prices,
    metadata: {
      startDay,
      endDay,
      lowestValue,
      highestValue,
      valleyDepth,
      volatility,
      valleyCeiling,
    },
  };
}

/**
 * Generate valleys between multiple periods
 * Ensures each valley never exceeds minSellPrice and doesn't get stuck at 0.
 */
export function generateValleysBetweenPeriods(periods, options = {}) {
  const valleys = [];

  for (let i = 0; i < periods.length - 1; i++) {
    const currentPeriod = periods[i];
    const nextPeriod = periods[i + 1];

    const startDay =
      currentPeriod.metadata.dayOffset + currentPeriod.metadata.length;
    const endDay = nextPeriod.metadata.dayOffset - 1;

    if (endDay > startDay) {
      const valley = generateValley({
        startDay,
        endDay,
        // Start from last price in current period
        startValue: currentPeriod.prices[currentPeriod.prices.length - 1],
        // End at first price in next period
        endValue: nextPeriod.prices[0],
        // Force never exceeding minSellPrice
        minSellPrice: options.minSellPrice ?? 10,
        isEdgeValley: false,
        ...options,
      });
      valleys.push(valley);
    }
  }

  return valleys;
}
