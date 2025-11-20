// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { type SliderControlProps } from '../types'

/**
 * Slider control for numeric parameter editing
 */
const SliderControl: React.FC<SliderControlProps> = ({
  value,
  onChange,
  min,
  max,
  step,
  label,
}) => {
  // Handle slider change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  return (
    <SControlContainer>
      <SControlHeader>
        <SLabel>{label}</SLabel>
        <SNumberInput
          type='number'
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
        />
      </SControlHeader>
      <SSlider type='range' min={min} max={max} step={step} value={value} onChange={handleChange} />
    </SControlContainer>
  )
}

// Styled components
const SControlContainer = styled.div`
  width: auto;
  margin-bottom: 12px;
  gap: 8px;
  position: relative;
`

const SControlHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding: 4px 8px 0px 8px;
`

const SLabel = styled.label`
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
`

const SNumberInput = styled.input`
  width: 25%;
  padding: 0px 6px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-family: monospace;
  text-align: center;
  height: 22px;

  &:focus {
    outline: none;
    border-color: #5f5fff;
    box-shadow: 0 0 0 1px rgba(95, 95, 255, 0.3);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const SSlider = styled.input`
  width: 100%;
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, rgba(95, 95, 255, 0.7), rgba(95, 95, 255, 0.3));
  outline: none;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #5f5fff;
    border: 2px solid white;
    border-radius: 20%;
    cursor: pointer;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
    transition: all 0.2s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    background: #7f7fff;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #5f5fff;
    border: 2px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
    transition: all 0.2s;
  }

  &::-moz-range-thumb:hover {
    transform: scale(1.15);
    background: #7f7fff;
  }
`

export default SliderControl
