// @ts-nocheck
import React, { useEffect } from 'react'
import { useBombsGameStore } from '../store/BombsGameStore'
import { styled } from 'styled-components'
import {
  isImageValue,
  createBackgroundValue,
} from '@/features/custom-casino/CustomGames/shared/utils/backgroundUtils'
import { getImageUrl } from '@/features/custom-casino/shared/utils/cropDataUtils'

interface SceneContainerProps {
  $backgroundColor: string
  $background?: string
}

const SceneContainer = styled.div<SceneContainerProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
  background: ${props => props.$background || props.$backgroundColor};
  background-size: cover;
  background-position: center;
`

interface ResultOverlayProps {
  isWin: boolean
}

const ResultOverlay = styled.div<ResultOverlayProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 24px;
  background-color: ${props => (props.isWin ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)')};
  color: white;
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

export const BombsScene: React.FC = () => {
  const { gameState, lastResult, parameters, reset } = useBombsGameStore((state: any) => ({
    gameState: state.gameState,
    lastResult: state.lastResult,
    parameters: state.parameters,
    reset: state.reset,
  }))

  // Auto-reset after showing result
  useEffect(() => {
    if (gameState === 'SHOWING_RESULT') {
      const timer = setTimeout(() => {
        reset()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameState, reset])

  if (gameState !== 'SHOWING_RESULT' || !lastResult) {
    return <SceneContainer $backgroundColor='transparent' />
  }

  const backgroundValue = getImageUrl(parameters.background)

  return (
    <SceneContainer
      $backgroundColor={backgroundValue}
      $background={
        isImageValue(backgroundValue) ? createBackgroundValue(backgroundValue) : undefined
      }
    >
      <ResultOverlay isWin={lastResult.isWin}>
        {lastResult.isWin ? 'WIN!' : 'BOOM!'}
        <div style={{ marginTop: '10px', fontSize: '18px' }}>
          {lastResult.isWin ? `You won ${lastResult.payout} coins!` : 'Better luck next time!'}
        </div>
      </ResultOverlay>
    </SceneContainer>
  )
}
