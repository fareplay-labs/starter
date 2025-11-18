// @ts-nocheck
import { styled } from 'styled-components'
import { TEXT_COLORS } from '@/design'
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
  console.log('[detectPlatform] Analyzing URL:', url)

  try {
    // Clean the URL to ensure it's valid for parsing
    const cleanUrl = url.toLowerCase().trim()
    let urlObj: URL

    try {
      urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`)
    } catch (e) {
      console.log('[detectPlatform] Failed to parse URL:', e)
      // Just do basic string matching if URL parsing fails
      for (const [platform, info] of Object.entries(KNOWN_PLATFORMS)) {
        if (info.urlPatterns.some(pattern => cleanUrl.includes(pattern))) {
          console.log('[detectPlatform] Matched platform via string matching:', platform)
          return platform
        }
      }
      return 'custom'
    }

    const domain = urlObj.hostname.replace('www.', '')
    console.log('[detectPlatform] Parsed domain:', domain)

    // Check against known platform patterns
    for (const [platform, info] of Object.entries(KNOWN_PLATFORMS)) {
      if (info.urlPatterns.some(pattern => domain.includes(pattern))) {
        console.log('[detectPlatform] Matched platform:', platform)
        return platform
      }
    }
  } catch (e) {
    console.error('[detectPlatform] Error detecting platform:', e)
  }

  console.log('[detectPlatform] No platform match found, using "custom"')
  return 'custom'
}

// Styled components
const SLinkInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #1a1a1a;
  border-radius: 6px;
  padding: 6px 8px;
  margin-bottom: 8px;
  position: relative;
  border: 1px solid transparent;
  transition: border-color 0.2s ease;

  &[data-invalid='true'] {
    border-color: #ff5e4f;
  }
`

const SPlatformIcon = styled.div`
  width: 16px;
  height: 16px;
  min-width: 16px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const SLinkInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: ${TEXT_COLORS.one};
  font-size: 14px;
  outline: none;
  padding: 4px;
  min-width: 0;

  &::placeholder {
    color: ${TEXT_COLORS.three};
    opacity: 0.7;
  }
`

const SRemoveButton = styled.div`
  width: 16px;
  height: 16px;
  min-width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${TEXT_COLORS.two};
  transition: color 0.2s;
  margin-left: 4px;

  &:hover {
    color: #ff5e4f;
  }
`

const SErrorMessage = styled.div`
  position: absolute;
  bottom: -18px;
  left: 0;
  font-size: 11px;
  color: #ff5e4f;
`

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
    <SLinkInputWrapper data-invalid={isInvalid}>
      <SPlatformIcon>
        <img src={getPlatformIcon(platform)} alt={platform} />
      </SPlatformIcon>
      <SLinkInput
        value={url}
        onChange={handleChange}
        placeholder={`${KNOWN_PLATFORMS[platform]?.name || 'Website'} URL`}
      />
      {url && <SRemoveButton onClick={() => onClear(id)}>✕</SRemoveButton>}
      {isInvalid && errorMessage && <SErrorMessage>{errorMessage}</SErrorMessage>}
    </SLinkInputWrapper>
  )
}
