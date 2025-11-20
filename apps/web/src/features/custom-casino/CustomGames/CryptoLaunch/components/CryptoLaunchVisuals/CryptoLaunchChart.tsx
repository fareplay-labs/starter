// @ts-nocheck
import React, { useMemo, useRef, useState, useEffect } from 'react'
import { styled } from 'styled-components'
import { CRYPTO_LAUNCH_TIMINGS } from '../../animations'
import { type CryptoLaunchParameters, type CryptoLaunchEntry } from '../../types'

interface CryptoLaunchChartProps {
  parameters: CryptoLaunchParameters
  entry: CryptoLaunchEntry
  priceData: number[]
  currentDay: number
  isInSellWindow: boolean
  isAboveMinSell: boolean
}

// Use constants from animations file for consistency

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: ${CRYPTO_LAUNCH_TIMINGS.CHART_PADDING}px;
  box-sizing: border-box;
  position: relative;
`

const ChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`

const StaticLine = styled.line`
  stroke-width: 2;
  stroke-dasharray: 5, 5;
`

const PriceLine = styled.path`
  fill: none;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
`

const WinArea = styled.path``

const SellWindow = styled.rect`
  fill: rgba(255, 255, 255, 0.1);
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 1;
  stroke-dasharray: 3, 3;
`

const Label = styled.text`
  font-size: 12px;
  font-family: monospace;
`

