// @ts-nocheck
import React from 'react'
import { ThreeCoin } from './ThreeCoin'
import { type CoinModelType, type CoinAnimationPreset, type CoinSide } from '../types'

interface CoinModelProps {
  type: CoinModelType
  size: number
  color: string
  headsCustomImage?: string
  tailsCustomImage?: string
  animationPreset: CoinAnimationPreset
  animationDuration: number
  // Number of full flips/spins to perform during animation
  flipCount: number
  flipResult: CoinSide | null
  isFlipping: boolean
  onAnimationComplete: () => void
  playerChoice: CoinSide | null
  onCoinClick?: () => void
}

export const CoinModel: React.FC<CoinModelProps> = ({
  size,
  color,
  headsCustomImage,
  tailsCustomImage,
  animationPreset,
  animationDuration,
  flipCount,
  flipResult,
  isFlipping,
  onAnimationComplete,
  playerChoice,
  onCoinClick,
}) => {
  // Assuming new approach overrides, we ignore type and always use ThreeCoin
  return (
    <ThreeCoin
      size={size}
      coinColor={color}
      headsCustomImage={headsCustomImage}
      tailsCustomImage={tailsCustomImage}
      animationPreset={animationPreset}
      animationDuration={animationDuration}
      flipCount={flipCount}
      flipResult={flipResult}
      isFlipping={isFlipping}
      onAnimationComplete={onAnimationComplete}
      playerChoice={playerChoice}
      onCoinClick={onCoinClick}
    />
  )
}
