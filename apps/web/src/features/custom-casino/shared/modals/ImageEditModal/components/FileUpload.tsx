// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react'
import {
  UploadSection,
  FileUploadContainer,
  FileUploadButton,
  UploadIcon,
  TextContainer,
  UploadText,
  UploadHint,
  HiddenFileInput,
} from '../styles/fileUploadStyles'

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

/**
 * Component for file upload with drag and drop support
 */
const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // Set up drag and drop event handlers
  useEffect(() => {
    const dropElement = dropRef.current
    if (!dropElement) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]
        onFileUpload(file)
        if (e.dataTransfer) {
          e.dataTransfer.items.clear()
        }
      }
    }

    dropElement.addEventListener('dragover', handleDragOver)
    dropElement.addEventListener('dragenter', handleDragEnter)
    dropElement.addEventListener('dragleave', handleDragLeave)
    dropElement.addEventListener('drop', handleDrop)

    return () => {
      dropElement.removeEventListener('dragover', handleDragOver)
      dropElement.removeEventListener('dragenter', handleDragEnter)
      dropElement.removeEventListener('dragleave', handleDragLeave)
      dropElement.removeEventListener('drop', handleDrop)
    }
  }, [onFileUpload])

  // Handle file input change
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      onFileUpload(file)

      // Reset the file input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <UploadSection>
      <FileUploadContainer $isDragging={isDragging} ref={dropRef}>
        <label htmlFor='file-upload'>
          <FileUploadButton as='div'>
            <UploadIcon>📁</UploadIcon>
            <TextContainer>
              <UploadText>
                <span>Upload a file</span> or drag & drop
              </UploadText>
              <UploadHint>PNG, JPG, GIF, WebP • up to 5MB</UploadHint>
            </TextContainer>
          </FileUploadButton>
        </label>
        <HiddenFileInput
          id='file-upload'
          type='file'
          accept='image/png,image/jpeg,image/jpg,image/gif,image/webp'
          ref={fileInputRef}
          onChange={handleFileInputChange}
        />
      </FileUploadContainer>
    </UploadSection>
  )
}

export default FileUpload
