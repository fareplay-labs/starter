// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { type ToggleControlProps } from '../types'

/**
 * Toggle switch control for boolean parameters
 */
const ToggleControl: React.FC<ToggleControlProps> = ({ value, onChange, label }) => {
  // Handle the toggle
  const handleToggle = () => {
    onChange(!value)
  }

  return (
    <SControlContainer>
      <SControlHeader>
        <SLabel>{label}</SLabel>
        <SToggleWrapper onClick={handleToggle}>
          <SToggleTrack $isActive={value}>
            <SToggleThumb $isActive={value} />
          </SToggleTrack>
          <SToggleText>{value ? 'ON' : 'OFF'}</SToggleText>
        </SToggleWrapper>
      </SControlHeader>
    </SControlContainer>
  )
}

// Styled components
const SControlContainer = styled.div`
  width: 100%;
  margin-bottom: 16px;
`

const SControlHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SLabel = styled.label`
  font-size: 14px;
  color: #aaa;
`

const SToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`

const SToggleTrack = styled.div<{ $isActive: boolean }>`
  position: relative;
  width: 40px;
  height: 20px;
  background-color: ${props => (props.$isActive ? 'rgba(95, 95, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)')};
  border-radius: 10px;
  transition: background-color 0.2s;
  border: 1px solid ${props => (props.$isActive ? '#5f5fff' : '#444')};
`

const SToggleThumb = styled.div<{ $isActive: boolean }>`
  position: absolute;
  top: 2px;
  left: ${props => (props.$isActive ? 'calc(100% - 18px)' : '2px')};
  width: 14px;
  height: 14px;
  background-color: ${props => (props.$isActive ? '#5f5fff' : '#888')};
  border-radius: 50%;
  transition:
    left 0.2s,
    background-color 0.2s;
`

const SToggleText = styled.span`
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  min-width: 30px;
  text-align: left;
`

export default ToggleControl
