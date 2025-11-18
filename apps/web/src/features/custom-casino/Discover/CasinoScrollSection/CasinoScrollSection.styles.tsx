// @ts-nocheck
// File: components/CasinoScrollSection/CasinoScrollSection.styles.ts
import { styled } from 'styled-components'
import { BORDER_COLORS, SPACING, TEXT_COLORS, BREAKPOINTS } from '@/design'

export const SSection = styled.section`
  margin: ${SPACING.xl}px 0;
`

export const STitle = styled.h2`
  color: ${TEXT_COLORS.one};
  margin: 0 0 ${SPACING.lg}px 0;
  font-size: 24px;
`

export const SScrollWrapper = styled.div`
  position: relative;
  margin: 0 -70px; /* Negative margin to extend the container */
  padding: 0 70px; /* Padding to offset the negative margin */
  overflow: visible; /* Important to allow elements to be visible outside the container */
  pointer-events: auto;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    margin: 0 -45px;
    padding: 0 45px;
  }
`

export const SScrollContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: visible;
  pointer-events: none;
`

export const SScrollContent = styled.div`
  display: flex;
  gap: ${SPACING.md}px;
  padding: 10px 0;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  pointer-events: auto;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  /* Accessibility focus indicator - only for keyboard navigation */
  &:focus-visible {
    outline: 2px solid ${TEXT_COLORS.three};
    outline-offset: 2px;
    border-radius: 8px;
  }

  /* Remove default focus style for mouse clicks */
  &:focus:not(:focus-visible) {
    outline: none;
  }
`

export const SScrollButton = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => (props.$direction === 'left' ? 'left: -40px;' : 'right: -40px;')}
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid ${BORDER_COLORS.one};
  color: ${TEXT_COLORS.one};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 5;
  display: flex;
  align-items: center;
  font-size: 18px;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  pointer-events: auto;

  &:hover,
  &:focus {
    background: rgba(0, 0, 0, 0.9);
    border-color: ${TEXT_COLORS.three};
    outline: none;
  }

  &:disabled {
    opacity: 0;
    pointer-events: none;
    cursor: default;
    border-color: ${BORDER_COLORS.two};
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    ${props => (props.$direction === 'left' ? 'left: -30px;' : 'right: -30px;')}
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
`
