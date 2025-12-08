import React, { type ChangeEvent } from 'react'
import { cn } from '@/lib/utils'

// Input container
const InputContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full flex flex-col gap-3 mb-6">
    {children}
  </div>
)

// Input label
const InputLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="text-[#aaaaaa] text-sm font-medium mb-0.5">
    {children}
  </label>
)

// Base input styles
const inputBaseStyles = cn(
  'bg-[rgba(10,10,10,0.8)] border border-[#1b1d26] rounded-lg',
  'text-white p-4 text-base w-full transition-all duration-200',
  'hover:border-white/30',
  'focus:outline-none focus:border-[#410dff] focus:shadow-[0_0_0_2px_rgba(0,112,243,0.15)]',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-black/20'
)

// Help text
const HelpText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[#aaaaaa] text-[13px] mt-1 opacity-80">
    {children}
  </p>
)

// Error text
const ErrorText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[#ff5e4f] text-[13px] mt-1 font-medium">
    {children}
  </p>
)

// Character count
interface CharCountProps {
  current: number
  max: number
  isNearLimit: boolean
}

const CharCount: React.FC<CharCountProps> = ({ current, max, isNearLimit }) => (
  <div
    className={cn(
      'text-xs mt-1 text-right transition-colors duration-200',
      isNearLimit ? 'text-[#ff5e4f]' : 'text-[#aaaaaa]'
    )}
  >
    {current}/{max}
  </div>
)

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
    <InputContainer>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <input
        id={id}
        name={name || id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          inputBaseStyles,
          'h-12 w-auto',
          'max-[992px]:h-[52px] max-[992px]:text-base'
        )}
      />
      {helpText && <HelpText>{helpText}</HelpText>}
      {error && <ErrorText>{error}</ErrorText>}
      {showCharCount && (
        <CharCount current={value.length} max={maxLength} isNearLimit={isNearLimit} />
      )}
    </InputContainer>
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
    <InputContainer>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <textarea
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          inputBaseStyles,
          'min-h-[120px] w-auto resize-y leading-relaxed'
        )}
      />
      {helpText && <HelpText>{helpText}</HelpText>}
      {error && <ErrorText>{error}</ErrorText>}
      {showCharCount && (
        <CharCount current={value.length} max={maxLength} isNearLimit={isNearLimit} />
      )}
    </InputContainer>
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
    <InputContainer>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <select
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          inputBaseStyles,
          'h-12 appearance-none pr-8',
          'bg-[url("data:image/svg+xml;utf8,<svg fill=\'white\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")] bg-no-repeat bg-[right_16px_center]',
          'max-[992px]:h-[52px]'
        )}
      >
        {options.map(option => (
          <option
            key={option.value}
            value={option.value}
            className="bg-casino-dark text-white p-4"
          >
            {option.label}
          </option>
        ))}
      </select>
      {helpText && <HelpText>{helpText}</HelpText>}
      {error && <ErrorText>{error}</ErrorText>}
    </InputContainer>
  )
}
