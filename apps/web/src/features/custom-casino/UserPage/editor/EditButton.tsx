// @ts-nocheck
import React from 'react'
import { styled, keyframes, css } from 'styled-components'

// Define button states
export type EditButtonState = 'edit' | 'saving' | 'saved' | 'active' | 'failed'

interface EditButtonProps {
  state?: EditButtonState
  onClick: () => void
  className?: string
  fixed?: boolean
  disabled?: boolean
  position?: {
    top?: string | number
    left?: string | number
    right?: string | number
    bottom?: string | number
  }
}

// Loading dots animation
const loadingDots = keyframes`
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
  100% { content: '.'; }
`

// Success animation
const checkmark = keyframes`
  0% { 
    transform: scale(0); 
    opacity: 0;
  }
  50% { 
    transform: scale(1.2); 
    opacity: 1;
  }
  100% { 
    transform: scale(1); 
    opacity: 1;
  }
`

// Failure animation (same as checkmark but for X-mark)
const xmark = keyframes`
  0% { 
    transform: scale(0); 
    opacity: 0;
  }
  50% { 
    transform: scale(1.2); 
    opacity: 1;
  }
  100% { 
    transform: scale(1); 
    opacity: 1;
  }
`

const checkmarkAnimation = css`
  animation: ${checkmark} 0.5s ease forwards;
`

const xmarkAnimation = css`
  animation: ${xmark} 0.5s ease forwards;
`

const SEditButton = styled.button<{
  $state: EditButtonState
  $fixed?: boolean
  $position?: EditButtonProps['position']
}>`
  ${props => (props.$fixed ? 'position: fixed;' : '')}
  ${props =>
    props.$position?.top ?
      `top: ${typeof props.$position.top === 'number' ? `${props.$position.top}px` : props.$position.top};`
    : ''}
  ${props =>
    props.$position?.left ?
      `left: ${typeof props.$position.left === 'number' ? `${props.$position.left}px` : props.$position.left};`
    : ''}
  ${props =>
    props.$position?.right ?
      `right: ${typeof props.$position.right === 'number' ? `${props.$position.right}px` : props.$position.right};`
    : ''}
  ${props =>
    props.$position?.bottom ?
      `bottom: ${typeof props.$position.bottom === 'number' ? `${props.$position.bottom}px` : props.$position.bottom};`
    : ''}
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$state) {
      case 'active':
        return 'rgba(80, 80, 80, 0.9)'
      case 'saving':
        return 'rgba(60, 60, 60, 0.85)'
      case 'saved':
        return 'rgba(40, 100, 40, 0.85)'
      case 'failed':
        return 'rgba(180, 40, 40, 0.85)'
      default:
        return 'rgba(40, 40, 40, 0.85)'
    }
  }};
  border: 2px solid rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: ${props =>
    props.$state === 'active' ? 'inset 0 2px 4px rgba(0, 0, 0, 0.5)' : 'none'};
  transform: ${props => (props.$state === 'active' ? 'scale(0.95)' : 'scale(1)')};
  z-index: 1000;

  &:hover {
    background: ${props => {
      // Apply consistent hover brightening effect across all states
      switch (props.$state) {
        case 'active':
          return 'rgba(100, 100, 100, 0.95)'
        case 'saving':
          return 'rgba(60, 60, 60, 0.85)' // No change during saving
        case 'saved':
          return 'rgba(50, 120, 50, 0.95)'
        case 'failed':
          return 'rgba(200, 60, 60, 0.95)'
        default:
          return 'rgba(60, 60, 60, 0.95)'
      }
    }};
    transform: ${props => {
      // Consistent transform effect - no scale during saving, slight grow otherwise
      if (props.$state === 'saving') return 'scale(1)' // No transform during saving
      if (props.$state === 'active') return 'scale(0.95)' // Keep pressed state
      return 'scale(1.05)' // Consistent subtle grow effect for all other states
    }};
    box-shadow: ${
      props =>
        props.$state === 'active' ?
          'inset 0 2px 4px rgba(0, 0, 0, 0.5)' // Keep inset shadow for active
        : props.$state === 'saving' ?
          'none' // No shadow during saving
        : '0 2px 4px rgba(0, 0, 0, 0.25)' // Consistent subtle shadow for other states
    };
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }

  svg {
    width: 18px;
    height: 18px;
    fill: #ffffff;
  }

  .dots {
    position: relative;
    font-size: 16px;
    color: white;
    letter-spacing: 1px;
    height: 16px;
    width: 16px;

    &::after {
      content: '.';
      animation: ${loadingDots} 1.5s infinite;
      position: absolute;
      left: 1px;
      bottom: -4px;
    }
  }
`

const EditIcon = () => (
  <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z' />
  </svg>
)

const SaveIcon = () => (
  <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z' />
  </svg>
)

// Create a styled SVG component with the animation applied properly
const AnimatedSvg = styled.svg`
  ${checkmarkAnimation}
`

const CheckmarkIcon = () => (
  <AnimatedSvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
  </AnimatedSvg>
)

// Create a styled SVG component for the X-mark with animation
const AnimatedXSvg = styled.svg`
  ${xmarkAnimation}
`

const XmarkIcon = () => (
  <AnimatedXSvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z' />
  </AnimatedXSvg>
)

export const EditButton: React.FC<EditButtonProps> = ({
  state = 'edit',
  onClick,
  className,
  fixed = false,
  disabled = false,
  position,
}) => {
  // Get the appropriate button title based on state
  const getButtonTitle = () => {
    switch (state) {
      case 'active':
        return 'Save and exit edit mode'
      case 'saving':
        return 'Saving changes...'
      case 'saved':
        return 'Changes saved'
      case 'failed':
        return 'Save failed'
      default:
        return 'Enter edit mode'
    }
  }

  // Return the appropriate icon based on state
  const renderIcon = () => {
    switch (state) {
      case 'active':
        return <SaveIcon />
      case 'saving':
        return <span className='dots'></span>
      case 'saved':
        return <CheckmarkIcon />
      case 'failed':
        return <XmarkIcon />
      default:
        return <EditIcon />
    }
  }

  return (
    <SEditButton
      onClick={onClick}
      className={className}
      $state={state}
      $fixed={fixed}
      $position={position}
      title={getButtonTitle()}
      disabled={disabled}
      aria-label={getButtonTitle()}
      role='button'
    >
      {renderIcon()}
    </SEditButton>
  )
}

export default EditButton
