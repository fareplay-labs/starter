// @ts-nocheck
import { styled } from 'styled-components'
import { motion } from 'framer-motion'
import { BaseDiceContainer, getDiceTransform, type BaseDiceProps } from './shared/diceStyles'

const OuterSquare = styled(motion.div)<{ $color: string }>`
  position: relative;
  width: 100%;
  height: 100%;
  border: 3px solid black inside;
  border-radius: 3px;
  background-color: ${({ $color }) => $color};
  opacity: 1;
`

const InnerSquare = styled(motion.div)<{ $color: string; $size: number }>`
  position: absolute;
  width: ${({ $size }) => $size}%;
  height: ${({ $size }) => $size}%;
  /* border: 2px dashed ${({ $color }) => $color}; */
  border: 2px solid black;
  opacity: 0.2;
`

const EdgeHighlight = styled(motion.div)<{ $color: string; $position: string }>`
  position: absolute;
  background: ${({ $color }) => $color};
  opacity: 0.15;
  ${({ $position }) => {
    switch ($position) {
      case 'top':
        return 'height: 2px; width: 100%; top: 0;'
      case 'right':
        return 'width: 2px; height: 100%; right: 0;'
      case 'bottom':
        return 'height: 2px; width: 100%; bottom: 0;'
      case 'left':
        return 'width: 2px; height: 100%; left: 0;'
    }
  }}
`

export const SimpleDice: React.FC<BaseDiceProps> = ({ size, color, rotation }) => {
  return (
    <BaseDiceContainer style={getDiceTransform(rotation, size)}>
      <OuterSquare $color={color} />
      <InnerSquare $color={color} $size={85} />

      {['top', 'right', 'bottom', 'left'].map(position => (
        <EdgeHighlight key={position} $color={color} $position={position} />
      ))}
    </BaseDiceContainer>
  )
}
