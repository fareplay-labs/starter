// @ts-nocheck
import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

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
    <div className="w-full flex flex-col gap-3 mb-4">
      <input
        ref={inputRef}
        id='image-url'
        type='text'
        value={value}
        onChange={handleChange}
        placeholder='paste a url'
        disabled={disabled}
        className={cn(
          'bg-black/20 rounded-lg text-white p-4 text-base w-full h-12',
          'box-border transition-all duration-200',
          'focus:outline-none',
          errorMessage
            ? 'border border-[#ff5e4f] focus:border-[#ff5e4f] focus:shadow-[0_0_0_2px_rgba(255,94,79,0.15)]'
            : 'border border-[#1b1d26] focus:border-[#410dff] focus:shadow-[0_0_0_2px_rgba(0,112,243,0.15)]',
          'max-[992px]:h-[52px]'
        )}
      />
      {errorMessage && (
        <div className="text-[#ff5e4f] text-[13px] mt-1">{errorMessage}</div>
      )}
    </div>
  )
}

export default UrlInput
