// @ts-nocheck
import React, { type ReactNode } from 'react'
import { styled } from 'styled-components'
import { BREAKPOINTS, SPACING, TEXT_COLORS, BORDER_COLORS, FARE_COLORS } from '@/design'

// Button group container
const SButtonGroup = styled.div`
  display: flex;
  gap: ${SPACING.md}px;
  margin-top: ${SPACING.md}px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    flex-direction: column;
  }
`

// Base button styling
const SButton = styled.button<{ $isPrimary?: boolean; $fullWidth?: boolean }>`
  flex: ${props => (props.$fullWidth ? 1 : 'initial')};
  padding: ${SPACING.md}px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  ${props =>
    props.$isPrimary ?
      `
    background-color: ${FARE_COLORS.salmon};
    color: white;
    border: none;
    
    &:hover {
      background-color: ${FARE_COLORS.pink};
    }
  `
    : `
    background-color: transparent;
    color: ${TEXT_COLORS.one};
    border: 1px solid ${BORDER_COLORS.one};
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

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
    <SButton
      onClick={onClick}
      $isPrimary={isPrimary}
      $fullWidth={fullWidth}
      disabled={disabled}
      type={type}
    >
      {children}
    </SButton>
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
  return <SButtonGroup>{children}</SButtonGroup>
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
