// @ts-nocheck
import React, { useRef, useState, useCallback, useEffect, type ReactNode } from 'react'
import {
  SScrollButton,
  SScrollContainer,
  SScrollContent,
} from './CasinoScrollSection/CasinoScrollSection.styles'

interface HorizontalScrollContainerProps {
  children: ReactNode
  scrollAmount?: number // Percentage of visible width to scroll (0-1)
  id: string
  ariaLabelledBy?: string
  scrollThreshold?: number
}

export const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({
  children,
  scrollAmount = 0.8,
  id,
  ariaLabelledBy,
  scrollThreshold = 5, // 5px threshold for rounding errors
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Handle scroll direction
  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      if (!scrollRef.current) return

      const scrollContainer = scrollRef.current
      const scrollDistance = scrollContainer.clientWidth * scrollAmount
      const targetScroll =
        scrollContainer.scrollLeft + (direction === 'left' ? -scrollDistance : scrollDistance)

      // Smooth scroll to the target position
      scrollContainer.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      })
    },
    [scrollAmount]
  )

  // Update scroll indicators
  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const maxScrollLeft = scrollWidth - clientWidth

    // Check if we can scroll in either direction
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < maxScrollLeft - scrollThreshold)
  }, [scrollThreshold])

  // Set up scroll event listener
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    // Initial check
    updateScrollState()

    // Add scroll listener
    scrollElement.addEventListener('scroll', updateScrollState)

    // Handle window resize
    const handleResize = () => {
      requestAnimationFrame(updateScrollState)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      scrollElement.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', handleResize)
    }
  }, [updateScrollState])

  return (
    <SScrollContainer>
      <SScrollButton
        $direction='left'
        aria-label='Scroll left'
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        aria-controls={id}
      >
        ←
      </SScrollButton>

      <SScrollContent
        ref={scrollRef}
        tabIndex={0}
        role='region'
        aria-labelledby={ariaLabelledBy}
        id={id}
      >
        {children}
      </SScrollContent>

      <SScrollButton
        $direction='right'
        onClick={() => scroll('right')}
        aria-label='Scroll right'
        disabled={!canScrollRight}
        aria-controls={id}
      >
        →
      </SScrollButton>
    </SScrollContainer>
  )
}
