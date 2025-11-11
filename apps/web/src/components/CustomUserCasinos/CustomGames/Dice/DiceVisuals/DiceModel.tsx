// @ts-nocheck
import { memo } from 'react'
import { SimpleDice } from './SimpleDice'
import { SolidDice } from './SolidDice'
import { NeonDice } from './NeonDice'
import { CustomDice } from './CustomDice'
import { type DiceModelType } from '../types'
import { type BaseDiceProps } from './shared/diceStyles'

interface DiceModelProps extends BaseDiceProps {
  type: DiceModelType
}

/**
 * Optimized dice model component with proper memoization
 * Prevents unnecessary re-renders when props haven't changed
 */
export const DiceModel = memo<DiceModelProps>(({ type, size, color, rotation }) => {
  switch (type) {
    case 'solid':
      return <SolidDice size={size} color={color} rotation={rotation} />
    case 'neon':
      return <NeonDice size={size} color={color} rotation={rotation} />
    case 'custom':
      return <CustomDice size={size} rotation={rotation} color={color} />
    case 'wireframe':
    default:
      return <SimpleDice size={size} color={color} rotation={rotation} />
  }
})

DiceModel.displayName = 'DiceModel'
