// @ts-nocheck
import { styled, keyframes, css } from 'styled-components'
import { BORDER_COLORS, BREAKPOINTS, SPACING, TEXT_COLORS } from '@/design'

// Animation constants
const ANIMATION_DELAY = 2000
const ANIMATION_DURATION = 8000
const REWIND_DURATION = 1000

// Keyframes
const progressAnimation = keyframes`
  0% { width: 0; }
  100% { width: 100%; }
`

const rewindAnimation = (startWidth: number) => keyframes`
  0% { width: ${startWidth}%; }
  100% { width: 0%; }
`

// Styled components
export const SHeroContainer = styled.div`
  width: 100%;
  height: 400px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  border: 2px solid ${BORDER_COLORS.one};

  &:hover {
    transform: scale(1.005);

    .navigation-arrow {
      opacity: 1;
    }
  }

  /* Accessibility focus indicator - only for keyboard navigation */
  &:focus-visible {
    outline: 2px solid ${TEXT_COLORS.three};
    outline-offset: 2px;
  }

  /* Remove default focus style for mouse clicks */
  &:focus:not(:focus-visible) {
    outline: none;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    height: 240px;
    width: 99%;
  }
`

export const SHeroBackgrounds = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

export const SHeroBackground = styled.div<{ $bgImage: string; $isActive: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$bgImage});
  background-size: cover;
  background-position: center;
  opacity: ${props => (props.$isActive ? 1 : 0)};
  transition: opacity 0.8s ease-in-out;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%);
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    opacity: ${props => (props.$isActive ? 0.5 : 0)};
  }
`

export const SProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 2;
`

export const SProgress = styled.div<{ $isRewinding?: boolean; $startWidth?: number }>`
  height: 100%;
  background: ${TEXT_COLORS.three};
  width: 0;
  transform-origin: left center;

  ${props =>
    props.$isRewinding ?
      css`
        animation: ${rewindAnimation(props.$startWidth || 0)} ${REWIND_DURATION}ms ease-out forwards;
      `
    : css`
        animation: ${progressAnimation} ${ANIMATION_DURATION}ms linear;
        animation-delay: ${ANIMATION_DELAY}ms;
        animation-fill-mode: forwards;
      `}
`

export const SContent = styled.div`
  position: relative;
  z-index: 1;
  padding: ${SPACING.xl}px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  max-width: min(100%, 800px);

  @media (max-width: ${BREAKPOINTS.sm}px) {
    justify-content: flex-start;
  }
`

export const STitle = styled.h2`
  font-size: 40px;
  color: ${TEXT_COLORS.one};
  margin: 0 0 ${SPACING.md}px 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  line-height: 1.1;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    font-size: 28px;
  }
`

export const SDescription = styled.p`
  font-size: 16px;
  color: ${TEXT_COLORS.two};
  margin: 0 0 ${SPACING.md}px 25px;
  max-width: 600px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);

  @media (max-width: ${BREAKPOINTS.sm}px) {
    font-size: 14px;
    margin-left: 0;
  }
`

export const SFeaturedBadge = styled.div`
  position: absolute;
  top: ${SPACING.lg}px;
  left: ${SPACING.lg}px;
  background: rgba(5, 5, 5, 0.8);
  border: 1px solid ${BORDER_COLORS.one};
  border-radius: 4px;
  padding: ${SPACING.sm}px ${SPACING.md}px;
  color: ${TEXT_COLORS.one};
  display: inline-block;
  z-index: 2;
  font-weight: 500;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    top: ${SPACING.xxs}px;
    padding: ${SPACING.xxs}px ${SPACING.xs}px;
  }
`

export const SStats = styled.div`
  display: flex;
  gap: ${SPACING.lg}px;
  margin-top: ${SPACING.md}px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    flex-wrap: nowrap;
    gap: ${SPACING.md}px;
    margin-top: 0;
  }
`

export const SStatItem = styled.div`
  color: ${TEXT_COLORS.two};
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);

  strong {
    color: ${TEXT_COLORS.one};
    font-size: 16px;
    display: block;
  }
`

export const SNavigationArrow = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => (props.$direction === 'left' ? 'left: 20px;' : 'right: 20px;')}
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid ${BORDER_COLORS.one};
  color: ${TEXT_COLORS.one};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  opacity: 0;
  transition: all 0.2s ease-in-out;

  &:hover,
  &:focus-visible {
    background: rgba(0, 0, 0, 0.8);
    opacity: 1;
    outline: none;
    transform: translateY(-50%) scale(1.1);
  }

  /* Remove default focus styles */
  &:focus:not(:focus-visible) {
    outline: none;
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    ${props => (props.$direction === 'left' ? 'left: 5px;' : 'right: 5px;')}
    width: 35px;
    height: 35px;
  }
`

export const SPaginationDots = styled.div`
  position: absolute;
  bottom: ${SPACING.xs}px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: ${SPACING.sm}px;
  z-index: 2;
  padding: ${SPACING.sm}px ${SPACING.md}px;
  border-radius: 20px;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    bottom: ${SPACING.xs}px;
  }
`

export const SPaginationDot = styled.button<{ $isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => (props.$isActive ? TEXT_COLORS.one : 'rgba(255, 255, 255, 0.3)')};
  transition: all 0.2s ease-in-out;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    transform: scale(1.2);
    background: ${TEXT_COLORS.one};
    outline: none;
  }

  /* Remove default focus styles */
  &:focus:not(:focus-visible) {
    outline: none;
  }
`
