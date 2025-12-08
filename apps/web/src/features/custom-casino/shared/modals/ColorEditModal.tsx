import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ModalBase } from './shared/ModalBase'
import { ModalActions } from './shared/ModalActions'
import { type FieldEditModalProps } from './shared/modalTypes'

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
      <div className="flex flex-col gap-4 w-full mb-4">
        <label htmlFor='color-input' className="text-sm text-white/70 mb-2">
          Choose a color:
        </label>
        <div className="relative w-full flex items-center gap-4">
          {/* Color preview */}
          <div
            className="w-10 h-10 rounded-lg border-2 border-white/10"
            style={{ backgroundColor: isValid ? colorValue : '#ff5050' }}
          />
          {/* Color text input */}
          <input
            id='color-input'
            type='text'
            value={colorValue}
            onChange={handleColorChange}
            aria-invalid={!isValid}
            aria-describedby={!isValid ? 'color-error' : undefined}
            className={cn(
              'w-[70%] p-3 bg-black/30 rounded text-white font-mono',
              'border transition-colors duration-200',
              isValid ? 'border-white/10' : 'border-red-500/70'
            )}
          />
          {/* Native color picker */}
          <input
            type='color'
            value={isValid ? colorValue : '#ff5050'}
            onChange={handleColorChange}
            aria-label='Color picker'
            className={cn(
              'w-10 h-10 border-none rounded-lg cursor-pointer',
              'appearance-none',
              '[&::-webkit-color-swatch-wrapper]:p-0',
              '[&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-lg'
            )}
          />
        </div>
        {!isValid && (
          <div id='color-error' className="text-red-400/90 text-xs mt-2">
            {errorMessage}
          </div>
        )}
      </div>

      <ModalActions onCancel={onClose} onConfirm={handleSave} disabled={!isValid} />
    </ModalBase>
  )
}

export default ColorEditModal
