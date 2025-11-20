// @ts-nocheck
import React, { useState, useRef, useMemo, useEffect } from 'react'
import { type ImageData } from '../../config/PageConfig'
import { type Area } from 'react-easy-crop'
import { styled } from 'styled-components'

interface CroppedImageProps {
  imageData: string | ImageData | { url: string; crop: Area }
  alt: string
  width?: string | number
  height?: string | number
  className?: string
}

// Container for the cropped image with specified dimensions
const ImageContainer = styled.div<{
  $width?: string | number
  $height?: string | number
}>`
  width: ${props =>
    typeof props.$width === 'number' ? `${props.$width}px` : props.$width || '100%'};
  height: ${props =>
    typeof props.$height === 'number' ? `${props.$height}px` : props.$height || 'auto'};
  overflow: hidden;
  position: relative;
`

// Actual image element that will be positioned and scaled
const CroppedImg = styled.img`
  position: absolute;
  transform-origin: 0 0;
`

// Type guard for Area format
const isAreaCrop = (crop: any): crop is Area => {
  return (
    crop &&
    typeof crop.x === 'number' &&
    typeof crop.y === 'number' &&
    typeof crop.width === 'number' &&
    typeof crop.height === 'number'
  )
}

// Type guard for points/zoom format
const isPointsCrop = (crop: any): crop is { points: number[]; zoom: number } => {
  return crop && Array.isArray(crop.points) && typeof crop.zoom === 'number'
}

/**
 * Component that displays an image with crop settings applied,
 * supporting both old (points/zoom) and new (Area) formats.
 * Test comment added for verification purposes.
 */
const CroppedImage: React.FC<CroppedImageProps> = ({
  imageData,
  alt,
  width,
  height,
  className,
}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [forceRerender, setForceRerender] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get the image URL - Correctly handle all input types
  const imageUrl = useMemo(() => {
    if (typeof imageData === 'string') {
      // Only try to parse if it looks like JSON
      if (imageData.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(imageData)
          if (parsed && typeof parsed === 'object' && typeof parsed.url === 'string') {
            return parsed.url
          }
        } catch (e) {
          // Silently fail and return the original string
        }
      }
      return imageData
    } else if (imageData && typeof imageData === 'object' && 'url' in imageData) {
      return imageData.url
    }
    return '' // Fallback to empty string if no valid URL found
  }, [imageData])

  // Force re-render when width or height props change to recalculate layout
  useEffect(() => {
    setForceRerender(prev => prev + 1)
  }, [width, height])

  // Track image load to get accurate dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
    setIsImageLoaded(true)
  }

  // If no image, just return an empty container
  if (!imageUrl) {
    return (
      <ImageContainer $width={width} $height={height} className={className} ref={containerRef} />
    )
  }

  // Helper to get crop data
  const getCropData = () => {
    try {
      if (typeof imageData === 'object' && imageData !== null) {
        const crop = 'crop' in imageData ? imageData.crop : null

        if (isAreaCrop(crop)) {
          return crop
        }

        if (isPointsCrop(crop)) {
          return {
            points: crop.points,
            zoom: crop.zoom,
          }
        }
      }

      if (typeof imageData === 'string' && imageData.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(imageData)
          if (parsed && typeof parsed === 'object' && parsed.crop) {
            if (isAreaCrop(parsed.crop)) {
              return parsed.crop
            }
            if (isPointsCrop(parsed.crop)) {
              return {
                points: parsed.crop.points,
                zoom: parsed.crop.zoom,
              }
            }
          }
        } catch (e) {
          // Silently fail and return null
          return null
        }
      }

      return null
    } catch (error) {
      // Only log error if it's not a simple case of non-JSON string
      if (
        typeof imageData === 'object' ||
        (typeof imageData === 'string' && imageData.trim().startsWith('{'))
      ) {
        console.error('Error getting crop data:', error)
      }
      return null
    }
  }

  const cropData = getCropData()

  if (!cropData || !isImageLoaded) {
    return (
      <ImageContainer $width={width} $height={height} className={className} ref={containerRef}>
        <img
          src={imageUrl}
          alt={alt}
          onLoad={handleImageLoad}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </ImageContainer>
    )
  }

  const renderCroppedImage = () => {
    const containerWidth = containerRef.current?.offsetWidth || 300
    const containerHeight = containerRef.current?.offsetHeight || 200
    // Use forceRerender to ensure calculations update when size changes
    const _ = forceRerender

    try {
      let transformStyle = {}

      if (isAreaCrop(cropData)) {
        const scaleX = containerWidth / cropData.width
        const scaleY = containerHeight / cropData.height
        const scale = Math.max(scaleX, scaleY)
        const offsetX = -cropData.x * scale
        const offsetY = -cropData.y * scale

        transformStyle = {
          width: `${imageSize.width}px`,
          height: `${imageSize.height}px`,
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        }
      } else if (isPointsCrop(cropData)) {
        const [x1, y1, x2, y2] = cropData.points
        const cropWidth = x2 - x1
        const cropHeight = y2 - y1
        const scaleX = containerWidth / cropWidth
        const scaleY = containerHeight / cropHeight
        const scale = Math.max(scaleX, scaleY)

        const scaledWidth = cropWidth * scale
        const scaledHeight = cropHeight * scale
        const horizontalExcess = scaledWidth - containerWidth
        const offsetX = -x1 * scale - (horizontalExcess > 0 ? horizontalExcess / 2 : 0)
        const verticalExcess = scaledHeight - containerHeight
        const isNearTop = y1 < imageSize.height * 0.1
        const isNearBottom = y2 > imageSize.height * 0.9
        let offsetY = -y1 * scale
        if (verticalExcess > 0) {
          offsetY =
            isNearTop ? -y1 * scale
            : isNearBottom ? -y1 * scale - verticalExcess
            : -y1 * scale - verticalExcess / 2
        }

        transformStyle = {
          width: `${imageSize.width}px`,
          height: `${imageSize.height}px`,
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        }
      } else {
        return renderFullImage()
      }

      return <CroppedImg src={imageUrl} alt={alt} style={transformStyle} onLoad={handleImageLoad} />
    } catch (error) {
      console.error('Error calculating crop styles:', error)
      return renderFullImage()
    }
  }

  const renderFullImage = () => (
    <img
      src={imageUrl}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
      onLoad={handleImageLoad}
    />
  )

  return (
    <ImageContainer $width={width} $height={height} className={className} ref={containerRef}>
      {renderCroppedImage()}
    </ImageContainer>
  )
}

export default CroppedImage
