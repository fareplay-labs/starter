// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
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
      <div className="overflow-hidden transition-all duration-300">
        <UrlInput
          value={urlValue}
          onChange={onUrlChange}
          errorMessage={urlErrorMessage}
          inputRef={urlInputRef}
          disabled={disabled}
        />
        {/* Divider */}
        <div className="flex items-center text-[0.9em] transition-all duration-300 my-4 overflow-hidden">
          <div className="flex-1 h-px bg-[#3a4052]" />
          <span className="px-3 text-[#aaaaaa]">or</span>
          <div className="flex-1 h-px bg-[#3a4052]" />
        </div>
      </div>
      <FileUpload onFileUpload={onFileSelected} />
    </>
  )

  const renderPreviewMode = () => (
    <div className="flex flex-row transition-opacity duration-300">
      {/* Left Section */}
      <div className="flex flex-col items-center w-[30%] h-auto mr-4">
        {/* Thumbnail Preview */}
        <div className="flex-[0_0_100px] flex justify-center items-center [&_img]:max-h-[100px] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain [&_img]:rounded [&_img]:border [&_img]:border-[#1b1d26]">
          {thumbnailUrl && <img src={thumbnailUrl} alt='Upload preview' />}
        </div>
        {/* Upload Button Container */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleUploadClick}
            disabled={disabled || uploadStatus === 'uploading' || selectedTags.length === 0}
            className={cn(
              'bg-black/80 text-[#4af5d3] border border-[#4af5d3] rounded py-0.5 px-4',
              'text-base cursor-pointer transition-all duration-200',
              'shadow-[0_0_10px_rgba(0,255,0,0.59),inset_0_0_5px_rgba(0,255,0,0.59)]',
              'uppercase tracking-wider',
              'hover:bg-black/90 hover:shadow-[0_0_10px_#00ff00,inset_0_0_3px_#00ff00] hover:[text-shadow:0_0_5px_#00ff00]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
              uploadStatus === 'uploading' && 'cursor-not-allowed'
            )}
          >
            {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {/* File Info */}
        {selectedFile && (
          <div className="text-[0.8em] mt-2 text-[#777] text-center">
            {selectedFile.type.split('/')[1].toUpperCase()} • {formatFileSize(selectedFile.size)}
          </div>
        )}
      </div>

      {/* Tags Container */}
      <div className="flex-1 mr-0">
        <TagSelector
          initialSelectedTags={['all', ...suggestedTags]}
          suggestedTags={[]}
          availableTags={availableTags.filter(tag => tag !== 'all')}
          onChange={handleTagChange}
          maxUserTags={2}
        />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col justify-center border border-[#1b1d26] rounded-lg p-3 bg-transparent overflow-hidden min-h-[165px] h-[175px]">
      {isPreviewMode ? renderPreviewMode() : renderInputMode()}
      {errorMessage && (
        <div className="text-red-500 mt-2 text-[0.9em]">{errorMessage}</div>
      )}
    </div>
  )
}

export default CombinedUpload
