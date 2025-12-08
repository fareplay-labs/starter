// @ts-nocheck
import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { type SoundUploadProgress } from '../../../types/sound.types'
import { createSoundService } from '../../../services/soundService'
import { MediaStorageApi } from '../../../services/mediaStorageApi'
import { addAppNoti } from '@/store/useNotiStore'

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
              upload.fileId === uploadProgress.fileId
                ? { ...upload, status: 'uploading', progress: 10 }
                : upload
            )
          )

          try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
              setUploads(prev =>
                prev.map(upload =>
                  upload.fileId === uploadProgress.fileId && upload.progress < 90
                    ? { ...upload, progress: upload.progress + 10 }
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
                  upload.fileId === uploadProgress.fileId
                    ? { ...upload, status: 'completed', progress: 100 }
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
                upload.fileId === uploadProgress.fileId
                  ? {
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

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed': return '#00ff00'
      case 'failed': return '#ff0000'
      case 'uploading': return '#ffa500'
      default: return '#5f5fff'
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
          isDragOver && 'border-[#5f5fff] bg-[rgba(95,95,255,0.1)]',
          isUploading && 'border-[#ffa500] cursor-not-allowed opacity-70',
          !isDragOver && !isUploading && 'border-white/30 bg-white/5 cursor-pointer'
        )}
      >
        <div className="text-5xl mb-4">🎵</div>
        <div className="text-white text-lg font-medium mb-3">
          {isUploading ? 'Uploading...' : 'Drag & drop audio files here'}
        </div>
        <div className="text-[#aaa] text-sm mb-4">
          or{' '}
          <label
            htmlFor='file-input'
            className="text-[#5f5fff] cursor-pointer underline hover:text-[#7f7fff]"
          >
            browse files
          </label>
        </div>
        <input
          id='file-input'
          type='file'
          multiple
          accept='.mp3,.wav,audio/mp3,audio/mpeg,audio/wav'
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
        <div className="text-[#777] text-xs mt-3">
          Supported formats: MP3, WAV • Max size: 5MB • Max duration: 8 seconds
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="bg-black/30 rounded-lg p-4">
          <div className="text-white text-sm font-semibold mb-4">Upload Progress</div>
          {uploads.map(upload => (
            <div key={upload.fileId} className="mb-3 last:mb-0">
              <div className="flex justify-between items-center mb-1">
                <div className="text-[#aaa] text-xs flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap">
                  {upload.filename}
                </div>
                <div
                  className="text-xs"
                  style={{ color: getProgressColor(upload.status) }}
                >
                  {upload.status === 'completed' && '✓'}
                  {upload.status === 'failed' && '✗'}
                  {upload.status === 'uploading' && '⏳'}
                  {upload.status === 'pending' && '⏸'}
                </div>
              </div>
              <div className="h-1 bg-white/10 rounded overflow-hidden">
                <div
                  className="h-full transition-[width] duration-300"
                  style={{
                    width: `${upload.progress}%`,
                    backgroundColor: getProgressColor(upload.status),
                  }}
                />
              </div>
              {upload.error && (
                <div className="text-[#ff6666] text-[11px] mt-0.5">{upload.error}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SoundUpload
