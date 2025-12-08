import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
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

// Character counter component
const CharCounter: React.FC<{ current: number; max: number; isNearLimit: boolean }> = ({
  current,
  max,
  isNearLimit,
}) => (
  <div
    className={cn(
      'absolute -bottom-[18px] right-[5px] text-xs pointer-events-none bg-black/50 px-1 py-0.5 rounded',
      isNearLimit ? 'text-red-400' : 'text-white/50'
    )}
  >
    {current}/{max}
  </div>
)

// Edit indicator wrapper
const EditIndicatorWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute -left-8 top-1/2 -translate-y-[90%] pointer-events-none [&_button]:pointer-events-none [&_button]:w-[30px] [&_button]:h-[30px] [&_button]:animate-none [&_button]:static [&_button_svg]:w-5 [&_button_svg]:h-5">
    {children}
  </div>
)

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

  // Base input styles
  const inputStyles = 'bg-transparent border-none text-white text-inherit font-inherit font-[inherit] w-full p-0 m-0 leading-inherit focus:outline-none'

  const renderContent = () => {
    if (isEditing) {
      if (multiline) {
        return (
          <div className="relative">
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              maxLength={maxLength}
              autoFocus
              rows={1}
              className={cn(inputStyles, 'resize-none min-h-[1.3em] h-full overflow-hidden block')}
              style={textHeight ? { height: `${textHeight}px` } : {}}
            />
            {maxLength && (
              <CharCounter current={editValue.length} max={maxLength} isNearLimit={isNearLimit} />
            )}
          </div>
        )
      } else {
        return (
          <div className="relative">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              maxLength={maxLength}
              autoFocus
              className={inputStyles}
            />
            {maxLength && (
              <CharCounter current={editValue.length} max={maxLength} isNearLimit={isNearLimit} />
            )}
          </div>
        )
      }
    } else {
      return (
        <div
          ref={wrapperRef}
          className={cn(
            'relative min-w-[50px] min-h-[22px] break-words transition-all duration-200 w-full',
            'text-inherit font-inherit leading-inherit p-0 rounded bg-transparent h-auto overflow-visible',
            isEditing && 'shadow-[0_0_0_1px_rgba(255,255,255,0.15)]',
            isEditMode && !isEditing && 'hover:animate-pulse-text',
            className
          )}
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
        </div>
      )
    }
  }

  return renderContent()
}

export default EditableText
