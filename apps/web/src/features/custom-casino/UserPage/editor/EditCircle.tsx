// @ts-nocheck
import React from 'react'
import { styled, keyframes } from 'styled-components'
import { FARE_COLORS } from '@/design'
import { useIsBreakpoint } from '@/hooks/common/useIsBreakpoint'

// Updated interface for the EditCircle with simpler props
interface EditCircleProps {
  onClick?: () => void
  title?: string
  $position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'center'
}

// Define animations
const editCirclePop = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const editCirclePulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    transform: scale(1);
  }
`

// Styled components
const EditButtonStyled = styled.button<{
  $position?: string
  $isMobileScreen?: boolean
}>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  background-color: rgba(40, 40, 40, 0.85);
  border: 2px solid ${FARE_COLORS.salmon};
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 100;
  transform-origin: center;
  animation:
    ${editCirclePop} 0.3s ease forwards,
    ${editCirclePulse} 3s ease-in-out 2s infinite;

  ${({ $position, $isMobileScreen }) => {
    switch ($position) {
      case 'topRight':
        return `
          top: ${$isMobileScreen ? '-30px' : '-10px'};
          right: ${$isMobileScreen ? '0' : '-10px'};
        `
      case 'topLeft':
        return `
          top: -10px;
          left: -10px;
        `
      case 'bottomRight':
        return `
          bottom: -10px;
          right: -10px;
        `
      case 'bottomLeft':
        return `
          bottom: -10px;
          left: -10px;
        `
      case 'center':
        return `
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `
      default:
        return `
          top: -10px;
          left: -10px;
        `
    }
  }}

  &:hover {
    filter: brightness(1.2);
    transform: scale(1.1);
  }

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`

// Simple edit icon
const EditIcon = () => (
  <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z' />
  </svg>
)

// EditCircle component - simplified version
export const EditCircle: React.FC<EditCircleProps> = ({
  onClick,
  title,
  $position = 'topLeft',
}) => {
  const isMobileScreen = useIsBreakpoint('sm')

  return (
    <EditButtonStyled
      onClick={onClick}
      $position={$position}
      title={title}
      $isMobileScreen={isMobileScreen}
    >
      <EditIcon />
    </EditButtonStyled>
  )
}

// Interface for the container that uses EditCircle
interface EditableContainerProps {
  children: React.ReactNode
  isEditable?: boolean
  className?: string
}

const EditableWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: auto;
  height: auto;
`

// Simplified EditableContainer that just wraps content
export const EditableContainer: React.FC<EditableContainerProps> = ({ children, className }) => {
  return <EditableWrapper className={className}>{children}</EditableWrapper>
}
