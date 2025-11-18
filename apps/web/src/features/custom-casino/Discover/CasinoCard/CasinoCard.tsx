// @ts-nocheck
// CasinoCard.tsx
import React, { useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { type CasinoPreview } from '../../shared/types'
import { formatCurrency } from './formatters'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { HeartIcon } from './HeartIcon'
import {
  SCard,
  SContent,
  SBanner,
  SContentContainer,
  SProfileSection,
  SLogo,
  STitle,
  SDescription,
  SFavoriteButton,
  SCornerBanner,
} from './CasinoCard.styles'
import CroppedImage from '../../shared/ui/CroppedImage'
import profilePlaceholder from '@/assets/png/profile-pic-placeholder.png'
import bannerPlaceholder from '@/assets/png/banner-placeholder.png'

interface CasinoCardProps {
  casino: CasinoPreview
  isFeatured?: boolean
  featuredReason?: string
  featuredUntil?: string
  onFavoriteToggle?: (casinoId: string, isFavorite: boolean) => void
}

// Custom hook for handling favorites
const useCasinoFavorites = (casinoId: string) => {
  const { toggleFavorite, isFavorite, loadFromLocalStorage } = useFavoritesStore()

  useEffect(() => {
    loadFromLocalStorage()
  }, [loadFromLocalStorage])

  return {
    isFavorite: isFavorite(casinoId),
    toggleFavorite: () => toggleFavorite(casinoId),
  }
}

const CasinoCardComponent: React.FC<CasinoCardProps> = ({
  casino,
  isFeatured,
  featuredReason,
  featuredUntil,
  onFavoriteToggle,
}) => {
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useCasinoFavorites(casino.id)

  // Get images safely handling both string and ImageData formats
  const bannerImage = casino.config.bannerImage
  const profileImage = casino.config.profileImage

  // Check if images are placeholder strings (for ImageData or string types) - matching UserHeroSection logic
  const hasBannerImage =
    bannerImage &&
    (typeof bannerImage === 'string' ?
      bannerImage !== 'placeholder'
    : bannerImage.url && bannerImage.url !== 'placeholder')
  const hasProfileImage =
    profileImage &&
    (typeof profileImage === 'string' ?
      profileImage !== 'placeholder'
    : profileImage.url && profileImage.url !== 'placeholder')

  const handleClick = () => {
    navigate(`/custom/${casino.username}`)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigation when clicking the heart
    toggleFavorite()

    // Call the optional callback if provided
    if (onFavoriteToggle) {
      onFavoriteToggle(casino.id, !isFavorite)
    }
  }

  // Display behavior: always show a banner when jackpot > 0
  // TODO(launch): Replace spoof with real jackpot from backend once available.
  // - Current API preview does not provide jackpot; when backend adds it,
  //   remove the env override below and rely on casino.stats.jackpot.
  // - For dev-only testing you can set VITE_FAKE_JACKPOT in .env.local.
  // TODO(launch): Replace spoof with real jackpot from backend once available.
  // For now, use a simple spoof value for development
  const jackpot = casino.stats.jackpot || 319 // spoof jackpot for demo
  const showJackpotBadge = jackpot > 0

  const jackpotTier = (value: number): 'low' | 'mid' | 'high' | 'ultra' => {
    if (value >= 10000) return 'ultra'
    if (value >= 1000) return 'high'
    if (value >= 200) return 'mid'
    return 'low'
  }

  return (
    <SCard
      onClick={handleClick}
      className='casino-card'
      tabIndex={0}
      role='button'
      aria-label={`View details for ${casino.config.title}`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {isFeatured && (
        <div className='featured-badge'>
          <div className='featured-reason'>{featuredReason}</div>
          <div className='featured-until'>{featuredUntil}</div>
        </div>
      )}

      <SBanner role='img' aria-label={`${casino.config.title} banner`}>
        {hasBannerImage ?
          <CroppedImage imageData={bannerImage} alt='Casino Banner' width='100%' height='100%' />
        : <img
            src={bannerPlaceholder}
            alt='Banner Placeholder'
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '50% 75%',
            }}
          />
        }
      </SBanner>

      {showJackpotBadge && (
        <SCornerBanner
          $tier={jackpotTier(jackpot)}
          aria-label={`Current jackpot ${formatCurrency(jackpot)}`}
        >
          {formatCurrency(jackpot)}
        </SCornerBanner>
      )}

      <SFavoriteButton
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        data-favorite={isFavorite}
        type='button'
      >
        <HeartIcon filled={isFavorite} />
      </SFavoriteButton>

      <SContentContainer className='content-container'>
        <SContent>
          <SProfileSection>
            <SLogo>
              {hasProfileImage ?
                <CroppedImage
                  imageData={profileImage}
                  alt={`${casino.config.title} profile`}
                  width='100%'
                  height='100%'
                />
              : <img
                  src={profilePlaceholder}
                  alt='Profile Placeholder'
                  style={{
                    width: '100%',
                    height: '100%',
                    transform: 'scale(1.4)',
                  }}
                />
              }
            </SLogo>
            <STitle>{casino.config.title}</STitle>
          </SProfileSection>
          <SDescription className='description'>{casino.config.shortDescription}</SDescription>
        </SContent>
      </SContentContainer>
    </SCard>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const CasinoCard = memo(CasinoCardComponent)
