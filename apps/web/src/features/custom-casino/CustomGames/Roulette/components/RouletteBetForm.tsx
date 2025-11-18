// @ts-nocheck
import React, { useMemo, useState } from 'react'
import { useRouletteGameStore } from '../RouletteGameStore'
import { type RouletteBet, type BetPosition } from '../types'
import { createBet } from '../logic/RouletteGameLogic'
import useCurrencyStore from '@/features/custom-casino/store/useCurrencyStore'
import {
  BetFormWrapper,
  BottomSection,
  LeftButton,
  MiddleSection,
  NumberButton,
  NumberGrid,
  RightColumn,
  SectionButton,
  TopSection,
} from './RouletteBetForm.styles'
import { BettingOverlay } from './BettingOverlay'
import { styled } from 'styled-components'
import { BREAKPOINTS, TEXT_COLORS } from '@/design'
import { useIsBreakpoint } from '@/hooks/common/useIsBreakpoint'
import { isGradientValue } from '../utils/spinUtils'

const numberGrid = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
]

const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

const getBorderColor = (color: string): string => {
  if (isGradientValue(color)) {
    return 'rgba(0, 0, 0, 0.4)'
  }

  const hex = color.replace('#', '')
  if (hex.length === 6) {
    const r = Math.round(parseInt(hex.slice(0, 2), 16) * 0.7)
    const g = Math.round(parseInt(hex.slice(2, 4), 16) * 0.7)
    const b = Math.round(parseInt(hex.slice(4, 6), 16) * 0.7)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  return 'rgba(0, 0, 0, 0.4)'
}

const convertBetsToMap = (
  bets: RouletteBet[]
): Map<string, { position: BetPosition; amount: number }> => {
  const map = new Map()
  bets.forEach(bet => {
    const position: BetPosition = {
      type: bet.type,
      numbers: bet.numbers,
    }

    let key: string
    if (['redBlack', 'oddEven', 'highLow'].includes(bet.type)) {
      let value = ''
      if (bet.type === 'redBlack') {
        value = redNumbers.some(n => bet.numbers.includes(n)) ? 'red' : 'black'
      } else if (bet.type === 'oddEven') {
        value = bet.numbers[0] % 2 === 0 ? 'even' : 'odd'
      } else if (bet.type === 'highLow') {
        value = bet.numbers[0] <= 18 ? 'low' : 'high'
      }
      position.value = value
      key = `${bet.type}-${value}`
    } else {
      key = `${bet.type}-${bet.numbers.join('-')}`
    }

    map.set(key, { position, amount: bet.amount })
  })
  return map
}

const InstructionText = styled.div`
  font-size: 8px;
  color: ${TEXT_COLORS.three};
  opacity: 0.6;
  user-select: none;
  margin-top: 10px;
  margin-inline: 40px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    color: white;
    font-size: 15px;
    text-align: center;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) and (orientation: landscape) {
    font-size: 18px;
    color: white;
    opacity: 1;
    margin-top: 20px;
  }
`

const InstructionWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  @media (max-width: ${BREAKPOINTS.sm}px) and (orientation: landscape) {
    padding-bottom: 100px;
    text-wrap: nowrap;
  }
`

const ErrorMessage = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(220, 38, 38, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: ${props => (props.$visible ? 1 : 0)};
  visibility: ${props => (props.$visible ? 'visible' : 'hidden')};
  transition:
    opacity 0.3s,
    visibility 0.3s;
  z-index: 1000;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(220, 38, 38, 1);

  @media (max-width: ${BREAKPOINTS.sm}px) {
    font-size: 14px;
    top: -50px;
  }
`

interface RouletteBetFormProps {
  disabled?: boolean
}

export const RouletteBetForm: React.FC<RouletteBetFormProps> = ({ disabled = false }) => {
  const {
    placeBet,
    removeBet,
    clearAllBets,
    selectedChip,
    entry,
    gameState,
    isDrawerOpen,
    isSpinning,
    parameters,
    isDemoMode,
  } = useRouletteGameStore()

  const balanceInUsdc = useCurrencyStore(state => state.balances.balanceInUsdc)
  const walletBalance = Number(balanceInUsdc) || 0
  const [balanceError, setBalanceError] = useState<string>('')

  const isMobileScreen = useIsBreakpoint('sm')

  const isDisabled = disabled || gameState !== 'IDLE' || isSpinning

  // Ensure entry.side is an array
  const placedBets = Array.isArray(entry.side) ? entry.side : []
  const placedBetsMap = useMemo(() => convertBetsToMap(placedBets), [placedBets])

  // Calculate current total bet amount
  const totalBetAmount = useMemo(() => {
    return placedBets.reduce((sum, bet) => sum + bet.amount, 0)
  }, [placedBets])

  const { rouletteColor1, rouletteColor2, neutralColor, textColor } = parameters

  const neutralBorderColor = getBorderColor(neutralColor || '#00AA00')
  const rouletteColor1BorderColor = getBorderColor(rouletteColor1 || '#CC0000')
  const rouletteColor2BorderColor = getBorderColor(rouletteColor2 || '#000000')

  const handleBetPlaced = (position: BetPosition) => {
    if (selectedChip === null || isDisabled) return

    // Calculate actual bet amount from multiplier and minBetAmount
    const actualBetAmount = (parameters.minBetAmount || 1) * selectedChip

    // Check if placing this bet would exceed wallet balance (only in non-demo mode)
    if (!isDemoMode) {
      const newTotalAmount = totalBetAmount + actualBetAmount
      if (newTotalAmount > walletBalance) {
        setBalanceError(`Insufficient balance`)
        setTimeout(() => setBalanceError(''), 3000) // Clear error after 3 seconds
        return
      }
    }

    const bet = createBet(
      position.type,
      position.numbers,
      actualBetAmount,
      `${position.type}-${position.numbers.join('-')}`
    )

    placeBet(bet)
  }

  const handleBetRemoved = (position: BetPosition) => {
    if (isDisabled) return
    setBalanceError('') // Clear any error when removing bets

    const betIndex = placedBets.findIndex(bet => {
      return (
        bet.type === position.type &&
        JSON.stringify(bet.numbers) === JSON.stringify(position.numbers)
      )
    })

    if (betIndex !== -1) {
      removeBet(betIndex)
    }
  }

  const handleAllBetsRemoved = () => {
    if (isDisabled) return
    clearAllBets()
  }

  return (
    <BetFormWrapper $isDisabled={isDisabled} $isOpen={isDrawerOpen}>
      <ErrorMessage $visible={!!balanceError}>{balanceError}</ErrorMessage>
      <TopSection>
        <LeftButton
          disabled={isDisabled}
          $neutralColor={neutralColor}
          $textColor={textColor}
          $borderColor={neutralBorderColor}
        >
          0
        </LeftButton>
        <NumberGrid>
          {numberGrid.map((row, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              {row.map(num => (
                <NumberButton
                  key={num}
                  $isRed={redNumbers.includes(num)}
                  $rouletteColor1={rouletteColor1}
                  $rouletteColor2={rouletteColor2}
                  $textColor={textColor}
                  $borderColor1={rouletteColor1BorderColor}
                  $borderColor2={rouletteColor2BorderColor}
                  disabled={isDisabled}
                  onClick={() => {}}
                >
                  {num}
                </NumberButton>
              ))}
            </React.Fragment>
          ))}
          <BettingOverlay
            onBetPlaced={handleBetPlaced}
            placedBets={placedBetsMap}
            hoverAmount={Math.round((parameters.minBetAmount || 1) * (selectedChip ?? 1))}
            debug={false}
            onBetRemoved={handleBetRemoved}
            disabled={isDisabled}
            minBetAmount={parameters?.minBetAmount ?? 1}
          />
        </NumberGrid>
        <RightColumn>
          {[1, 2, 3].map(num => (
            <NumberButton
              key={`2to1-${num}`}
              onClick={() => {}}
              disabled={isDisabled}
              $rouletteColor2={rouletteColor2}
              $textColor={textColor}
              $borderColor2={rouletteColor2BorderColor}
            >
              2:1
            </NumberButton>
          ))}
        </RightColumn>
      </TopSection>

      <MiddleSection>
        <SectionButton
          disabled={isDisabled}
          $rouletteColor2={rouletteColor2}
          $textColor={textColor}
          $borderColor2={rouletteColor2BorderColor}
        >
          1 to 12
        </SectionButton>
        <SectionButton
          disabled={isDisabled}
          $rouletteColor2={rouletteColor2}
          $textColor={textColor}
          $borderColor2={rouletteColor2BorderColor}
        >
          13 to 24
        </SectionButton>
        <SectionButton
          disabled={isDisabled}
          $rouletteColor2={rouletteColor2}
          $textColor={textColor}
          $borderColor2={rouletteColor2BorderColor}
        >
          25 to 36
        </SectionButton>
      </MiddleSection>

      <BottomSection>
        <SectionButton
          disabled={isDisabled}
          $rouletteColor2={rouletteColor2}
          $textColor={textColor}
          $borderColor2={rouletteColor2BorderColor}
        >
          1 to 18
        </SectionButton>
        <SectionButton
          disabled={isDisabled}
          $rouletteColor2={rouletteColor2}
          $textColor={textColor}
          $borderColor2={rouletteColor2BorderColor}
        >
          EVEN
        </SectionButton>
        <SectionButton
          $isRed
          disabled={isDisabled}
          $rouletteColor1={rouletteColor1}
          $textColor={textColor}
          $borderColor1={rouletteColor1BorderColor}
        ></SectionButton>
        <SectionButton
          disabled={isDisabled}
          $rouletteColor2={rouletteColor2}
          $textColor={textColor}
          $borderColor2={rouletteColor2BorderColor}
        ></SectionButton>
        <SectionButton
          disabled={isDisabled}
          $rouletteColor2={rouletteColor2}
          $textColor={textColor}
          $borderColor2={rouletteColor2BorderColor}
        >
          ODD
        </SectionButton>
        <SectionButton
          disabled={isDisabled}
          $rouletteColor2={rouletteColor2}
          $textColor={textColor}
          $borderColor2={rouletteColor2BorderColor}
        >
          19 to 36
        </SectionButton>
      </BottomSection>

      {isMobileScreen ?
        <InstructionWrapper>
          <InstructionText>TAP BOARD TO PLACE BET</InstructionText>
          <InstructionText onClick={handleAllBetsRemoved}>TAP HERE CLEAR BOARD</InstructionText>
        </InstructionWrapper>
      : <InstructionWrapper>
          <InstructionText>CLICK TO PLACE</InstructionText>
          <InstructionText>SHIFT-CLICK TO REMOVE</InstructionText>
        </InstructionWrapper>
      }
    </BetFormWrapper>
  )
}
