// @ts-nocheck
import { styled } from 'styled-components'

// Main container and layout components
export const SControlContainer = styled.div`
  width: auto;
  margin-bottom: 12px;
  padding: 10px;
  position: relative;
`

export const SControlHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;
`

export const SLabel = styled.label`
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
`

export const SControlOptions = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`

// Color input and preview components
export const SColorInput = styled.input`
  width: 100%;
  height: 22px;
  padding: 2px 6px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0px 0px 4px 4px;
  color: white;
  font-size: 12px;
  font-family: monospace;

  &:focus {
    outline: none;
    border-color: #5f5fff;
    box-shadow: 0 0 0 1px rgba(95, 95, 255, 0.3);
  }

  &.color-input {
    width: 100%;
    height: 40px;
    padding: 2px;
    border: none;
    cursor: pointer;
    background: transparent;
    outline: none;
  }
`

export const SColorPickerIcon = styled.div`
  opacity: 0;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.49 10 10-4.49 10-10 10zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8z'/%3E%3C/svg%3E");
  background-size: contain;
  transition: opacity 0.2s;
`

export const SColorPreview = styled.div<{ $color: string }>`
  width: 100%;
  height: 28px;
  border-radius: 6px;
  background: ${props => props.$color};
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    transform: scale(1.01);
    border-color: rgba(95, 95, 255, 0.4);

    ${SColorPickerIcon} {
      opacity: 0.7;
    }
  }
`

// Color picker modal components
export const SColorPickerContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 10;
`

export const SColorInputContainer = styled.div`
  width: 100%;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;

  &:hover {
    border-color: rgba(95, 95, 255, 0.3);
  }
`

export const SColorPickerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
`

export const SColorPicker = styled.div`
  position: relative;
  background-color: rgba(20, 20, 24, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-top: 6px;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  width: 260px;
  max-width: 100%;
`

// Color palette components
export const SPaletteLabel = styled.div`
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  font-weight: 600;
`

export const SCommonColors = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  justify-content: space-between;
  margin-bottom: 4px;
`

export const SColorSwatch = styled.div<{ $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: ${props => props.$color};
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
    border-color: rgba(95, 95, 255, 0.4);
    z-index: 1;
  }
`

// Gradient control components
export const SGradientDirectionControl = styled.div`
  margin-bottom: 10px;
`

export const SGradientDirectionOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
`

export const SGradientDirectionButton = styled.button<{ $isActive: boolean }>`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.$isActive ? 'rgba(95, 95, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)')};
  border: 1px solid
    ${props => (props.$isActive ? 'rgba(95, 95, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 4px;
  color: ${props => (props.$isActive ? 'white' : '#aaa')};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(95, 95, 255, 0.1);
    border-color: rgba(95, 95, 255, 0.3);
    color: white;
  }
`

export const SAddColorButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #aaa;
  font-size: 10px;
  padding: 4px 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;

  &:hover {
    background: rgba(95, 95, 255, 0.1);
    border-color: rgba(95, 95, 255, 0.3);
    color: white;
  }
`

export const SAddColorIcon = styled.span`
  font-size: 14px;
  line-height: 1;
`

// Gradient swap button components
export const SGradientStopsContainer = styled.div`
  position: relative;
  margin-bottom: 10px;
`

export const SGradientSwapButton = styled.button`
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(38, 38, 48, 0.9);
  border: 1px solid rgba(213, 213, 228, 0.15);
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
  
  &:hover {
    border-color: rgba(95, 95, 255, 0.7);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`

// Mode toggle components
export const SModeToggleBar = styled.div`
  display: flex;
  width: 100%;
`

export const SModeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 4px 8px;
  font-size: 11px;
  background: ${props => (props.$active ? 'rgba(95, 95, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)')};
  color: ${props => (props.$active ? 'white' : '#aaa')};
  border: 1px solid
    ${props => (props.$active ? 'rgba(95, 95, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;

  &:hover {
    background: rgba(95, 95, 255, 0.1);
    color: white;
  }
`

// Image mode components
export const SImagePath = styled.div`
  width: 100%;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0px 0px 4px 4px;
  color: #aaa;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const SImageControlsContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`

export const SImagePickerButton = styled.button<{ $hasAIGen?: boolean }>`
  flex: ${props => (props.$hasAIGen ? '1' : 'auto')};
  min-width: ${props => (props.$hasAIGen ? '120px' : '140px')};
  padding: 6px 12px;
  background-color: rgba(95, 95, 255, 0.1);
  border: 1px solid rgba(95, 95, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(95, 95, 255, 0.2);
    border-color: rgba(95, 95, 255, 0.3);
  }
`

// Emoji mode components
export const SEmojiDisplay = styled.div`
  width: 100%;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0px 0px 4px 4px;
  color: #fff;
  font-size: 16px;
  text-align: center;
  min-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const SEmojiPickerButton = styled.button`
  width: 100%;
  padding: 6px 12px;
  background-color: rgba(95, 95, 255, 0.1);
  border: 1px solid rgba(95, 95, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(95, 95, 255, 0.2);
    border-color: rgba(95, 95, 255, 0.3);
  }
`

export const SEmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 8px;
`

export const SEmojiSwatch = styled.button<{ $isSelected?: boolean }>`
  width: 32px;
  height: 32px;
  border: 1px solid ${props => props.$isSelected ? 'rgba(95, 95, 255, 0.6)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 4px;
  background: ${props => props.$isSelected ? 'rgba(95, 95, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${props => props.$isSelected ? 'scale(1.05)' : 'scale(1)'};

  &:hover {
    transform: scale(1.1);
    border-color: rgba(95, 95, 255, 0.4);
    background: rgba(95, 95, 255, 0.1);
    z-index: 1;
  }
`
