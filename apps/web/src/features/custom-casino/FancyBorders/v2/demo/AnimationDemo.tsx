// @ts-nocheck
import React, { useState } from 'react'
import { styled } from 'styled-components'
import FancyBorder from '../FancyBorder'
import {
  type PulseAnimationConfig,
  type EntryAnimationConfig,
  type FlowAnimationConfig,
  type SpinAnimationConfig,
} from '../types'

/**
 * Demo component showcasing FancyBorder animation capabilities with interactive controls
 */
const AnimationDemo: React.FC = () => {
  // Pulse animation states
  const [intensity, setIntensity] = useState(1)
  const [duration, setDuration] = useState(1.5)
  const [minOpacity, setMinOpacity] = useState(0)
  const [maxOpacity, setMaxOpacity] = useState(1)

  // Flow animation states
  const [flowDirection, setFlowDirection] = useState(90)
  const [flowSpeed, setFlowSpeed] = useState(1)
  const [flowDuration, setFlowDuration] = useState(3)

  // Spin animation states
  const [spinSpeed, setSpinSpeed] = useState(1)
  const [spinDuration, setSpinDuration] = useState(4)
  const [spinDirection, setSpinDirection] = useState(1)

  // Entry animation states
  const [entryDuration, setEntryDuration] = useState(1)
  const [entryDelay, setEntryDelay] = useState(0)
  const [entryTrigger, setEntryTrigger] = useState(0)
  const [entryEasing, setEntryEasing] = useState('ease-in-out')
  const [cornerSize, setCornerSize] = useState(0)

  // Create animation config objects
  const pulseConfig: PulseAnimationConfig = {
    intensity,
    duration,
    minOpacity,
    maxOpacity,
  }

  // Flow animation config
  const flowConfig: FlowAnimationConfig = {
    flowDirection,
    speed: flowSpeed,
    duration: flowDuration,
    colorStops: ['#3498db', '#9b59b6', '#2ecc71', '#3498db'],
  }

  // Spin animation config
  const spinConfig: SpinAnimationConfig = {
    speed: spinSpeed,
    duration: spinDuration,
    direction: spinDirection,
    colorStops: ['#3498db', '#9b59b6', '#2ecc71', '#3498db'],
  }

  // Entry animation config
  const entryConfig: EntryAnimationConfig = {
    type: 'corners-to-center',
    duration: entryDuration,
    delay: entryDelay,
    easing: entryEasing,
    trigger: entryTrigger,
    onComplete: () => console.log('Entry animation completed'),
    cornerSize: cornerSize,
  }

  // Config for variations
  const subtleConfig: PulseAnimationConfig = {
    ...pulseConfig,
    intensity: intensity * 0.7,
    maxOpacity: maxOpacity * 0.8,
  }

  const strongConfig: PulseAnimationConfig = {
    ...pulseConfig,
    intensity: intensity * 1.5,
    minOpacity: minOpacity * 1.5,
    maxOpacity: Math.min(1, maxOpacity * 1.2),
  }

  // Pulse animation handlers
  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntensity(parseFloat(e.target.value))
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(parseFloat(e.target.value))
  }

  const handleMinOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinOpacity(parseFloat(e.target.value))
  }

  const handleMaxOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxOpacity(parseFloat(e.target.value))
  }

  // Flow animation handlers
  const handleFlowDirectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlowDirection(parseFloat(e.target.value))
  }

  const handleFlowSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlowSpeed(parseFloat(e.target.value))
  }

  const handleFlowDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlowDuration(parseFloat(e.target.value))
  }

  // Spin animation handlers
  const handleSpinSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpinSpeed(parseFloat(e.target.value))
  }

  const handleSpinDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpinDuration(parseFloat(e.target.value))
  }

  const handleSpinDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpinDirection(parseInt(e.target.value))
  }

  // Entry animation handlers
  const handleEntryDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEntryDuration(parseFloat(e.target.value))
  }

  const handleEntryDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEntryDelay(parseFloat(e.target.value))
  }

  const handleCornerSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCornerSize(parseInt(e.target.value))
  }

  const triggerEntryAnimation = () => {
    setEntryTrigger(prev => prev + 1)
  }

  return (
    <DemoContainer>
      <DemoHeader>FancyBorder Animation Demo</DemoHeader>

      <DemoSection>
        <SectionHeader>Pulse Animation</SectionHeader>
        <DemoDescription>
          Customize the pulse effect by adjusting intensity, duration and opacity
        </DemoDescription>

        <ControlsContainer>
          <ControlGroup>
            <ControlLabel htmlFor='intensity'>Intensity: {intensity.toFixed(1)}</ControlLabel>
            <RangeInput
              id='intensity'
              type='range'
              min='0.1'
              max='2'
              step='0.1'
              value={intensity}
              onChange={handleIntensityChange}
            />
          </ControlGroup>

          <ControlGroup>
            <ControlLabel htmlFor='duration'>Duration: {duration.toFixed(1)}s</ControlLabel>
            <RangeInput
              id='duration'
              type='range'
              min='0.5'
              max='3'
              step='0.1'
              value={duration}
              onChange={handleDurationChange}
            />
          </ControlGroup>

          <ControlGroup>
            <ControlLabel htmlFor='minOpacity'>Min Opacity: {minOpacity.toFixed(1)}</ControlLabel>
            <RangeInput
              id='minOpacity'
              type='range'
              min='0'
              max='0.5'
              step='0.1'
              value={minOpacity}
              onChange={handleMinOpacityChange}
            />
          </ControlGroup>

          <ControlGroup>
            <ControlLabel htmlFor='maxOpacity'>Max Opacity: {maxOpacity.toFixed(1)}</ControlLabel>
            <RangeInput
              id='maxOpacity'
              type='range'
              min='0.1'
              max='1'
              step='0.1'
              value={maxOpacity}
              onChange={handleMaxOpacityChange}
            />
          </ControlGroup>
        </ControlsContainer>

        <DemoRow>
          <FancyBorder
            key={`solid-${intensity}-${duration}-${minOpacity}-${maxOpacity}`}
            color='#3498db'
            width='3px'
            radius='4px'
            animated
            animationType='pulse'
            animationConfig={pulseConfig}
          >
            <FixedSizeContent>
              Solid Border
              <br />
              Pulse Animation
            </FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            key={`gradient-${intensity}-${duration}-${minOpacity}-${maxOpacity}`}
            isGradient
            gradientColors={['#9b59b6', '#3498db']}
            width='3px'
            radius='8px'
            animated
            animationType='pulse'
            animationConfig={pulseConfig}
          >
            <FixedSizeContent>
              Gradient Border
              <br />
              Pulse Animation
            </FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            key={`circular-${intensity}-${duration}-${minOpacity}-${maxOpacity}`}
            isGradient
            gradientColors={['#e74c3c', '#f39c12', '#2ecc71']}
            width='4px'
            radius='50%'
            animated
            animationType='pulse'
            animationConfig={pulseConfig}
          >
            <CircularContent>
              Circular
              <br />
              Pulsing
              <br />
              Border
            </CircularContent>
          </FancyBorder>
        </DemoRow>
      </DemoSection>

      <DemoSection>
        <SectionHeader>Flow Animation</SectionHeader>
        <DemoDescription>
          Customize the gradient flow effect by adjusting direction, speed and duration
        </DemoDescription>

        <ControlsContainer>
          <ControlGroup>
            <ControlLabel htmlFor='flowDirection'>Direction: {flowDirection}°</ControlLabel>
            <RangeInput
              id='flowDirection'
              type='range'
              min='0'
              max='360'
              step='15'
              value={flowDirection}
              onChange={handleFlowDirectionChange}
            />
          </ControlGroup>

          <ControlGroup>
            <ControlLabel htmlFor='flowSpeed'>Speed: {flowSpeed.toFixed(1)}x</ControlLabel>
            <RangeInput
              id='flowSpeed'
              type='range'
              min='0.1'
              max='3'
              step='0.1'
              value={flowSpeed}
              onChange={handleFlowSpeedChange}
            />
          </ControlGroup>

          <ControlGroup>
            <ControlLabel htmlFor='flowDuration'>
              Base Duration: {flowDuration.toFixed(1)}s
            </ControlLabel>
            <RangeInput
              id='flowDuration'
              type='range'
              min='1'
              max='10'
              step='0.5'
              value={flowDuration}
              onChange={handleFlowDurationChange}
            />
          </ControlGroup>
        </ControlsContainer>

        <DemoRow>
          <FancyBorder
            key={`flow-solid-${flowDirection}-${flowSpeed}-${flowDuration}`}
            color='#3498db'
            width='3px'
            radius='4px'
            animated
            animationType='flow'
            animationConfig={flowConfig}
          >
            <FixedSizeContent>
              Solid Border
              <br />
              Flow Animation
            </FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            key={`flow-dashed-${flowDirection}-${flowSpeed}-${flowDuration}`}
            color='#e74c3c'
            width='3px'
            radius='8px'
            borderStyle='dashed'
            animated
            animationType='flow'
            animationConfig={{
              ...flowConfig,
              colorStops: ['#e74c3c', '#f39c12', '#e74c3c'],
            }}
          >
            <FixedSizeContent>
              Dashed Border
              <br />
              Flow Animation
            </FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            key={`flow-dotted-${flowDirection}-${flowSpeed}-${flowDuration}`}
            color='#2ecc71'
            width='4px'
            radius='12px'
            borderStyle='dotted'
            animated
            animationType='flow'
            animationConfig={{
              ...flowConfig,
              colorStops: ['#2ecc71', '#3498db', '#2ecc71'],
            }}
          >
            <FixedSizeContent>
              Dotted Border
              <br />
              Flow Animation
            </FixedSizeContent>
          </FancyBorder>
        </DemoRow>
      </DemoSection>

      <DemoSection>
        <SectionHeader>Spin Animation</SectionHeader>
        <DemoDescription>
          Customize the gradient spin effect by adjusting speed, duration and direction
        </DemoDescription>

        <ControlsContainer>
          <ControlGroup>
            <ControlLabel htmlFor='spinSpeed'>Speed: {spinSpeed.toFixed(1)}x</ControlLabel>
            <RangeInput
              id='spinSpeed'
              type='range'
              min='0.1'
              max='3'
              step='0.1'
              value={spinSpeed}
              onChange={handleSpinSpeedChange}
            />
          </ControlGroup>

          <ControlGroup>
            <ControlLabel htmlFor='spinDuration'>
              Base Duration: {spinDuration.toFixed(1)}s
            </ControlLabel>
            <RangeInput
              id='spinDuration'
              type='range'
              min='1'
              max='10'
              step='0.5'
              value={spinDuration}
              onChange={handleSpinDurationChange}
            />
          </ControlGroup>

          <ControlGroup>
            <ControlLabel htmlFor='spinDirection'>Rotation Direction:</ControlLabel>
            <Select id='spinDirection' value={spinDirection} onChange={handleSpinDirectionChange}>
              <option value='1'>Clockwise</option>
              <option value='-1'>Counter-Clockwise</option>
            </Select>
          </ControlGroup>
        </ControlsContainer>

        <DemoRow>
          <FancyBorder
            key={`spin-solid-${spinSpeed}-${spinDuration}-${spinDirection}`}
            color='#3498db'
            width='3px'
            radius='4px'
            animated
            animationType='spin'
            animationConfig={spinConfig}
          >
            <FixedSizeContent>
              Solid Border
              <br />
              Spin Animation
            </FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            key={`spin-dashed-${spinSpeed}-${spinDuration}-${spinDirection}`}
            color='#e74c3c'
            width='3px'
            radius='8px'
            borderStyle='dashed'
            animated
            animationType='spin'
            animationConfig={{
              ...spinConfig,
              colorStops: ['#e74c3c', '#f39c12', '#e74c3c'],
            }}
          >
            <FixedSizeContent>
              Dashed Border
              <br />
              Spin Animation
            </FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            key={`spin-dotted-${spinSpeed}-${spinDuration}-${spinDirection}`}
            color='#2ecc71'
            width='4px'
            radius='50%'
            borderStyle='dotted'
            animated
            animationType='spin'
            animationConfig={{
              ...spinConfig,
              colorStops: ['#2ecc71', '#3498db', '#2ecc71'],
            }}
          >
            <CircularContent>
              Circular
              <br />
              Spin Animation
            </CircularContent>
          </FancyBorder>
        </DemoRow>
      </DemoSection>

      <DemoSection>
        <SectionHeader>Entry Animation</SectionHeader>
        <DemoDescription>
          Corner-to-center border reveal animation that can be triggered on demand
        </DemoDescription>

        <ControlsContainer>
          <ControlGroup>
            <ControlLabel htmlFor='cornerSize'>Corner Size: {cornerSize}px</ControlLabel>
            <RangeInput
              id='cornerSize'
              type='range'
              min='0'
              max='50'
              step='1'
              value={cornerSize}
              onChange={handleCornerSizeChange}
            />
          </ControlGroup>

          <ControlGroup>
            <ControlLabel htmlFor='entryDuration'>
              Entry Duration: {entryDuration.toFixed(1)}s
            </ControlLabel>
            <RangeInput
              id='entryDuration'
              type='range'
              min='0.1'
              max='3'
              step='0.1'
              value={entryDuration}
              onChange={handleEntryDurationChange}
            />
          </ControlGroup>

          <ControlGroup>
            <ControlLabel htmlFor='entryDelay'>Entry Delay: {entryDelay.toFixed(1)}s</ControlLabel>
            <RangeInput
              id='entryDelay'
              type='range'
              min='0'
              max='2'
              step='0.1'
              value={entryDelay}
              onChange={handleEntryDelayChange}
            />
          </ControlGroup>

          <ControlGroup>
            <ControlLabel htmlFor='entryEasing'>Easing Function:</ControlLabel>
            <Select
              id='entryEasing'
              value={entryEasing}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEntryEasing(e.target.value)}
            >
              <option value='ease-in-out'>Ease In Out</option>
              <option value='ease-in'>Ease In</option>
              <option value='ease-out'>Ease Out</option>
              <option value='linear'>Linear</option>
              <option value='ease'>Ease</option>
              <option value='smooth'>Smooth</option>
              <option value='cubic-bezier(0.68, -0.6, 0.32, 1.6)'>Elastic</option>
            </Select>
          </ControlGroup>

          <TriggerButton onClick={triggerEntryAnimation}>Trigger Entry Animation</TriggerButton>
        </ControlsContainer>

        <DemoRow>
          <FancyBorder
            key={`entry-solid-${cornerSize}-${entryDuration}-${entryDelay}-${entryTrigger}`}
            color='#3498db'
            width='3px'
            radius='4px'
            entryAnimation
            entryAnimationConfig={entryConfig}
          >
            <FixedSizeContent>
              Solid Border
              <br />
              Corners-to-Center
            </FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            key={`entry-gradient-${cornerSize}-${entryDuration}-${entryDelay}-${entryTrigger}`}
            isGradient
            gradientColors={['#9b59b6', '#3498db']}
            width='3px'
            radius='8px'
            entryAnimation
            entryAnimationConfig={entryConfig}
          >
            <FixedSizeContent>
              Gradient Border
              <br />
              Corners-to-Center
            </FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            key={`entry-circular-${cornerSize}-${entryDuration}-${entryDelay}-${entryTrigger}`}
            isGradient
            gradientColors={['#e74c3c', '#f39c12', '#2ecc71']}
            width='4px'
            radius='50%'
            entryAnimation
            entryAnimationConfig={entryConfig}
          >
            <CircularContent>
              Circular
              <br />
              Corners-to-Center
            </CircularContent>
          </FancyBorder>
        </DemoRow>
      </DemoSection>

      <DemoSection>
        <SectionHeader>Combined Effects</SectionHeader>
        <DemoDescription>
          Sequential animations: entry animation plays first, followed by animation after completion
        </DemoDescription>
        <DemoRow>
          <FancyBorder
            key={`combined-pulse-${intensity}-${duration}-${cornerSize}-${entryTrigger}`}
            color='#e74c3c'
            width='2px'
            borderStyle='dashed'
            radius='4px'
            animated
            animationType='pulse'
            animationConfig={subtleConfig}
            entryAnimation
            entryAnimationConfig={entryConfig}
          >
            <FixedSizeContent>
              Pulse After
              <br />
              Entry Animation
            </FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            key={`combined-flow-${flowDirection}-${flowSpeed}-${cornerSize}-${entryTrigger}`}
            color='#2ecc71'
            width='3px'
            radius='8px'
            animated
            animationType='flow'
            animationConfig={flowConfig}
            entryAnimation
            entryAnimationConfig={entryConfig}
          >
            <FixedSizeContent>
              Flow After
              <br />
              Entry Animation
            </FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            key={`combined-gradient-${intensity}-${duration}-${cornerSize}-${entryTrigger}`}
            isGradient
            gradientColors={['#3498db', '#9b59b6']}
            gradientDirection='to bottom'
            width='3px'
            radius='12px'
            animated
            animationType='pulse'
            animationConfig={strongConfig}
            entryAnimation
            entryAnimationConfig={entryConfig}
          >
            <FixedSizeContent>
              Gradient Pulse
              <br />
              After Entry
            </FixedSizeContent>
          </FancyBorder>
        </DemoRow>
        <DemoRow style={{ marginTop: '20px' }}>
          <FancyBorder
            key={`combined-spin-${spinSpeed}-${spinDuration}-${cornerSize}-${entryTrigger}`}
            color='#9b59b6'
            width='3px'
            radius='12px'
            animated
            animationType='spin'
            animationConfig={spinConfig}
            entryAnimation
            entryAnimationConfig={entryConfig}
          >
            <FixedSizeContent>
              Spin After
              <br />
              Entry Animation
            </FixedSizeContent>
          </FancyBorder>
        </DemoRow>
      </DemoSection>
    </DemoContainer>
  )
}

