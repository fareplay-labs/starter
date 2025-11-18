// @ts-nocheck
import { memo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FARE_COLORS } from '@/design'
import { SActionSection, SActionTile, SActionTiles, SFavoriteBadge } from './DiscoverPage.styles'
import { SearchBar } from './SearchBar'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useAuth } from '@/hooks/useAuth'

const ActionTile = memo(
  ({
    color,
    isSearch = false,
    disabled = false,
    onClick,
    children,
    badge = null,
  }: {
    color: string
    isSearch?: boolean
    disabled?: boolean
    onClick?: (e: React.MouseEvent) => void
    children: React.ReactNode
    badge?: number | null
  }) => (
    <SActionTile
      $color={color}
      $isSearch={isSearch}
      $disabled={disabled}
      onClick={disabled ? undefined : onClick}
      aria-label={typeof children === 'string' ? children : undefined}
      disabled={disabled}
    >
      {children}
      {badge !== null && badge > 0 && (
        <SFavoriteBadge aria-label={`${badge} items`}>{badge}</SFavoriteBadge>
      )}
    </SActionTile>
  )
)

ActionTile.displayName = 'ActionTile'

export const ActionTiles: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { loadFromLocalStorage, favoriteCasinos } = useFavoritesStore()

  // Derive current username from auth
  const { user } = useAuth()
  const username = user?.address?.toLowerCase()

  useEffect(() => {
    loadFromLocalStorage()
  }, [loadFromLocalStorage])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleClear = () => {
    setSearchQuery('')
  }

  return (
    <SActionSection>
      <SActionTiles>
        <ActionTile
          color={FARE_COLORS.peach}
          onClick={() => navigate('/custom/me')}
          badge={favoriteCasinos.length}
        >
          Favorites
        </ActionTile>
        <ActionTile
          color={username ? FARE_COLORS.salmon : FARE_COLORS.gray}
          disabled={!username}
          onClick={() => navigate(`/custom/${username}`)}
        >
          My Casino
        </ActionTile>
        <ActionTile color={FARE_COLORS.pink} onClick={() => navigate('/custom/analytics')}>
          Analytics
        </ActionTile>
        <ActionTile color={FARE_COLORS.blue} isSearch>
          <SearchBar onSearch={handleSearch} onClear={handleClear} value={searchQuery} />
        </ActionTile>{' '}
      </SActionTiles>
    </SActionSection>
  )
}
