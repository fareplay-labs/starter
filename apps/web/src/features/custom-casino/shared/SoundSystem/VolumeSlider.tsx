import React, { useState, useMemo, useEffect } from 'react'
import { styled } from 'styled-components'
import { useSound } from './SoundContext'
import { BORDER_COLORS, BREAKPOINTS } from '@/design'
import volumeOffIcon from '@/features/custom-casino/assets/svg/volume-off.svg'
import volumeOnIcon from '@/features/custom-casino/assets/svg/volume-half.svg'
import volumeFull from '@/features/custom-casino/assets/svg/volume-full.svg'
import { noUserSelect } from '@/style'

const VOLUME_OFF_ICON_PATH = volumeOffIcon
const VOLUME_HALF_ICON_PATH = volumeOnIcon
const VOLUME_FULL_ICON_PATH = volumeFull

interface VolumeSliderProps {
  iconColor?: string
  onVolumeChange?: (volume: number) => void
}

const SliderContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  background-color: transparent;
  border-color: ${BORDER_COLORS.one};
  border-style: dashed;
  border-width: 1px;
  border-radius: 6px;
  padding: 5px;
  ${noUserSelect}

  transition:
    width 0.3s ease-in-out,
    border-style 0.3s ease-in-out,
    background-color 0.3s ease-in-out;
  overflow: hidden;
  width: 30px;
  &:hover {
    width: 150px;
    border-style: solid;
    background-color: #52525226;
  }

  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    width: 20px;
  }
`

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Icon = styled.img<{ $color: string }>`
  width: 20px;
  height: 20px;

  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    width: 12px;
    height: 12px;
  }
`

const SliderInput = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100px;
  height: 5px;
  border-radius: 5px;
  background: #28605c;
  outline: none;
  opacity: 0;
  transition: opacity 0.2s;
  margin-left: 10px;
  ${SliderContainer}:hover & {
    opacity: 1;
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 12px;
    width: 12px;
    top: 7px;
    border: 1px solid #4af5d3;
    border-radius: 2px;
    background: #4af5d350;
    cursor: pointer;
  }
  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #4caf50;
    cursor: pointer;
  }
`

export const SVolumeSliderWrapper = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 1000;
  touch-action: none; // this stops the finger sliding the page to live-entries or chat

  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    top: 10px;
  }
`

const VOLUME_STORAGE_KEY = 'audioVolume'
const MUTE_STORAGE_KEY = 'audioMuted'

export const VolumeSlider: React.FC<VolumeSliderProps> = ({ iconColor = '0', onVolumeChange }) => {
  const [volume, setVolume] = useState<number>(() => {
    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY)
    return savedVolume ? parseFloat(savedVolume) : 0.5
  })
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const savedMuteState = localStorage.getItem(MUTE_STORAGE_KEY)
    return savedMuteState ? JSON.parse(savedMuteState) : false
  })
  const { setVolume: setGlobalVolume, toggleMute } = useSound()

  useEffect(() => {
    // Initialize volume and mute state
    setGlobalVolume(isMuted ? 0 : volume)
    if (isMuted) toggleMute()
  }, [isMuted, setGlobalVolume, toggleMute, volume])

  useEffect(() => {
    localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString())
  }, [volume])

  useEffect(() => {
    localStorage.setItem(MUTE_STORAGE_KEY, JSON.stringify(isMuted))
  }, [isMuted])

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value)
    setVolume(newVolume)
    setGlobalVolume(newVolume)
    onVolumeChange?.(newVolume)
    if (isMuted && newVolume > 0) {
      setIsMuted(false)
      toggleMute()
    }
  }

  const handleMuteToggle = () => {
    setIsMuted((prev: boolean) => {
      const newMutedState = !prev
      onVolumeChange?.(newMutedState ? 0 : volume)
      return newMutedState
    })
    toggleMute()
  }

  const iconSrc = useMemo(() => {
    if (isMuted || volume === 0) return VOLUME_OFF_ICON_PATH
    if (volume < 0.5) return VOLUME_HALF_ICON_PATH
    return VOLUME_FULL_ICON_PATH
  }, [volume, isMuted])

  return (
    <SliderContainer>
      <IconButton onClick={handleMuteToggle}>
        <Icon src={iconSrc} alt='Volume' $color={iconColor} />
      </IconButton>
      <SliderInput
        type='range'
        min='0'
        max='1'
        step='0.01'
        value={volume}
        onChange={handleVolumeChange}
      />
    </SliderContainer>
  )
}

VolumeSlider.displayName = 'VolumeSlider'
