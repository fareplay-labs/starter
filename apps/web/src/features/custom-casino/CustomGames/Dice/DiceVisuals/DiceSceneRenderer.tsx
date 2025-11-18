// @ts-nocheck
import { useMemo } from 'react'
import { DiceModel } from './DiceModel'
import { WinParticles } from './WinParticles'
import { ResultText } from './ResultText'
import { type DiceModelType } from '../types'
import { SceneContainer, DiceWrapper, RollLine } from '../DiceScene.styles'
import { type AnimationControls } from 'framer-motion'

interface DiceSceneRendererProps {
  // Dice properties
  size: number
  color: string
  winColor: string
  loseColor: string
  diceModel: DiceModelType

  // Animation state
  diceControls: AnimationControls
  resultControls: AnimationControls
  showParticles: boolean

  // Game state
  rolledNumber: number | null
  targetNumber: number
  formattedResult: string
}

/**
 * Compound component that handles all visual rendering for the dice scene
 */
export const DiceSceneRenderer: React.FC<DiceSceneRendererProps> = ({
  size,
  color,
  winColor,
  loseColor,
  diceModel,
  diceControls,
  resultControls,
  showParticles,
  rolledNumber,
  targetNumber,
  formattedResult,
}) => {
  // Calculate result color (memoized)
  const resultColor = useMemo(() => {
    if (rolledNumber === null) return color
    const isWinningRoll = rolledNumber > targetNumber
    return isWinningRoll ? winColor : loseColor
  }, [rolledNumber, targetNumber, winColor, loseColor, color])

  return (
    <SceneContainer>
      <WinParticles isVisible={showParticles} color={winColor} diceSize={size} />

      <DiceWrapper animate={diceControls} initial={{ y: 0, rotate: 0, scale: 1 }}>
        <DiceModel type={diceModel} size={size} color={color} rotation={0} />
      </DiceWrapper>

      <RollLine $color={color} initial={{ opacity: 0, scale: 0 }} animate={diceControls} />

      {rolledNumber !== null && (
        <ResultText
          $color={resultColor}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={resultControls}
        >
          {formattedResult}
        </ResultText>
      )}
    </SceneContainer>
  )
}
