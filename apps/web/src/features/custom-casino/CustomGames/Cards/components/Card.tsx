// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { styled, keyframes, css } from 'styled-components'
import { isEmojiValue } from '../../shared/utils/emojiUtils'
import { isImageValue, parseImageValue } from '../../shared/utils/backgroundUtils'
import { formatCardValue } from '../utils/formatUtils'

// Pulsing animation for higher tier cards
const pulseGlow = keyframes`
  0% {
    filter: brightness(1) saturate(1);
  }
  50% {
    filter: brightness(1.1) saturate(1.2);
  }
  100% {
    filter: brightness(1) saturate(1);
  }
`

const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
`

interface CardProps {
  name: string
  value?: number
  icon?: string
  isRevealed?: boolean
  isClickable?: boolean
  onClick?: () => void
  size?: 'small' | 'medium' | 'large' | 'responsive' | 'dynamic'
  width?: number
  height?: number
  hidePrice?: boolean
  tierColor?: string
  tier?: 'common' | 'rare' | 'epic' | 'legendary'
  iconSize?: number
  showValueOnHover?: boolean
}

const CardContainer = styled.div<{
  $size: 'small' | 'medium' | 'large' | 'responsive' | 'dynamic'
  $isClickable: boolean
  $isRevealed: boolean
  $width?: number
  $height?: number
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: ${props => (props.$isClickable ? 'pointer' : 'default')};
  transition: transform 0.2s ease;

  ${props =>
    props.$isClickable &&
    `
    &:hover {
      transform: translateY(-4px);
    }
  `}
`

const CardBody = styled.div<{
  $size: 'small' | 'medium' | 'large' | 'responsive' | 'dynamic'
  $isRevealed: boolean
  $width?: number
  $height?: number
  $tierColor?: string
  $tier?: 'common' | 'rare' | 'epic' | 'legendary'
}>`
  width: ${props =>
    props.$size === 'dynamic' && props.$width ? `${props.$width}px`
    : props.$size === 'small' ? 'min(60px, 10vw, 10vh)'
    : props.$size === 'large' ? 'min(120px, 15vw, 18vh)'
    : props.$size === 'responsive' ? 'min(100px, 13vw, 15vh)'
    : 'min(80px, 12vw, 13vh)'};
  height: ${props =>
    props.$size === 'dynamic' && props.$height ? `${props.$height}px`
    : props.$size === 'small' ? 'min(85px, 14vw, 14vh)'
    : props.$size === 'large' ? 'min(160px, 20vw, 24vh)'
    : props.$size === 'responsive' ? 'min(135px, 18vw, 20vh)'
    : 'min(110px, 16vw, 17vh)'};
  background: ${props => {
    if (props.$tierColor && props.$tier) {
      // Add a gradient overlay with the tier color - more opaque for better visibility
      return `linear-gradient(135deg, 
        ${props.$tierColor}40 0%, 
        #1e1e2e 25%, 
        #2a2a3e 75%, 
        ${props.$tierColor}40 100%)`
    }
    return 'linear-gradient(135deg, #1e1e2e, #2a2a3e)'
  }};
  border: 2px solid ${props => props.$tierColor || 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  /* Prevent text selection */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  /* Glow effect based on rarity tier */
  box-shadow: ${props => {
    if (!props.$tierColor || !props.$tier) {
      return '0 4px 12px rgba(0, 0, 0, 0.3)'
    }

    // Determine glow intensity based on tier
    const glowIntensity = {
      common: {
        inset: `inset 0 0 20px ${props.$tierColor}30`,
        outer: `0 0 15px ${props.$tierColor}40, 0 4px 20px ${props.$tierColor}20`,
      },
      rare: {
        inset: `inset 0 0 30px ${props.$tierColor}40`,
        outer: `0 0 25px ${props.$tierColor}50, 0 4px 25px ${props.$tierColor}30`,
      },
      epic: {
        inset: `inset 0 0 40px ${props.$tierColor}50`,
        outer: `0 0 35px ${props.$tierColor}60, 0 0 50px ${props.$tierColor}30, 0 4px 30px ${props.$tierColor}40`,
      },
      legendary: {
        inset: `inset 0 0 50px ${props.$tierColor}60`,
        outer: `0 0 45px ${props.$tierColor}70, 0 0 70px ${props.$tierColor}40, 0 0 100px ${props.$tierColor}20, 0 4px 35px ${props.$tierColor}50`,
      },
    }

    const glow = glowIntensity[props.$tier] || glowIntensity.common
    return `${glow.inset}, ${glow.outer}`
  }};

  /* Add a subtle inner glow overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => {
      if (props.$tierColor && props.$tier) {
        const opacity =
          {
            common: '08',
            rare: '10',
            epic: '18',
            legendary: '25',
          }[props.$tier] || '08'
        return `radial-gradient(circle at center, ${props.$tierColor}${opacity} 0%, transparent 70%)`
      }
      return 'none'
    }};
    pointer-events: none;
  }

  transition:
    width 0.3s ease,
    height 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;

  /* Pulsing animation for epic and legendary cards */
  ${props =>
    props.$tier === 'epic' &&
    css`
      animation: ${pulseGlow} 3s ease-in-out infinite;
    `}

  ${props =>
    props.$tier === 'legendary' &&
    css`
      animation: ${pulseGlow} 2s ease-in-out infinite;

      /* Add shimmer effect for legendary cards */
      &::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -100%;
        width: 100%;
        height: 200%;
        background: linear-gradient(90deg, transparent, ${props.$tierColor}30, transparent);
        transform: translateX(-100%);
        animation: ${shimmer} 5s infinite;
        pointer-events: none;
      }
    `}
`

