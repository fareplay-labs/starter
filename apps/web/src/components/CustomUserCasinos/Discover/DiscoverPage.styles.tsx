// @ts-nocheck
import { styled } from 'styled-components'
import {
  BREAKPOINTS,
  SPACING,
  TEXT_COLORS,
  FARE_COLORS,
  BORDER_COLORS,
  BACKGROUND_COLORS,
} from '@/design'

export const SDiscoverPage = styled.div`
  width: 100%;
  color: ${TEXT_COLORS.one};
  padding: 0px;
  display: flex;
  justify-content: center;
  overflow-y: scroll;
  overflow-x: auto;
  height: calc(100% - ${SPACING.md}px);
  position: relative;
  margin: 0 -70px; /* Negative margin to extend the container */
  padding: 0 70px; /* Padding to offset the negative margin */

  @media (max-width: ${BREAKPOINTS.sm}px) {
    margin: auto;
    width: calc(100% - ${SPACING.lg}px);
    overflow-x: hidden;
    height: 100%;
  }
`

export const SContent = styled.div`
  width: calc(100% - 140px);
  position: relative;
  z-index: 1;
  margin: ${SPACING.md}px auto;

  @media only screen and (max-width: ${BREAKPOINTS.lg}px) {
    max-width: calc(100% - ${SPACING.xl * 2}px);
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    max-width: 100%;
    width: 100%;
  }
`

export const SActionSection = styled.div`
  margin: ${SPACING.xl}px 0;
  display: flex;
  gap: ${SPACING.md}px;
  align-items: stretch;
  position: relative;
  z-index: 1;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    flex-direction: column;
  }
`

export const SActionTiles = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${SPACING.md}px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    width: 100%;
    grid-template-columns: repeat(2, 1fr);
  }
`

export const SFavoriteBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: ${FARE_COLORS.salmon};
  color: white;
  font-size: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`

export const SActionTile = styled.button<{
  $color: string
  $isSearch?: boolean
  $disabled?: boolean
}>`
  background: transparent;
  border: 1px solid ${props => props.$color};
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  color: ${TEXT_COLORS.one};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props =>
    props.$isSearch ? 'text'
    : props.$disabled ? 'not-allowed'
    : 'pointer'};
  transition: all 0.2s ease-in-out;
  font-size: 18px;
  font-weight: 600;
  height: 60px;
  position: relative;
  opacity: ${props => (props.$disabled ? 0.5 : 1)};

  ${props =>
    !props.$isSearch &&
    !props.$disabled &&
    `
    &:hover {
      transform: translateY(-2px);
      background: ${props.$color}10;
    }
  `}
`

export const STagWrapper = styled.div`
  display: flex;
  gap: ${SPACING.md}px;
  width: 100%;
`

export const STag = styled.p<{ $isActive: boolean }>`
  border: 1px solid ${BORDER_COLORS.one};
  border-radius: 6px;
  padding: ${SPACING.xxs}px ${SPACING.sm}px;
  cursor: pointer;
  width: 100%;
  text-align: center;
  text-transform: uppercase;
  background: ${props => (props.$isActive ? BACKGROUND_COLORS.four : 'transparent')};
  font-weight: ${props => (props.$isActive ? 'bold' : 'normal')};
  margin-block: 0;
  font-size: 16px;
  vertical-align: middle;
  line-height: 1.5;
  transition: all 0.2s ease-in-out;
  text-wrap: nowrap;

  &:hover {
    transform: translateY(-2px);
    background: ${BACKGROUND_COLORS.four};
  }
`

export const SCasinoGridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${SPACING.md}px;
  margin-top: ${SPACING.xl}px;
`
