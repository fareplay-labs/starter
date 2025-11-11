// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { ModalBase } from './shared/ModalBase'
import { ModalActions } from './shared/ModalActions'
import { styled } from 'styled-components'
import { SPACING, TEXT_COLORS, BORDER_COLORS } from '@/design'
import { fontOptions, applyFontToPage } from '../utils/fontUtils'
import { type FieldEditModalProps } from './shared/modalTypes'

// Font option grid
const SFontGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${SPACING.md}px;
  margin-bottom: ${SPACING.lg}px;
  max-height: 400px;
  overflow-y: auto;
`

// Font option card - with class to exempt from global font override
const SFontOption = styled.button<{ $isSelected?: boolean; $fontFamily: string }>`
  background-color: rgba(0, 0, 0, 0.2);
  border: 2px solid ${props => (props.$isSelected ? 'white' : BORDER_COLORS.one)};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  text-align: center;
  cursor: pointer;
  color: ${TEXT_COLORS.one};
  transition: all 0.2s ease;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  /* Increase specificity so this wins over broad page-level rules
     that force font inheritance on buttons */
  && {
    font-family: ${props => props.$fontFamily} !important;
  }
`

// Font preview
const SFontPreview = styled.div<{ $fontFamily: string }>`
  padding: ${SPACING.md}px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: ${SPACING.md}px;
  font-family: ${props => props.$fontFamily};
`

// Preview title
const SPreviewTitle = styled.h3`
  color: ${TEXT_COLORS.two};
  font-size: 14px;
  margin-bottom: ${SPACING.sm}px;
`

// Preview text
const SPreviewText = styled.p`
  color: ${TEXT_COLORS.one};
  font-size: 18px;
  margin: 0;
`

// Preview caption
const SPreviewCaption = styled.p`
  color: ${TEXT_COLORS.two};
  font-size: 12px;
  margin-top: ${SPACING.sm}px;
`

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
      <SFontPreview $fontFamily={selectedFont}>
        <SPreviewTitle>Font Preview</SPreviewTitle>
        <SPreviewText>Fareplay is a decentralizedWeb3 crypto casino </SPreviewText>
        <SPreviewCaption>
          Current selection: <strong>{getFontLabel(selectedFont)}</strong>
        </SPreviewCaption>
      </SFontPreview>

      <SFontGrid>
        {fontOptions.map((font, index) => (
          <SFontOption
            key={index}
            className="font-selector-button"
            $fontFamily={font.value}
            $isSelected={selectedFont === font.value}
            onClick={() => handleFontSelect(font.value)}
          >
            {font.label}
          </SFontOption>
        ))}
      </SFontGrid>

      <ModalActions onCancel={onClose} onConfirm={handleSave} />
    </ModalBase>
  )
}

export default FontEditModal
