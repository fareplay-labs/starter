// @ts-nocheck
// CasinoCard.styles.ts
import { styled, keyframes, css } from 'styled-components'
import { BORDER_COLORS, SPACING, TEXT_COLORS, FARE_COLORS, BREAKPOINTS } from '@/design'
import MockCustomCasinoProfiles from '@/assets/png/custom-casino-mock-images/MockCustomCasinoProfiles.png'

// Local accent colors
const ACCENT_COLORS = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  silverSoft: 'rgba(192, 192, 192, 0.18)',
  amber: '#FFA500',
} as const

// Define variables for component dimensions
export const CARD_DIMENSIONS = {
  WIDTH: '300px',
  HEIGHT: '400px',
  CONTENT_HEIGHT: '100px',
  STATS_HEIGHT: '60px',
  BORDER_RADIUS: '8px',
}

// Define animations with reduced motion support
const createAnimations = () => {
  const slideUp = keyframes`
    from { transform: translateY(calc(${CARD_DIMENSIONS.CONTENT_HEIGHT} - 30px)); }
    to { transform: translateY(0); }
  `

  const slideDown = keyframes`
    from { transform: translateY(0); }
    to { transform: translateY(calc(${CARD_DIMENSIONS.CONTENT_HEIGHT} - 30px)); }
  `

  const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `

  const fadeOut = keyframes`
    from { opacity: 1; }
    to { opacity: 0; }
  `

  const heartPulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  `

  return {
    slideUp,
    slideDown,
    fadeIn,
    fadeOut,
    heartPulse,
  }
}

const animations = createAnimations()

// Card component
export const SCard = styled.div`
  width: 100%;
  max-width: ${CARD_DIMENSIONS.WIDTH};
  height: ${CARD_DIMENSIONS.HEIGHT};
  flex-shrink: 0;
  border-radius: ${CARD_DIMENSIONS.BORDER_RADIUS};
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition:
    transform 0.3s ease-out,
    border-color 0.3s ease-out;
  background: #0a0a0a;
  border: 1px solid ${BORDER_COLORS.one};

  /* Add focus outline for accessibility */
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${FARE_COLORS.salmon};
  }

  /* Remove default focus style for mouse clicks */
  &:focus:not(:focus-visible) {
    outline: none;
    box-shadow: none;
  }

  @media (prefers-reduced-motion: no-preference) {
    &:hover {
      transform: scale(1.01);
      border-color: ${BORDER_COLORS.two};

      .content-container {
        animation: ${animations.slideUp} 0.3s ease-out forwards;
      }

      .description {
        animation: ${animations.fadeIn} 0.3s ease-out forwards;
        opacity: 1;
      }
    }

    &:not(:hover) {
      .content-container {
        animation: ${animations.slideDown} 0.3s ease-out forwards;
      }

      .description {
        animation: ${animations.fadeOut} 0.3s ease-out forwards;
      }
    }
  }

  /* For users who prefer reduced motion */
  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
      border-color: ${BORDER_COLORS.two};

      .description {
        opacity: 1;
      }
    }
  }
`

// Banner component
export const SBanner = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 0.3s ease;

  > img,
  > div {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 70%;
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.95) 0%,
      rgba(0, 0, 0, 0.95) 30%,
      transparent 100%
    );
  }
`

// Content container
export const SContentContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  transform: translateY(calc(${CARD_DIMENSIONS.CONTENT_HEIGHT} - 80px));
  background: transparent;
`

// Content section
export const SContent = styled.div`
  /* padding: ${SPACING.lg}px; */
  padding: 30px 10px;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.md}px;
  min-height: ${CARD_DIMENSIONS.CONTENT_HEIGHT};
`

// Profile section
export const SProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.md}px;
`

// Logo component - uses either custom profile image or default sprite
export const SLogo = styled.div`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid ${BORDER_COLORS.one};
  overflow: hidden;
  position: relative;

  > div,
  > img {
    width: 100%;
    height: 100%;
  }

  > div {
    background-image: url(${MockCustomCasinoProfiles});
    background-size: 640px 320px;
  }
`

// Title component
export const STitle = styled.h3`
  color: ${TEXT_COLORS.one};
  margin: 0;
  font-size: 16px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  flex: 1;
  min-width: 0;
`

// Description component
export const SDescription = styled.p`
  color: ${TEXT_COLORS.two};
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  opacity: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: calc(1.4em * 2); /* line-height * number of lines */
`


// Favorite button component
export const SFavoriteButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;

  &:hover {
    transform: scale(1.1);
    background: rgba(0, 0, 0, 0.8);
    opacity: 1;
    border-color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${FARE_COLORS.salmon};
  }

  /* Show button more prominently when the card is hovered */
  .casino-card:hover & {
    opacity: 0.9;
  }

  /* Keep button visible when it's active/filled */
  &[data-favorite='true'] {
    opacity: 1;
    background: rgba(0, 0, 0, 0.8);
  }
`

// Corner banner for jackpot
export const SCornerBanner = styled.div<{ $tier: 'low' | 'mid' | 'high' | 'ultra' }>`
  position: absolute;
  top: 18px;
  left: -80px;
  color: ${FARE_COLORS.black};
  padding: 4px 0;
  width: 215px;
  transform: rotate(-45deg);
  font-size: 13px;
  font-weight: 700;
  z-index: 9; /* Keep below favorite button */
  opacity: 0.95;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background 0.2s ease, box-shadow 0.2s ease;
  /* Subtle outline around text for readability across gradients */
  text-shadow:
    0 1px 1px rgba(0, 0, 0, 0.35),
    -0.5px 0 0 rgba(255, 255, 255, 0.35),
    0.5px 0 0 rgba(255, 255, 255, 0.35),
    0 -0.5px 0 rgba(255, 255, 255, 0.35);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;

  ${({ $tier }) =>
    $tier === 'low' &&
    css`
      background: ${ACCENT_COLORS.silverSoft};
      color: ${TEXT_COLORS.one};
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      border: 1px solid ${ACCENT_COLORS.silver};
      text-shadow:
        0 1px 1px rgba(0, 0, 0, 0.45),
        -0.5px 0 0 rgba(0, 0, 0, 0.3),
        0.5px 0 0 rgba(0, 0, 0, 0.3),
        0 -0.5px 0 rgba(0, 0, 0, 0.3);
    `}

  ${({ $tier }) =>
    $tier === 'mid' &&
    css`
      background: ${ACCENT_COLORS.gold};
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    `}

  ${({ $tier }) =>
    $tier === 'high' &&
    css`
      background: linear-gradient(90deg, ${ACCENT_COLORS.gold}, ${ACCENT_COLORS.amber});
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
    `}

  ${({ $tier }) =>
    $tier === 'ultra' &&
    css`
      background: linear-gradient(90deg, ${ACCENT_COLORS.gold}, ${FARE_COLORS.salmon});
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
    `}

  /* On small screens, avoid rotated ribbon: use a simple badge */
  @media (max-width: ${BREAKPOINTS.sm}px) {
    left: 12px;
    transform: none;
    padding: 6px 10px;
    width: auto;
    border-radius: 999px;
    font-size: 12px;
  }
`

// Styled heart SVG with animation
export const HeartSvg = styled.svg<{ $filled: boolean }>`
  @media (prefers-reduced-motion: no-preference) {
    animation: ${({ $filled }) =>
      $filled ?
        css`
          ${animations.heartPulse} 1.2s ease-in-out
        `
      : 'none'};
  }
`