const CardIcon = styled.div<{
  $size: 'small' | 'medium' | 'large' | 'responsive' | 'dynamic'
  $width?: number
  $tierColor?: string
  $tier?: 'common' | 'rare' | 'epic' | 'legendary'
  $iconSize?: number
}>`
  font-size: ${props => {
    const iconSize = props.$iconSize || 1.0
    const baseSize =
      props.$size === 'dynamic' && props.$width ? `${props.$width * 0.4 * iconSize}px`
      : props.$size === 'small' ? `calc((min(1.5rem, 5vw, 5vh)) * ${iconSize})`
      : props.$size === 'large' ? `calc((min(3rem, 7vw, 8vh)) * ${iconSize})`
      : props.$size === 'responsive' ? `calc((min(2.5rem, 6vw, 7vh)) * ${iconSize})`
      : `calc((min(2rem, 5.5vw, 6vh)) * ${iconSize})`
    return baseSize
  }};

  /* Size for image containers */
  width: ${props => {
    const iconSize = props.$iconSize || 1.0
    const baseWidth =
      props.$size === 'dynamic' && props.$width ? `${props.$width * 0.5 * iconSize}px`
      : props.$size === 'small' ? `calc((min(2rem, 6vw, 6vh)) * ${iconSize})`
      : props.$size === 'large' ? `calc((min(4rem, 9vw, 10vh)) * ${iconSize})`
      : props.$size === 'responsive' ? `calc((min(3.5rem, 8vw, 9vh)) * ${iconSize})`
      : `calc((min(3rem, 7vw, 8vh)) * ${iconSize})`
    return baseWidth
  }};
  height: ${props => {
    const iconSize = props.$iconSize || 1.0
    const baseHeight =
      props.$size === 'dynamic' && props.$width ? `${props.$width * 0.5 * iconSize}px`
      : props.$size === 'small' ? `calc((min(2rem, 6vw, 6vh)) * ${iconSize})`
      : props.$size === 'large' ? `calc((min(4rem, 9vw, 10vh)) * ${iconSize})`
      : props.$size === 'responsive' ? `calc((min(3.5rem, 8vw, 9vh)) * ${iconSize})`
      : `calc((min(3rem, 7vw, 8vh)) * ${iconSize})`
    return baseHeight
  }};

  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    font-size 0.3s ease,
    filter 0.3s ease,
    width 0.3s ease,
    height 0.3s ease;
  position: relative;
  z-index: 2;

  /* Add glow to the icon based on tier */
  ${props =>
    props.$tierColor &&
    props.$tier &&
    css`
      filter: drop-shadow(
        0 0
          ${{
            common: '8px',
            rare: '12px',
            epic: '18px',
            legendary: '25px',
          }[props.$tier]}
          ${props.$tierColor}80
      );
    `}
`

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
`

const CardTitle = styled.div<{
  $size: 'small' | 'medium' | 'large' | 'responsive' | 'dynamic'
  $width?: number
  $tierColor?: string
  $tier?: 'common' | 'rare' | 'epic' | 'legendary'
}>`
  position: absolute;
  bottom: 12px; /* Increased from 6px for more padding */
  left: 50%;
  transform: translateX(-50%);
  color: ${props => {
    // Legendary cards get golden text
    if (props.$tier === 'legendary') {
      return props.$tierColor || 'white'
    }
    return 'white'
  }};
  font-size: ${props =>
    props.$size === 'dynamic' && props.$width ? `${Math.max(10, props.$width * 0.12)}px`
    : props.$size === 'small' ? 'min(0.625rem, 1.8vw, 1.8vh)'
    : props.$size === 'large' ? 'min(0.875rem, 2.2vw, 2.5vh)'
    : props.$size === 'responsive' ? 'min(0.75rem, 2vw, 2.2vh)'
    : 'min(0.7rem, 1.9vw, 2vh)'};
  font-weight: 600;
  width: ${props =>
    props.$size === 'dynamic' && props.$width ?
      `${props.$width - 16}px`
    : '90%'}; /* Use width instead of max-width for consistent sizing */
  text-align: center;
  padding: 0 4px;
  z-index: 2;

  /* Add text shadow for higher rarities */
  ${props =>
    props.$tierColor &&
    props.$tier &&
    css`
      text-shadow: ${{
        common: `0 0 4px ${props.$tierColor}40`,
        rare: `0 0 6px ${props.$tierColor}60`,
        epic: `0 0 8px ${props.$tierColor}80`,
        legendary: `0 0 12px ${props.$tierColor}, 0 0 20px ${props.$tierColor}60`,
      }[props.$tier]};
    `}

  /* Allow text to wrap to 2 lines only at word boundaries */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.15;
  white-space: normal;
  word-wrap: break-word; /* Only break long words if absolutely necessary */
  overflow-wrap: normal; /* Don't break words unless they're too long */

  transition:
    font-size 0.3s ease,
    color 0.3s ease,
    text-shadow 0.3s ease;
