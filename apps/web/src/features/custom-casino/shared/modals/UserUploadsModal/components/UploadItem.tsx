// @ts-nocheck
import React, { useState } from 'react'
import { styled } from 'styled-components'
import { SPACING, FARE_COLORS, COLORS } from '@/design'

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

// Styled components
const SItemContainer = styled.div<{ $isSelected: boolean }>`
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;

  ${props =>
    props.$isSelected &&
    `
    box-shadow: 0 0 0 2px ${FARE_COLORS.blue};
  `}

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`

const SThumbnailContainer = styled.div`
  position: relative;
  width: 100%;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.2);
`

const SImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

const SErrorState = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
`

const SOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`

const SActionButton = styled.button<{ $isDelete?: boolean }>`
  background-color: white;
  color: ${props => (props.$isDelete ? COLORS.error : '#333')};
  border-radius: 50%;
  padding: 4px;
  margin: ${props => (props.$isDelete ? '0 0 0 6px' : '0')};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${props =>
      props.$isDelete ? 'rgba(255, 200, 200, 0.9)' : 'rgba(200, 220, 255, 0.9)'};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

const SSelectedIndicator = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: ${FARE_COLORS.blue};
  color: white;
  border-radius: 50%;
  padding: 2px;

  svg {
    width: 10px;
    height: 10px;
  }
`

const SFilename = styled.div`
  padding: ${SPACING.xs}px;
  font-size: 10px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(255, 255, 255, 0.8);
`

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
    <SItemContainer
      $isSelected={isSelected}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <SThumbnailContainer>
        {imageError ?
          <SErrorState>
            <svg
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
          </SErrorState>
        : <SImage src={file.url} alt={displayFilename} onError={() => setImageError(true)} />}

        {/* Overlay with actions */}
        {isHovered && (
          <SOverlay>
            {!isSelected && (
              <SActionButton
                onClick={e => {
                  e.stopPropagation()
                  onSelect()
                }}
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
              </SActionButton>
            )}

            <SActionButton
              $isDelete
              onClick={e => {
                e.stopPropagation()
                onDelete()
              }}
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
            </SActionButton>
          </SOverlay>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <SSelectedIndicator>
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
          </SSelectedIndicator>
        )}
      </SThumbnailContainer>

      <SFilename title={file.filename}>{displayFilename}</SFilename>
    </SItemContainer>
  )
}

export default UploadItem
