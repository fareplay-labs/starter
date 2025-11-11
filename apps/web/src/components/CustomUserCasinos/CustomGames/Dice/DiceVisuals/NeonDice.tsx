// @ts-nocheck
import { styled } from 'styled-components'
import { motion } from 'framer-motion'

const DiceContainer = styled(motion.div)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Face = styled(motion.div)<{ $size: number; $color: string }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid ${({ $color }) => $color};
  border-radius: 4px;
  box-shadow:
    0 0 10px ${({ $color }) => $color},
    inset 0 0 10px ${({ $color }) => $color};
`

interface NeonDiceProps {
  size: number
  color: string
  rotation: number
}

export const NeonDice: React.FC<NeonDiceProps> = ({ size, color, rotation }) => {
  return (
    <DiceContainer
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <Face $size={size} $color={color} />
    </DiceContainer>
  )
}
