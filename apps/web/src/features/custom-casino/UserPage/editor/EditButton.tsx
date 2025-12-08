import React from 'react'
import { cn } from '@/lib/utils'

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

// Helper to format position values
const formatPosition = (value: string | number | undefined): string | undefined => {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

// State-based background colors
const bgColors: Record<EditButtonState, string> = {
  edit: 'rgba(40, 40, 40, 0.85)',
  active: 'rgba(80, 80, 80, 0.9)',
  saving: 'rgba(60, 60, 60, 0.85)',
  saved: 'rgba(40, 100, 40, 0.85)',
  failed: 'rgba(180, 40, 40, 0.85)',
}

const hoverBgColors: Record<EditButtonState, string> = {
  edit: 'rgba(60, 60, 60, 0.95)',
  active: 'rgba(100, 100, 100, 0.95)',
  saving: 'rgba(60, 60, 60, 0.85)',
  saved: 'rgba(50, 120, 50, 0.95)',
  failed: 'rgba(200, 60, 60, 0.95)',
}

// Icons
const EditIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] fill-white">
    <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" />
  </svg>
)

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] fill-white">
    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
  </svg>
)

const CheckmarkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="w-[18px] h-[18px] fill-white animate-icon-pop"
  >
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
)

const XmarkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="w-[18px] h-[18px] fill-white animate-icon-pop"
  >
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
)

// Loading dots component
const LoadingDots = () => (
  <span className="relative text-base text-white tracking-wide h-4 w-4 flex items-center justify-center">
    <span className="animate-loading-dots">.</span>
  </span>
)

export const EditButton: React.FC<EditButtonProps> = ({
  state = 'edit',
  onClick,
  className,
  fixed = false,
  disabled = false,
  position,
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

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
        return <LoadingDots />
      case 'saved':
        return <CheckmarkIcon />
      case 'failed':
        return <XmarkIcon />
      default:
        return <EditIcon />
    }
  }

  // Compute dynamic styles
  const dynamicStyles: React.CSSProperties = {
    position: fixed ? 'fixed' : undefined,
    top: formatPosition(position?.top),
    left: formatPosition(position?.left),
    right: formatPosition(position?.right),
    bottom: formatPosition(position?.bottom),
    background: isHovered ? hoverBgColors[state] : bgColors[state],
    boxShadow:
      state === 'active'
        ? 'inset 0 2px 4px rgba(0, 0, 0, 0.5)'
        : isHovered && state !== 'saving'
          ? '0 2px 4px rgba(0, 0, 0, 0.25)'
          : 'none',
    transform:
      state === 'active'
        ? 'scale(0.95)'
        : isHovered && state !== 'saving'
          ? 'scale(1.05)'
          : 'scale(1)',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out z-[1000]',
        disabled && 'cursor-default opacity-70',
        className
      )}
      style={dynamicStyles}
      title={getButtonTitle()}
      disabled={disabled}
      aria-label={getButtonTitle()}
      role="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderIcon()}
    </button>
  )
}

export default EditButton
