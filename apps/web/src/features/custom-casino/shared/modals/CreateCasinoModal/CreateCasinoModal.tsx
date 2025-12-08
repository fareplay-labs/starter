// @ts-nocheck
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ModalBase } from '../shared/ModalBase'
import { ModalActions } from '../shared/ModalActions'

interface CreateCasinoModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectAI?: () => void
  username: string
}

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
    <div className="flex flex-col gap-6">
      {/* Intro Text */}
      <p className="m-0 text-[#aaaaaa]">Choose how you want to create your casino:</p>

      {/* Option Container */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* AI Designer Option */}
        <div
          onClick={() => handleOptionSelect('ai')}
          className={cn(
            'flex-1 p-6 rounded-xl bg-[rgba(20,20,20,0.85)] cursor-pointer',
            'transition-all duration-200 border-2',
            selected === 'ai' ? 'border-[#ff5e4f]' : 'border-white/[0.08]',
            selected !== 'ai' && 'hover:border-white/25 hover:-translate-y-0.5',
            'active:translate-y-0'
          )}
        >
          <h3 className="m-0 mb-3 text-white text-center">AI Designer</h3>
          <div className="h-px bg-white/10 my-3" />
          <p className="m-0 text-[#aaaaaa] text-center">
            {aiEnabled
              ? 'Let our AI create a unique casino design for you based on your preferences.'
              : 'AI-assisted design is coming soon.'}
          </p>
        </div>

        {/* Manual Setup Option */}
        <div
          onClick={() => handleOptionSelect('manual')}
          className={cn(
            'flex-1 p-6 rounded-xl bg-[rgba(20,20,20,0.85)] cursor-pointer',
            'transition-all duration-200 border-2',
            selected === 'manual' ? 'border-[#ff5e4f]' : 'border-white/[0.08]',
            selected !== 'manual' && 'hover:border-white/25 hover:-translate-y-0.5',
            'active:translate-y-0'
          )}
        >
          <h3 className="m-0 mb-3 text-white text-center">Manual Setup</h3>
          <div className="h-px bg-white/10 my-3" />
          <p className="m-0 text-[#aaaaaa] text-center">
            Design your casino manually with complete control over all aspects.
          </p>
        </div>
      </div>
    </div>
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
