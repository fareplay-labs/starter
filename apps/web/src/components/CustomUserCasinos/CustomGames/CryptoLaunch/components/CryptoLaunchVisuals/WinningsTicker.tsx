// @ts-nocheck
import React, { useMemo, useRef, useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { useCryptoLaunchGameStore } from '../../store/CryptoLaunchGameStore'

// Absolute positioned container – moved up from bottom-center of GameContainer
const STicker = styled.div<{ isWinning: boolean; winColor: string }>`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  font-weight: 600;
  color: ${props => (props.isWinning ? props.winColor : '#bfbfbf')};
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.55);
  pointer-events: none;
  user-select: none;
  z-index: 5;
  transition: color 0.3s ease;
`

interface WinningsTickerProps {
  currentDay: number
}

export const WinningsTicker: React.FC<WinningsTickerProps> = ({ currentDay }) => {
  const { entry, submittedEntry, gameState, gameData, predeterminedResult, parameters } = useCryptoLaunchGameStore(
    state => ({
      entry: state.entry,
      submittedEntry: state.submittedEntry,
      parameters: state.parameters,
      gameState: state.gameState,
      gameData: state.gameData,
      predeterminedResult: state.predeterminedResult,
    })
  )

  const [displayValue, setDisplayValue] = useState(0)
  const targetValueRef = useRef(0)
  const rafRef = useRef<number>()

  // Calculate progressive profit/loss display
  const profit = useMemo(() => {
    // Use submitted entry during play, otherwise use current entry
    const activeEntry = submittedEntry || entry
    const { startDay, endDay } = activeEntry.side
    const betAmount = activeEntry.entryAmount
    
    // Start at negative bet amount (investment)
    if (!gameData || currentDay < 0) {
      return -betAmount
    }

    // Before sell window, still show negative investment
    if (currentDay < startDay) {
      return -betAmount
    }

    // If we have a predetermined result from contract, use it
    if (predeterminedResult) {
      const finalPayout = predeterminedResult.payout
      
      // After sell window or at the end, show final profit/loss
      if (currentDay >= endDay) {
        return finalPayout - betAmount
      }
      
      // During sell window, calculate based on area under curve ratio
      // The area ratio represents how much of the total return we've accumulated
      const priceData = gameData.priceData
      
      // Calculate cumulative area from startDay to currentDay
      let cumulativeArea = 0
      let totalArea = 0
      
      for (let day = startDay; day <= Math.min(endDay, priceData.length - 1); day++) {
        const price = priceData[day]
        totalArea += price
        
        if (day <= currentDay) {
          cumulativeArea += price
        }
      }
      
      // Avoid division by zero
      if (totalArea === 0) return -betAmount
      
      // Area ratio determines how much of the payout we've earned
      const areaRatio = cumulativeArea / totalArea
      
      // Start from -betAmount and accumulate towards final payout
      // -betAmount + (finalPayout * areaRatio) 
      return -betAmount + (finalPayout * areaRatio)
    }
    
    // No predetermined result yet (shouldn't happen in normal flow)
    return -betAmount
  }, [entry, submittedEntry, gameData, predeterminedResult, currentDay])

  // Update display target whenever profit changes
  useEffect(() => {
    targetValueRef.current = profit

    // animation loop
    const animate = () => {
      setDisplayValue(prev => {
        const diff = targetValueRef.current - prev
        if (Math.abs(diff) < 0.01) return targetValueRef.current
        return prev + diff * 0.1 // ease factor
      })
      rafRef.current = requestAnimationFrame(animate)
    }

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = undefined
    }
  }, [profit])

  // Render only when game has started
  if (gameState === 'IDLE') return null
  
  // Determine if we're winning (positive profit)
  const isWinning = displayValue > 0

  // Safety check for NaN values
  const safeProfit = isNaN(displayValue) ? 0 : displayValue
  
  // Format display: show + for gains, - for losses
  const displayText = safeProfit >= 0 
    ? `+ $${Math.abs(safeProfit).toFixed(2)}`
    : `- $${Math.abs(safeProfit).toFixed(2)}`
  
  // Use green for wins or a default color from parameters
  const winColor = parameters?.winColor || '#00ff00'

  return (
    <STicker isWinning={isWinning} winColor={winColor}>
      {displayText}
    </STicker>
  )
}
