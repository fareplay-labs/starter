// @ts-nocheck
import { styled } from 'styled-components'
import { SPACING, TEXT_COLORS, FARE_COLORS } from '@/design'

// File upload section container
export const UploadSection = styled.div`
  width: 100%;
  /* margin-bottom: ${SPACING.lg}px; */
  box-sizing: border-box;
`

// File input container that handles drag & drop
export const FileUploadContainer = styled.div<{ $isDragging: boolean; $isProcessing?: boolean }>`
  position: relative;
  width: 100%;
  padding: ${SPACING.xs}px ${SPACING.md}px;
  background-color: ${props =>
    props.$isDragging ? 'rgba(0, 112, 243, 0.1)' : 'rgba(0, 0, 0, 0.2)'};
  border: 2px dashed ${props => (props.$isDragging ? FARE_COLORS.blue : 'rgba(255, 255, 255, 0.2)')};
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: ${props => (props.$isProcessing ? 'wait' : 'pointer')};
  opacity: ${props => (props.$isProcessing ? 0.7 : 1)};
  pointer-events: ${props => (props.$isProcessing ? 'none' : 'auto')};
  overflow: hidden;
  box-sizing: border-box;

  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* Style for the label to fill the container */
  & > label {
    display: block;
    cursor: pointer;
    width: 100%;
  }
`

export const FileUploadButton = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: ${SPACING.xs}px;
  color: ${TEXT_COLORS.two};
  height: 40px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
`

export const UploadIcon = styled.div`
  font-size: 22px;
  margin-right: ${SPACING.md}px;
  flex-shrink: 0;
`

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  overflow: hidden;
`

export const UploadText = styled.div`
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    color: ${FARE_COLORS.blue};
    font-weight: 600;
  }
`

export const UploadHint = styled.div`
  font-size: 12px;
  color: ${TEXT_COLORS.two};
  opacity: 0.7;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

// Hidden file input
export const HiddenFileInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 0.1px; /* Nearly invisible but still accessible */
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;

  &:disabled {
    cursor: not-allowed;
  }
`
