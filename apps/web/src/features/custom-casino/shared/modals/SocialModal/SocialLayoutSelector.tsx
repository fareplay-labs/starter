// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { TEXT_COLORS, FARE_COLORS } from '@/design'
import { KNOWN_PLATFORMS } from './SocialPlatformItem'

// Define layout types
export type SocialLayoutType = 'horizontal' | 'vertical' | 'showLinks'

// Props for the component
interface SocialLayoutSelectorProps {
  selectedLayout: SocialLayoutType
  onLayoutChange: (layout: SocialLayoutType) => void
}

// Styled components
const SSectionTitle = styled.h3`
  font-size: 16px;
  color: ${TEXT_COLORS.one};
  margin: 0 0 8px 0;
`

const SLayoutOptions = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  width: 100%;
`

const SLayoutOption = styled.button<{ $isSelected: boolean }>`
  flex: 1;
  border: 2px solid ${props => (props.$isSelected ? '#ff5e4f' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  background-color: #1a1a1a;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80px;

  &:hover {
    border-color: ${props => (props.$isSelected ? '#ff5e4f' : 'rgba(255, 255, 255, 0.3)')};
  }
`

// Social Icons for Previews
const SSocialIconCircle = styled.div<{ $color?: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(40, 40, 40, 0.85);
  border: 2px solid ${props => props.$color || FARE_COLORS.peach};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
`

// Layout preview components
const SHorizontalPreview = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
`

const SVerticalPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
`

const SShowLinksPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
`

const SLinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const SLinkText = styled.div`
  color: ${TEXT_COLORS.one};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
`

/**
 * Component for selecting social link layout style
 */
export const SocialLayoutSelector: React.FC<SocialLayoutSelectorProps> = ({
  selectedLayout,
  onLayoutChange,
}) => {
  // Preview colors for icons
  const previewColors = [FARE_COLORS.peach, FARE_COLORS.salmon, FARE_COLORS.pink]

  // Sample platforms for previews
  const samplePlatforms = ['twitter', 'discord', 'telegram']

  return (
    <>
      <SSectionTitle>Layout Style</SSectionTitle>
      <SLayoutOptions>
        <SLayoutOption
          $isSelected={selectedLayout === 'showLinks'}
          onClick={() => onLayoutChange('showLinks')}
        >
          <SShowLinksPreview>
            {samplePlatforms.map((platform, index) => (
              <SLinkRow key={platform}>
                <SSocialIconCircle $color={previewColors[index % 3]}>
                  <img src={KNOWN_PLATFORMS[platform]?.icon} alt={platform} />
                </SSocialIconCircle>
                <SLinkText>
                  {platform === 'twitter' ?
                    'x.com/user'
                  : platform === 'discord' ?
                    'discord.gg/link'
                  : 't.me/user'}
                </SLinkText>
              </SLinkRow>
            ))}
          </SShowLinksPreview>
        </SLayoutOption>

        <SLayoutOption
          $isSelected={selectedLayout === 'vertical'}
          onClick={() => onLayoutChange('vertical')}
        >
          <SVerticalPreview>
            {samplePlatforms.map((platform, index) => (
              <SSocialIconCircle key={platform} $color={previewColors[index % 3]}>
                <img src={KNOWN_PLATFORMS[platform]?.icon} alt={platform} />
              </SSocialIconCircle>
            ))}
          </SVerticalPreview>
        </SLayoutOption>

        <SLayoutOption
          $isSelected={selectedLayout === 'horizontal'}
          onClick={() => onLayoutChange('horizontal')}
        >
          <SHorizontalPreview>
            {samplePlatforms.map((platform, index) => (
              <SSocialIconCircle key={platform} $color={previewColors[index % 3]}>
                <img src={KNOWN_PLATFORMS[platform]?.icon} alt={platform} />
              </SSocialIconCircle>
            ))}
          </SHorizontalPreview>
        </SLayoutOption>
      </SLayoutOptions>
    </>
  )
}
