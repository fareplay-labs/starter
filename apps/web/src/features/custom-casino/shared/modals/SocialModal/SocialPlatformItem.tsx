// @ts-nocheck
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { SVGS } from '@/assets'

// Platform definitions and detection
export interface PlatformInfo {
  name: string
  icon: string
  urlPatterns: string[]
}

export const KNOWN_PLATFORMS: Record<string, PlatformInfo> = {
  discord: {
    name: 'Discord',
    icon: SVGS.discordIcon,
    urlPatterns: ['discord.com', 'discord.gg'],
  },
  telegram: {
    name: 'Telegram',
    icon: SVGS.telegramIcon,
    urlPatterns: ['t.me', 'telegram.me', 'telegram.org'],
  },
  twitter: {
    name: 'Twitter',
    icon: SVGS.xIcon,
    urlPatterns: ['twitter.com', 'x.com'],
  },
  youtube: {
    name: 'YouTube',
    icon: SVGS.docsIcon,
    urlPatterns: ['youtube.com', 'youtu.be'],
  },
  instagram: {
    name: 'Instagram',
    icon: SVGS.shareIcon,
    urlPatterns: ['instagram.com'],
  },
  twitch: {
    name: 'Twitch',
    icon: SVGS.docsIcon,
    urlPatterns: ['twitch.tv'],
  },
  facebook: {
    name: 'Facebook',
    icon: SVGS.shareIcon,
    urlPatterns: ['facebook.com', 'fb.com'],
  },
}

// Helper function to detect platform from URL
export const detectPlatform = (url: string): string => {
  if (!url) return 'custom'

  try {
    // Clean the URL to ensure it's valid for parsing
    const cleanUrl = url.toLowerCase().trim()
    let urlObj: URL

    try {
      urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`)
    } catch {
      // Just do basic string matching if URL parsing fails
      for (const [platform, info] of Object.entries(KNOWN_PLATFORMS)) {
        if (info.urlPatterns.some(pattern => cleanUrl.includes(pattern))) {
          return platform
        }
      }
      return 'custom'
    }

    const domain = urlObj.hostname.replace('www.', '')

    // Check against known platform patterns
    for (const [platform, info] of Object.entries(KNOWN_PLATFORMS)) {
      if (info.urlPatterns.some(pattern => domain.includes(pattern))) {
        return platform
      }
    }
  } catch {
    // Silently handle errors
  }

  return 'custom'
}

// Props for the component
interface SocialPlatformItemProps {
  id: string
  platform: string
  url: string
  onChange: (id: string, url: string) => void
  onClear: (id: string) => void
}

// Helper to get icon for platform
const getPlatformIcon = (platform: string) => {
  if (platform === 'custom') {
    return SVGS.questionMarkIcon
  }
  return KNOWN_PLATFORMS[platform]?.icon || SVGS.questionMarkIcon
}

/**
 * Component for inputting and displaying a social platform link
 */
export const SocialPlatformItem: React.FC<SocialPlatformItemProps> = ({
  id,
  platform,
  url,
  onChange,
  onClear,
}) => {
  const [isInvalid, setIsInvalid] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Validate URL as user types
  const validateUrl = (value: string) => {
    // Skip validation if empty
    if (!value.trim()) {
      setIsInvalid(false)
      setErrorMessage('')
      return true
    }

    try {
      // Try to construct a URL object to validate
      new URL(value.startsWith('http') ? value : `https://${value}`)
      setIsInvalid(false)
      setErrorMessage('')
      return true
    } catch {
      setIsInvalid(true)
      setErrorMessage('Please enter a valid URL')
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    validateUrl(newValue)
    onChange(id, newValue)
  }

  return (
    <div
      className={cn(
        'flex items-center bg-[#1a1a1a] rounded-md px-2 py-1.5 mb-2 relative',
        'border transition-colors duration-200',
        isInvalid ? 'border-[#ff5e4f]' : 'border-transparent'
      )}
    >
      {/* Platform Icon */}
      <div className="w-4 h-4 min-w-[16px] mr-2 flex items-center justify-center">
        <img
          src={getPlatformIcon(platform)}
          alt={platform}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Input */}
      <input
        value={url}
        onChange={handleChange}
        placeholder={`${KNOWN_PLATFORMS[platform]?.name || 'Website'} URL`}
        className={cn(
          'flex-1 bg-transparent border-none text-white text-sm',
          'outline-none p-1 min-w-0',
          'placeholder:text-[#666] placeholder:opacity-70'
        )}
      />

      {/* Clear Button */}
      {url && (
        <div
          onClick={() => onClear(id)}
          className={cn(
            'w-4 h-4 min-w-[16px] flex items-center justify-center',
            'cursor-pointer text-[#aaaaaa] transition-colors duration-200 ml-1',
            'hover:text-[#ff5e4f]'
          )}
        >
          ✕
        </div>
      )}

      {/* Error Message */}
      {isInvalid && errorMessage && (
        <div className="absolute -bottom-[18px] left-0 text-[11px] text-[#ff5e4f]">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
