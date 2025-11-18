// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { BORDER_COLORS, BREAKPOINTS, SPACING } from '@/design'
import { type ImageData } from '../../../config/PageConfig'
import { getImageUrl } from '../../../shared/utils/cropDataUtils'
import bannerPlaceholder from '@/assets/png/banner-placeholder.png'

interface GameBannerProps {
  bannerImage: ImageData | string
  casinoName: string
  isEditMode: boolean
  themeColor?: string
  className?: string
}

const SBannerContainer = styled.div<{ $borderColor?: string }>`
  width: 100%;
  height: 100px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
  border: 2px solid ${props => props.$borderColor || BORDER_COLORS.one};
  box-shadow: ${props => (props.$borderColor ? `0 4px 20px ${props.$borderColor}40` : 'none')};
  margin-bottom: ${SPACING.md}px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    // height: 80px; // if this is being used in just the userpage lets hide it so we can use that space to anchor the canvas to the top instead
    display: none;
  }
`

const SBannerBackground = styled.div<{ $bgImage: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$bgImage});
  background-size: cover;
  background-position: center;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%);
  }
`

const SContent = styled.div`
  position: relative;
  z-index: 1;
  padding: ${SPACING.md}px ${SPACING.lg}px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const SCasinoName = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);

  @media (max-width: ${BREAKPOINTS.sm}px) {
    font-size: 20px;
  }
`

export const GameBanner: React.FC<GameBannerProps> = ({ bannerImage, casinoName, themeColor }) => {
  const imageUrl = getImageUrl(bannerImage)
  const displayUrl = !imageUrl || imageUrl === 'placeholder' ? bannerPlaceholder : imageUrl

  return (
    <SBannerContainer $borderColor={themeColor}>
      <SBannerBackground $bgImage={displayUrl} role='img' aria-label={`${casinoName} banner`} />
      <SContent>
        <SCasinoName>{casinoName}</SCasinoName>
      </SContent>
    </SBannerContainer>
  )
}

export default GameBanner
