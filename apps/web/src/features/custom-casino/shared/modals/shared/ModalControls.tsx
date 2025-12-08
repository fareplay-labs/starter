import React, { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Button Props interface
export interface ButtonProps {
  onClick: () => void
  isPrimary?: boolean
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}

/**
 * Button component for modals
 */
export const Button: React.FC<ButtonProps> = ({
  onClick,
  isPrimary = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  children,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        'p-4 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 text-center',
        fullWidth ? 'flex-1' : '',
        isPrimary
          ? 'bg-[#ff5e4f] text-white border-none hover:bg-[#d900d5]'
          : 'bg-transparent text-white border border-[#1b1d26] hover:bg-white/10',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )
}

// ButtonGroup Props interface
export interface ButtonGroupProps {
  children: ReactNode
}

/**
 * Button group component for modal actions
 */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children }) => {
  return (
    <div className="flex gap-4 mt-4 max-[992px]:flex-col">
      {children}
    </div>
  )
}

// Standard modal action buttons for OK/Cancel or Save/Cancel patterns
export interface ModalActionsProps {
  onCancel: () => void
  onConfirm: () => void
  cancelText?: string
  confirmText?: string
  confirmDisabled?: boolean
}

/**
 * Standard modal action buttons (Cancel/Save)
 */
export const ModalActions: React.FC<ModalActionsProps> = ({
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Save Changes',
  confirmDisabled = false,
}) => {
  return (
    <ButtonGroup>
      <Button onClick={onCancel} fullWidth>
        {cancelText}
      </Button>
      <Button onClick={onConfirm} isPrimary fullWidth disabled={confirmDisabled}>
        {confirmText}
      </Button>
    </ButtonGroup>
  )
}
