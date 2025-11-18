// @ts-nocheck
import { styled } from 'styled-components'
import { motion } from 'framer-motion'

export const ResultText = styled(motion.div)<{ $color: string }>`
  position: absolute;
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ $color }) => $color};
  text-shadow: 0 0 10px ${({ $color }) => $color}40;
  z-index: 3;
  user-select: none;
  pointer-events: none;
  text-align: center;
  white-space: nowrap;
`
