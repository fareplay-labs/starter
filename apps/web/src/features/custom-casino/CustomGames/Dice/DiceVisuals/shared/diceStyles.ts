// @ts-nocheck
import { css, styled } from 'styled-components'
import { motion } from 'framer-motion'

/**
 * Common dice styling patterns and utilities
 * Reduces code duplication across visual components
 */

// Common dice container styles
export const baseDiceContainerStyles = css`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
`

// Shared rotation transform utility
export const getDiceTransform = (rotation: number, size: number) => ({
  width: size,
  height: size,
  transform: `rotate(${rotation}deg)`,
})

// Common dice shadow styles
export const diceShadowStyles = css`
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.2);
`

// Base dice container component that all dice types can extend
export const BaseDiceContainer = styled(motion.div)`
  ${baseDiceContainerStyles}
`

// Common interface for all dice components
export interface BaseDiceProps {
  size: number
  color: string
  rotation: number
}

// Utility for generating gradient backgrounds
export const getDiceGradient = (color: string) =>
  `linear-gradient(45deg, ${color} 0%, ${color}dd 50%, ${color} 100%)`
