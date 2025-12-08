// @ts-nocheck
import React from 'react'
import { Slider } from '@/components/ui/slider'
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
  const handleChange = (values: number[]) => {
    onChange(values[0])
  }

  const volumePercentage = Math.round(volume * 100)

  return (
    <div className="flex flex-col gap-3">
      {/* Volume Header */}
      <div className="flex justify-between items-center">
        <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
          {label}
        </label>
        <div className="text-xs text-secondary font-semibold">{volumePercentage}%</div>
      </div>

      {/* Volume Slider Container */}
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">🔇</div>
        <Slider
          value={[volume]}
          onValueChange={handleChange}
          min={0}
          max={1}
          step={0.05}
          disabled={disabled}
          className={cn(
            'flex-1',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <div className="text-sm text-muted-foreground">🔊</div>
      </div>
    </div>
  )
}

export default VolumeControl
