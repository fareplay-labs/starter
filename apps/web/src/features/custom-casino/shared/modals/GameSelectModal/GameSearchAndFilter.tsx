// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { SPACING, TEXT_COLORS, BORDER_COLORS, FARE_COLORS } from '@/design'

// Styled components
const SSearchContainer = styled.div`
  width: 100%;
  position: relative;
  margin-bottom: ${SPACING.md}px;
`

const SSearchInput = styled.input`
  width: 100%;
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  padding: ${SPACING.md}px;
  padding-left: 40px;
  border-radius: 8px;
  background-color: rgba(30, 30, 30, 0.7);
  border: 1px solid ${BORDER_COLORS.one};
  color: ${TEXT_COLORS.one};
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${FARE_COLORS.salmon};
  }
`

const SSearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: ${TEXT_COLORS.two};

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`

const SGameCount = styled.div`
  color: ${TEXT_COLORS.two};
  text-align: center;
  padding: ${SPACING.md}px 0;
  font-size: 14px;
`

const SNoGamesMessage = styled.div`
  color: ${TEXT_COLORS.two};
  text-align: center;
  padding: ${SPACING.xl}px;
  font-size: 16px;
`

// Search SVG icon
const SearchSVG = () => (
  <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' />
  </svg>
)

// GameSearchAndFilter props interface
export interface GameSearchAndFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  totalCount: number
  filteredCount: number
  selectedCount: number
  showCounts?: boolean
}

/**
 * Game search and filter component for GameSelectModal
 */
export const GameSearchAndFilter: React.FC<GameSearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  totalCount,
  filteredCount,
  selectedCount,
  showCounts = false,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }

  return (
    <>
      <SSearchContainer>
        <SSearchIcon>
          <SearchSVG />
        </SSearchIcon>
        <SSearchInput
          type='text'
          placeholder='Search games...'
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </SSearchContainer>

      {showCounts && filteredCount > 0 && (
        <SGameCount>
          Showing {filteredCount} of {totalCount} games ({selectedCount} selected)
        </SGameCount>
      )}

      {filteredCount === 0 && (
        <SNoGamesMessage>No games found matching your search criteria.</SNoGamesMessage>
      )}
    </>
  )
}
