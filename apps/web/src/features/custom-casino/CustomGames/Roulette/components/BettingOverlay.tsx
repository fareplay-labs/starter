// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { styled } from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { type BetPosition, type RouletteBetType } from '../types'

const numberGrid = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
]

const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

const OverlayContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`

const BetButton = styled.button<{ $debug?: boolean }>`
  position: absolute;
  background: ${props => (props.$debug ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  border: ${props => (props.$debug ? '1px solid rgba(255, 255, 255, 0.2)' : 'none')};
  cursor: pointer;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`

const StraightButton = styled(BetButton)`
  width: calc(100% / 12);
  height: calc(100% / 3);
  bottom: 0;
  margin: 0;
`

const SplitButtonHorizontal = styled(BetButton)`
  width: calc(100% / 12 * 0.2);
  height: calc(100% / 3);
  transform: translateX(-50%);
`

const SplitButtonVertical = styled(BetButton)`
  width: calc(100% / 12);
  height: calc(100% / 3 * 0.2);
  transform: translateY(-50%);
`

const CornerButton = styled(BetButton)`
  width: calc(100% / 12 * 0.2);
  height: calc(100% / 3 * 0.2);
  transform: translate(-50%, -50%);
  z-index: 2;
`

const DozenButton = styled(BetButton)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.$debug ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  border: ${props => (props.$debug ? '1px solid rgba(255, 255, 255, 0.2)' : 'none')};
`

const HalfButton = styled(BetButton)`
  width: 100%;
  height: 100%;
  background: ${props => (props.$debug ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ColumnButton = styled(BetButton)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.$debug ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  border: ${props => (props.$debug ? '1px solid rgba(255, 255, 255, 0.2)' : 'none')};
`

const ZeroButton = styled(BetButton)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.$debug ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  border: ${props => (props.$debug ? '1px solid rgba(255, 255, 255, 0.2)' : 'none')};
`

const ChipContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`

const StreetButton = styled(BetButton)`
  width: calc(100% / 12 * 0.3);
  height: calc(100% / 3 * 0.3);
  transform: translateX(-50%);
`

const LineButton = styled(BetButton)`
  width: calc(100% / 12 * 0.3);
  height: calc(100% / 3 * 2 * 0.2);
  transform: translateX(-50%);
`

const ChipCircle = styled.div<{ $value: number; $minBetAmount: number; $isHover?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => {
    if (props.$isHover) return 'rgba(255, 255, 255, 0.7)'
    const multiplier = props.$value / props.$minBetAmount
    if (multiplier >= 100) return '#44aa44' // Green (100x+)
    if (multiplier >= 25) return '#4444aa' // Blue (25x+)
    if (multiplier >= 5) return '#aa4444' // Red (5x+)
    return '#ffffff' // White (1x+)
  }};
  border: 2px solid
    ${props => {
      if (props.$isHover) return '#000'
      const multiplier = props.$value / props.$minBetAmount
      return multiplier < 5 ? '#000' : '#fff'
    }};
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  color: ${props => {
    if (props.$isHover) return '#000'
    const multiplier = props.$value / props.$minBetAmount
    return multiplier < 5 ? '#000' : '#fff'
  }};
  text-shadow: ${props => {
    const multiplier = props.$value / props.$minBetAmount
    return multiplier < 5 ?
        '1px 1px 1px rgba(255, 255, 255, 0.5)'
      : '1px 1px 1px rgba(0, 0, 0, 0.5)'
  }};
  opacity: ${props => (props.$isHover ? 0.8 : 1)};
`

interface BettingOverlayProps {
  onBetPlaced: (position: BetPosition) => void
  placedBets: Map<string, { position: BetPosition; amount: number }>
  hoverAmount: number
  debug?: boolean
  onBetRemoved?: (position: BetPosition) => void
  disabled?: boolean
  minBetAmount?: number
}

const getBetKey = (position: BetPosition) => {
  if (
    position.value &&
    ['red', 'black', 'odd', 'even', 'high', 'low'].includes(position.value as string)
  ) {
    return `${position.type}-${position.value}`
  }
  return `${position.type}-${position.numbers.join('-')}`
}

export const BettingOverlay: React.FC<BettingOverlayProps> = ({
  onBetPlaced,
  placedBets,
  hoverAmount,
  debug,
  onBetRemoved,
  disabled = false,
  minBetAmount = 1,
}) => {
  const [hoverPosition, setHoverPosition] = useState<BetPosition | null>(null)
  const [removingChip, setRemovingChip] = useState<string | null>(null)

  useEffect(() => {
    if (disabled) {
      setHoverPosition(null)
    }
  }, [disabled])

  const handleBetClick = async (position: BetPosition, event: React.MouseEvent) => {
    if (disabled) return

    const betKey = getBetKey(position)

    if (event.shiftKey) {
      if (placedBets.has(betKey)) {
        setRemovingChip(betKey)
        await new Promise(resolve => setTimeout(resolve, 200))
        onBetRemoved?.(position)
        setRemovingChip(null)
      }
    } else {
      onBetPlaced(position)
    }
    setHoverPosition(null)
  }

  const renderChip = (position: BetPosition, amount: number, isHover = false) => {
    const betKey = getBetKey(position)
    if (isHover && disabled) return null

    return (
      <AnimatePresence mode='wait'>
        {removingChip !== betKey && (
          <ChipContainer
            initial={isHover ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ChipCircle $value={amount} $minBetAmount={minBetAmount} $isHover={isHover}>
              {Math.round(amount)}
            </ChipCircle>
          </ChipContainer>
        )}
      </AnimatePresence>
    )
  }

  const handleMouseEnter = (position: BetPosition) => {
    if (!disabled) {
      setHoverPosition(position)
    }
  }

  return (
    <OverlayContainer>
      {/* Zero bet */}
      {(() => {
        const position: BetPosition = {
          type: 'straight',
          numbers: [0],
        }
        const betKey = getBetKey(position)
        const existingBet = placedBets.get(betKey)

        return (
          <ZeroButton
            key='zero'
            style={{
              left: '-8.33%',
              top: 0,
              width: 'calc(100% / 12)',
              height: '100%',
            }}
            onMouseEnter={() => handleMouseEnter(position)}
            onMouseLeave={() => setHoverPosition(null)}
            onClick={e => handleBetClick(position, e)}
            $debug={debug}
          >
            {existingBet && renderChip(position, existingBet.amount)}
            {hoverPosition &&
              getBetKey(hoverPosition) === betKey &&
              renderChip(position, hoverAmount, true)}
          </ZeroButton>
        )
      })()}

      {/* Dozen bets */}
      {[1, 2, 3].map(dozen => {
        const startNum = (dozen - 1) * 12 + 1
        const endNum = dozen * 12
        const position: BetPosition = {
          type: 'dozen',
          numbers: Array.from({ length: endNum - startNum + 1 }, (_, index) => startNum + index),
        }
        const betKey = getBetKey(position)
        const existingBet = placedBets.get(betKey)

        return (
          <DozenButton
            key={`dozen-${dozen}`}
            style={{
              left: `${(dozen - 1) * (100 / 3)}%`,
              top: '100%',
              width: `${100 / 3}%`,
              height: 'calc(100% / 3)',
            }}
            onMouseEnter={() => handleMouseEnter(position)}
            onMouseLeave={() => setHoverPosition(null)}
            onClick={e => handleBetClick(position, e)}
            $debug={debug}
          >
            {existingBet && renderChip(position, existingBet.amount)}
            {hoverPosition &&
              getBetKey(hoverPosition) === betKey &&
              renderChip(position, hoverAmount, true)}
          </DozenButton>
        )
      })}

      {/* Bottom row bets */}
      {[
        {
          type: 'highLow' as RouletteBetType,
          numbers: Array.from({ length: 18 }, (_, i) => i + 1),
          value: 'low',
        },
        {
          type: 'oddEven' as RouletteBetType,
          numbers: Array.from({ length: 18 }, (_, i) => (i + 1) * 2),
          value: 'even',
        },
        {
          type: 'redBlack' as RouletteBetType,
          numbers: redNumbers,
          value: 'red',
        },
        {
          type: 'redBlack' as RouletteBetType,
          numbers: numberGrid.flat().filter(n => !redNumbers.includes(n)),
          value: 'black',
        },
        {
          type: 'oddEven' as RouletteBetType,
          numbers: Array.from({ length: 18 }, (_, i) => i * 2 + 1),
          value: 'odd',
        },
        {
          type: 'highLow' as RouletteBetType,
          numbers: Array.from({ length: 18 }, (_, i) => i + 19),
          value: 'high',
        },
      ].map((bet, index) => {
        const position: BetPosition = {
          type: bet.type,
          numbers: bet.numbers,
          value: bet.value,
        }
        const betKey = getBetKey(position)
        const existingBet = placedBets.get(betKey)

        return (
          <HalfButton
            key={`half-${index}`}
            style={{
              left: `${index * (100 / 6)}%`,
              top: 'calc(100% + calc(100% / 3))',
              width: `${100 / 6}%`,
              height: 'calc(100% / 3)',
              position: 'absolute',
              zIndex: 1,
            }}
            onMouseEnter={() => handleMouseEnter(position)}
            onMouseLeave={() => setHoverPosition(null)}
            onClick={e => handleBetClick(position, e)}
            $debug={debug}
          >
            {existingBet && renderChip(position, existingBet.amount)}
            {hoverPosition &&
              getBetKey(hoverPosition) === betKey &&
              renderChip(position, hoverAmount, true)}
          </HalfButton>
        )
      })}

      {/* Straight bets */}
      {numberGrid.map((row, rowIndex) =>
        row.map((num, colIndex) => {
          const position: BetPosition = {
            type: 'straight',
            numbers: [num],
          }
          const betKey = getBetKey(position)
          const existingBet = placedBets.get(betKey)

          return (
            <StraightButton
              key={`straight-${num}`}
              style={{
                left: `${colIndex * (100 / 12)}%`,
                top: `${rowIndex * (100 / 3)}%`,
              }}
              onMouseEnter={() => handleMouseEnter(position)}
              onMouseLeave={() => setHoverPosition(null)}
              onClick={e => handleBetClick(position, e)}
              $debug={debug}
            >
              {existingBet && renderChip(position, existingBet.amount)}
              {hoverPosition &&
                getBetKey(hoverPosition) === betKey &&
                renderChip(position, hoverAmount, true)}
            </StraightButton>
          )
        })
      )}

      {/* Horizontal splits */}
      {numberGrid.map((row, rowIndex) =>
        row.slice(0, -1).map((num, colIndex) => {
          const position: BetPosition = {
            type: 'split',
            numbers: [num, numberGrid[rowIndex][colIndex + 1]],
          }
          const betKey = getBetKey(position)
          const existingBet = placedBets.get(betKey)

          return (
            <SplitButtonHorizontal
              key={`split-h-${rowIndex}-${colIndex}`}
              style={{
                left: `${(colIndex + 1) * (100 / 12)}%`,
                top: `${rowIndex * (100 / 3)}%`,
              }}
              onMouseEnter={() => handleMouseEnter(position)}
              onMouseLeave={() => setHoverPosition(null)}
              onClick={e => handleBetClick(position, e)}
              $debug={debug}
            >
              {existingBet && renderChip(position, existingBet.amount)}
              {hoverPosition &&
                getBetKey(hoverPosition) === betKey &&
                renderChip(position, hoverAmount, true)}
            </SplitButtonHorizontal>
          )
        })
      )}

      {/* Vertical splits */}
      {numberGrid.slice(0, -1).map((row, rowIndex) =>
        row.map((num, colIndex) => {
          const position: BetPosition = {
            type: 'split',
            numbers: [num, numberGrid[rowIndex + 1][colIndex]],
          }
          const betKey = getBetKey(position)
          const existingBet = placedBets.get(betKey)

          return (
            <SplitButtonVertical
              key={`split-v-${rowIndex}-${colIndex}`}
              style={{
                left: `${colIndex * (100 / 12)}%`,
                top: `${(rowIndex + 1) * (100 / 3)}%`,
              }}
              onMouseEnter={() => handleMouseEnter(position)}
              onMouseLeave={() => setHoverPosition(null)}
              onClick={e => handleBetClick(position, e)}
              $debug={debug}
            >
              {existingBet && renderChip(position, existingBet.amount)}
              {hoverPosition &&
                getBetKey(hoverPosition) === betKey &&
                renderChip(position, hoverAmount, true)}
            </SplitButtonVertical>
          )
        })
      )}

      {/* Corner bets */}
      {numberGrid.slice(0, -1).map((row, rowIndex) =>
        row.slice(0, -1).map((num, colIndex) => {
          const position: BetPosition = {
            type: 'corner',
            numbers: [
              num,
              numberGrid[rowIndex][colIndex + 1],
              numberGrid[rowIndex + 1][colIndex],
              numberGrid[rowIndex + 1][colIndex + 1],
            ],
          }
          const betKey = getBetKey(position)
          const existingBet = placedBets.get(betKey)

          return (
            <CornerButton
              key={`corner-${rowIndex}-${colIndex}`}
              style={{
                left: `${(colIndex + 1) * (100 / 12)}%`,
                top: `${(rowIndex + 1) * (100 / 3)}%`,
              }}
              onMouseEnter={() => handleMouseEnter(position)}
              onMouseLeave={() => setHoverPosition(null)}
              onClick={e => handleBetClick(position, e)}
              $debug={debug}
            >
              {existingBet && renderChip(position, existingBet.amount)}
              {hoverPosition &&
                getBetKey(hoverPosition) === betKey &&
                renderChip(position, hoverAmount, true)}
            </CornerButton>
          )
        })
      )}

      {/* Street bets */}
      {numberGrid.map((row, rowIndex) => {
        const position: BetPosition = {
          type: 'street',
          numbers: row.slice(0, 3),
        }
        const betKey = getBetKey(position)
        const existingBet = placedBets.get(betKey)

        return (
          <StreetButton
            key={`street-${rowIndex}`}
            style={{
              left: '0%',
              top: `${(rowIndex + 0.5) * (100 / 3)}%`,
            }}
            onMouseEnter={() => handleMouseEnter(position)}
            onMouseLeave={() => setHoverPosition(null)}
            onClick={e => handleBetClick(position, e)}
            $debug={debug}
          >
            {existingBet && renderChip(position, existingBet.amount)}
            {hoverPosition &&
              getBetKey(hoverPosition) === betKey &&
              renderChip(position, hoverAmount, true)}
          </StreetButton>
        )
      })}

      {/* Line bets */}
      {numberGrid.slice(0, -1).map((row, rowIndex) => {
        const position: BetPosition = {
          type: 'line',
          numbers: [...row.slice(0, 3), ...numberGrid[rowIndex + 1].slice(0, 3)],
        }
        const betKey = getBetKey(position)
        const existingBet = placedBets.get(betKey)

        return (
          <LineButton
            key={`line-${rowIndex}`}
            style={{
              left: '0%',
              top: `${(rowIndex + 1) * (100 / 3)}%`,
            }}
            onMouseEnter={() => handleMouseEnter(position)}
            onMouseLeave={() => setHoverPosition(null)}
            onClick={e => handleBetClick(position, e)}
            $debug={debug}
          >
            {existingBet && renderChip(position, existingBet.amount)}
            {hoverPosition &&
              getBetKey(hoverPosition) === betKey &&
              renderChip(position, hoverAmount, true)}
          </LineButton>
        )
      })}

      {/* Column bets */}
      {[1, 2, 3].map(column => {
        const position: BetPosition = {
          type: 'column',
          numbers: numberGrid[3 - column].slice(),
        }
        const betKey = getBetKey(position)
        const existingBet = placedBets.get(betKey)

        return (
          <ColumnButton
            key={`column-${column}`}
            style={{
              left: '100%',
              top: `${(column - 1) * (100 / 3)}%`,
              width: 'calc(100% / 12)',
              height: `${100 / 3}%`,
            }}
            onMouseEnter={() => handleMouseEnter(position)}
            onMouseLeave={() => setHoverPosition(null)}
            onClick={e => handleBetClick(position, e)}
            $debug={debug}
          >
            {existingBet && renderChip(position, existingBet.amount)}
            {hoverPosition &&
              getBetKey(hoverPosition) === betKey &&
              renderChip(position, hoverAmount, true)}
          </ColumnButton>
        )
      })}
    </OverlayContainer>
  )
}