`

// CardName was replaced by CardTitle and is no longer used

const CardValue = styled.div<{
  $size: 'small' | 'medium' | 'large' | 'responsive' | 'dynamic'
  $isPositive?: boolean
  $width?: number
  $isHovered?: boolean
  $showOnHover?: boolean
}>`
  color: ${props => (props.$isPositive ? '#10b981' : '#ef4444')};
  font-size: ${props =>
    props.$size === 'dynamic' && props.$width ? `${Math.max(9, props.$width * 0.1)}px`
    : props.$size === 'small' ? 'min(0.6rem, 1.8vw)'
    : props.$size === 'large' ? 'min(0.85rem, 2.2vw)'
    : props.$size === 'responsive' ? 'min(0.75rem, 2vw)'
    : 'min(0.7rem, 1.9vw)'};
  font-weight: bold;
  opacity: ${props => 
    props.$showOnHover ? (props.$isHovered ? 1 : 0) : 1
  };
  transition: opacity 0.3s ease, font-size 0.3s ease;
`

// Get emoji based on name (placeholder system)
const getCardEmoji = (name: string): string => {
  const emojiMap: Record<string, string> = {
    // Common
    'Common Crystal': '💎',
    'Basic Gem': '💠',
    'Simple Stone': '🔮',

    // Rare
    'Rare Gem': '💎',
    'Magic Orb': '🔮',
    'Golden Coin': '🪙',

    // Epic
    'Epic Artifact': '🏺',
    'Ancient Scroll': '📜',
    'Mystic Tome': '📚',

    // Legendary
    'Legendary Relic': '👑',
    'Divine Crown': '👑',
    'Cosmic Key': '🗝️',

    // Default fallbacks by tier keywords
    crystal: '💎',
    gem: '💠',
    artifact: '🏺',
    relic: '👑',
    crown: '👑',
    key: '🗝️',
    coin: '🪙',
    stone: '🔮',
  }

  // Try exact match first
  if (emojiMap[name]) return emojiMap[name]

  // Try keyword match
  const nameLower = name.toLowerCase()
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (nameLower.includes(key)) return emoji
  }

  // Default
  return '🃏'
}

export const Card: React.FC<CardProps> = ({
  name,
  value,
  icon,
  isRevealed = true,
  isClickable = false,
  onClick,
  size = 'medium',
  width,
  height,
  hidePrice = false,
  tierColor,
  tier,
  iconSize = 1.0,
  showValueOnHover = false,
}) => {
  // State to track if image failed to load
  const [imageLoadError, setImageLoadError] = useState(false)
  // State to track hover
  const [isHovered, setIsHovered] = useState(false)

  // Reset image error state when icon prop changes
  useEffect(() => {
    setImageLoadError(false)
  }, [icon])

  // Determine what to display:
  // 1. If icon is provided and it's an emoji, use it
  // 2. If icon is provided and it's a valid image URL, use it (will be handled differently in rendering)
  // 3. If no icon is provided or it's empty, fall back to the name-based emoji mapping
  let displayIcon = icon
  let isIconEmoji = false

  if (!icon || icon.trim() === '') {
    // No icon provided, use fallback
    displayIcon = getCardEmoji(name)
    isIconEmoji = true
  } else if (isEmojiValue(icon)) {
    // Icon is an emoji
    displayIcon = icon
    isIconEmoji = true
  } else if (isImageValue(icon)) {
    // Icon is an image URL (using proper ColorControl format detection)
    if (imageLoadError) {
      displayIcon = getCardEmoji(name)
      isIconEmoji = true
    } else {
      // Handle different image formats from ColorControl
      let imageUrl = icon

      // Check if it's a JSON string from ColorControl
      if (icon.startsWith('{') && icon.includes('"url"')) {
        try {
          const imageData = JSON.parse(icon)
          imageUrl = imageData.url || icon
        } catch (e) {
          imageUrl = icon
        }
      } else {
        // Use the old parseImageValue for url|opacity format
        const { url } = parseImageValue(icon)
        imageUrl = url
      }

      displayIcon = imageUrl
      isIconEmoji = false
    }
  } else {
    // Unknown format, use fallback
    displayIcon = getCardEmoji(name)
    isIconEmoji = true
  }
  const isPositive = value !== undefined ? value > 0 : undefined

  return (
    <CardContainer
      $size={size}
      $isClickable={isClickable}
      $isRevealed={isRevealed}
      $width={width}
      $height={height}
      onClick={isClickable ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardBody
        $size={size}
        $isRevealed={isRevealed}
        $width={width}
        $height={height}
        $tierColor={tierColor}
        $tier={tier}
      >
        {isRevealed ?
          <CardIcon
            $size={size}
            $width={width}
            $tierColor={tierColor}
            $tier={tier}
            $iconSize={iconSize}
          >
            {isIconEmoji ?
              displayIcon
            : <img
                src={displayIcon}
                alt={name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
                onError={() => {
                  // React way: update state to trigger re-render with fallback
                  setImageLoadError(true)
                }}
              />
            }
          </CardIcon>
        : <CardIcon $size={size} $width={width} $iconSize={iconSize}>
            ?
          </CardIcon>
        }
        {/* Name moved into the card face */}
        <CardTitle $size={size} $width={width} $tierColor={tierColor} $tier={tier}>
          {name}
        </CardTitle>
      </CardBody>

      <CardInfo>
        {value !== undefined && !hidePrice && (
          <CardValue 
            $size={size} 
            $isPositive={isPositive} 
            $width={width}
            $isHovered={isHovered}
            $showOnHover={showValueOnHover}
          >
            ${formatCardValue(value)}
          </CardValue>
        )}
      </CardInfo>
    </CardContainer>
  )
}
