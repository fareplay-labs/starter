// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { ModalBase } from './shared/ModalBase'
import { ModalActions } from './shared/ModalActions'
import { type FieldEditModalProps } from './shared/modalTypes'
import { TextInput } from './shared/FormElements'
import { styled } from 'styled-components'
import { SPACING, FARE_COLORS, TEXT_COLORS } from '@/design'

const LinkPreviewContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.md}px;
  display: flex;
  align-items: center;
  gap: ${SPACING.md}px;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
`

const LinkIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 6px;
  background-color: ${FARE_COLORS.salmon};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  font-size: 18px;
`

const LinkInfo = styled.div`
  flex: 1;
  overflow: hidden;
`

const LinkUrl = styled.a`
  color: ${TEXT_COLORS.one};
  text-decoration: none;
  font-size: 14px;
  word-break: break-all;
  display: block;

  &:hover {
    color: ${FARE_COLORS.blue};
    text-decoration: underline;
  }
`

const LinkTest = styled.button`
  background-color: transparent;
  border: none;
  color: ${FARE_COLORS.blue};
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-top: 4px;

  &:hover {
    text-decoration: underline;
  }
`

const StatusMessage = styled.div<{ $isValid: boolean }>`
  margin-top: 4px;
  color: ${props => (props.$isValid ? FARE_COLORS.blue : FARE_COLORS.salmon)};
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
`

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
        <LinkPreviewContainer>
          <LinkIcon>🔗</LinkIcon>
          <LinkInfo>
            <LinkUrl href={displayUrl} target='_blank' rel='noopener noreferrer'>
              {displayUrl}
            </LinkUrl>
            {isUrlValid && linkUrl && <LinkTest onClick={handleTestLink}>Test link</LinkTest>}
            {linkUrl && !isUrlValid && (
              <StatusMessage $isValid={false}>⚠️ Invalid URL format</StatusMessage>
            )}
            {linkUrl && isUrlValid && <StatusMessage $isValid={true}>✓ Valid URL</StatusMessage>}
          </LinkInfo>
        </LinkPreviewContainer>
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
