// @ts-nocheck
import { styled } from 'styled-components'
import { SPACING, BREAKPOINTS } from '@/design'

// Carousel Layout
export const CarouselLayout = styled.div`
  display: flex;
  gap: ${SPACING.sm}px;
  margin: 0 auto;
  padding-block: ${SPACING.lg}px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  position: relative;
  flex-wrap: nowrap;
  scroll-padding-left: ${SPACING.xs}px;
  max-width: 850px;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    height: 6px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  /* Center items when there are fewer games */
  &:has(> :last-child:nth-child(-n + 8)) {
    justify-content: center;

    @media (max-width: ${BREAKPOINTS.sm}px) {
      justify-content: flex-start;
      scroll-padding-left: ${SPACING.xxs}px;
      margin-left: 0;
    }
  }

  /* Ensure proper spacing around items */
  > div {
    margin: 0 ${SPACING.xs}px;
    overflow: visible;
    flex: 0 0 auto; /* Don't allow items to grow or shrink */
  }

  /* Remove any pseudo-elements */
  &::before,
  &::after {
    display: none;
  }
`

// Small Tiles Layout
export const SmallTilesLayout = styled.div`
  display: flex;
  gap: ${SPACING.md}px;
  padding-block: ${SPACING.lg}px;
  margin: 0 auto;
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
`

// Large Tiles Layout
export const LargeTilesLayout = styled.div`
  display: flex;
  gap: ${SPACING.xxl}px;
  padding-block: ${SPACING.lg}px;
  margin: 0 auto;
  justify-content: center;
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  width: 100%;
  flex-wrap: wrap;
`
