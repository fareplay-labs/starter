// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { SPACING, TEXT_COLORS, BORDER_COLORS, BREAKPOINTS } from '@/design'
import { useIsBreakpoint } from '@/hooks/common/useIsBreakpoint'

// Layout section container
const SLayoutSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.md}px;
  margin-bottom: ${SPACING.xl}px;
  padding: ${SPACING.lg}px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
  margin-bottom: 0;
`

// Layout section title
const SLayoutTitle = styled.h3`
  color: ${TEXT_COLORS.one};
  font-size: 16px;
  margin: 0;
  text-align: center;
`

// Layout options container
const SLayoutOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${SPACING.md}px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    display: flex;
    flex-direction: column;
    gap: ${SPACING.sm}px;
  }
`

// Individual layout option
const SLayoutOption = styled.button<{ $isSelected?: boolean; $themeColor?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.sm}px;
  padding: ${SPACING.md}px;
  background: transparent;
  border: 1px solid
    ${props => (props.$isSelected ? props.$themeColor || BORDER_COLORS.one : BORDER_COLORS.one)};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.$themeColor || BORDER_COLORS.two};
  }

  span {
    color: ${props => (props.$isSelected ? props.$themeColor || TEXT_COLORS.one : TEXT_COLORS.two)};
    font-size: 14px;
    transform: translateY(0.6px);
    transition: color 0.2s ease, transform 0.2s ease;

    &:hover {
    font-weight: 600;
    transform: scale(1.02);
  }
`

// Layout preview container
const SLayoutPreview = styled.div`
  width: 100%;
  min-height: 60px;
  background: rgba(10, 10, 10, 0.7);
  border-radius: 4px;
  margin-top: 8px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

// Shared tile/card hover/transition CSS
const tileHoverTransition = `
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  &:hover {
    transform: scale(1.05);
    background: rgba(255, 255, 255, 0.45);
    box-shadow: 0 4px 16px rgba(71, 69, 69, 0.7);
  }
`

const SCarouselPreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  .card {
    height: 40px;
    width: 30px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    margin: 0 2px;
    flex-shrink: 0;
    ${tileHoverTransition}
  }

  .main-card {
    height: 50px;
    width: 38px;
    background: rgba(255, 255, 255, 0.4);
    z-index: 2;
    ${tileHoverTransition}
  }
`

// Small tiles preview mockup
const SSmallTilesPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  width: 75%;

  .tile {
    height: 26px;
    aspect-ratio: 1;
    display: inline-block;
    justify-self: center;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 3px;
    ${tileHoverTransition}
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`

// Large tiles preview mockup
const SLargeTilesPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: 75%;

  .tile {
    height: 40px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 3px;
    ${tileHoverTransition}
  }
`

// Layout options type
export type LayoutType = 'carousel' | 'smallTiles' | 'largeTiles'

// Layout preview components
const CarouselPreview = () => (
  <SCarouselPreview>
    <div className='card' style={{ transform: 'translateX(18px) scale(0.8)' }}></div>
    <div className='card' style={{ transform: 'translateX(8px)' }}></div>
    <div className='card main-card'></div>
    <div className='card' style={{ transform: 'translateX(-8px)' }}></div>
    <div className='card' style={{ transform: 'translateX(-18px) scale(0.8)' }}></div>
  </SCarouselPreview>
)

const SmallTilesPreview = () => (
  <SSmallTilesPreview>
    {Array.from({ length: 8 }).map((_, i) => (
      <div className='tile' key={i}></div>
    ))}
  </SSmallTilesPreview>
)

const LargeTilesPreview = () => (
  <SLargeTilesPreview>
    {Array.from({ length: 8 }).map((_, i) => (
      <div className='tile' key={i}></div>
    ))}
  </SLargeTilesPreview>
)

// LayoutSelector props interface
export interface LayoutSelectorProps {
  selectedLayout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
  themeColor: string
}

/**
 * Component for selecting layout type in GameSelectModal
 */
export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  selectedLayout,
  onLayoutChange,
  themeColor,
}) => {
  const isMobileScreen = useIsBreakpoint('sm')
  return (
    <SLayoutSection>
      <SLayoutTitle>Select Layout</SLayoutTitle>
      <SLayoutOptions>
        {[
          {
            key: 'carousel',
            label: 'Carousel',
            Preview: CarouselPreview,
          },
          {
            key: 'smallTiles',
            label: 'Small Tiles',
            Preview: SmallTilesPreview,
          },
          {
            key: 'largeTiles',
            label: 'Large Tiles',
            Preview: LargeTilesPreview,
          },
        ].map(({ key, label, Preview }) => (
          <SLayoutOption
            key={key}
            onClick={() => onLayoutChange(key as LayoutType)}
            $isSelected={selectedLayout === key}
            $themeColor={themeColor}
          >
            <span>{label}</span>
            {!isMobileScreen && (
              <SLayoutPreview>
                <Preview />
              </SLayoutPreview>
            )}
          </SLayoutOption>
        ))}
      </SLayoutOptions>
    </SLayoutSection>
  )
}
