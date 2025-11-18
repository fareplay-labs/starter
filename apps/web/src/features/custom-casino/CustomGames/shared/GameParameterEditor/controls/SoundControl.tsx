// @ts-nocheck
import React, { useState } from 'react'
import { styled } from 'styled-components'
import { type SoundData } from '../../../../shared/types/sound.types'
import { SoundEditModal } from '../../../../shared/modals/SoundEditModal'

interface SoundControlProps {
  value: SoundData | undefined
  onChange: (value: SoundData | undefined) => void
  label: string
  parameterId: string
  soundContext: string
}

const SoundControl: React.FC<SoundControlProps> = ({ value, onChange, label, soundContext }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleChooseSound = () => {
    setIsModalOpen(true)
  }

  const handleSoundSelect = (selectedSound: SoundData) => {
    onChange(selectedSound)
    setIsModalOpen(false)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleClearSound = () => {
    onChange(undefined)
  }

  const handlePreview = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (value?.url) {
      // Create audio element and play
      const audio = new Audio(value.url)
      audio.volume = value.volume || 0.7
      audio.play().catch(console.error)
    }
    e.currentTarget.blur()
  }

  const displayName = value?.name || 'Default'

  return (
    <>
      <SControlContainer>
        <SControlHeader>
          <SLabel>{label}</SLabel>
        </SControlHeader>

        <SSoundDisplay>
          <SSoundInfo>
            <SSoundName>{displayName}</SSoundName>
          </SSoundInfo>

          {value && (
            <SPreviewButton onClick={handlePreview} title='Preview sound'>
              ▶
            </SPreviewButton>
          )}
        </SSoundDisplay>

        <SChooseButtonContainer>
          <SChooseButton onClick={handleChooseSound}>
            {value ? 'Change Sound' : 'Choose Sound'}
          </SChooseButton>
          {value && (
            <SClearButton onClick={handleClearSound} title='Clear selection'>
              ✕
            </SClearButton>
          )}
        </SChooseButtonContainer>
      </SControlContainer>

      <SoundEditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSelect={handleSoundSelect}
        currentSound={value}
        context={soundContext}
      />
    </>
  )
}

const SControlContainer = styled.div`
  width: auto;
  margin-bottom: 12px;
  padding: 10px;
  position: relative;
  box-sizing: border-box;
`

const SControlHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;
`

const SLabel = styled.label`
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
`

const SSoundDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  padding-right: 0px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  height: 30px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  margin-bottom: 8px;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(95, 95, 255, 0.3);
  }
`

const SSoundInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`

const SSoundName = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SChooseButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`

const SPreviewButton = styled.button`
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(95, 95, 255, 0.1);
    color: #5f5fff;
  }

  &:focus {
    outline: none;
    background-color: rgba(95, 95, 255, 0.1);
  }

  &:active {
    transform: scale(0.95);
  }
`

const SClearButton = styled.button`
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  width: 32px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(255, 59, 48, 0.1);
    color: #ff6666;
  }

  &:focus {
    outline: none;
    background-color: rgba(255, 59, 48, 0.1);
  }

  &:active {
    transform: scale(0.95);
  }
`

const SChooseButton = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 6px 12px;
  background-color: rgba(95, 95, 255, 0.1);
  border: 1px solid rgba(95, 95, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background-color: rgba(95, 95, 255, 0.2);
    border-color: rgba(95, 95, 255, 0.3);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 1px rgba(95, 95, 255, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }
`

export default SoundControl
