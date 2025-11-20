// @ts-nocheck
import React, { useState } from 'react'
import { styled } from 'styled-components'

interface MultiSelectControlProps {
  value: string[]
  onChange: (value: string[]) => void
  options: Array<{ value: string; label: string }>
  label: string
}

const MultiSelectControl: React.FC<MultiSelectControlProps> = ({
  value = [],
  onChange,
  options,
  label,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleOption = (optionValue: string) => {
    const newValue =
      value.includes(optionValue) ? value.filter(v => v !== optionValue) : [...value, optionValue]

    // Ensure at least one option is selected
    if (newValue.length > 0) {
      onChange(newValue)
    }
  }

  const handleSelectAll = () => {
    onChange(options.map(opt => opt.value))
  }

  const handleSelectNone = () => {
    // Keep at least one selected (the first option)
    onChange([options[0].value])
  }

  const selectedCount = value.length
  const selectedLabels = options
    .filter(opt => value.includes(opt.value))
    .map(opt => opt.label)
    .join(', ')

  return (
    <SControlContainer>
      <SControlHeader>
        <SLabel>{label}</SLabel>
        <SHelperButtons>
          <SHelperButton onClick={handleSelectAll}>All</SHelperButton>
          <SHelperButton onClick={handleSelectNone}>Clear</SHelperButton>
        </SHelperButtons>
      </SControlHeader>

      <SSummaryButton onClick={() => setIsExpanded(!isExpanded)} $isExpanded={isExpanded}>
        <SSummaryText>
          {selectedCount === 0 ?
            'None selected'
          : selectedCount === options.length ?
            'All selected'
          : `${selectedCount} selected`}
        </SSummaryText>
        <SArrowIcon $isExpanded={isExpanded}>▼</SArrowIcon>
      </SSummaryButton>

      {selectedCount > 0 && selectedCount < options.length && (
        <SSelectedPreview>{selectedLabels}</SSelectedPreview>
      )}

      {isExpanded && (
        <SOptionsContainer>
          {options.map(option => (
            <SCheckboxOption key={option.value}>
              <SCheckbox
                type='checkbox'
                checked={value.includes(option.value)}
                onChange={() => handleToggleOption(option.value)}
                disabled={value.length === 1 && value.includes(option.value)}
              />
              <SOptionLabel>{option.label}</SOptionLabel>
            </SCheckboxOption>
          ))}
        </SOptionsContainer>
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
  align-items: center;
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

const SHelperButtons = styled.div`
  display: flex;
  gap: 8px;
`

const SHelperButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #aaa;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`

const SSummaryButton = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid
    ${props => (props.$isExpanded ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)')};
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

const SSummaryText = styled.span`
  font-weight: 500;
`

const SArrowIcon = styled.span<{ $isExpanded: boolean }>`
  font-size: 10px;
  transform: ${props => (props.$isExpanded ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s;
  opacity: 0.7;
`

const SSelectedPreview = styled.div`
  padding: 4px 12px;
  margin: 4px 6px;
  font-size: 11px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SOptionsContainer = styled.div`
  margin: 8px 6px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;

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

const SCheckboxOption = styled.label`
  display: flex;
  align-items: center;
  padding: 6px 4px;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`

const SCheckbox = styled.input`
  margin-right: 8px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const SOptionLabel = styled.span`
  font-size: 12px;
  color: #ddd;
`

export default MultiSelectControl

