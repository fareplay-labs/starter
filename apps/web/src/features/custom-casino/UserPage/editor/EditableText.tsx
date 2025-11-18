// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react'
import { styled, keyframes, css } from 'styled-components'
import { TEXT_COLORS } from '@/design'
import { useEditStore } from '@/features/custom-casino/UserPage/editor/useEditStore'
import { EditCircle } from '@/features/custom-casino/UserPage/editor/EditCircle'

interface EditableTextProps {
  fieldName?: string
  value: string
  placeholder?: string
  onSave?: (fieldName: string, value: string) => void
  onChange?: (value: string) => void
  multiline?: boolean
  maxLength?: number
  className?: string
}

const pulse = keyframes`
  0% {
    opacity: 0.6;
    scale: 0.98;
    transform: translateY(0);
  }
  50% {
    opacity: 0.8;
    scale: 1;
    transform: translateY(-1px);


  }
  100% {
    opacity: 1;
    scale: 1.02;
    transform: translateY(-2px);

  }
`

const TextWrapper = styled.div<{ $isEditing: boolean; $shouldPulse: boolean }>`
  position: relative;
  min-width: 50px;
  min-height: 22px;
  word-break: break-word;
  transition: all 0.2s ease;
  width: 100%;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  padding: 0;
  border-radius: 4px;
  background-color: transparent;
  height: auto;
  overflow: visible;

  ${props =>
    props.$isEditing &&
    `
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15);
  `}
  &:hover {
    ${props =>
      props.$shouldPulse &&
      css`
        animation: 1s linear 0s infinite alternate ${pulse};
      `}
  }
`

const TextInput = styled.input`
  background: transparent;
  border: none;
  color: ${TEXT_COLORS.one};
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  width: 100%;
  padding: 0;
  margin: 0;
  line-height: inherit;

  &:focus {
    outline: none;
  }
`

const TextArea = styled.textarea`
  background: transparent;
  border: none;
  color: ${TEXT_COLORS.one};
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  width: 100%;
  padding: 0;
  margin: 0;
  resize: none;
  min-height: 1.3em;
  line-height: inherit;
  height: 100%;
  overflow: hidden; /* Prevent scrollbars */
  display: block;

  &:focus {
    outline: none;
  }
`

const CharCounter = styled.div<{ $isNearLimit: boolean }>`
  position: absolute;
  bottom: -18px;
  right: 5px;
  font-size: 12px;
  color: ${props => (props.$isNearLimit ? '#ff6b6b' : 'rgba(255, 255, 255, 0.5)')};
  pointer-events: none;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 4px;
  border-radius: 4px;
`

const EditIndicatorWrapper = styled.div`
  position: absolute;
  left: -32px;
  top: 50%;
  transform: translateY(-90%);
  pointer-events: none;
  
  button {
    pointer-events: none;
    width: 30px;
    height: 30px;
    animation: none;
    position: static;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`

const EditableText: React.FC<EditableTextProps> = ({
  fieldName = '',
  value,
  placeholder = 'Click to edit',
  onSave,
  onChange,
  multiline = false,
  maxLength,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { isEditMode } = useEditStore()
  const [textHeight, setTextHeight] = useState<number | null>(null)

  // Set up the initial value when the component props change
  useEffect(() => {
    setEditValue(value)
  }, [value])

  // Measure the height of the text container before editing
  useEffect(() => {
    if (wrapperRef.current && !isEditing && multiline) {
      setTextHeight(wrapperRef.current.clientHeight)
    }
  }, [wrapperRef, isEditing, multiline, value])

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()

      // Set the height of the textarea to match the original text height
      if (multiline && textHeight && inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.style.height = `${textHeight}px`
      }
    }
  }, [isEditing, multiline, textHeight])

  const handleEditStart = () => {
    if (isEditMode) {
      setIsEditing(true)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (maxLength && newValue.length > maxLength) {
      return // Don't update if exceeding max length
    }
    setEditValue(newValue)
  }

  const handleBlur = () => {
    if (isEditing) {
      handleSave()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(value) // Reset to original value
      setIsEditing(false)
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    if (editValue !== value) {
      if (onSave && fieldName) {
        onSave(fieldName, editValue)
      }
      if (onChange) {
        onChange(editValue)
      }
    }
  }

  // If we're in edit mode and the user clicks on the field, make it editable
  const handleClick = () => {
    if (isEditMode && !isEditing) {
      handleEditStart()
    }
  }

  const isNearLimit = maxLength ? editValue.length > maxLength * 0.8 : false

  const renderContent = () => {
    if (isEditing) {
      if (multiline) {
        return (
          <>
            <TextArea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              maxLength={maxLength}
              autoFocus
              rows={1} // Start with 1 row
              style={textHeight ? { height: `${textHeight}px` } : {}}
            />
            {maxLength && (
              <CharCounter $isNearLimit={isNearLimit}>
                {editValue.length}/{maxLength}
              </CharCounter>
            )}
          </>
        )
      } else {
        return (
          <>
            <TextInput
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type='text'
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              maxLength={maxLength}
              autoFocus
            />
            {maxLength && (
              <CharCounter $isNearLimit={isNearLimit}>
                {editValue.length}/{maxLength}
              </CharCounter>
            )}
          </>
        )
      }
    } else {
      return (
        <TextWrapper
          ref={wrapperRef}
          className={className}
          $isEditing={isEditing}
          $shouldPulse={isEditMode && !isEditing}
          onClick={handleClick}
          style={{
            cursor: isEditMode && !isEditing ? 'text' : 'default',
          }}
        >
          {isEditMode && !isEditing && (
            <EditIndicatorWrapper>
              <EditCircle $position="topLeft" />
            </EditIndicatorWrapper>
          )}
          {editValue || placeholder}
        </TextWrapper>
      )
    }
  }

  return renderContent()
}

export default EditableText
