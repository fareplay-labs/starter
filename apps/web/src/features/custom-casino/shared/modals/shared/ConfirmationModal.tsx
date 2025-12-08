import React from 'react'
import { ModalBase } from './ModalBase'
import { ModalActions } from './ModalActions'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonVariant?: 'primary' | 'danger'
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonVariant = 'primary',
}) => {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={title} maxWidth='400px'>
      <div className="text-white text-base leading-relaxed text-center p-6">
        {message}
      </div>
      <ModalActions
        onCancel={onClose}
        onConfirm={onConfirm}
        confirmText={confirmText}
        cancelText={cancelText}
        confirmButtonVariant={confirmButtonVariant}
      />
    </ModalBase>
  )
}
