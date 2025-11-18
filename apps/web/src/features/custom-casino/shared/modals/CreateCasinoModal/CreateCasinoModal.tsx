// @ts-nocheck
import React, { useState } from 'react'
import { styled } from 'styled-components'
import { ModalBase } from '../shared/ModalBase'
import { ModalActions } from '../shared/ModalActions'
import { SPACING, FARE_COLORS, TEXT_COLORS } from '@/design'

interface CreateCasinoModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectAI?: () => void
  username: string
}

// Styled Components
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.lg}px;
`

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.lg}px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`

const OptionCard = styled.div<{ $selected?: boolean }>`
  flex: 1;
  padding: ${SPACING.lg}px;
  border-radius: 12px;
  /* Use a slightly stronger backdrop than the old rgba(30,30,30,0.4) to match other modals */
  background-color: rgba(20, 20, 20, 0.85);
  border: 2px solid ${props => (props.$selected ? FARE_COLORS.salmon : 'rgba(255, 255, 255, 0.08)')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => (props.$selected ? FARE_COLORS.salmon : 'rgba(255, 255, 255, 0.25)')};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`

const OptionTitle = styled.h3`
  margin: 0 0 ${SPACING.sm}px 0;
  color: ${TEXT_COLORS.one};
  text-align: center;
`

const OptionDivider = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: ${SPACING.sm}px 0;
`

const OptionDescription = styled.p`
  margin: 0;
  color: ${TEXT_COLORS.two};
  text-align: center;
`

// Subtle intro text at top of the modal
const IntroText = styled.p`
  margin: 0;
  color: ${TEXT_COLORS.two};
`

export const CreateCasinoModal: React.FC<CreateCasinoModalProps> = ({
  isOpen,
  onClose,
  onSelectAI,
  username,
}) => {
  const [selected, setSelected] = useState<'ai' | 'manual' | null>(null)
  const aiEnabled = Boolean(onSelectAI)

  // Handle option selection
  const handleOptionSelect = (option: 'ai' | 'manual') => {
    if (option === 'ai' && !aiEnabled) {
      return
    }
    setSelected(option)
  }

  // Handle next button click
  const handleNext = () => {
    if (selected === 'ai') {
      if (aiEnabled && onSelectAI) {
        onClose()
        onSelectAI()
      }
    } else if (selected === 'manual') {
      // Close modal and let user create manually
      onClose()
    }
  }

  // Render the selection page
  const renderSelectionPage = () => (
    <ModalContent>
      <IntroText>Choose how you want to create your casino:</IntroText>
      <OptionContainer>
        <OptionCard $selected={selected === 'ai'} onClick={() => handleOptionSelect('ai')}>
          <OptionTitle>AI Designer</OptionTitle>
          <OptionDivider />
          <OptionDescription>
            {aiEnabled
              ? 'Let our AI create a unique casino design for you based on your preferences.'
              : 'AI-assisted design is coming soon.'}
          </OptionDescription>
        </OptionCard>
        <OptionCard $selected={selected === 'manual'} onClick={() => handleOptionSelect('manual')}>
          <OptionTitle>Manual Setup</OptionTitle>
          <OptionDivider />
          <OptionDescription>
            Design your casino manually with complete control over all aspects.
          </OptionDescription>
        </OptionCard>
      </OptionContainer>
    </ModalContent>
  )

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title='Create a New Casino' maxWidth='500px'>
      {renderSelectionPage()}
      <ModalActions
        onCancel={onClose}
        onConfirm={handleNext}
        confirmDisabled={!selected}
        confirmText={selected === 'manual' ? 'Continue' : 'Next'}
        cancelText='Cancel'
      />
    </ModalBase>
  )
}
