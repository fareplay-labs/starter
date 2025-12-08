import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ModalBase } from './shared/ModalBase'
import { ModalActions } from './shared/ModalActions'
import { type FieldEditModalProps } from './shared/modalTypes'
import { TextInput } from './shared/FormElements'

/**
 * Validates if a URL is in a valid format
 */
const isValidUrl = (url: string): boolean => {
  if (!url) return false

  try {
    // Try to construct a URL object
    new URL(url)
    return true
  } catch (e) {
    // If URL construction fails, check if adding https:// would make it valid
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      try {
        new URL(`https://${url}`)
        return true
      } catch (e) {
        return false
      }
    }
    return false
  }
}

/**
 * Ensures URL has proper protocol
 */
const formatUrl = (url: string): string => {
  if (!url) return ''

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }

  return url
}

/**
 * Modal for editing link URLs with validation and preview
 */
const LinkEditModal: React.FC<FieldEditModalProps> = ({
  isOpen,
  onClose,
  fieldName,
  onSave,
  currentValue = '',
}) => {
  // Local state for the link URL
  const [linkUrl, setLinkUrl] = useState(currentValue)
  const [error, setError] = useState<string | null>(null)
  const [isUrlValid, setIsUrlValid] = useState(true)

  // Get a display name for the field from the fieldName
  const getDisplayName = (): string => {
    if (fieldName.includes('.')) {
      const [_, platform] = fieldName.split('.')
      return platform.charAt(0).toUpperCase() + platform.slice(1)
    }
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
  }

  // Format URL and validate when saving
  const handleSave = () => {
    if (!linkUrl.trim()) {
      // Allow saving empty URL to remove a link
      onSave(fieldName, '')
      onClose()
      return
    }

    // Check if URL is valid
    if (!isUrlValid) {
      setError('Please enter a valid URL')
      return
    }

    // Format URL before saving
    const formattedUrl = formatUrl(linkUrl)
    onSave(fieldName, formattedUrl)
    onClose()
  }

  // Handle input change and validate
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setLinkUrl(newUrl)

    // Validate URL as user types
    const valid = isValidUrl(newUrl) || newUrl === ''
    setIsUrlValid(valid)
    setError(valid ? null : 'Please enter a valid URL including domain (e.g. example.com)')
  }

  // Open link in new tab
  const handleTestLink = () => {
    if (isUrlValid && linkUrl) {
      window.open(formatUrl(linkUrl), '_blank', 'noopener,noreferrer')
    }
  }

  // Reset state when modal opens with new value
  useEffect(() => {
    if (isOpen) {
      setLinkUrl(currentValue)
      setIsUrlValid(isValidUrl(currentValue) || currentValue === '')
      setError(null)
    }
  }, [isOpen, currentValue])

  const displayUrl = linkUrl ? formatUrl(linkUrl) : ''

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Edit ${getDisplayName()} Link`}>
      {linkUrl && (
        <div className="bg-black/20 rounded-lg p-4 mb-4 flex items-center gap-4 transition-all duration-200 border border-transparent hover:bg-black/30">
          {/* Link icon */}
          <div className="w-[42px] h-[42px] rounded-md bg-[#ff5e4f] flex items-center justify-center flex-shrink-0 text-white text-lg">
            🔗
          </div>
          {/* Link info */}
          <div className="flex-1 overflow-hidden">
            <a
              href={displayUrl}
              target='_blank'
              rel='noopener noreferrer'
              className="text-white text-sm break-all block no-underline hover:text-[#410dff] hover:underline"
            >
              {displayUrl}
            </a>
            {isUrlValid && linkUrl && (
              <button
                onClick={handleTestLink}
                className="bg-transparent border-none text-[#410dff] text-[13px] cursor-pointer p-0 mt-1 hover:underline"
              >
                Test link
              </button>
            )}
            {linkUrl && !isUrlValid && (
              <div className="mt-1 text-[#ff5e4f] text-[13px] flex items-center gap-1">
                ⚠️ Invalid URL format
              </div>
            )}
            {linkUrl && isUrlValid && (
              <div className="mt-1 text-[#410dff] text-[13px] flex items-center gap-1">
                ✓ Valid URL
              </div>
            )}
          </div>
        </div>
      )}

      <TextInput
        id='link-url'
        label='URL'
        value={linkUrl}
        onChange={handleChange}
        placeholder='https://example.com'
        error={error || undefined}
        helpText='Enter a valid URL or leave empty to remove the link'
      />

      <ModalActions
        onCancel={onClose}
        onConfirm={handleSave}
        disabled={linkUrl !== '' && !isUrlValid}
      />
    </ModalBase>
  )
}

export default LinkEditModal
