// @ts-nocheck
import { styled } from 'styled-components'
import { motion } from 'framer-motion'

export const TilesContainer = styled.div<{
  $tileSize: number
  $tileSpacing: number
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.$tileSpacing}px;
  padding: 20px;
`

export const ResponsiveTilesContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
`

export const ZeroTile = styled(motion.div)<{
  $isActive: boolean
  $isWinner: boolean
  $textColor: string
  $backgroundColor: string
  $tileSize: number
  $tileSpacing: number
  $borderRadius: number
  $borderHighlightColor: string
  $defaultBorderColor: string
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$tileSize * 6 + props.$tileSpacing * 5}px;
  height: ${props => props.$tileSize}px;
  background: ${props => props.$backgroundColor};
  border: 3px solid
    ${props => {
      if (props.$isWinner) {
        return '#ffd700'
      } else if (props.$isActive) {
        return props.$borderHighlightColor
      } else {
        return props.$defaultBorderColor
      }
    }};
  border-radius: ${props => Math.max(1, props.$borderRadius)}px;
  color: ${props => {
    if (props.$isWinner) {
      return '#ffd700'
    }
    return props.$textColor
  }};
  font-family: 'gohu', monospace;
  font-weight: bold;
  font-size: ${props => Math.max(12, props.$tileSize * 0.35)}px;
  text-shadow: ${props => {
    if (props.$isWinner) {
      return '0 0 15px #ffd700, 0 0 30px #ffd700'
    }
    return '0 0 10px rgba(255, 255, 255, 0.5)'
  }};
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: all 0.15s ease;
  margin-bottom: ${props => props.$tileSpacing}px;
  box-shadow: ${props => {
    if (props.$isWinner) {
      return '0 0 20px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3)'
    }
    return 'none'
  }};

  ${props =>
    props.$isWinner &&
    `
    animation: winnerPulse 1.2s ease-in-out infinite alternate;
    transform: scale(1.15) !important;
    z-index: 10;
    
    @keyframes winnerPulse {
      0% { 
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3);
      }
      100% { 
        box-shadow: 0 0 40px rgba(255, 215, 0, 1), inset 0 0 30px rgba(255, 215, 0, 0.5);
      }
    }
  `}

  &:hover {
    transform: ${props => (props.$isWinner ? 'scale(1.15)' : 'scale(1.05)')};
    border-color: ${props => (props.$isWinner ? '#ffd700' : 'rgba(255, 255, 255, 0.4)')};
  }
`

export const GridContainer = styled.div<{
  $tileSize: number
  $tileSpacing: number
}>`
  display: grid;
  grid-template-columns: repeat(6, ${props => props.$tileSize}px);
  grid-template-rows: repeat(6, ${props => props.$tileSize}px);
  gap: ${props => props.$tileSpacing}px;
  justify-content: center;
  align-content: center;
  margin-top: -10px;
`

export const Tile = styled(motion.div)<{
  $isRed: boolean
  $isZero: boolean
  $tileSize: number
  $borderRadius: number
  $isActive: boolean
  $isWinner: boolean
  $textColor: string
  $backgroundColor: string
  $borderHighlightColor: string
  $defaultBorderColor: string
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$tileSize}px;
  height: ${props => props.$tileSize}px;
  background: ${props => props.$backgroundColor};
  border: 3px solid
    ${props => {
      if (props.$isWinner) {
        return '#ffd700'
      } else if (props.$isActive) {
        return props.$borderHighlightColor
      } else {
        return props.$defaultBorderColor
      }
    }};
  border-radius: ${props => Math.max(1, props.$borderRadius)}px;
  color: ${props => {
    if (props.$isWinner) {
      return '#ffd700'
    }
    return props.$textColor
  }};
  font-family: 'gohu', monospace;
  font-weight: bold;
  font-size: ${props => Math.max(12, props.$tileSize * 0.35)}px;
  text-shadow: ${props => {
    if (props.$isWinner) {
      return '0 0 15px #ffd700, 0 0 30px #ffd700'
    }
    return '0 0 10px rgba(255, 255, 255, 0.5)'
  }};
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: all 0.15s ease;
  box-shadow: ${props => {
    if (props.$isWinner) {
      return '0 0 20px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3)'
    }
    return 'none'
  }};

  ${props =>
    props.$isWinner &&
    `
    animation: winnerPulse 1.2s ease-in-out infinite alternate;
    transform: scale(1.2) !important;
    z-index: 10;
    
    @keyframes winnerPulse {
      0% { 
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3);
      }
      100% { 
        box-shadow: 0 0 40px rgba(255, 215, 0, 1), inset 0 0 30px rgba(255, 215, 0, 0.5);
      }
    }
  `}

  &:hover {
    transform: ${props => (props.$isWinner ? 'scale(1.2)' : 'scale(1.05)')};
    border-color: ${props => (props.$isWinner ? '#ffd700' : 'rgba(255, 255, 255, 0.4)')};
  }
`
