// @ts-nocheck
import { useMemo } from 'react'
import { DiceSceneRenderer } from './DiceVisuals'
import { useDiceAnimation, useDiceResultText } from './hooks'
import { type DiceSceneProps } from './types'

export const DiceScene: React.FC<DiceSceneProps> = ({
  size,
  color,
  winColor,
  loseColor,
  animationDuration,
  targetNumber,
  rolledNumber,
  isRolling,
  animationPreset,
  diceModel,
  onRollComplete,
}) => {
  // Determine if it's a winning roll (memoized)
  const isWinningRoll = useMemo(
    () => rolledNumber !== null && rolledNumber > targetNumber,
    [rolledNumber, targetNumber]
  )

  // Use the animation hooks
  const { diceControls, resultControls, showParticles } = useDiceAnimation({
    isRolling,
    rolledNumber,
    isWinningRoll,
    animationPreset,
    animationDuration,
    diceSize: size,
    onRollComplete,
  })

  const { formattedResult } = useDiceResultText({
    rolledNumber,
    isRolling,
    resultControls,
  })

  return (
    <DiceSceneRenderer
      size={size}
      color={color}
      winColor={winColor}
      loseColor={loseColor}
      diceModel={diceModel}
      diceControls={diceControls}
      resultControls={resultControls}
      showParticles={showParticles}
      rolledNumber={rolledNumber}
      targetNumber={targetNumber}
      formattedResult={formattedResult}
    />
  )
}
