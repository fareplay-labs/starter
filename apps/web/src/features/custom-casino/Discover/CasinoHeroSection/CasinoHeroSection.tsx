// @ts-nocheck
import React, { useCallback, memo, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { type FeaturedCasinoPreview } from '../../shared/types'
import { useCarousel } from './useCarousel'
import { getImageUrl } from '../../shared/utils/cropDataUtils'
import {
  SHeroContainer,
  SHeroBackgrounds,
  SHeroBackground,
  SProgressBar,
  SProgress,
  SContent,
  STitle,
  SDescription,
  SFeaturedBadge,
  SStats,
  SStatItem,
  SNavigationArrow,
  SPaginationDots,
  SPaginationDot,
} from './CasinoHeroSection.styles'

// Constants
const SLIDE_DURATION = 10000 // 10 seconds

interface CasinoHeroSectionProps {
  featuredItems: FeaturedCasinoPreview[]
  initialIndex?: number
  autoAdvance?: boolean
  onSlideChange?: (index: number) => void
}

const CasinoHeroSectionComponent: React.FC<CasinoHeroSectionProps> = ({
  featuredItems = [],
  initialIndex = 0,
  autoAdvance = true,
  onSlideChange,
}) => {
  const navigate = useNavigate()

  // Log only when featuredItems changes, not on every render
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('CasinoHeroSection featuredItems updated:', featuredItems)
    }
  }, [featuredItems])

  const {
    currentIndex,
    previousIndex,
    progressRef,
    isRewinding,
    rewindStartWidth,
    pauseTimer,
    resumeTimer,
    goToSlide,
    isTimerPaused,
  } = useCarousel({
    itemCount: featuredItems.length,
    initialIndex,
    duration: SLIDE_DURATION,
    autoAdvance,
    onSlideChange,
  })

  // Memoize item references to prevent unnecessary re-renders
  const currentItem = useMemo(
    () => featuredItems[currentIndex] || null,
    [featuredItems, currentIndex]
  )

  const previousItem = useMemo(
    () => featuredItems[previousIndex] || null,
    [featuredItems, previousIndex]
  )

  const handleClick = useCallback(() => {
    if (currentItem?.username) {
      navigate(`/custom/${currentItem.username}`)
    }
  }, [currentItem, navigate])

  const handleNavigation = useCallback(
    (direction: 'left' | 'right', e: React.MouseEvent) => {
      e.stopPropagation() // Prevent triggering the hero click
      e.preventDefault()

      const newIndex =
        direction === 'left' ?
          (currentIndex - 1 + featuredItems.length) % featuredItems.length
        : (currentIndex + 1) % featuredItems.length

      goToSlide(newIndex)
    },
    [currentIndex, featuredItems.length, goToSlide]
  )

  const handleDotClick = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      goToSlide(index)
    },
    [goToSlide]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleNavigation('left', e as unknown as React.MouseEvent)
      } else if (e.key === 'ArrowRight') {
        handleNavigation('right', e as unknown as React.MouseEvent)
      }
    },
    [handleNavigation]
  )

  // Don't render if no items or currentItem is null
  if (!featuredItems.length || !currentItem) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('CasinoHeroSection: No featured items to display or current item is null')
    }
    return null
  }

  return (
    <SHeroContainer
      onClick={handleClick}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role='region'
      aria-label='Featured casino carousel'
    >
      <SHeroBackgrounds>
        {/* Previous slide for smoother transition */}
        {previousItem && previousItem.config && (
          <SHeroBackground
            $bgImage={getImageUrl(previousItem.config.bannerImage)}
            $isActive={false}
            aria-hidden='true'
            onError={e => {
              // Fallback to default image on error
              ;(e.target as HTMLElement).style.backgroundColor = '#1a1a1a'
            }}
          />
        )}

        {/* Current slide */}
        <SHeroBackground
          $bgImage={getImageUrl(currentItem.config.bannerImage)}
          $isActive={true}
          aria-label={`Featured image for ${currentItem.config.title || 'Casino'}`}
          onError={e => {
            // Fallback to default image on error
            ;(e.target as HTMLElement).style.backgroundColor = '#1a1a1a'
          }}
        />
      </SHeroBackgrounds>

      {currentItem.featuredReason && <SFeaturedBadge>{currentItem.featuredReason}</SFeaturedBadge>}

      {/* Navigation arrows */}
      <SNavigationArrow
        className='navigation-arrow'
        $direction='left'
        onClick={e => handleNavigation('left', e)}
        aria-label='Previous slide'
      >
        ←
      </SNavigationArrow>

      <SNavigationArrow
        className='navigation-arrow'
        $direction='right'
        onClick={e => handleNavigation('right', e)}
        aria-label='Next slide'
      >
        →
      </SNavigationArrow>

      {/* Pagination dots */}
      <SPaginationDots role='tablist'>
        {featuredItems.map((_, index) => (
          <SPaginationDot
            key={index}
            $isActive={index === currentIndex}
            onClick={e => handleDotClick(index, e)}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={index === currentIndex}
            role='tab'
          />
        ))}
      </SPaginationDots>

      {/* Progress bar */}
      <SProgressBar>
        {(!isTimerPaused || isRewinding) && (
          <SProgress
            ref={progressRef}
            key={`${currentIndex}-${isRewinding}`}
            $isRewinding={isRewinding}
            $startWidth={rewindStartWidth}
            aria-hidden='true'
          />
        )}
      </SProgressBar>

      {/* Content section */}
      <SContent>
        <STitle>{currentItem.config.title}</STitle>
        <SDescription>{currentItem.config.shortDescription}</SDescription>

        <SStats>
          {currentItem.stats.totalPlays !== undefined && (
            <SStatItem>
              <strong>{currentItem.stats.totalPlays.toLocaleString()}</strong>
              Total Plays
            </SStatItem>
          )}

          {currentItem.stats.totalWagered !== undefined && (
            <SStatItem>
              <strong>${currentItem.stats.totalWagered.toLocaleString()}</strong>
              Total Wagered
            </SStatItem>
          )}

          {currentItem.stats.uniquePlayers !== undefined && (
            <SStatItem>
              <strong>{currentItem.stats.uniquePlayers.toLocaleString()}</strong>
              Unique Players
            </SStatItem>
          )}
        </SStats>
      </SContent>
    </SHeroContainer>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const CasinoHeroSection = memo(CasinoHeroSectionComponent)
