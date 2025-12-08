// @ts-nocheck
import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface UserFile {
  id: string
  filename: string
  url: string
  tags?: string[]
}

interface UploadItemProps {
  file: UserFile
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

/**
 * Individual upload item with image, selection and delete controls
 */
const UploadItem: React.FC<UploadItemProps> = ({ file, isSelected, onSelect, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Extract a more user-friendly filename (without timestamp)
  const displayFilename =
    file.filename.includes('-') ? file.filename.split('-').slice(1).join('-') : file.filename

  return (
    <div
      className={cn(
        'relative border border-white/10 rounded-md overflow-hidden',
        'transition-all duration-200 cursor-pointer',
        isSelected && 'shadow-[0_0_0_2px_#410dff]',
        'hover:shadow-[0_2px_6px_rgba(0,0,0,0.15)]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Thumbnail Container */}
      <div className="relative w-full h-[60px] bg-black/20">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center text-white/40">
            <svg
              className="w-6 h-6"
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
        ) : (
          <img
            src={file.url}
            alt={displayFilename}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain"
          />
        )}

        {/* Overlay with actions */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            {!isSelected && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onSelect()
                }}
                className={cn(
                  'bg-white text-[#333] rounded-full p-1 flex items-center justify-center',
                  'hover:bg-[rgba(200,220,255,0.9)]',
                  '[&_svg]:w-3.5 [&_svg]:h-3.5'
                )}
              >
                <svg
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </button>
            )}

            <button
              onClick={e => {
                e.stopPropagation()
                onDelete()
              }}
              className={cn(
                'bg-white text-[#ef4444] rounded-full p-1 flex items-center justify-center ml-1.5',
                'hover:bg-[rgba(255,200,200,0.9)]',
                '[&_svg]:w-3.5 [&_svg]:h-3.5'
              )}
            >
              <svg
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
            </button>
          </div>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-0.5 right-0.5 bg-[#410dff] text-white rounded-full p-0.5 [&_svg]:w-2.5 [&_svg]:h-2.5">
            <svg
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2.5}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
        )}
      </div>

      {/* Filename */}
      <div
        className="p-2 text-[10px] text-center whitespace-nowrap overflow-hidden text-ellipsis text-white/80"
        title={file.filename}
      >
        {displayFilename}
      </div>
    </div>
  )
}

export default UploadItem
