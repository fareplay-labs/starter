/**
 * multi-period-orchestrator.js
 *
 * Puts everything together:
 *  - Chooses how many periods (humps)
 *  - Generates each hump using beta-curve-utils
 *  - Inserts valleys between humps (using valley-generator)
 *  - Adds optional tails at the beginning and end (if desired)
 *  - Calculates final stats
 */

import { randBetween } from './math-utils'
import { generateValleysBetweenPeriods, generateValley } from './valley-generator'
import { generateTail, generateZeroReturnSeries } from './tail-generator'
import { generatePriceSeries } from './beta-curve-utils'

/* ---------------------------------------------
   1) PERIOD PARAMETER CALCULATIONS
   --------------------------------------------- */
function calculatePeriodParameters(totalArea, minSellPrice, tradingStartDay, tradingDuration) {
  // maxPossibleDays if you needed minSellPrice daily (within trading window)
  const maxPossibleDays = Math.floor(totalArea / minSellPrice)

  // targetDaysAboveSell (30-70% of trading duration)
  const targetDaysAboveSell = Math.floor(
    Math.min(maxPossibleDays, tradingDuration) * (0.3 + Math.random() * 0.4)
  )

  // areaRatio based on trading duration
  const avgDailyReturn = totalArea / tradingDuration
  const areaRatio = avgDailyReturn / minSellPrice

  // Decide humpCount
  let humpCount
  if (areaRatio < 0.3) {
    humpCount = 1
  } else {
    const maxHumps = Math.min(
      4, // cap at 4
      Math.floor(tradingDuration / 20),
      Math.floor(areaRatio * 4)
    )
    const rnd = Math.random()
    if (rnd < 0.3) humpCount = 1
    else if (rnd < 0.6) humpCount = 2
    else if (rnd < 0.85) humpCount = 3
    else humpCount = maxHumps
  }

  // Days per period constraints (based on trading duration)
  const maxDaysForArea = Math.floor(totalArea / (minSellPrice * humpCount))
  const maxDaysPerHump = Math.floor(tradingDuration / humpCount)

  const minDaysPerPeriod = Math.max(
    8,
    Math.min(Math.floor(targetDaysAboveSell / (humpCount * 2)), Math.floor(maxDaysPerHump * 0.3))
  )

  const maxDaysPerPeriod = Math.min(
    maxDaysForArea,
    Math.floor((targetDaysAboveSell / humpCount) * 1.5),
    Math.floor(maxDaysPerHump * 0.8)
  )

  // If can't satisfy constraints, reduce humpCount recursively
  if (maxDaysPerPeriod < minDaysPerPeriod) {
    return calculatePeriodParameters(totalArea, minSellPrice, tradingStartDay, tradingDuration)
  }

  // Gaps (within trading window)
  const maxTotalPeriodDays = maxDaysPerPeriod * humpCount
  const remainingDays = tradingDuration - maxTotalPeriodDays
  const minGapDays = Math.max(2, Math.floor(remainingDays / (humpCount + 1)))
  const maxGapDays = Math.max(minGapDays * 2, Math.floor(remainingDays / humpCount))

  return {
    humpCount,
    minDaysPerPeriod,
    maxDaysPerPeriod,
    minGapDays,
    maxGapDays,
    targetDaysAboveSell,
  }
}

/* ---------------------------------------------
   2) MULTI-PERIOD SERIES (MAIN ORCHESTRATION)
   --------------------------------------------- */

