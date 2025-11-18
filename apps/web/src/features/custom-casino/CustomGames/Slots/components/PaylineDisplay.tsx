// @ts-nocheck
import React from 'react'
import styled from 'styled-components'

const PaylineContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 5;
`

const Payline = styled.div<{ $color: string; $pattern: string }>`
  position: absolute;
  height: 2px;
  background: ${props => props.$color};
  box-shadow: 0 0 10px ${props => props.$color};
  opacity: 0.8;

  &::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.$color};
    box-shadow: 0 0 15px ${props => props.$color};
  }

  &::after {
    content: '';
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.$color};
    box-shadow: 0 0 15px ${props => props.$color};
  }
`

interface PaylineDisplayProps {
  lines: number[]
  columns: number
  color: string
}

export const PaylineDisplay: React.FC<PaylineDisplayProps> = ({ lines, columns, color }) => {
  // Define payline patterns based on number of columns
  const getPaylinePattern = (lineNumber: number, columns: number): string => {
    // Simple patterns for demonstration
    // In a real implementation, these would match the actual payline patterns
    const patterns: Record<number, string> = {
      1: 'middle', // Straight across middle
      2: 'top', // Straight across top
      3: 'bottom', // Straight across bottom
      4: 'v-shape', // V shape
      5: 'inverted-v', // Inverted V
    }

    return patterns[lineNumber] || 'middle'
  }

  const getPaylineStyle = (pattern: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      left: 0,
    }

    switch (pattern) {
      case 'top':
        return { ...baseStyle, top: '25%' }
      case 'middle':
        return { ...baseStyle, top: '50%' }
      case 'bottom':
        return { ...baseStyle, top: '75%' }
      case 'v-shape':
        return {
          ...baseStyle,
          top: '50%',
          transform: 'rotate(5deg)',
          transformOrigin: 'center',
        }
      case 'inverted-v':
        return {
          ...baseStyle,
          top: '50%',
          transform: 'rotate(-5deg)',
          transformOrigin: 'center',
        }
      default:
        return { ...baseStyle, top: '50%' }
    }
  }

  return (
    <PaylineContainer>
      {lines.map(lineNumber => {
        const pattern = getPaylinePattern(lineNumber, columns)
        const style = getPaylineStyle(pattern)

        return <Payline key={lineNumber} $color={color} $pattern={pattern} style={style} />
      })}
    </PaylineContainer>
  )
}
