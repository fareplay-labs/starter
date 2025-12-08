// @ts-nocheck
import React, { useState, useCallback, useEffect } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { cn } from '@/lib/utils'

// Helper function remains the same
const createSafeImageUrl = (url: string): string => {
  if (url.startsWith('data:') || url.startsWith('/') || url.startsWith('blob:')) {
    return url
  }
  if (url.startsWith('uploads/')) {
    return `https://fp-game-assets.nyc3.cdn.digitaloceanspaces.com/${url}`
  }
  if (process.env.NODE_ENV === 'development') {
    return url
  }
  return url
}

interface EasyCropImageCropperProps {
  imageUrl: string
  isLoading: boolean
  aspect: number
  cropShape?: 'rect' | 'round'
  initialZoom?: number
  initialCroppedAreaPixels?: Area | null
  onCropComplete: (croppedAreaPixels: Area) => void
  onImageLoad?: () => void
  onImageError?: (error: Error) => void
  onCropStart?: () => void
  onCropEnd?: () => void
}

// --- Component Implementation ---
const EasyCropImageCropper: React.FC<EasyCropImageCropperProps> = ({
  imageUrl,
  isLoading,
  aspect,
  cropShape,
  initialZoom = 1,
  initialCroppedAreaPixels,
  onCropComplete,
  onImageLoad,
  onImageError,
  onCropStart,
  onCropEnd,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(initialZoom)
  const [rotation, setRotation] = useState(0) // Added rotation state if needed later
  const [internalLoading, setInternalLoading] = useState(true) // Manage internal load state

  const handleCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      onCropComplete(croppedAreaPixels)
    },
    [onCropComplete]
  )

  const handleMediaLoaded = useCallback(() => {
    setInternalLoading(false)
    onImageLoad?.()
  }, [onImageLoad])

  const handleLoadError = useCallback(
    (e: Error) => {
      console.error('Error loading media in react-easy-crop:', e)
      setInternalLoading(false)
      onImageError?.(e)
    },
    [onImageError]
  )

  const safeImageUrl = imageUrl ? createSafeImageUrl(imageUrl) : ''

  // Reset internal loading state when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setInternalLoading(true)
    } else {
      setInternalLoading(false) // No image, not loading
    }
  }, [imageUrl])

  // Reset zoom if initialZoom prop changes
  useEffect(() => {
    setZoom(initialZoom)
  }, [initialZoom])

  return (
    <div className="w-full mb-6 flex flex-col gap-3">
      {/* Image Container */}
      <div
        className={cn(
          'relative w-full h-[300px] bg-[#191919] rounded-xl overflow-hidden',
          // react-easy-crop specific styles
          '[&_.reactEasyCrop_Container]:w-full [&_.reactEasyCrop_Container]:h-full',
          '[&_.reactEasyCrop_CropArea]:border-2 [&_.reactEasyCrop_CropArea]:border-[#d900d5]',
          '[&_.reactEasyCrop_CropArea]:shadow-[0_0_0_999px_rgba(0,0,0,0.5)]',
          '[&_.reactEasyCrop_CropArea]:text-white/50',
          // Instructions hint via pseudo-element styling
          'after:content-["Scroll_to_zoom,_drag_to_position"]',
          'after:absolute after:bottom-2.5 after:right-2.5',
          'after:bg-black/50 after:text-white after:py-1 after:px-2',
          'after:rounded after:text-xs after:pointer-events-none after:z-[1]'
        )}
      >
        {(isLoading || internalLoading) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white z-10">
            <div className="w-10 h-10 rounded-full border-[3px] border-white/30 border-t-white animate-spin mb-3" />
            <span>Loading Image...</span>
          </div>
        )}
        {safeImageUrl && (
          <Cropper
            image={safeImageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape={cropShape}
            zoomSpeed={0.2}
            maxZoom={5}
            initialCroppedAreaPixels={initialCroppedAreaPixels || undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
            onInteractionStart={onCropStart}
            onInteractionEnd={onCropEnd}
            onMediaLoaded={handleMediaLoaded}
          />
        )}
        {!safeImageUrl && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-white z-10">
            <span>No image selected</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default EasyCropImageCropper
