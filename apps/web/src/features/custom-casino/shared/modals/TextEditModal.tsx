// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { ModalBase } from './shared/ModalBase'
import { ModalActions } from './shared/ModalActions'
import { TextInput, TextArea } from './shared/FormElements'
import { type FieldEditModalProps } from './shared/modalTypes'

/**
 * Modal for editing text fields (both single and multi-line)
 */
const TextEditModal: React.FC<FieldEditModalProps> = ({
  isOpen,
  onClose,
  fieldName,
  onSave,
  currentValue = '',
}) => {
  // Local state for the text value
  const [textValue, setTextValue] = useState(currentValue)

  // Reset state when modal opens with new value
  useEffect(() => {
    if (isOpen) {
      setTextValue(currentValue || '')
    }
  }, [isOpen, currentValue])

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTextValue(e.target.value)
  }

  // Handle save action
  const handleSave = () => {
    onSave(fieldName, textValue)
    onClose()
  }

  // Get a display name for the field
  const getDisplayName = () => {
    if (fieldName.includes('.')) {
      const [_, fieldPart] = fieldName.split('.')
      return fieldPart.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }

    // For standard field names
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  // Check if this should be a multiline text area
  const isMultiline =
    fieldName === 'description' ||
    fieldName === 'longDescription' ||
    fieldName.includes('description')

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Edit ${getDisplayName()}`}>
      {isMultiline ?
        <TextArea
          id='text-edit-field'
          label={getDisplayName()}
          value={textValue}
          onChange={handleTextChange}
          rows={6}
        />
      : <TextInput
          id='text-edit-field'
          label={getDisplayName()}
          value={textValue}
          onChange={handleTextChange}
        />
      }

      <ModalActions onCancel={onClose} onConfirm={handleSave} />
    </ModalBase>
  )
}

export default TextEditModal
