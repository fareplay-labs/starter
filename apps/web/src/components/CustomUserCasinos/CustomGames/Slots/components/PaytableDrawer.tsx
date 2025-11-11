// @ts-nocheck
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { PAYOUT_MATRIX, type PayoutCombination } from '../utils/payoutMapping'
import type { SlotSymbol } from '../types'
import { isEmojiValue } from '@/components/CustomUserCasinos/CustomGames/shared/utils/emojiUtils'
import { getImageUrl } from '@/components/CustomUserCasinos/shared/utils/cropDataUtils'

interface PaytableDrawerProps {
  isOpen: boolean
  onClose: () => void
  symbols: SlotSymbol[]
  gameScale?: number
  iconSize?: number
}

interface PayoutGroupEntry {
  multiplier: number
  combinations: PayoutCombination[]
}

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
`

const DrawerContainer = styled(motion.div)`
  width: auto;
  min-width: 300px;
  max-width: 90vw;
  max-height: 60vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`

const DrawerContent = styled.div`
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(95, 95, 255, 0.2);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(95, 95, 255, 0.3);
  }
`

const SPayoutGroup = styled.div`
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const PayoutHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
`

const MultiplierBadge = styled.div<{ $multiplier: number }>`
  background: ${({ $multiplier }) => 
    $multiplier >= 10 ? 'linear-gradient(45deg, #ffd700, #ffed4e)' :
    $multiplier >= 3 ? 'linear-gradient(45deg, #c0392b, #e74c3c)' :
    $multiplier >= 1.5 ? 'linear-gradient(45deg, #8e44ad, #9b59b6)' :
    'linear-gradient(45deg, #2980b9, #3498db)'
  };
  color:rgb(0, 0, 0);
  font-weight: bold;
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 16px;
  min-width: 54px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(24, 24, 24, 0.3);
`

const Options = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-left: 4px;
`

const Option = styled.span`
  display: inline-flex;
  align-items: center;
`

const Separator = styled.span`
  color: #888;
  margin: 0 6px;
`

const SymbolDisplay = styled.div<{ $size?: number }>`
  display: flex;
  align-items: center;
  gap: 1px;
  font-size: ${({ $size }) => $size || 24}px;
`

const Symbol = styled.div<{ $size?: number }>`
  width: ${({ $size }) => $size || 24}px;
  height: ${({ $size }) => $size || 24}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => ($size || 24) * 0.8}px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export const PaytableDrawer: React.FC<PaytableDrawerProps> = ({
  isOpen,
  onClose,
  symbols,
  gameScale = 1,
  iconSize = 1,
}) => {
  const payoutGroups = useMemo<PayoutGroupEntry[]>(() => {
    const groups: { [multiplier: number]: PayoutCombination[] } = {}
    
    PAYOUT_MATRIX.forEach(combination => {
      if (!groups[combination.multiplier]) {
        groups[combination.multiplier] = []
      }
      groups[combination.multiplier].push(combination)
    })
    
    // Sort by multiplier ascending (lowest first, jackpot last)
    return Object.entries(groups)
      .map(([multiplier, combinations]) => ({
        multiplier: parseFloat(multiplier),
        combinations: combinations.sort((a, b) => b.matchCount - a.matchCount)
      }))
      .sort((a, b) => a.multiplier - b.multiplier)
  }, [])

  const renderSymbol = (iconIndex: number, size: number) => {
    const symbol = symbols[iconIndex]
    
    if (!symbol) {
      // Fallback to default symbols if symbol not found
      const defaultSymbols = ['🍒', '🍋', '🍊', '🍇', '7️⃣', '⭐', '💎']
      return <Symbol $size={size}>{defaultSymbols[iconIndex] || '❓'}</Symbol>
    }
    
    // Use getImageUrl to extract the proper URL from any format (same as SimpleReel)
    const extractedValue = getImageUrl(symbol)
    
    // Check if it's an emoji
    const isEmoji = typeof extractedValue === 'string' && isEmojiValue(extractedValue)
    
    // If no valid content, show fallback
    if (!extractedValue) {
      const defaultSymbols = ['🍒', '🍋', '🍊', '🍇', '7️⃣', '⭐', '💎']
      return <Symbol $size={size}>{defaultSymbols[iconIndex] || '❓'}</Symbol>
    }
    
    // Render emoji or image
    if (isEmoji) {
      return <Symbol $size={size}>{extractedValue}</Symbol>
    } else {
      return (
        <Symbol $size={size}>
          <img src={extractedValue} alt={`Symbol ${iconIndex + 1}`} />
        </Symbol>
      )
    }
  }

  const symbolSize = Math.round(24 * gameScale * iconSize)

  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <DrawerContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            role='dialog'
            aria-label='Slots paytable'
            onClick={onClose}
          >
            <DrawerContent>
              {payoutGroups.map(({ multiplier, combinations }) => (
                <SPayoutGroup key={multiplier}>
                  <PayoutHeader>
                    <MultiplierBadge $multiplier={multiplier}>{multiplier}×</MultiplierBadge>
                    <Options>
                      {combinations.map((combination, index) => (
                        <React.Fragment key={`${combination.iconIndex}-${combination.matchCount}-${index}`}>
                          <Option>
                            <SymbolDisplay $size={symbolSize}>
                              {Array.from({ length: combination.matchCount }).map((_, i) => (
                                <React.Fragment key={i}>
                                  {renderSymbol(combination.iconIndex, symbolSize)}
                                </React.Fragment>
                              ))}
                            </SymbolDisplay>
                          </Option>
                          {/* Add invisible spacer after 4-match cherry in 0.75x row */}
                          {multiplier === 0.75 && index === 0 && (
                            <Option>
                              <SymbolDisplay $size={symbolSize}>
                                <div style={{ width: `${symbolSize - 5}px`, height: `${symbolSize}px`, visibility: 'hidden' }}>
                                  {renderSymbol(0, symbolSize)}
                                </div>
                              </SymbolDisplay>
                            </Option>
                          )}
                          {index < combinations.length - 1 ? <Separator>|</Separator> : null}
                        </React.Fragment>
                      ))}
                    </Options>
                  </PayoutHeader>
                </SPayoutGroup>
              ))}
            </DrawerContent>
          </DrawerContainer>
        </Backdrop>
      )}
    </AnimatePresence>
  )
}
