import React from 'react'
import { cn } from '@/lib/utils'
import { useIsBreakpoint } from '@/hooks/common/useIsBreakpoint'

// Updated interface for the EditCircle with simpler props
interface EditCircleProps {
  onClick?: () => void
  title?: string
  $position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'center'
}

// Position styles mapped to Tailwind-compatible values
const getPositionStyles = (
  position: EditCircleProps['$position'],
  isMobile: boolean
): React.CSSProperties => {
  switch (position) {
    case 'topRight':
      return {
        top: isMobile ? '-30px' : '-10px',
        right: isMobile ? '0' : '-10px',
      }
    case 'topLeft':
      return {
        top: '-10px',
        left: '-10px',
      }
    case 'bottomRight':
      return {
        bottom: '-10px',
        right: '-10px',
      }
    case 'bottomLeft':
      return {
        bottom: '-10px',
        left: '-10px',
      }
    case 'center':
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    default:
      return {
        top: '-10px',
        left: '-10px',
      }
  }
}

// Simple edit icon
const EditIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current">
    <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" />
  </svg>
)

// EditCircle component - simplified version
export const EditCircle: React.FC<EditCircleProps> = ({
  onClick,
  title,
  $position = 'topLeft',
}) => {
  const isMobileScreen = useIsBreakpoint('sm')
  const positionStyles = getPositionStyles($position, isMobileScreen)

  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'absolute flex items-center justify-center w-8 h-8 rounded-full text-white',
        'bg-[rgba(40,40,40,0.85)] border-2 border-[#ff5e4f] cursor-pointer',
        'transition-all duration-200 ease-out z-[100] origin-center',
        'hover:brightness-125 hover:scale-110',
        'animate-edit-circle-pop',
        // Add pulse animation after pop completes (handled via CSS)
      )}
      style={{
        ...positionStyles,
        // Compound animation: pop then pulse
        animation: 'editCirclePop 0.3s ease forwards, editCirclePulse 3s ease-in-out 2s infinite',
      }}
    >
      <EditIcon />
    </button>
  )
}

// Interface for the container that uses EditCircle
interface EditableContainerProps {
  children: React.ReactNode
  isEditable?: boolean
  className?: string
}

// Simplified EditableContainer that just wraps content
export const EditableContainer: React.FC<EditableContainerProps> = ({ children, className }) => {
  return (
    <div className={cn('relative inline-block w-auto h-auto', className)}>
      {children}
    </div>
  )
}
