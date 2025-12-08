import React from 'react'
import { cn } from '@/lib/utils'
import { SVGS } from '@/assets'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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

// Social icon link component
interface SocialIconProps {
  href: string
  themeColor?: string
  title?: string
  children: React.ReactNode
}

const SocialIcon: React.FC<SocialIconProps> = ({ href, themeColor, title, children }) => {
  const borderColor = themeColor || 'rgba(255, 255, 255, 0.8)'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className="w-8 h-8 rounded-full bg-[rgba(40,40,40,0.85)] flex items-center justify-center transition-all duration-200 ease-in-out hover:-translate-y-1 hover:brightness-125 [&_img]:w-[18px] [&_img]:h-[18px] [&_img]:brightness-125"
      style={{
        border: `2px solid ${borderColor}`,
      }}
      onMouseEnter={(e) => {
        if (themeColor) {
          e.currentTarget.style.boxShadow = `0 4px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px ${themeColor}`
        } else {
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {children}
    </a>
  )
}

// Link text with tooltip using shadcn Tooltip
interface LinkTextProps {
  tooltip: string
  children: React.ReactNode
}

const LinkText: React.FC<LinkTextProps> = ({ tooltip, children }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="whitespace-nowrap overflow-hidden text-ellipsis text-sm text-foreground cursor-default">
        {children}
      </div>
    </TooltipTrigger>
    <TooltipContent side="top" className="bg-popover border-border">
      <p className="text-xs">{tooltip}</p>
    </TooltipContent>
  </Tooltip>
)

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

  switch (layoutType) {
    case 'horizontal':
      return (
        <TooltipProvider>
        <div className="flex gap-2 relative">
          {links.map((link, index) => (
            <SocialIcon
              key={link.platform + index}
              href={getFormattedUrl(link.url)}
              themeColor={getThemeColor(index)}
              title={link.url}
            >
              <img
                src={getPlatformIcon(link.platform)}
                alt={link.platform}
                width="18"
                height="18"
              />
            </SocialIcon>
          ))}
        </div>
        </TooltipProvider>
      )
    case 'vertical':
      return (
        <TooltipProvider>
        <div className="flex flex-col gap-2 items-start w-full">
          {links.map((link, index) => (
            <SocialIcon
              key={link.platform + index}
              href={getFormattedUrl(link.url)}
              themeColor={getThemeColor(index)}
              title={link.url}
            >
              <img
                src={getPlatformIcon(link.platform)}
                alt={link.platform}
                width="18"
                height="18"
              />
            </SocialIcon>
          ))}
        </div>
        </TooltipProvider>
      )
    case 'showLinks':
    default:
      return (
        <TooltipProvider>
        <div className="flex flex-col gap-2 items-start w-full">
          {links.map((link, index) => (
            <div
              key={link.platform + index}
              className="grid grid-cols-[32px_1fr] gap-2 items-center w-full"
            >
              <SocialIcon
                href={getFormattedUrl(link.url)}
                themeColor={getThemeColor(index)}
                title={link.url}
              >
                <img
                  src={getPlatformIcon(link.platform)}
                  alt={link.platform}
                  width="18"
                  height="18"
                />
              </SocialIcon>
              <LinkText tooltip={link.url}>
                {getDisplayText(link.platform, link.url)}
              </LinkText>
            </div>
          ))}
        </div>
        </TooltipProvider>
      )
  }
}
