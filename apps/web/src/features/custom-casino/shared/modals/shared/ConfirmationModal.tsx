// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { SPACING, TEXT_COLORS } from '@/design'
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

const SMessage = styled.div`
  color: ${TEXT_COLORS.one};
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  padding: ${SPACING.lg}px;
`

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
      <SMessage>{message}</SMessage>
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