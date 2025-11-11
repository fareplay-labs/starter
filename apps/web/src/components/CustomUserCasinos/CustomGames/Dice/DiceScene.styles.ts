// @ts-nocheck
import { styled } from 'styled-components'
import { motion } from 'framer-motion'

// Styled components
export const SceneContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`

export const DiceWrapper = styled(motion.div)`
  position: absolute;
  z-index: 2;
`

export const RollLine = styled(motion.div)<{ $color: string }>`
  position: absolute;
  height: 2px;
  background: ${({ $color }) => $color};
  opacity: 0.3;
  bottom: 20%;
  left: 20%;
  right: 20%;
  z-index: 1;
`
