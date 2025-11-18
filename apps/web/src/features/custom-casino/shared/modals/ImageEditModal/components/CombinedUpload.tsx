// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react'
import {
  CombinedUploadContainer,
  InputSection,
  DividerContainer,
  DividerLine,
  DividerText,
  PreviewContainer,
  ThumbnailPreview,
  TagsContainer,
  UploadButtonContainer,
  UploadButton,
  LeftSection,
} from '../styles/uploadSectionStyles'
import FileUpload from './FileUpload'
import UrlInput from './UrlInput'
import TagSelector from './TagSelector'

interface CombinedUploadProps {
  urlValue: string
  onUrlChange: (value: string) => void
  onFileSelected: (file: File) => void
  onFileUpload: (tags: string[]) => Promise<void>
  onCancel: () => void
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error'
  selectedFile: File | null
  suggestedTags: string[]
  availableTags: string[]
  errorMessage: string | null
  urlInputRef: React.RefObject<HTMLInputElement>
  urlErrorMessage: string | null
  disabled: boolean
}

// Helper function to format file size in human-readable format
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const CombinedUpload: React.FC<CombinedUploadProps> = ({
  urlValue,
  onUrlChange,
  onFileSelected,
  onFileUpload,
  onCancel,
  uploadStatus,
  selectedFile,
  suggestedTags,
  availableTags,
  errorMessage,
  urlInputRef,
  urlErrorMessage,
  disabled,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(['all', ...suggestedTags])
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setThumbnailUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  const handleTagChange = useCallback((newTags: string[]) => {
    setSelectedTags(newTags)
  }, [])

  const handleUploadClick = useCallback(() => {
    onFileUpload(selectedTags)
  }, [onFileUpload, selectedTags])

  const isPreviewMode = !!selectedFile

  const renderInputMode = () => (
    <>
      <InputSection>
        <UrlInput
          value={urlValue}
          onChange={onUrlChange}
          errorMessage={urlErrorMessage}
          inputRef={urlInputRef}
          disabled={disabled}
        />
        <DividerContainer>
          <DividerLine />
          <DividerText>or</DividerText>
          <DividerLine />
        </DividerContainer>
      </InputSection>
      <FileUpload onFileUpload={onFileSelected} />
    </>
  )

  const renderPreviewMode = () => (
    <PreviewContainer>
      <LeftSection>
        <ThumbnailPreview>
          {thumbnailUrl && (
            <img src={thumbnailUrl} alt='Upload preview' />
          )}
        </ThumbnailPreview>
        <UploadButtonContainer>
          <UploadButton
            onClick={handleUploadClick}
            disabled={disabled || uploadStatus === 'uploading' || selectedTags.length === 0}
            $status={uploadStatus}
          >
            {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
          </UploadButton>
        </UploadButtonContainer>
        {selectedFile && (
          <div
            style={{
              fontSize: '0.8em',
              marginTop: '8px',
              color: '#777',
              textAlign: 'center',
            }}
          >
            {selectedFile.type.split('/')[1].toUpperCase()} •{' '}
            {formatFileSize(selectedFile.size)}
          </div>
        )}
      </LeftSection>

      <TagsContainer>
        <TagSelector
          initialSelectedTags={['all', ...suggestedTags]}
          suggestedTags={[]}
          availableTags={availableTags.filter(tag => tag !== 'all')}
          onChange={handleTagChange}
          maxUserTags={2}
        />
      </TagsContainer>
    </PreviewContainer>
  )

  return (
    <CombinedUploadContainer>
      {isPreviewMode ? renderPreviewMode() : renderInputMode()}
      {errorMessage && (
        <div style={{ color: 'red', marginTop: '8px', fontSize: '0.9em' }}>{errorMessage}</div>
      )}
    </CombinedUploadContainer>
  )
}

export default CombinedUpload
