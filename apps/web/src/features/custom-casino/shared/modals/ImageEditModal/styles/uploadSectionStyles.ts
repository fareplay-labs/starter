// @ts-nocheck
import { BORDER_COLORS, FARE_COLORS, TEXT_COLORS } from '@/design/colors'
import { styled } from 'styled-components'

export const CombinedUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid ${BORDER_COLORS.one};
  border-radius: 8px;
  padding: 12px;
  background-color: transparent;
  overflow: hidden;
  min-height: 165px;
  height: 175px;
`

export const InputSection = styled.div`
  overflow: hidden;
  transition: all 0.3s ease-out;
`

export const DividerContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9em;
  transition: all 0.3s ease-out;
  margin: 16px 0;
  overflow: hidden;
`

export const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: ${BORDER_COLORS.three};
`

export const DividerText = styled.span`
  padding: 0 12px;
  color: ${TEXT_COLORS.two};
`

// only visible when a file is selected
export const PreviewContainer = styled.div`
  display: flex;
  flex-direction: row;
  transition: opacity 0.3s ease-in;
`

export const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30%;
  height: auto;
  margin-right: 16px;
`

export const ThumbnailPreview = styled.div`
  flex: 0 0 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    max-height: 100px;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    border-radius: 4px;
    border: 1px solid ${BORDER_COLORS.one};
  }
`

export const TagsContainer = styled.div`
  flex: 1;
  margin-right: 0px;
`

export const UploadButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const TagSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 12px;
  margin-bottom: 12px;
`

export const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  /* margin-bottom: 12px; */
`

export const VerticalDivider = styled.div`
  width: 2px;
  height: 20px;
  background-color: ${BORDER_COLORS.three};
  margin: 0 10px;
  opacity: 0.5;
  align-self: center;
`

export const TagItem = styled.div<{ $isSelected?: boolean; $type?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  min-width: auto;
  width: auto;
  background-color: transparent;
  color: white;
  border-radius: 4px;
  padding: 0px 7px;
  font-size: 0.9em;
  /* text-align: center; */
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => {
      if (props.$type === 'image-type') return FARE_COLORS.peach
      if (props.$type === 'game-or-general') return FARE_COLORS.pink
      if (props.$type === 'element') return FARE_COLORS.blue
      if (props.$type === 'user-tag') return FARE_COLORS.aqua
      return '#f1f1f1'
    }};
    opacity: ${props => (props.$isSelected ? 1 : 0.5)};
    border-radius: inherit;
    z-index: -1;
  }

  border-width: 1px;
  border-style: solid;
  border-color: ${props => {
    if (props.$type === 'image-type') return FARE_COLORS.peach
    if (props.$type === 'game-or-general') return FARE_COLORS.pink
    if (props.$type === 'element') return FARE_COLORS.blue
    if (props.$type === 'user-tag') return FARE_COLORS.aqua
    return '#f1f1f1'
  }};

  &:hover {
    filter: brightness(1.05);
  }

  &:active {
    transform: scale(0.98);
  }
`

// New component for Add Tag button that looks like a TagItem
export const AddTagButton = styled(TagItem)`
  background-color: transparent;
  color: ${TEXT_COLORS.two};
  line-height: 1.5;
  font-size: 0.9em;
  border: 1px solid ${BORDER_COLORS.three};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;

  &::before {
    display: none; // No background opacity effect
  }

  &:hover {
    background-color: rgba(61, 54, 68, 0.57);
    border-color: #999;
  }
`

// New component for inline tag input that appears when AddTagButton is clicked
export const InlineTagInput = styled.input`
  min-width: 10px;
  width: auto;
  height: 24px;
  padding: 0 8px;
  font-size: 0.9em;
  line-height: 1.5;
  background: transparent;
  border: 1px solid ${FARE_COLORS.aqua};
  border-radius: 4px;
  outline: none;
  color: white;
  text-align: center;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    border-color: ${FARE_COLORS.aqua};
    box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2);
  }
`

export const CustomTagInput = styled.div`
  display: flex;
  margin-top: 12px;

  input {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 0.9em;
  }

  button {
    margin-left: 8px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0 12px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #e3e3e3;
    }
  }
`

export const UploadButton = styled.button<{ $status?: string }>`
  background-color: rgba(0, 0, 0, 0.8);
  color: ${FARE_COLORS.aqua};
  border: 1px solid ${FARE_COLORS.aqua};
  border-radius: 4px;
  padding: 2px 16px;
  font-size: 1em;
  cursor: ${props => (props.$status === 'uploading' ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  box-shadow:
    0 0 10px rgba(0, 255, 0, 0.59),
    inset 0 0 5px rgba(0, 255, 0, 0.59);
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
    box-shadow:
      0 0 10px #00ff00,
      inset 0 0 3px #00ff00;
    text-shadow: 0 0 5px #00ff00;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`
