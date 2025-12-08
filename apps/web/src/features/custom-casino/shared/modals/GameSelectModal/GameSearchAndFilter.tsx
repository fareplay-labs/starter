// @ts-nocheck
import React from 'react'
import { cn } from '@/lib/utils'

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
      {/* Search Container */}
      <div className="w-full relative mb-4">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#aaaaaa] [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current">
          <SearchSVG />
        </div>
        {/* Search Input */}
        <input
          type='text'
          placeholder='Search games...'
          value={searchTerm}
          onChange={handleSearchChange}
          className={cn(
            'w-full p-4 pl-10 rounded-lg',
            'bg-[rgba(30,30,30,0.7)] border border-[#1b1d26]',
            'text-white text-base',
            'focus:outline-none focus:border-[#ff5e4f]'
          )}
        />
      </div>

      {/* Game Count */}
      {showCounts && filteredCount > 0 && (
        <div className="text-[#aaaaaa] text-center py-4 text-sm">
          Showing {filteredCount} of {totalCount} games ({selectedCount} selected)
        </div>
      )}

      {/* No Games Message */}
      {filteredCount === 0 && (
        <div className="text-[#aaaaaa] text-center py-8 text-base">
          No games found matching your search criteria.
        </div>
      )}
    </>
  )
}
