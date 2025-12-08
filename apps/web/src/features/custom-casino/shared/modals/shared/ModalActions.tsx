import React from 'react'
import { cn } from '@/lib/utils'

// Props for the modal actions
interface ModalActionsProps {
  onCancel: () => void
  onConfirm?: () => void
  disabled?: boolean
  confirmDisabled?: boolean
  confirmText?: string
  cancelText?: string
  confirmButtonVariant?: 'primary' | 'danger'
}

// Button component
interface ButtonProps {
  onClick: () => void
  isPrimary?: boolean
  variant?: 'primary' | 'danger'
  disabled?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  isPrimary = false,
  variant = 'primary',
  disabled = false,
  children,
}) => {
  const getBackgroundColor = () => {
    if (!isPrimary) return 'rgba(20, 20, 20, 0.7)'
    return variant === 'danger' ? '#dc3545' : '#ff5e4f'
  }

  const getHoverBackgroundColor = () => {
    if (disabled) return getBackgroundColor()
    if (!isPrimary) return 'rgba(40, 40, 40, 0.8)'
    return variant === 'danger' ? '#c82333' : '#ff7a6e'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'text-white rounded-lg py-3 px-6 text-base cursor-pointer',
        'transition-all duration-200 h-[42px] min-w-[120px]',
        isPrimary ? 'border-none font-semibold' : 'border border-white/10 font-normal',
        disabled && 'opacity-60 cursor-not-allowed',
        !disabled && 'hover:-translate-y-px active:translate-y-0',
        'max-[992px]:w-full max-[992px]:h-12'
      )}
      style={{
        backgroundColor: getBackgroundColor(),
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = getHoverBackgroundColor()
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = getBackgroundColor()
      }}
    >
      {children}
    </button>
  )
}

/**
 * Standardized action buttons for modals
 */
export const ModalActions: React.FC<ModalActionsProps> = ({
  onCancel,
  onConfirm,
  disabled = false,
  confirmDisabled = false,
  confirmText = 'Save',
  cancelText = 'Cancel',
  confirmButtonVariant = 'primary',
}) => {
  return (
    <div className="flex justify-between mt-4 max-[992px]:flex-col max-[992px]:gap-4">
      <Button onClick={onCancel}>{cancelText}</Button>
      {onConfirm && (
        <Button
          isPrimary
          variant={confirmButtonVariant}
          onClick={onConfirm}
          disabled={disabled || confirmDisabled}
        >
          {confirmText}
        </Button>
      )}
    </div>
  )
}
