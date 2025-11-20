// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react'
import { styled } from 'styled-components'
import { type SelectControlProps } from '../types'

/**
 * Select control for option selection parameters
 */
const SelectControl: React.FC<SelectControlProps> = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get the currently selected option's label
  const selectedOption = options.find(option => option.value === value)
  const displayValue = selectedOption ? selectedOption.label : 'Select an option'

  // Handle selection
  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <SControlContainer ref={dropdownRef}>
      <SControlHeader>
        <SLabel>{label}</SLabel>
      </SControlHeader>
      <SSelectButton onClick={() => setIsOpen(!isOpen)} $isOpen={isOpen}>
        <span>{displayValue}</span>
        <SArrowIcon $isOpen={isOpen}>▼</SArrowIcon>
      </SSelectButton>

      {isOpen && (
        <SDropdown>
          {options.map(option => (
            <SOption
              key={option.value}
              $isSelected={option.value === value}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </SOption>
          ))}
        </SDropdown>
      )}
    </SControlContainer>
  )
}

// Styled components
const SControlContainer = styled.div`
  width: 100%;
  margin-bottom: 16px;
  position: relative;
`

const SControlHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px;
  padding-bottom: 0px;
`

const SLabel = styled.label`
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const SSelectButton = styled.div<{ $isOpen: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid
    ${props => (props.$isOpen ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-inline: 6px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(0, 0, 0, 0.3);
  }
`

const SArrowIcon = styled.span<{ $isOpen: boolean }>`
  font-size: 10px;
  transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s;
  opacity: 0.7;
`

const SDropdown = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background-color: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
`

const SOption = styled.div<{ $isSelected: boolean }>`
  padding: 8px 12px;
  color: ${props => (props.$isSelected ? '#fff' : '#aaa')};
  background-color: ${props => (props.$isSelected ? 'rgba(95, 95, 255, 0.2)' : 'transparent')};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.1s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }
`

export default SelectControl
