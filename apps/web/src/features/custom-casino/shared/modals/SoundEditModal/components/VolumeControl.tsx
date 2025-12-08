// @ts-nocheck
import React from 'react'
import { cn } from '@/lib/utils'

interface VolumeControlProps {
  volume: number // 0-1 range
  onChange: (volume: number) => void
  label?: string
  disabled?: boolean
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onChange,
  label = 'Volume',
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    onChange(newVolume)
  }

  const volumePercentage = Math.round(volume * 100)

  return (
    <div className="flex flex-col gap-3">
      {/* Volume Header */}
      <div className="flex justify-between items-center">
        <label className="text-xs text-[#aaa] uppercase tracking-wide font-semibold">{label}</label>
        <div className="text-xs text-[#5f5fff] font-semibold">{volumePercentage}%</div>
      </div>

      {/* Volume Slider Container */}
      <div className="flex items-center gap-3">
        <div className="text-sm text-[#aaa]">🔇</div>
        <input
          type='range'
          min='0'
          max='1'
          step='0.05'
          value={volume}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'flex-1 h-1 rounded-sm outline-none appearance-none transition-opacity duration-200',
            'bg-gradient-to-r from-[#5f5fff] to-[#5f5fff]',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            // Webkit slider thumb
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5f5fff]',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white',
            '[&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
            '[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb:hover]:bg-[#7f7fff] [&::-webkit-slider-thumb:hover]:scale-110',
            '[&::-webkit-slider-thumb:active]:scale-95',
            '[&:focus::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(95,95,255,0.3)]',
            // Disabled webkit thumb
            '[&:disabled::-webkit-slider-thumb]:bg-[#666] [&:disabled::-webkit-slider-thumb]:cursor-not-allowed',
            // Firefox slider thumb
            '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#5f5fff]',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white',
            '[&::-moz-range-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
            '[&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200',
            '[&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb:hover]:bg-[#7f7fff] [&::-moz-range-thumb:hover]:scale-110',
            '[&:focus::-moz-range-thumb]:shadow-[0_0_0_3px_rgba(95,95,255,0.3)]',
            '[&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-[#333] [&::-moz-range-track]:rounded-sm',
            // Disabled firefox thumb
            '[&:disabled::-moz-range-thumb]:bg-[#666] [&:disabled::-moz-range-thumb]:cursor-not-allowed'
          )}
          style={{
            background: `linear-gradient(to right, #5f5fff 0%, #5f5fff ${volumePercentage}%, #333 ${volumePercentage}%, #333 100%)`,
          }}
        />
        <div className="text-sm text-[#aaa]">🔊</div>
      </div>
    </div>
  )
}

export default VolumeControl
