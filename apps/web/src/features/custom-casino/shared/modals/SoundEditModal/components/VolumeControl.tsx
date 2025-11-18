// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { SPACING } from '@/design'

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
    <SVolumeContainer>
      <SVolumeHeader>
        <SVolumeLabel>{label}</SVolumeLabel>
        <SVolumeValue>{volumePercentage}%</SVolumeValue>
      </SVolumeHeader>

      <SVolumeSliderContainer>
        <SVolumeIcon>🔇</SVolumeIcon>
        <SVolumeSlider
          type='range'
          min='0'
          max='1'
          step='0.05'
          value={volume}
          onChange={handleChange}
          disabled={disabled}
        />
        <SVolumeIcon>🔊</SVolumeIcon>
      </SVolumeSliderContainer>
    </SVolumeContainer>
  )
}

const SVolumeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.sm}px;
`

const SVolumeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SVolumeLabel = styled.label`
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
`

const SVolumeValue = styled.div`
  font-size: 12px;
  color: #5f5fff;
  font-weight: 600;
`

const SVolumeSliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm}px;
`

const SVolumeIcon = styled.div`
  font-size: 14px;
  color: #aaa;
`

const SVolumeSlider = styled.input`
  flex: 1;
  height: 4px;
  background: linear-gradient(
    to right,
    #333 0%,
    #333 var(--progress, 70%),
    #5f5fff var(--progress, 70%),
    #5f5fff 100%
  );
  border-radius: 2px;
  outline: none;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: opacity 0.2s ease;

  /* Custom progress calculation */
  --progress: ${props => `${parseFloat(String(props.value || 0)) * 100}%`};

  /* Webkit styles */
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #5f5fff;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
  }

  &::-webkit-slider-thumb:hover {
    background: #7f7fff;
    transform: scale(1.1);
  }

  &::-webkit-slider-thumb:active {
    transform: scale(0.95);
  }

  /* Firefox styles */
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #5f5fff;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
  }

  &::-moz-range-thumb:hover {
    background: #7f7fff;
    transform: scale(1.1);
  }

  &::-moz-range-track {
    height: 4px;
    background: #333;
    border-radius: 2px;
  }

  &:focus {
    &::-webkit-slider-thumb {
      box-shadow: 0 0 0 3px rgba(95, 95, 255, 0.3);
    }

    &::-moz-range-thumb {
      box-shadow: 0 0 0 3px rgba(95, 95, 255, 0.3);
    }
  }

  &:disabled {
    cursor: not-allowed;

    &::-webkit-slider-thumb {
      background: #666;
      cursor: not-allowed;
    }

    &::-moz-range-thumb {
      background: #666;
      cursor: not-allowed;
    }
  }
`

export default VolumeControl
