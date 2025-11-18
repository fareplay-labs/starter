// @ts-nocheck
import React from 'react'
import styled from 'styled-components'

const StyledButton = styled.button<{ $disabled: boolean; $loading: boolean }>`
  // Match GameButton dimensions and styling
  width: 100%;
  height: 48px;
  padding: 12px 24px;
  
  // Match GameButton's border and radius
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  
  // Hard-coded demo mode color (purple-ish to differentiate from real mode)
  background: ${props => props.$disabled ? 'rgba(100, 100, 100, 0.3)' : 'rgba(139, 92, 246, 0.8)'};
  
  // Text styling
  color: ${props => props.$disabled ? 'rgba(255, 255, 255, 0.4)' : 'white'};
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  // Interaction states
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: rgba(139, 92, 246, 1);
    border-color: rgba(139, 92, 246, 0.5);
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  // Loading state animation
  ${props => props.$loading && `
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.05),
        transparent
      );
      animation: loading 2s infinite;
    }
    
    @keyframes loading {
      0% { left: -100%; }
      100% { left: 100%; }
    }
  `}
`

interface DemoSubmitButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  children?: React.ReactNode
  accentColor?: string // Keep for compatibility but don't use
}

/**
 * A styled submit button specifically for demo mode
 * Mirrors the GameButton styling but with a distinct color
 */
export const DemoSubmitButton: React.FC<DemoSubmitButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  children,
}) => {
  return (
    <StyledButton
      onClick={onClick}
      disabled={disabled || loading}
      $disabled={disabled || loading}
      $loading={loading}
      type='button'
    >
      {loading ? 'PROCESSING...' : children || 'PLAY DEMO'}
    </StyledButton>
  )
}