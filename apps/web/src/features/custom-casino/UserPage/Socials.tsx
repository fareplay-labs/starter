// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { SPACING, TEXT_COLORS } from '@/design'
import { SVGS } from '@/assets'

// Platform information for social icons
interface PlatformInfo {
  name: string
  icon: string
}

const SOCIAL_PLATFORMS: Record<string, PlatformInfo> = {
  discord: {
    name: 'Discord',
    icon: SVGS.discordIcon,
  },
  telegram: {
    name: 'Telegram',
    icon: SVGS.telegramIcon,
  },
  twitter: {
    name: 'Twitter',
    icon: SVGS.xIcon,
  },
  youtube: {
    name: 'YouTube',
    icon: SVGS.docsIcon,
  },
  instagram: {
    name: 'Instagram',
    icon: SVGS.shareIcon,
  },
  twitch: {
    name: 'Twitch',
    icon: SVGS.docsIcon,
  },
  facebook: {
    name: 'Facebook',
    icon: SVGS.shareIcon,
  },
}

const SSocialIcon = styled.a<{ $themeColor?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(40, 40, 40, 0.85);
  border: 2px solid ${props => props.$themeColor || 'rgba(255, 255, 255, 0.8)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-4px);
    filter: brightness(1.2);
    box-shadow: ${props =>
      props.$themeColor ?
        `0 4px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px ${props.$themeColor}`
      : '0 4px 8px rgba(0, 0, 0, 0.3)'};
  }

  svg {
    width: 18px;
    height: 18px;
    fill: ${TEXT_COLORS.one};
  }

  img {
    width: 18px;
    height: 18px;
    filter: brightness(1.2);
  }
`

const SSocialIconsWrapper = styled.div`
  display: flex;
  gap: ${SPACING.xs}px;
  position: relative;
`

const SVerticalSocials = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs}px;
  align-items: flex-start;
  width: 100%;
`

const SSocialsWithLinksWrapper = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: ${SPACING.xs}px;
  align-items: center;
  width: 100%;
`

const SLinkText = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
  color: ${TEXT_COLORS.one};
  position: relative;

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 5px);
    left: 0;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    white-space: nowrap;
    z-index: 1000;
  }
`

interface SocialsProps {
  layoutType: string
  links: Array<{ platform: string; url: string }>
  themeColor: string
  themeColor2?: string
  themeColor3?: string
}

export const Socials: React.FC<SocialsProps> = ({
  layoutType,
  links,
  themeColor,
  themeColor2,
  themeColor3,
}) => {
  // Helper to get icon for platform
  const getPlatformIcon = (platform: string) => {
    if (platform === 'custom' || platform.startsWith('custom_')) {
      return SVGS.questionMarkIcon
    }
    return SOCIAL_PLATFORMS[platform]?.icon || SVGS.questionMarkIcon
  }

  // Helper to get theme color by index
  const getThemeColor = (index: number) => {
    const colors = [themeColor, themeColor2, themeColor3]
    return colors[index % 3] || themeColor
  }

  // Helper to format URL for proper linking
  const getFormattedUrl = (url: string) => {
    if (!url) return '#'
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`
    return formattedUrl
  }

  // Helper to extract username or relevant display text from URL
  const getDisplayText = (platform: string, url: string) => {
    if (!url) return ''

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      const path = urlObj.pathname.replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes

      let displayText = 'Link'

      // Handle different platforms
      switch (platform) {
        case 'twitter':
          displayText = '@' + path
          break
        case 'discord':
          displayText = path.includes('invite') ? 'Join Server' : path
          break
        case 'telegram':
          displayText = '@' + path
          break
        case 'youtube':
          displayText = path.includes('channel') ? 'Channel' : path.replace('@', '')
          break
        case 'twitch':
          displayText = path
          break
        case 'instagram':
          displayText = '@' + path
          break
        case 'facebook':
          displayText = path
          break
        default:
          if (platform === 'custom' || platform.startsWith('custom_')) {
            displayText = urlObj.hostname.replace('www.', '')
          } else {
            displayText = path || urlObj.hostname.replace('www.', '')
          }
      }

      return displayText
    } catch (e) {
      return 'Link'
    }
  }

  // Log the rendering mode we're choosing

  switch (layoutType) {
    case 'horizontal':
      return (
        <SSocialIconsWrapper>
          {links.map((link, index) => {
            return (
              <SSocialIcon
                key={link.platform + index}
                href={getFormattedUrl(link.url)}
                target='_blank'
                rel='noopener noreferrer'
                $themeColor={getThemeColor(index)}
                title={link.url}
              >
                <img
                  src={getPlatformIcon(link.platform)}
                  alt={link.platform}
                  width='18'
                  height='18'
                />
              </SSocialIcon>
            )
          })}
        </SSocialIconsWrapper>
      )
    case 'vertical':
      return (
        <SVerticalSocials>
          {links.map((link, index) => {
            return (
              <SSocialIcon
                key={link.platform + index}
                href={getFormattedUrl(link.url)}
                target='_blank'
                rel='noopener noreferrer'
                $themeColor={getThemeColor(index)}
                title={link.url}
              >
                <img
                  src={getPlatformIcon(link.platform)}
                  alt={link.platform}
                  width='18'
                  height='18'
                />
              </SSocialIcon>
            )
          })}
        </SVerticalSocials>
      )
    case 'showLinks':
    default:
      return (
        <SVerticalSocials>
          {links.map((link, index) => {
            return (
              <SSocialsWithLinksWrapper key={link.platform + index}>
                <SSocialIcon
                  href={getFormattedUrl(link.url)}
                  target='_blank'
                  rel='noopener noreferrer'
                  $themeColor={getThemeColor(index)}
                  title={link.url}
                >
                  <img
                    src={getPlatformIcon(link.platform)}
                    alt={link.platform}
                    width='18'
                    height='18'
                  />
                </SSocialIcon>
                <SLinkText data-tooltip={link.url}>
                  {getDisplayText(link.platform, link.url)}
                </SLinkText>
              </SSocialsWithLinksWrapper>
            )
          })}
        </SVerticalSocials>
      )
  }
}
