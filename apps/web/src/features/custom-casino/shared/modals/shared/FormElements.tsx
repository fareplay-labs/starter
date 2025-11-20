// @ts-nocheck
import React, { type ChangeEvent } from 'react'
import { styled } from 'styled-components'
import { SPACING, TEXT_COLORS, BORDER_COLORS, FARE_COLORS, BREAKPOINTS } from '@/design'

// Container for input groups
const SInputContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.sm}px;
  margin-bottom: ${SPACING.lg}px;
`

// Input label
const SInputLabel = styled.label`
  color: ${TEXT_COLORS.two};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
`

// Base input styles (shared between inputs and textareas)
const inputStyles = `
  background-color: rgba(10, 10, 10, 0.8);
  border: 1px solid ${BORDER_COLORS.one};
  border-radius: 8px;
  color: ${TEXT_COLORS.one};
  padding: ${SPACING.md}px;
  font-size: 16px;
  width: 100%;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: none;
    border-color: ${FARE_COLORS.blue};
    box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: rgba(0, 0, 0, 0.2);
  }
`

// Text input
const STextInput = styled.input`
  ${inputStyles}
  height: 48px;
  width: auto;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    height: 52px;
    font-size: 16px; /* Prevent zoom on mobile */
  }
`

// Textarea for multiline text
const STextArea = styled.textarea`
  ${inputStyles}
  min-height: 120px;
  width: auto;
  resize: vertical;
  line-height: 1.5;
`

// Select dropdown
const SSelect = styled.select`
  ${inputStyles}
  height: 48px;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right ${SPACING.md}px center;
  padding-right: ${SPACING.xl}px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    height: 52px;
  }
`

// Option for select dropdown
const SOption = styled.option`
  background-color: #0a0a0a;
  color: ${TEXT_COLORS.one};
  padding: ${SPACING.md}px;
`

// Form instruction text
const SHelpText = styled.p`
  color: ${TEXT_COLORS.two};
  font-size: 13px;
  margin: 4px 0 0 0;
  opacity: 0.8;
`

// Error message styling
const SErrorText = styled.p`
  color: ${FARE_COLORS.salmon};
  font-size: 13px;
  margin: 4px 0 0 0;
  font-weight: 500;
`

// Character count display
const SCharCount = styled.div<{ $isNearLimit: boolean }>`
  font-size: 12px;
  margin-top: 4px;
  text-align: right;
  color: ${props => (props.$isNearLimit ? FARE_COLORS.salmon : TEXT_COLORS.two)};
  transition: color 0.2s ease;
`

// Text input props
export interface TextInputProps {
  id: string
  name?: string
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  type?: string
  helpText?: string
  error?: string
  maxLength?: number
}

/**
 * Text input field with label
 */
export const TextInput: React.FC<TextInputProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = '',
  disabled = false,
  type = 'text',
  helpText,
  error,
  maxLength,
}) => {
  const showCharCount = maxLength !== undefined && maxLength > 0
  const isNearLimit = showCharCount ? value.length > maxLength * 0.8 : false

  return (
    <SInputContainer>
      <SInputLabel htmlFor={id}>{label}</SInputLabel>
      <STextInput
        id={id}
        name={name || id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
      />
      {helpText && <SHelpText>{helpText}</SHelpText>}
      {error && <SErrorText>{error}</SErrorText>}
      {showCharCount && (
        <SCharCount $isNearLimit={isNearLimit}>
          {value.length}/{maxLength}
        </SCharCount>
      )}
    </SInputContainer>
  )
}

// Textarea props
export interface TextAreaProps {
  id: string
  name?: string
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  helpText?: string
  error?: string
  rows?: number
  maxLength?: number
}

/**
 * Textarea field with label
 */
export const TextArea: React.FC<TextAreaProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = '',
  disabled = false,
  helpText,
  error,
  rows = 4,
  maxLength,
}) => {
  const showCharCount = maxLength !== undefined && maxLength > 0
  const isNearLimit = showCharCount ? value.length > maxLength * 0.8 : false

  return (
    <SInputContainer>
      <SInputLabel htmlFor={id}>{label}</SInputLabel>
      <STextArea
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
      />
      {helpText && <SHelpText>{helpText}</SHelpText>}
      {error && <SErrorText>{error}</SErrorText>}
      {showCharCount && (
        <SCharCount $isNearLimit={isNearLimit}>
          {value.length}/{maxLength}
        </SCharCount>
      )}
    </SInputContainer>
  )
}

// Select option type
export interface SelectOption {
  value: string
  label: string
}

// Select props
export interface SelectProps {
  id: string
  name?: string
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  options: SelectOption[]
  disabled?: boolean
  helpText?: string
  error?: string
}

/**
 * Select dropdown with label
 */
export const Select: React.FC<SelectProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  options,
  disabled = false,
  helpText,
  error,
}) => {
  return (
    <SInputContainer>
      <SInputLabel htmlFor={id}>{label}</SInputLabel>
      <SSelect
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
      >
        {options.map(option => (
          <SOption key={option.value} value={option.value}>
            {option.label}
          </SOption>
        ))}
      </SSelect>
      {helpText && <SHelpText>{helpText}</SHelpText>}
      {error && <SErrorText>{error}</SErrorText>}
    </SInputContainer>
  )
}
