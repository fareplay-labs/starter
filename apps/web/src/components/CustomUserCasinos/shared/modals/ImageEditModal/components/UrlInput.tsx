// @ts-nocheck
import React from 'react'
import { InputContainer, ImageUrlInput, ErrorMessage } from '../styles/inputStyles'

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
  errorMessage: string | null
  inputRef: React.RefObject<HTMLInputElement>
  disabled?: boolean
}

/**
 * Component for image URL input with validation
 */
const UrlInput: React.FC<UrlInputProps> = ({
  value,
  onChange,
  errorMessage,
  inputRef,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <InputContainer>
      <ImageUrlInput
        ref={inputRef}
        id='image-url'
        type='text'
        value={value}
        onChange={handleChange}
        placeholder='paste a url'
        $hasError={!!errorMessage}
        disabled={disabled}
      />
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </InputContainer>
  )
}

export default UrlInput
