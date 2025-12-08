import React, { useState, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { useSound } from './SoundContext'
import volumeOffIcon from '@/features/custom-casino/assets/svg/volume-off.svg'
import volumeOnIcon from '@/features/custom-casino/assets/svg/volume-half.svg'
import volumeFull from '@/features/custom-casino/assets/svg/volume-full.svg'

const VOLUME_OFF_ICON_PATH = volumeOffIcon
const VOLUME_HALF_ICON_PATH = volumeOnIcon
const VOLUME_FULL_ICON_PATH = volumeFull

interface VolumeSliderProps {
  iconColor?: string
  onVolumeChange?: (volume: number) => void
}

const VOLUME_STORAGE_KEY = 'audioVolume'
const MUTE_STORAGE_KEY = 'audioMuted'

export const SVolumeSliderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute bottom-2.5 left-2.5 z-[1000] touch-none max-sm:top-2.5 max-sm:bottom-auto">
    {children}
  </div>
)

export const VolumeSlider: React.FC<VolumeSliderProps> = ({ onVolumeChange }) => {
  const [volume, setVolume] = useState<number>(() => {
    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY)
    return savedVolume ? parseFloat(savedVolume) : 0.5
  })
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const savedMuteState = localStorage.getItem(MUTE_STORAGE_KEY)
    return savedMuteState ? JSON.parse(savedMuteState) : false
  })
  const [isHovered, setIsHovered] = useState(false)
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

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0]
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
    <div
      className={cn(
        'relative inline-flex items-center bg-transparent',
        'border border-dashed border-border rounded-md p-1.5',
        'transition-all duration-300 ease-in-out select-none',
        isHovered ? 'w-[150px] border-solid bg-white/10' : 'w-9 max-sm:w-7'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={handleMuteToggle}
        className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center flex-shrink-0"
      >
        <img
          src={iconSrc}
          alt="Volume"
          className="w-5 h-5 max-sm:w-3 max-sm:h-3"
        />
      </button>
      <div
        className={cn(
          'ml-2 transition-all duration-200 overflow-hidden',
          isHovered ? 'w-[100px] opacity-100' : 'w-0 opacity-0'
        )}
      >
        <Slider
          value={[volume]}
          onValueChange={handleVolumeChange}
          min={0}
          max={1}
          step={0.01}
          className="w-[100px]"
        />
      </div>
    </div>
  )
}

VolumeSlider.displayName = 'VolumeSlider'
