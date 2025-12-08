// @ts-nocheck
import React from 'react'
import { cn } from '@/lib/utils'

interface ImagePreviewProps {
  imageUrl: string
  isLoading: boolean
  hasError: boolean
  onImageLoad: () => void
  onImageError: () => void
}

/**
 * Component for displaying image preview with loading state and error handling
 */
const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  isLoading,
  hasError,
  onImageLoad,
  onImageError,
}) => {
  const renderPreview = () => {
    if (!imageUrl) {
      return (
        <div className="text-[#aaaaaa] text-base text-center p-4 flex flex-col items-center gap-3">
          <div className="text-4xl mb-3 opacity-60">🖼️</div>
          <p>No image selected</p>
          <p>Upload an image or enter a URL below</p>
        </div>
      )
    }

    if (hasError) {
      return (
        <div className="text-[#ff5e4f] text-base text-center p-4 flex flex-col items-center gap-3">
          <div className="text-4xl mb-3 opacity-60">⚠️</div>
          <p>Image could not be loaded</p>
          <p>Please check the URL or upload another image</p>
        </div>
      )
    }

    return (
      <>
        {isLoading && (
          <div className="absolute flex items-center justify-center gap-3 text-white bg-black/50 py-3 px-4 rounded-[20px] text-sm z-[5]">
            <div className="w-[18px] h-[18px] border-2 border-white/30 rounded-full border-t-white animate-spin" />
            Loading...
          </div>
        )}
        <img src={imageUrl} alt='Preview' onError={onImageError} onLoad={onImageLoad} />
      </>
    )
  }

  return (
    <div className="w-full mb-6">
      <div className="text-[#aaaaaa] text-sm font-medium mb-3">Preview</div>
      <div className="w-full relative aspect-[16/5] flex flex-col items-center bg-black/20 overflow-hidden rounded-xl">
        <div
          className={cn(
            'absolute top-0 left-0 w-full h-full rounded-xl',
            'flex items-center justify-center bg-black/20 transition-all duration-200',
            'border-2 border-dashed',
            hasError
              ? 'border-[#ff5e4f]'
              : imageUrl && !hasError
                ? 'border-transparent'
                : 'border-white/15',
            '[&_img]:w-full [&_img]:h-full [&_img]:object-cover',
            isLoading ? '[&_img]:opacity-50' : '[&_img]:opacity-100',
            '[&_img]:transition-opacity [&_img]:duration-300'
          )}
        >
          {renderPreview()}
        </div>
      </div>
    </div>
  )
}

export default ImagePreview
