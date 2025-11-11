// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { SPACING, BREAKPOINTS } from '@/design'

// Props for the modal base
interface ModalBaseProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
  backdropClickDisabledRef?: React.RefObject<boolean>
}

// Styled components
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${SPACING.md}px;
  backdrop-filter: blur(2px);
  transition: opacity 0.2s ease;
`

const ModalContainer = styled.div<{ $maxWidth: string }>`
  background-color: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: ${SPACING.lg}px 0;
  width: 100%;
  max-width: ${props => props.$maxWidth};
  max-height: 85vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.md}px;
  position: relative;
  box-sizing: border-box;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    padding: ${SPACING.md}px 0;
    max-width: 95%;
    max-height: 90vh;
  }
`

const ModalHeader = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: ${SPACING.md}px;
  padding: 0 ${SPACING.lg}px;
  box-sizing: border-box;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    padding: 0 ${SPACING.md}px;
  }
`

const ModalTitle = styled.h2`
  color: #ffffff;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
  text-align: center;
  width: 100%;
  line-height: 1.2;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 10;
  padding: 0;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  padding-top: 4px;
  padding-right: 1px;
  justify-content: center;
  width: 28px;
  height: 28px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    right: ${SPACING.md}px;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
`

const ModalContent = styled.div`
  padding: 0 ${SPACING.lg}px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    padding: 0 ${SPACING.md}px;
  }
`

/**
 * Base modal component with backdrop and container
 */
export const ModalBase: React.FC<ModalBaseProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '500px',
  backdropClickDisabledRef,
}) => {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!backdropClickDisabledRef?.current) {
      onClose()
    }
  }

  return (
    <ModalBackdrop onClick={handleBackdropClick}>
      <ModalContainer onClick={e => e.stopPropagation()} $maxWidth={maxWidth}>
        <CloseButton onClick={onClose} aria-label='Close modal'>
          ✕
        </CloseButton>
        {title && (
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
          </ModalHeader>
        )}
        <ModalContent>{children}</ModalContent>
      </ModalContainer>
    </ModalBackdrop>
  )
}