// Styled components for the demo
const DemoContainer = styled.div`
  background-color: #2d2d2d;
  color: #f1f1f1;
  padding: 20px;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
`

const DemoHeader = styled.h1`
  font-size: 24px;
  text-align: center;
  margin-bottom: 30px;
  color: #f1f1f1;
`

const DemoSection = styled.section`
  margin-bottom: 30px;
`

const SectionHeader = styled.h2`
  font-size: 18px;
  margin-bottom: 15px;
  color: #e0e0e0;
  position: relative;
  padding-left: 10px;
  border-left: 3px solid #3498db;
`

const DemoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 20px;
`

const ControlsContainer = styled.div`
  background-color: #242424;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  position: relative;
  z-index: 10; /* Ensure controls are above animations */
`

const TriggerButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
  height: 40px;
  align-self: flex-end;

  &:hover {
    background-color: #2980b9;
  }

  &:active {
    background-color: #1f6da8;
  }
`

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const ControlLabel = styled.label`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #d0d0d0;
  cursor: pointer;
`

const RangeInput = styled.input`
  width: 100%;
  height: 6px;
  background-color: #333;
  border-radius: 10px;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
  cursor: pointer;
  position: relative;
  z-index: 5;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background-color: #3498db;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background-color: #3498db;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  &::-webkit-slider-thumb:hover,
  &:active::-webkit-slider-thumb {
    background-color: #2980b9;
  }

  &::-moz-range-thumb:hover,
  &:active::-moz-range-thumb {
    background-color: #2980b9;
  }
`

const DemoDescription = styled.p`
  color: #a0a0a0;
  font-style: italic;
  margin-top: 0;
`

const FixedSizeContent = styled.div`
  padding: 10px;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #e0e0e0;
`

const CircularContent = styled(FixedSizeContent)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
`

const Select = styled.select`
  background: #2d3748;
  color: #ffffff;
  border: 1px solid #4a5568;
  border-radius: 4px;
  padding: 8px 12px;
  width: 100%;
  font-size: 14px;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #63b3ed;
  }

  option {
    background: #2d3748;
  }
`

export default AnimationDemo
