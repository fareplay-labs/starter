// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { ModalBase } from './shared/ModalBase'
import { ModalActions } from './shared/ModalActions'
import { styled } from 'styled-components'
import { SPACING } from '@/design'
import { type FieldEditModalProps } from './shared/modalTypes'

// Color input container
const SColorInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.md}px;
  width: 100%;
  margin-bottom: ${SPACING.md}px;
`

// Color picker container
const SColorPickerWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${SPACING.md}px;
`

// Color preview
const SColorPreview = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${props => props.$color};
  border: 2px solid rgba(255, 255, 255, 0.1);
`

// Color input
const SColorInput = styled.input<{ $isValid: boolean }>`
  width: 70%;
  padding: ${SPACING.sm}px;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid
    ${props => (props.$isValid ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 80, 80, 0.7)')};
  border-radius: 4px;
  color: white;
  font-family: monospace;
`

// Native color picker
const SColorPicker = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 8px;
  }
`

// Label
const SLabel = styled.label`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: ${SPACING.xs}px;
`

// Error message
const SErrorMessage = styled.div`
  color: rgba(255, 80, 80, 0.9);
  font-size: 12px;
  margin-top: ${SPACING.xs}px;
`

/**
 * Validates if a string is a valid color format (hex, rgb, rgba)
 * @param color The color string to validate
 * @returns Whether the color format is valid
 */
const isValidColor = (color: string): boolean => {
  // Check if empty
  if (!color || color.trim() === '') return false

  // Check for hex format (#fff or #ffffff)
  const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/
  if (hexRegex.test(color)) return true

  // Check for rgb format
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
  if (rgbRegex.test(color)) return true

  // Check for rgba format
  const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*\)$/
  if (rgbaRegex.test(color)) return true

  return false
}

/**
 * Modal for editing color values
 */
const ColorEditModal: React.FC<FieldEditModalProps> = ({
  isOpen,
  onClose,
  fieldName,
  onSave,
  currentValue = '#ffffff',
}) => {
  // State for color value
  const [colorValue, setColorValue] = useState(currentValue)
  // State for validation
  const [isValid, setIsValid] = useState(true)
  // State for error message
  const [errorMessage, setErrorMessage] = useState('')

  // Reset state when modal opens with new value
  useEffect(() => {
    if (isOpen) {
      setColorValue(currentValue || '#ffffff')
      setIsValid(true)
      setErrorMessage('')
    }
  }, [isOpen, currentValue])

  // Handle color input change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setColorValue(newValue)

    // Validate on input change
    const valid = isValidColor(newValue)
    setIsValid(valid)

    if (!valid) {
      setErrorMessage(
        'Please enter a valid color format: #RGB, #RRGGBB, rgb(r,g,b), or rgba(r,g,b,a)'
      )
    } else {
      setErrorMessage('')
    }
  }

  // Get a display name for the field from the fieldName
  const getDisplayName = () => {
    if (fieldName.includes('.')) {
      const [_, colorName] = fieldName.split('.')
      return colorName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  // Handle save action
  const handleSave = () => {
    // Only save if the color is valid
    if (isValid) {
      onSave(fieldName, colorValue)
      onClose()
    }
  }

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Edit ${getDisplayName()}`}>
      <SColorInputContainer>
        <SLabel htmlFor='color-input'>Choose a color:</SLabel>
        <SColorPickerWrapper>
          <SColorPreview $color={isValid ? colorValue : '#ff5050'} />
          <SColorInput
            id='color-input'
            type='text'
            value={colorValue}
            onChange={handleColorChange}
            $isValid={isValid}
            aria-invalid={!isValid}
            aria-describedby={!isValid ? 'color-error' : undefined}
          />
          <SColorPicker
            type='color'
            value={isValid ? colorValue : '#ff5050'}
            onChange={handleColorChange}
            aria-label='Color picker'
          />
        </SColorPickerWrapper>
        {!isValid && <SErrorMessage id='color-error'>{errorMessage}</SErrorMessage>}
      </SColorInputContainer>

      <ModalActions onCancel={onClose} onConfirm={handleSave} disabled={!isValid} />
    </ModalBase>
  )
}

export default ColorEditModal
