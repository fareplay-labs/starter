// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { SPACING, BREAKPOINTS } from '@/design'

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

// Styled components
const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${SPACING.md}px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    flex-direction: column;
    gap: ${SPACING.md}px;
  }
`

const Button = styled.button<{ $isPrimary?: boolean; $variant?: 'primary' | 'danger' }>`
  background-color: ${props => {
    if (!props.$isPrimary) return 'rgba(20, 20, 20, 0.7)';
    return props.$variant === 'danger' ? '#dc3545' : '#ff5e4f';
  }};
  color: #ffffff;
  border: ${props => (props.$isPrimary ? 'none' : '1px solid rgba(255, 255, 255, 0.1)')};
  border-radius: 8px;
  padding: ${SPACING.sm}px ${SPACING.lg}px;
  font-size: 1rem;
  font-weight: ${props => (props.$isPrimary ? '600' : 'normal')};
  cursor: pointer;
  transition: all 0.2s ease;
  height: 42px;
  min-width: 120px;
  opacity: ${props => (props.disabled ? 0.6 : 1)};

  &:hover {
    background-color: ${props => {
      if (props.disabled) {
        return props.$isPrimary ? 
          (props.$variant === 'danger' ? '#dc3545' : '#ff5e4f') : 
          'rgba(20, 20, 20, 0.7)';
      }
      if (!props.$isPrimary) return 'rgba(40, 40, 40, 0.8)';
      return props.$variant === 'danger' ? '#c82333' : '#ff7a6e';
    }};
    transform: ${props => (props.disabled ? 'none' : 'translateY(-1px)')};
  }

  &:active {
    transform: ${props => (props.disabled ? 'none' : 'translateY(0)')};
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    width: 100%;
    height: 48px;
  }
`

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
    <ButtonGroup>
      <Button onClick={onCancel}>{cancelText}</Button>
      {onConfirm && (
        <Button $isPrimary $variant={confirmButtonVariant} onClick={onConfirm} disabled={disabled || confirmDisabled}>
          {confirmText}
        </Button>
      )}
    </ButtonGroup>
  )
}
