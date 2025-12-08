// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

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
    <div className="w-full box-border">
      <div
        ref={dropRef}
        className={cn(
          'relative w-full px-4 py-2 rounded-xl border-2 border-dashed',
          'transition-all duration-200 overflow-hidden box-border',
          isDragging
            ? 'bg-[rgba(0,112,243,0.1)] border-[#410dff]'
            : 'bg-black/20 border-white/20',
          'hover:bg-black/30 hover:border-white/30',
          'cursor-pointer',
          '[&>label]:block [&>label]:cursor-pointer [&>label]:w-full'
        )}
      >
        <label htmlFor='file-upload'>
          <div className="flex flex-row items-center p-2 text-[#aaaaaa] h-10 w-full box-border cursor-pointer">
            {/* Upload Icon */}
            <div className="text-[22px] mr-4 flex-shrink-0">📁</div>
            {/* Text Container */}
            <div className="flex flex-col justify-center w-full overflow-hidden">
              <div className="text-sm font-medium text-left whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="text-[#410dff] font-semibold">Upload a file</span> or drag & drop
              </div>
              <div className="text-xs text-[#aaaaaa] opacity-70 text-left whitespace-nowrap overflow-hidden text-ellipsis">
                PNG, JPG, GIF, WebP • up to 5MB
              </div>
            </div>
          </div>
        </label>
        <input
          id='file-upload'
          type='file'
          accept='image/png,image/jpeg,image/jpg,image/gif,image/webp'
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="absolute top-0 left-0 w-[0.1px] h-[0.1px] opacity-0 overflow-hidden -z-10 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  )
}

export default FileUpload
