// @ts-nocheck
import React, { useState, useCallback } from 'react'
import { styled } from 'styled-components'
import { type SoundUploadProgress } from '../../../types/sound.types'
import { createSoundService } from '../../../services/soundService'
import { MediaStorageApi } from '../../../services/mediaStorageApi'
import { addAppNoti } from '@/store/useNotiStore'
import { SPACING } from '@/design'

interface SoundUploadProps {
  onUploadComplete: (soundIds: string[]) => void
  userId: string
}

const SoundUpload: React.FC<SoundUploadProps> = ({ onUploadComplete, userId }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploads, setUploads] = useState<SoundUploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const soundService = createSoundService()

  const validateFile = async (file: File): Promise<string | null> => {
    const validation = await MediaStorageApi.validateAudioFileWithDuration(file)
    return validation.valid ? null : validation.error || 'Invalid file'
  }

  const handleFiles = useCallback(
    async (files: FileList) => {
      const validFiles: File[] = []
      const errors: string[] = []

      // Validate all files first (now async)
      for (const file of Array.from(files)) {
        const error = await validateFile(file)
        if (error) {
          errors.push(`${file.name}: ${error}`)
        } else {
          validFiles.push(file)
        }
      }

      // Show validation errors
      if (errors.length > 0) {
        errors.forEach(error => {
          addAppNoti({ type: 'error', msg: error })
        })
      }

      if (validFiles.length === 0) return

      setIsUploading(true)

      // Initialize upload progress tracking
      const initialUploads: SoundUploadProgress[] = validFiles.map(file => ({
        fileId: `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        filename: file.name,
        progress: 0,
        status: 'pending',
      }))

      setUploads(initialUploads)

      const uploadedSoundIds: string[] = []

      try {
        // Upload files one by one to show progress
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i]
          const uploadProgress = initialUploads[i]

          // Update status to uploading
          setUploads(prev =>
            prev.map(upload =>
              upload.fileId === uploadProgress.fileId ?
                { ...upload, status: 'uploading', progress: 10 }
              : upload
            )
          )

          try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
              setUploads(prev =>
                prev.map(upload =>
                  upload.fileId === uploadProgress.fileId && upload.progress < 90 ?
                    { ...upload, progress: upload.progress + 10 }
                  : upload
                )
              )
            }, 100)

            const result = await soundService.uploadSounds([file])

            clearInterval(progressInterval)

            if (result.length > 0) {
              uploadedSoundIds.push(result[0].id)

              // Mark as completed
              setUploads(prev =>
                prev.map(upload =>
                  upload.fileId === uploadProgress.fileId ?
                    { ...upload, status: 'completed', progress: 100 }
                  : upload
                )
              )
            } else {
              throw new Error('Upload failed - no result returned')
            }
          } catch (error) {
            // Mark as failed
            setUploads(prev =>
              prev.map(upload =>
                upload.fileId === uploadProgress.fileId ?
                  {
                    ...upload,
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Upload failed',
                  }
                : upload
              )
            )
          }
        }

        // Notify parent of successful uploads
        if (uploadedSoundIds.length > 0) {
          onUploadComplete(uploadedSoundIds)
          const fileCount = uploadedSoundIds.length
          addAppNoti({
            type: 'success',
            msg: `${fileCount} sound${fileCount > 1 ? 's' : ''} uploaded successfully`,
          })
        }
      } finally {
        setIsUploading(false)

        // Clear upload progress after a delay
        setTimeout(() => {
          setUploads([])
        }, 3000)
      }
    },
    [soundService, userId, onUploadComplete]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles]
  )

  return (
    <SUploadContainer>
      <SDropZone
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        $isDragOver={isDragOver}
        $isUploading={isUploading}
      >
        <SUploadIcon>🎵</SUploadIcon>
        <SUploadText>{isUploading ? 'Uploading...' : 'Drag & drop audio files here'}</SUploadText>
        <SUploadSubtext>
          or{' '}
          <SBrowseButton as='label' htmlFor='file-input'>
            browse files
          </SBrowseButton>
        </SUploadSubtext>
        <SFileInput
          id='file-input'
          type='file'
          multiple
          accept='.mp3,.wav,audio/mp3,audio/mpeg,audio/wav'
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <SSupportedFormats>Supported formats: MP3, WAV • Max size: 5MB • Max duration: 8 seconds</SSupportedFormats>
      </SDropZone>

      {uploads.length > 0 && (
        <SUploadProgress>
          <SProgressHeader>Upload Progress</SProgressHeader>
          {uploads.map(upload => (
            <SProgressItem key={upload.fileId}>
              <SProgressInfo>
                <SProgressFilename>{upload.filename}</SProgressFilename>
                <SProgressStatus $status={upload.status}>
                  {upload.status === 'completed' && '✓'}
                  {upload.status === 'failed' && '✗'}
                  {upload.status === 'uploading' && '⏳'}
                  {upload.status === 'pending' && '⏸'}
                </SProgressStatus>
              </SProgressInfo>
              <SProgressBar>
                <SProgressFill $progress={upload.progress} $status={upload.status} />
              </SProgressBar>
              {upload.error && <SProgressError>{upload.error}</SProgressError>}
            </SProgressItem>
          ))}
        </SUploadProgress>
      )}
    </SUploadContainer>
  )
}

const SUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.md}px;
  height: 100%;
`

const SDropZone = styled.div<{ $isDragOver: boolean; $isUploading: boolean }>`
  border: 2px dashed
    ${props =>
      props.$isDragOver ? '#5f5fff'
      : props.$isUploading ? '#ffa500'
      : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 12px;
  padding: ${SPACING.xl}px;
  text-align: center;
  background-color: ${props =>
    props.$isDragOver ? 'rgba(95, 95, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  transition: all 0.2s ease;
  cursor: ${props => (props.$isUploading ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$isUploading ? 0.7 : 1)};
`

const SUploadIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${SPACING.md}px;
`

const SUploadText = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: ${SPACING.sm}px;
`

const SUploadSubtext = styled.div`
  color: #aaa;
  font-size: 14px;
  margin-bottom: ${SPACING.md}px;
`

const SBrowseButton = styled.span`
  color: #5f5fff;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #7f7fff;
  }
`

const SFileInput = styled.input`
  display: none;
`

const SSupportedFormats = styled.div`
  color: #777;
  font-size: 12px;
  margin-top: ${SPACING.sm}px;
`

const SUploadProgress = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: ${SPACING.md}px;
`

const SProgressHeader = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: ${SPACING.md}px;
`

const SProgressItem = styled.div`
  margin-bottom: ${SPACING.sm}px;

  &:last-child {
    margin-bottom: 0;
  }
`

const SProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`

const SProgressFilename = styled.div`
  color: #aaa;
  font-size: 12px;
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const SProgressStatus = styled.div<{ $status: string }>`
  font-size: 12px;
  color: ${props => {
    switch (props.$status) {
      case 'completed':
        return '#00ff00'
      case 'failed':
        return '#ff0000'
      case 'uploading':
        return '#ffa500'
      default:
        return '#aaa'
    }
  }};
`

const SProgressBar = styled.div`
  height: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
`

const SProgressFill = styled.div<{ $progress: number; $status: string }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background-color: ${props => {
    switch (props.$status) {
      case 'completed':
        return '#00ff00'
      case 'failed':
        return '#ff0000'
      case 'uploading':
        return '#ffa500'
      default:
        return '#5f5fff'
    }
  }};
  transition: width 0.3s ease;
`

const SProgressError = styled.div`
  color: #ff6666;
  font-size: 11px;
  margin-top: 2px;
`

export default SoundUpload
