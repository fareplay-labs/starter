// @ts-nocheck
import { styled } from 'styled-components'
import { motion } from 'framer-motion'
import {
  BaseDiceContainer,
  getDiceTransform,
  getDiceGradient,
  diceShadowStyles,
  type BaseDiceProps,
} from './shared/diceStyles'

const Face = styled(motion.div)<{ $size: number; $color: string }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: ${({ $color }) => $color};
  border-radius: 4px;
  ${diceShadowStyles}
  background-image: ${({ $color }) => getDiceGradient($color)};
`

const InnerShadow = styled(motion.div)<{ $size: number }>`
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: ${({ $size }) => $size * 0.9}px;
  height: ${({ $size }) => $size * 0.9}px;
  box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.3);
  border-radius: 2px;
`

export const SolidDice: React.FC<BaseDiceProps> = ({ size, color, rotation }) => {
  return (
    <BaseDiceContainer style={getDiceTransform(rotation, size)}>
      <Face $size={size} $color={color}>
        <InnerShadow $size={size} />
      </Face>
    </BaseDiceContainer>
  )
}
