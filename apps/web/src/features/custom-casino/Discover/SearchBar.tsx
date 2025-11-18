// @ts-nocheck
import React, { useState } from 'react'
import { styled } from 'styled-components'
import { TEXT_COLORS } from '@/design'
import { SVGS } from '@/assets'

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear?: () => void
  value?: string
}

const SSearchContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
`

const SSearchIcon = styled.img`
  width: 16px;
  height: 16px;
  opacity: 0.5;
`

const SSearchInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  padding: 10px;
  color: ${TEXT_COLORS.one};
  font-size: 18px;
  font-weight: 600;
  outline: none;
  text-align: center;

  &::placeholder {
    color: ${TEXT_COLORS.two};
  }
`

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear, value }) => {
  const [internalValue, setInternalValue] = useState('')
  const controlled = value !== undefined
  const inputValue = controlled ? value : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (!controlled) setInternalValue(newValue)
    onSearch(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(inputValue)
    }
    if (e.key === 'Escape') {
      if (!controlled) setInternalValue('')
      onSearch('')
      onClear?.()
    }
  }

  const handleClear = () => {
    if (!controlled) setInternalValue('')
    onSearch('')
    onClear?.()
  }

  return (
    <SSearchContainer>
      <SSearchInput
        type='text'
        name='search'
        placeholder='Search'
        value={inputValue}
        aria-label='Search'
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {inputValue && (
        <SSearchIcon
          src={SVGS.xMarkIcon}
          alt='Search'
          aria-label='Clear search'
          onClick={handleClear}
          tabIndex={0}
        />
      )}
    </SSearchContainer>
  )
}
