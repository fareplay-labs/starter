// @ts-nocheck
import React from 'react'
import {
  PreviewSection,
  PreviewLabel,
  ImagePreviewContainer,
  ImagePreview as StyledImagePreview,
  UploadPlaceholder,
  PlaceholderIcon,
  LoadingIndicator,
  Spinner,
} from '../styles/previewStyles'

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
        <UploadPlaceholder $hasError={false}>
          <PlaceholderIcon>🖼️</PlaceholderIcon>
          <p>No image selected</p>
          <p>Upload an image or enter a URL below</p>
        </UploadPlaceholder>
      )
    }

    if (hasError) {
      return (
        <UploadPlaceholder $hasError={true}>
          <PlaceholderIcon>⚠️</PlaceholderIcon>
          <p>Image could not be loaded</p>
          <p>Please check the URL or upload another image</p>
        </UploadPlaceholder>
      )
    }

    return (
      <>
        {isLoading && (
          <LoadingIndicator>
            <Spinner />
            Loading...
          </LoadingIndicator>
        )}
        <img src={imageUrl} alt='Preview' onError={onImageError} onLoad={onImageLoad} />
      </>
    )
  }

  return (
    <PreviewSection>
      <PreviewLabel>Preview</PreviewLabel>
      <ImagePreviewContainer>
        <StyledImagePreview
          $hasImage={!!imageUrl && !hasError}
          $isLoading={isLoading}
          $hasError={hasError}
        >
          {renderPreview()}
        </StyledImagePreview>
      </ImagePreviewContainer>
    </PreviewSection>
  )
}

export default ImagePreview
