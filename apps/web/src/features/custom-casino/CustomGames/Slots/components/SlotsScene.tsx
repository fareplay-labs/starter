// @ts-nocheck
import React, { useMemo, useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { MultiReelContainer } from './MultiReelContainer'
import { WinCelebrationOrchestrator } from './WinCelebrationOrchestrator'
import { WinningPaylines } from './WinningPaylines'
import { PaytableDrawer } from './PaytableDrawer'
import { type SlotsSceneProps } from '../types'
import { useSlotsGameStore } from '../store/SlotsGameStore'
import { useWinCelebration } from '../hooks/useWinCelebration'

const ContentWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
`

interface ScaledContainerProps {
  $scale: number
}

const ScaledContainer = styled.div<ScaledContainerProps>`
  transform: scale(${props => props.$scale});
  transform-origin: center;
  position: relative;
`

const GameContent = styled.div`
  width: max-content;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`

const PaytableButton = styled.button`
  position: absolute;
  bottom: 0px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color:rgba(255, 255, 255, 0.2);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1000;
  &:hover {
    color:rgba(255, 255, 255, 0.3);
    background: rgba(20, 20, 22, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`
export const SlotsScene: React.FC<SlotsSceneProps> = ({
  parameters,
  isSpinning,
  reelPositions,
  onSpinComplete,
  onReelStop,
  winningLines = [],
  sfx,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [animationType] = useState<string | undefined>(undefined) // Current/target animation type - undefined lets orchestrator choose
  const [direction] = useState<'forward' | 'backward'>('forward')
  const [directionMode] = useState<
    'forward' | 'backward' | 'random' | 'alternating'
  >('forward')
  const [reelOrder] = useState<
    'sequential' | 'reverse' | 'random' | 'center-out' | 'edges-in' | 'alternating'
  >('sequential')
  const [forcedStrategy] = useState<string>('auto')
  const [isPaytableOpen, setIsPaytableOpen] = useState(false)

  // Get store state for win celebration
  const { entry } = useSlotsGameStore(state => ({
    entry: state.entry,
  }))

  // Use win celebration hook
  const {
    isActive: celebrationActive,
    winTier,
    onComplete: onCelebrationComplete,
  } = useWinCelebration()


  // Memoize symbols - ensure we have 7 symbols to match the payout matrix
  const symbols = useMemo(() => {
    return parameters.slotsSymbols.length > 0 ?
        parameters.slotsSymbols
      : ['🍒', '🍋', '🍊', '🍇', '7️⃣', '⭐', '💎']
  }, [parameters.slotsSymbols])

  // Calculate scale to fit content within container
  useEffect(() => {
    const calculateScale = () => {
      if (!wrapperRef.current || !contentRef.current) return

      const wrapper = wrapperRef.current
      const content = contentRef.current

      // Get natural size of content (unscaled)
      const contentWidth = content.scrollWidth
      const contentHeight = content.scrollHeight

      // Get available space
      const wrapperWidth = wrapper.clientWidth
      const wrapperHeight = wrapper.clientHeight

      // Calculate padding based on gameScale parameter
      const baseScale = parameters.gameScale || 1.0
      const padding = 32 // Leave some padding

      // Calculate scale to fit with padding
      const scaleX = (wrapperWidth - padding) / contentWidth
      const scaleY = (wrapperHeight - padding) / contentHeight

      // Use smaller scale, never scale up beyond gameScale parameter
      const newScale = Math.min(scaleX, scaleY, baseScale)
      setScale(newScale)
    }

    calculateScale()

    const resizeObserver = new ResizeObserver(calculateScale)
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [parameters.gameScale])

  return (
    <ContentWrapper ref={wrapperRef}>
      <ScaledContainer $scale={scale}>
        <GameContent ref={contentRef}>
          <MultiReelContainer
            symbols={symbols}
            isSpinning={isSpinning}
            targetPositions={reelPositions}
            onReelStop={onReelStop}
            onAllReelsStopped={onSpinComplete}
            direction={direction}
            directionMode={directionMode}
            reelOrder={reelOrder}
            animationType={animationType as any}
            forcedStrategy={forcedStrategy}
            // Pass constraint arrays from user's configuration
            allowedStrategies={parameters.animationStrategies}
            allowedDirections={parameters.animationDirections}
            allowedStopOrders={parameters.reelStopOrders}
            reelBackground={parameters.reelBackground}
            reelContainer={parameters.reelContainer}
            borderColor={parameters.borderColor}
            paylineIndicator={parameters.paylineIndicator}
            iconSize={parameters.iconSize}
            gameScale={parameters.gameScale}
            isWinning={celebrationActive && winningLines.length > 0}
            winTier={winTier || undefined}
            synthConfig={parameters.synthConfig}
          />
          {/* Progressive Payline Indicators */}
          <WinningPaylines
            winningLines={winningLines}
            isActive={celebrationActive}
            showNearMiss={true}
            progressiveReveal={true}
            revealDelay={300}
            symbolHighlights={true}
            gameScale={parameters.gameScale}
            iconSize={parameters.iconSize}
          />
        </GameContent>
      </ScaledContainer>
      
      {/* Win Celebration Layer - outside scaled container */}
      <WinCelebrationOrchestrator
        winningLines={winningLines}
        totalPayout={
          // Convert multiplier sum to currency amount: sum(payout multipliers) * bet per spin
          (winningLines.reduce((sum, line) => sum + line.payout, 0)) * (entry?.entryAmount || 0)
        }
        betAmount={entry?.entryAmount || 0}
        isActive={celebrationActive}
        onComplete={onCelebrationComplete}
        soundEnabled={true}
        sfx={sfx}
      />
      
      {/* Paytable Button - outside scaled container */}
      <PaytableButton onClick={() => setIsPaytableOpen(!isPaytableOpen)}>
        {isPaytableOpen ? 'Click to Close' : 'Paytable'}
      </PaytableButton>
      
      {/* Paytable Drawer - outside scaled container */}
      <PaytableDrawer
        isOpen={isPaytableOpen}
        onClose={() => setIsPaytableOpen(false)}
        symbols={symbols}
        gameScale={parameters.gameScale}
        iconSize={parameters.iconSize}
      />
    </ContentWrapper>
  )
}
