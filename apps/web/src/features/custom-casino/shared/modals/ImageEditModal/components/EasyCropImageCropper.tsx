// @ts-nocheck
import React, { useState, useCallback, useEffect } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { styled } from 'styled-components'
import { SPACING, FARE_COLORS } from '@/design'

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

// --- Styled Components ---
const CropperWrapper = styled.div`
  width: 100%;
  margin-bottom: ${SPACING.lg}px;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.sm}px;
`

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px; /* Or adjust as needed */
  background-color: #191919; /* Match old boundary color */
  border-radius: 12px;
  overflow: hidden;

  /* react-easy-crop specific styles */
  .reactEasyCrop_Container {
    width: 100%;
    height: 100%;
  }

  .reactEasyCrop_CropArea {
    border: 2px solid ${FARE_COLORS.pink};
    box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.5);
    color: rgba(255, 255, 255, 0.5); /* Grid line color */
  }

  /* Instructions hint */
  &::after {
    content: 'Scroll to zoom, drag to position';
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1; /* Ensure it's above the crop area shadow */
  }
`

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  z-index: 10;
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-bottom: ${SPACING.sm}px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

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
    // console.log('Media Loaded')
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
    <CropperWrapper>
      <ImageContainer>
        {(isLoading || internalLoading) && (
          <LoadingOverlay>
            <Spinner />
            <span>Loading Image...</span>
          </LoadingOverlay>
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
          <LoadingOverlay style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <span>No image selected</span>
          </LoadingOverlay>
        )}
      </ImageContainer>
      {/* Add zoom/rotation controls here if needed */}
      {/* Example: <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} /> */}
    </CropperWrapper>
  )
}

export default EasyCropImageCropper