export function generateMultiPeriodSeries({ curveParams, tradingParams }) {
  // Validate and ensure totalDays is a positive integer
  const totalDays = Math.max(1, Math.floor(curveParams.totalDays))

  // Special case: If totalArea is 0, generate a series that stays below minSellPrice
  if (curveParams.totalArea === 0) {
    const zeroReturnData = generateZeroReturnSeries({
      totalDays,
      startPrice: tradingParams.startPrice,
      minSellPrice: tradingParams.minSellPrice,
      volatility: 0.03,
    })

    return {
      periods: [],
      valleys: [],
      tails: [],
      combinedPrices: zeroReturnData.prices,
      stats: {
        totalReturn: 0,
        targetReturn: 0,
        maxPrice: zeroReturnData.metadata.highestValue,
        minPrice: zeroReturnData.metadata.lowestValue,
        avgPrice: zeroReturnData.prices.reduce((a, b) => a + b, 0) / totalDays,
        periodReturns: [],
        periodWeights: [],
        periodLengths: [],
        gaps: [],
        valleys: [],
        tails: [],
        debug: {
          totalDaysAboveMinSell: 0,
          percentTimeAboveMinSell: '0%',
          totalFloorArea: 0,
          totalTargetAboveMinSell: 0,
          totalActualAboveMinSell: 0,
        },
      },
      metadata: {
        totalDays,
        periodCount: 0,
        periodLengths: [],
        weights: [],
        gaps: [],
        offsets: [],
      },
    }
  }

  // Validate trading parameters
  const tradingStartDay = Math.max(0, Math.floor(tradingParams.startDay))
  const tradingDuration = Math.max(1, Math.floor(tradingParams.sellDuration))
  const tradingEndDay = Math.min(totalDays - 1, tradingStartDay + tradingDuration - 1)

  // 2.1) Calculate dynamic parameters within trading window
  const periodParams = calculatePeriodParameters(
    curveParams.totalArea,
    tradingParams.minSellPrice,
    tradingStartDay,
    tradingDuration
  )

  // Check if average return per period is unrealistically high
  const avgReturnPerPeriod = curveParams.totalArea / periodParams.humpCount
  const avgValuePerPeriod = avgReturnPerPeriod / (periodParams.maxDaysPerPeriod * 0.5)
  const returnRatio = avgValuePerPeriod / tradingParams.minSellPrice

  // If average value is more than 10x the sell price, force single period
  if (returnRatio > 10 && periodParams.humpCount > 1) {
    // Recalculate with forced single period
    periodParams.humpCount = 1
    // Adjust other parameters for the single period
    periodParams.minDaysPerPeriod = Math.max(
      periodParams.minDaysPerPeriod,
      Math.floor(curveParams.totalDays * 0.3)
    )
    periodParams.maxDaysPerPeriod = Math.floor(curveParams.totalDays * 0.7)
  }

  const periods = []
  const periodCount = periodParams.humpCount

  // 2.2) Adjust start/end days to trading window
  const minStartDay = tradingStartDay
  const maxEndDay = tradingStartDay + tradingDuration - 1

  // 2.3) Random weights to distribute totalArea among humps
  const rawWeights = Array(periodCount)
    .fill(0)
    .map(() => Math.random())
  const totalWeight = rawWeights.reduce((sum, w) => sum + w, 0)
  const normalizedWeights = rawWeights.map(w => w / totalWeight)

  // 2.4) Random period lengths
  const periodLengths = Array(periodCount)
    .fill(0)
    .map(() =>
      Math.floor(randBetween(periodParams.minDaysPerPeriod, periodParams.maxDaysPerPeriod))
    )

  // 2.5) Calculate total length and minimum gap usage
  const totalPeriodLength = periodLengths.reduce((sum, len) => sum + len, 0)
  const minGapsLength = (periodCount - 1) * periodParams.minGapDays

  // 2.6) Distribute extra gap space
  const availableSpace = maxEndDay - minStartDay - totalPeriodLength - minGapsLength
  const extraGapSpace = Math.max(0, availableSpace)

  // 2.7) Calculate gaps, including potential initial gap
  const shouldStartWithValley = Math.random() < 0.4 // 40% chance to start with valley
  const minInitialGap = shouldStartWithValley ? 5 : 0 // Enforce minimum 5-day gap if starting with valley

  const initialGap =
    shouldStartWithValley ?
      Math.floor(
        minInitialGap +
          Math.random() *
            Math.min(
              tradingDuration * 0.4, // Allow up to 40% of trading duration
              Math.max(10, extraGapSpace * 0.5) // At least 10 days if space allows
            )
      )
    : 0 // No gap if not starting with valley

  const remainingExtraSpace = Math.max(0, extraGapSpace - initialGap)
  const gaps = Array(periodCount - 1)
    .fill(0)
    .map(() =>
      Math.floor(
        periodParams.minGapDays + (remainingExtraSpace / (periodCount - 1)) * Math.random()
      )
    )

  // 2.8) Calculate offsets, starting with potential gap
  let currentPosition = minStartDay + initialGap
  const offsets = [currentPosition]
  for (let i = 1; i < periodCount; i++) {
    currentPosition += periodLengths[i - 1] + gaps[i - 1]
    offsets.push(currentPosition)
  }

  // 2.9) Calculate total floor area
  const totalFloorArea = periodLengths.reduce(
    (sum, length) => sum + length * tradingParams.minSellPrice,
    0
  )
  // Remaining area above minSellPrice
  const totalAreaAboveMinSell = Math.max(0, curveParams.totalArea - totalFloorArea)

  // 2.10) Generate each period (hump)
  for (let i = 0; i < periodCount; i++) {
    let periodLength = periodLengths[i]
    const weight = normalizedWeights[i]
    const floorArea = periodLength * tradingParams.minSellPrice
    let targetAreaAboveMinSell = totalAreaAboveMinSell * weight

    // Single-hump generation
    let periodData = generatePriceSeries({
      curveParams: {
        ...curveParams,
        totalArea: targetAreaAboveMinSell,
        daysCount: periodLength,
      },
      tradingParams,
    })

    // TODO: Specify rule for when to apply first period trimming
    // For first period, only trim and rescale if it starts at trading start day
    if (i === 0 && offsets[0] === tradingStartDay) {
      // Calculate trim percentage (10-90%)
      const trimRatio = randBetween(0.1, 0.9)
      const trimIndex = Math.floor(periodData.prices.length * trimRatio)

      // Calculate original area of remaining portion
      const remainingPrices = periodData.prices.slice(trimIndex)
      const remainingArea = remainingPrices.reduce((sum, p) => sum + p, 0)

      // Calculate scale factor to maintain total area
      const scaleFactor = targetAreaAboveMinSell / remainingArea

      // Apply scaling to remaining portion
      const scaledPrices = remainingPrices.map(p => p * scaleFactor)

      // Update period data
      periodData.prices = scaledPrices
      periodLength = scaledPrices.length
      periodLengths[i] = periodLength

      // Adjust subsequent offsets
      for (let j = i + 1; j < periodCount; j++) {
        offsets[j] = offsets[j - 1] + periodLengths[j - 1] + (gaps[j - 1] || 0)
      }
    }

    // TODO: Specify rule for when to apply last period trimming
    // For last period, trim right side and rescale only if it extends beyond trading window
    // AND we randomly decide to trim it (70% chance to trim)
    if (i === periodCount - 1) {
      const periodEndDay = offsets[i] + periodLength - 1
      const exceedsTradingWindow = periodEndDay > tradingEndDay
      const shouldTrim = Math.random() < 0.7 // 70% chance to trim

      if (exceedsTradingWindow && shouldTrim) {
        // Calculate how much we need to trim to end exactly at tradingEndDay
        const daysToTrim = periodEndDay - tradingEndDay
        const trimRatio = daysToTrim / periodLength
        const trimIndex = Math.floor(periodData.prices.length * (1 - trimRatio))

        // Calculate original area of remaining portion
        const remainingPrices = periodData.prices.slice(0, trimIndex)
        const remainingArea = remainingPrices.reduce((sum, p) => sum + p, 0)

        // Calculate scale factor to maintain total area
        const scaleFactor = targetAreaAboveMinSell / remainingArea

        // Apply scaling to remaining portion
        const scaledPrices = remainingPrices.map(p => p * scaleFactor)

        // Update period data
        periodData.prices = scaledPrices
        periodLength = scaledPrices.length
        periodLengths[i] = periodLength
      }
    }

    // Evaluate spikiness/flatness
    const totalArea = periodData.prices.reduce((s, p) => s + p, 0)
    const areaAboveMinSell = periodData.prices.reduce(
      (s, p) => s + Math.max(0, p - tradingParams.minSellPrice),
      0
    )
    const areaDensity = areaAboveMinSell / periodLength
    const targetDensity = targetAreaAboveMinSell / periodLength
    const densityRatio = areaDensity / targetDensity

    // If too flat or too spiky, adjust length
    if (
      Math.abs(totalArea - periodLength * tradingParams.minSellPrice) < 0.01 ||
      densityRatio > 2
    ) {
      let newLength
      if (densityRatio > 1.25) {
        // Too spiky => lengthen (up to 2x)
        newLength = Math.min(
          Math.floor(periodLength * Math.min(densityRatio, 2)),
          periodParams.maxDaysPerPeriod
        )
      } else {
        // Too flat => shorten
        newLength = Math.max(5, Math.floor(periodLength * 0.4))
      }

      if (newLength !== periodLength) {
        periodData = generatePriceSeries({
          curveParams: {
            ...curveParams,
            totalArea: targetAreaAboveMinSell,
            daysCount: newLength,
          },
          tradingParams,
        })

        // Update length + adjust subsequent offsets
        periodLength = newLength
        periodLengths[i] = newLength
        for (let j = i + 1; j < periodCount; j++) {
          offsets[j] = offsets[j - 1] + periodLengths[j - 1] + (gaps[j - 1] || 0)
        }
      }
    }

    // Shift final prices up by minSellPrice
    const shiftedPrices = periodData.prices.map(p => p + tradingParams.minSellPrice)

    // Store
    periods.push({
      ...periodData,
      prices: shiftedPrices,
      metadata: {
        ...periodData.metadata,
        periodIndex: i,
        dayOffset: offsets[i],
        weight,
        originalWeight: normalizedWeights[i],
        weightAdjustment: 0,
        gapAfter: gaps[i] || 0,
        length: periodLength,
        originalLength: periodLengths[i],
        lengthAdjustment: periodLengths[i] - periodLength,
        totalPeriodTarget: targetAreaAboveMinSell,
        floorArea,
        targetAreaAboveMinSell,
        actualAreaAboveMinSell: shiftedPrices.reduce(
          (s, price) => s + Math.max(0, price - tradingParams.minSellPrice),
          0
        ),
      },
    })
  }

  // 2.11) Generate valleys between periods (still constrained by minSellPrice)
  const midValleys = []

  // Generate initial valley if there's a gap before first period
  let initialValleyStartValue = null
  if (periods.length > 0 && initialGap > 0) {
    const firstPeriod = periods[0]
    initialValleyStartValue = tradingParams.minSellPrice * randBetween(0.3, 0.7)
    const valley = generateValley({
      startDay: tradingStartDay,
      endDay: firstPeriod.metadata.dayOffset - 1,
      startValue: initialValleyStartValue,
      endValue: firstPeriod.prices[0],
      minSellPrice: tradingParams.minSellPrice,
      volatility: 0.4,
      valleyDepth: 0.9,
    })
    midValleys.push(valley)
  }

  // Generate valleys between consecutive humps
  if (periods.length > 1) {
    const betweenPeriodValleys = generateValleysBetweenPeriods(periods, {
      volatility: 0.4,
      valleyDepth: 0.9,
      minSellPrice: tradingParams.minSellPrice,
    })
    midValleys.push(...betweenPeriodValleys)
  }

  // Generate valley after the last hump if it ends before trading window
  // This applies to both single and multiple humps
  if (periods.length > 0) {
    const lastPeriod = periods[periods.length - 1]
    const lastPeriodEnd = lastPeriod.metadata.dayOffset + lastPeriod.metadata.length - 1

    if (lastPeriodEnd < tradingEndDay) {
      const valley = generateValley({
        startDay: lastPeriodEnd,
        endDay: tradingEndDay,
        startValue: lastPeriod.prices[lastPeriod.prices.length - 1],
        endValue: tradingParams.minSellPrice * randBetween(0.3, 0.7),
        minSellPrice: tradingParams.minSellPrice,
        volatility: 0.4,
        valleyDepth: 0.9,
      })
      midValleys.push(valley)
    }
  }

  // 2.12) Create initial tail
  const initialTail = generateTail({
    startDay: 0,
    endDay: tradingStartDay - 1,
    startValue: tradingParams.startPrice,
    // If we start with a valley, end at its start value
    // Otherwise, end at first period's start price or minSellPrice
    endValue:
      initialValleyStartValue ??
      (periods.length > 0 ? periods[0].prices[0] : tradingParams.minSellPrice),
    volatility: 0.02,
    minSellPrice: tradingParams.minSellPrice,
  })

  // 2.13) Create TAILS (instead of initial/final valleys)
  const tails = []
  if (periodCount > 0) {
    const firstPeriod = periods[0]
    const lastPeriod = periods[periods.length - 1]

    // --- Pre-tail: from day 0 to offsets[0] - 1 ---
    if (offsets[0] > 0 && firstPeriod) {
      // End the tail exactly at the first period's start price
      const preTailEndPrice = firstPeriod.prices[0]

      const preTail = generateTail({
        startDay: 0,
        endDay: offsets[0] - 1,
        startValue: tradingParams.startPrice,
        endValue: preTailEndPrice,
        // Tweak these as you like:
        volatility: 0.02,
        drift: 0.0,
        minFloor: 0.01,
        reflectionStrength: 0.5,
      })
      tails.push(preTail)
    }

    // --- Post-tail: from lastPeriodEnd + 1 to totalDays - 1 ---
    if (lastPeriod) {
      const lastPeriodEnd = lastPeriod.metadata.dayOffset + lastPeriod.metadata.length - 1
      if (lastPeriodEnd < curveParams.totalDays - 1) {
        const postTailStartValue = lastPeriod.prices[lastPeriod.prices.length - 1]

        // Option A: Let user specify a final end price
        // Option B: Or pick a random "endValue" above/below the start
        const postTailEndValue =
          tradingParams.postTailEndPrice ?? randBetween(postTailStartValue, postTailStartValue * 3)

        const postTail = generateTail({
          startDay: lastPeriodEnd + 1,
          endDay: curveParams.totalDays - 1,
          startValue: postTailStartValue,
          endValue: postTailEndValue,
          volatility: 0.02,
          drift: 0.0,
          minFloor: 0.01,
          reflectionStrength: 0.5,
        })
        tails.push(postTail)
      }
    }
  }

  const combinedPrices = new Array(totalDays).fill(0)

  // Insert initial tail
  initialTail.prices.forEach((price, dayIndex) => {
    combinedPrices[dayIndex] = price
  })

  // Insert period data
  periods.forEach(period => {
    period.prices.forEach((price, dayIndex) => {
      combinedPrices[period.metadata.dayOffset + dayIndex] = price
    })
  })

  // Insert valleys
  midValleys.forEach(valley => {
    valley.prices.forEach((price, dayIndex) => {
      combinedPrices[valley.metadata.startDay + dayIndex] = price
    })
  })

  // Insert post-trading tail if needed
  const lastDay = Math.max(
    ...periods.map(p => p.metadata.dayOffset + p.metadata.length - 1),
    ...midValleys.map(v => v.metadata.endDay)
  )

  if (lastDay < curveParams.totalDays - 1) {
    const startValue = combinedPrices[lastDay]
    const direction = Math.random() < 0.5 ? 'up' : 'down' // 50% chance to go up or down

    // Calculate end value based on direction
    let endValue
    if (direction === 'up') {
      endValue = startValue * randBetween(1.2, 3.0) // 20% to 200% increase
    } else {
      endValue = startValue * randBetween(0.2, Math.pow(50, 0.5)) // 20% to 7.07% of start value
    }

    const postTail = generateTail({
      startDay: lastDay + 1,
      endDay: curveParams.totalDays - 1,
      startValue: startValue,
      endValue: endValue,
      volatility: 0.02,
      minSellPrice: tradingParams.minSellPrice,
      direction,
    })

    postTail.prices.forEach((price, dayIndex) => {
      combinedPrices[postTail.metadata.startDay + dayIndex] = price
    })

    tails.push(postTail)
  }

  // Add initial tail to tails array
  tails.unshift(initialTail)

  // 2.15) Compile final stats
  const combinedStats = {
    // Sum area above minSellPrice across all periods
    totalReturn: periods.reduce(
      (sum, period) =>
        sum +
        period.prices.reduce(
          (periodSum, price) => periodSum + Math.max(0, price - tradingParams.minSellPrice),
          0
        ),
      0
    ),
    targetReturn: curveParams.totalArea,

    maxPrice: Math.max(
      ...periods.map(p => Math.max(...p.prices)),
      ...midValleys.map(v => v.metadata.highestValue),
      ...tails.map(t => t.metadata.highestValue)
    ),
    minPrice: Math.min(
      ...periods.map(p => Math.min(...p.prices)),
      ...midValleys.map(v => v.metadata.lowestValue),
      ...tails.map(t => t.metadata.lowestValue)
    ),
    avgPrice: combinedPrices.reduce((a, b) => a + b, 0) / curveParams.totalDays,

    // Per-period information
    startPrices: periods.map(p => p.prices[0]),
    periodReturns: periods.map(p =>
      p.prices.reduce((sum, price) => sum + Math.max(0, price - tradingParams.minSellPrice), 0)
    ),
    periodWeights: normalizedWeights.map(w => (w * 100).toFixed(1) + '%'),
    periodLengths,
    gaps,

    // Valley info
    valleys: midValleys.map(v => ({
      startDay: v.metadata.startDay,
      endDay: v.metadata.endDay,
      lowestValue: v.metadata.lowestValue,
      highestValue: v.metadata.highestValue,
    })),

    // Tail info
    tails: tails.map((t, idx) => ({
      index: idx,
      startDay: t.metadata.startDay,
      endDay: t.metadata.endDay,
      lowestValue: t.metadata.lowestValue,
      highestValue: t.metadata.highestValue,
    })),

    // Debug
    debug: {
      totalDaysAboveMinSell: combinedPrices.filter(p => p > tradingParams.minSellPrice).length,
      percentTimeAboveMinSell:
        (
          (combinedPrices.filter(p => p > tradingParams.minSellPrice).length /
            curveParams.totalDays) *
          100
        ).toFixed(1) + '%',
      totalFloorArea: periods.reduce((sum, p) => sum + p.metadata.floorArea, 0),
      totalTargetAboveMinSell: periods.reduce(
        (sum, p) => sum + p.metadata.targetAreaAboveMinSell,
        0
      ),
      totalActualAboveMinSell: periods.reduce(
        (sum, p) => sum + p.metadata.actualAreaAboveMinSell,
        0
      ),
    },
  }

  // 2.16) Return everything
  return {
    periods,
    valleys: midValleys,
    tails,
    combinedPrices,
    stats: combinedStats,
    metadata: {
      totalDays,
      periodCount,
      periodLengths,
      weights: normalizedWeights,
      gaps,
      offsets,
    },
  }
}
