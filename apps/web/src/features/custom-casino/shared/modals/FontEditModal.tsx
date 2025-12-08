import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ModalBase } from './shared/ModalBase'
import { ModalActions } from './shared/ModalActions'
import { fontOptions, applyFontToPage } from '../utils/fontUtils'
import { type FieldEditModalProps } from './shared/modalTypes'

/**
 * Modal for selecting fonts
 */
const FontEditModal: React.FC<FieldEditModalProps> = ({
  isOpen,
  onClose,
  fieldName,
  onSave,
  currentValue = 'Arial, Helvetica, sans-serif',
}) => {
  // State for selected font
  const [selectedFont, setSelectedFont] = useState(currentValue)

  // Reset state when modal opens with new value
  useEffect(() => {
    if (isOpen) {
      setSelectedFont(currentValue || 'Arial, Helvetica, sans-serif')
    }
  }, [isOpen, currentValue])

  // Handle font selection
  const handleFontSelect = (fontValue: string) => {
    setSelectedFont(fontValue)
    // Apply font for preview (buttons are excluded via CSS)
    applyFontToPage(fontValue)
  }

  // Handle save action
  const handleSave = () => {
    onSave(fieldName, selectedFont)
    onClose()
  }

  // Get font label from value for display
  const getFontLabel = (fontValue: string) => {
    const font = fontOptions.find(f => f.value === fontValue)
    return font ? font.label : fontValue.split(',')[0]
  }

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title='Choose a Font' maxWidth='600px'>
      {/* Font preview */}
      <div
        className="p-4 bg-black/20 rounded-lg mb-4"
        style={{ fontFamily: selectedFont }}
      >
        <h3 className="text-[#aaaaaa] text-sm mb-3">Font Preview</h3>
        <p className="text-white text-lg m-0">Fareplay is a decentralized Web3 crypto casino</p>
        <p className="text-[#aaaaaa] text-xs mt-3">
          Current selection: <strong>{getFontLabel(selectedFont)}</strong>
        </p>
      </div>

      {/* Font grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-h-[400px] overflow-y-auto scrollbar-thin">
        {fontOptions.map((font, index) => (
          <button
            key={index}
            className={cn(
              'font-selector-button bg-black/20 rounded-lg p-4 text-center cursor-pointer',
              'text-white transition-all duration-200 h-20 flex items-center justify-center',
              'hover:bg-white/5 border-2',
              selectedFont === font.value ? 'border-white' : 'border-[#1b1d26]'
            )}
            style={{ fontFamily: `${font.value} !important` }}
            onClick={() => handleFontSelect(font.value)}
          >
            {font.label}
          </button>
        ))}
      </div>

      <ModalActions onCancel={onClose} onConfirm={handleSave} />
    </ModalBase>
  )
}

export default FontEditModal
