// @ts-nocheck
import { styled } from 'styled-components'
import { SPACING, TEXT_COLORS, FARE_COLORS, BORDER_COLORS } from '@/design'

// Image preview section container
export const PreviewSection = styled.div`
  width: 100%;
  margin-bottom: ${SPACING.lg}px;
`

export const PreviewLabel = styled.div`
  color: ${TEXT_COLORS.two};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: ${SPACING.sm}px;
`

// Image preview container - with 16:5 aspect ratio for banner
export const ImagePreviewContainer = styled.div`
  width: 100%;
  position: relative;
  aspect-ratio: 16 / 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border-radius: 12px;

  @supports not (aspect-ratio: 16 / 5) {
    /* Fallback for browsers that don't support aspect-ratio */
    &::before {
      content: '';
      display: block;
      padding-top: 31.25%; /* 5/16 = 0.3125 */
    }
  }
`

// Image preview
export const ImagePreview = styled.div<{
  $hasImage: boolean
  $isLoading: boolean
  $hasError: boolean
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px dashed
    ${props =>
      props.$hasError ? FARE_COLORS.salmon
      : props.$hasImage ? 'transparent'
      : 'rgba(255, 255, 255, 0.15)'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: ${props => (props.$isLoading ? 0.5 : 1)};
    transition: opacity 0.3s ease;
  }
`

// Upload placeholder
export const UploadPlaceholder = styled.div<{ $hasError: boolean }>`
  color: ${props => (props.$hasError ? FARE_COLORS.salmon : TEXT_COLORS.two)};
  font-size: 16px;
  text-align: center;
  padding: ${SPACING.md}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.sm}px;
`

export const PlaceholderIcon = styled.div`
  font-size: 36px;
  margin-bottom: ${SPACING.sm}px;
  opacity: 0.6;
`

export const LoadingIndicator = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.sm}px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: ${SPACING.sm}px ${SPACING.md}px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 5;
`

// Animated spinner
export const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`