export const CryptoLaunchChart: React.FC<CryptoLaunchChartProps> = ({
  parameters,
  entry,
  priceData,
  currentDay,
  isInSellWindow,
  isAboveMinSell,
}) => {
  // Extract entry values for gameplay parameters
  const { startPrice, minSellPrice, startDay, endDay } = entry.side
  
  // Extract visual parameters
  const {
    chartColor,
    winColor,
    highlightOpacity,
    showXAxis,
    showDayLabels,
    showGrid,
    gridColor,
    textColor,
  } = parameters
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerDims, setContainerDims] = useState({ width: 0, height: 0 })

  // ---- Animated Y-axis scale domain ----
  const [scaleDomain, setScaleDomain] = useState(() => {
    const initialMin = Math.min(startPrice, minSellPrice)
    const initialMax = Math.max(startPrice, minSellPrice, 10) // Set default max to 10
    const margin = (initialMax - initialMin) * 0.1 || 1
    return { min: Math.max(0, initialMin - margin), max: Math.max(initialMax + margin, 10) }
  })

  // Adjust the scale domain smoothly as the animation progresses.
  useEffect(() => {
    const lookaheadIndex = Math.min(
      priceData.length - 1,
      currentDay + CRYPTO_LAUNCH_TIMINGS.CHART_LOOKAHEAD_DAYS
    )
    const visiblePrices = priceData.slice(0, lookaheadIndex + 1)

    if (visiblePrices.length === 0) return

    const targetMax = Math.max(...visiblePrices, minSellPrice, startPrice, 10) // Ensure minimum max of 10
    const targetMin = Math.min(...visiblePrices, startPrice)

    const margin = (targetMax - targetMin) * CRYPTO_LAUNCH_TIMINGS.PRICE_MARGIN_PERCENT || 1
    const desiredMax = Math.max(targetMax + margin, 10) // Ensure minimum max of 10
    const desiredMin = Math.max(0, targetMin - margin)

    setScaleDomain(prev => {
      // If we're at the beginning of a new run (day 0) we reset immediately
      if (currentDay === 0) {
        return { min: desiredMin, max: desiredMax }
      }

      const nextMax =
        prev.max + (desiredMax - prev.max) * CRYPTO_LAUNCH_TIMINGS.SCALE_SMOOTHING_RATE
      const nextMin =
        prev.min + (desiredMin - prev.min) * CRYPTO_LAUNCH_TIMINGS.SCALE_SMOOTHING_RATE

      // Prevent endless tiny updates that would trigger extra re-renders
      if (
        Math.abs(nextMax - prev.max) < CRYPTO_LAUNCH_TIMINGS.SCALE_UPDATE_THRESHOLD &&
        Math.abs(nextMin - prev.min) < CRYPTO_LAUNCH_TIMINGS.SCALE_UPDATE_THRESHOLD
      ) {
        return prev
      }

      return { min: nextMin, max: nextMax }
    })
  }, [priceData.length, currentDay, minSellPrice, startPrice])

  // Observe container resize to keep chart responsive
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setContainerDims({ width, height })
      }
    })

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  const chartData = useMemo(() => {
    const margin = { top: 20, right: 20, bottom: 40, left: 60 }

    // Inner drawable dimensions based on container minus padding & margins
    const drawableWidth = Math.max(
      containerDims.width - CRYPTO_LAUNCH_TIMINGS.CHART_PADDING * 2 - margin.left - margin.right,
      0
    )
    const drawableHeight = Math.max(
      containerDims.height - CRYPTO_LAUNCH_TIMINGS.CHART_PADDING * 2 - margin.top - margin.bottom,
      0
    )

    // Use the available width/height for the chart grid (non-square)
    const chartWidth = drawableWidth
    const chartHeight = drawableHeight

    // Fallback if container size not yet measured
    const svgWidth = drawableWidth + margin.left + margin.right || 800
    const svgHeight = drawableHeight + margin.top + margin.bottom || 400
    // X-axis: 365 days (1 year)
    const xScale = (day: number) => (day / 365) * chartWidth
    const maxPrice = scaleDomain.max
    const minPriceValue = scaleDomain.min
    const priceRange = Math.max(maxPrice - minPriceValue, CRYPTO_LAUNCH_TIMINGS.MIN_PRICE_RANGE)
    const yScale = (price: number) =>
      chartHeight - ((price - minPriceValue) / priceRange) * chartHeight

    // Generate price line path (only up to current day)
    const visibleData = priceData.slice(0, currentDay + 1)
    const pricePath = visibleData
      .map((price: number, index: number) => {
        const x = xScale(index)
        const y = yScale(price)
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')

    // Generate win area path (area above min sell price within sell window)
    const winAreaPath: string[] = []
    const sellWindowStart = Math.max(startDay, 0)
    const sellWindowEnd = Math.min(endDay, currentDay)

    for (let day = sellWindowStart; day <= sellWindowEnd; day++) {
      const price = priceData[day]
      if (price !== undefined && price >= minSellPrice) {
        const x = xScale(day)
        const yPrice = yScale(price)
        const yMinSell = yScale(minSellPrice)

        if (winAreaPath.length === 0) {
          winAreaPath.push(`M ${x} ${yMinSell}`)
        }
        winAreaPath.push(`L ${x} ${yPrice}`)
      }
    }

    // Close the path back to the min sell line
    if (winAreaPath.length > 0) {
      const lastDay = Math.min(endDay, sellWindowEnd)
      const x = xScale(lastDay)
      const yMinSell = yScale(minSellPrice)
      winAreaPath.push(`L ${x} ${yMinSell}`)
      winAreaPath.push('Z')
    }

    // Grid lines
    const gridLines = []
    // Horizontal grid lines (price levels)
    for (let i = 0; i <= 10; i++) {
      const price = minPriceValue + (priceRange * i) / 10
      const y = yScale(price)
      gridLines.push({
        type: 'horizontal',
        x1: 0,
        y1: y,
        x2: chartWidth,
        y2: y,
        label: price.toFixed(1),
      })
    }

    // Vertical grid lines (time intervals)
    for (let month = 0; month <= 12; month++) {
      const day = (month * 365) / 12
      const x = xScale(day)
      gridLines.push({
        type: 'vertical',
        x1: x,
        y1: 0,
        x2: x,
        y2: chartHeight,
        // Label months 1-12 only; skip label at month 0 (0m) and month 12 (already 12m)
        label:
          month === 0 ? ''
          : month === 12 ? '12m'
          : `${month}m`,
      })
    }

    return {
      width: svgWidth,
      height: svgHeight,
      margin,
      chartWidth,
      chartHeight,
      xScale,
      yScale,
      pricePath,
      winAreaPath: winAreaPath.join(' '),
      gridLines,
      maxPrice,
      minPriceValue,
    }
  }, [
    priceData,
    currentDay,
    startPrice,
    minSellPrice,
    startDay,
    endDay,
    isInSellWindow,
    isAboveMinSell,
    containerDims.width,
    containerDims.height,
    scaleDomain.min,
    scaleDomain.max,
  ])

  return (
    <ChartContainer ref={containerRef}>
      <ChartSVG viewBox={`0 0 ${chartData.width} ${chartData.height}`}>
        <g transform={`translate(${chartData.margin.left}, ${chartData.margin.top})`}>
          {/* Grid lines */}
          {showGrid &&
            chartData.gridLines.map((line: any, index: number) => (
              <line
                key={index}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={gridColor}
                strokeWidth={1}
              />
            ))}

          {/* Grid labels */}
          {chartData.gridLines
            .filter((line: any) => line.type === 'horizontal' || showXAxis)
            .map((line: any, index: number) => (
              <Label
                key={`label-${index}`}
                x={line.type === 'horizontal' ? -10 : line.x1}
                y={line.type === 'horizontal' ? line.y1 + 4 : chartData.chartHeight + 15}
                textAnchor={line.type === 'horizontal' ? 'end' : 'middle'}
                fill={textColor}
              >
                {line.label}
              </Label>
            ))}

          {/* Sell window background */}
          <SellWindow
            x={chartData.xScale(startDay)}
            y={0}
            width={chartData.xScale(endDay) - chartData.xScale(startDay)}
            height={chartData.chartHeight}
          />

          {/* Min sell price line */}
          <StaticLine
            x1={0}
            y1={chartData.yScale(minSellPrice)}
            x2={chartData.chartWidth}
            y2={chartData.yScale(minSellPrice)}
            stroke='#ff6b6b'
          />

          {/* Sell window start line */}
          <StaticLine
            x1={chartData.xScale(startDay)}
            y1={0}
            x2={chartData.xScale(startDay)}
            y2={chartData.chartHeight}
            stroke='#ffeb3b'
          />

          {/* Sell window end line */}
          <StaticLine
            x1={chartData.xScale(endDay)}
            y1={0}
            x2={chartData.xScale(endDay)}
            y2={chartData.chartHeight}
            stroke='#ffeb3b'
          />

          {/* Win area (area above min sell price within sell window) */}
          {chartData.winAreaPath && (
            <WinArea d={chartData.winAreaPath} fill={winColor} fillOpacity={highlightOpacity} />
          )}

          {/* Price line */}
          <PriceLine d={chartData.pricePath} stroke={chartColor} />

          {/* Current price indicator */}
          {currentDay >= 0 && currentDay < priceData.length && (
            <circle
              cx={chartData.xScale(currentDay)}
              cy={chartData.yScale(priceData[currentDay])}
              r={4}
              fill={chartColor}
              stroke='#fff'
              strokeWidth={2}
            />
          )}

          {/* Day labels */}
          {showDayLabels && (
            <>
              <Label x={chartData.xScale(startDay)} y={-10} textAnchor='middle' fill={textColor}>
                Start Day: {startDay}
              </Label>

              <Label x={chartData.xScale(endDay)} y={-10} textAnchor='middle' fill={textColor}>
                End Day: {endDay}
              </Label>
            </>
          )}
        </g>
      </ChartSVG>
    </ChartContainer>
  )
}
