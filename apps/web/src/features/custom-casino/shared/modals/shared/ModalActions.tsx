import React from 'react'
import { Button } from '@/components/ui/button'
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

/**
 * Standardized action buttons for modals using shadcn Button
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
    <div className="flex justify-between mt-4 gap-3 max-[992px]:flex-col max-[992px]:gap-4">
      <Button
        variant="outline"
        onClick={onCancel}
        className={cn(
          'min-w-[120px] h-[42px] px-6',
          'bg-surface-raised border-border hover:bg-accent',
          'max-[992px]:w-full max-[992px]:h-12'
        )}
      >
        {cancelText}
      </Button>
      {onConfirm && (
        <Button
          variant={confirmButtonVariant === 'danger' ? 'destructive' : 'default'}
          onClick={onConfirm}
          disabled={disabled || confirmDisabled}
          className={cn(
            'min-w-[120px] h-[42px] px-6 font-semibold',
            confirmButtonVariant === 'danger'
              ? 'bg-destructive hover:bg-destructive/90'
              : 'bg-primary hover:bg-primary/90',
            'max-[992px]:w-full max-[992px]:h-12'
          )}
        >
          {confirmText}
        </Button>
      )}
    </div>
  )
}
