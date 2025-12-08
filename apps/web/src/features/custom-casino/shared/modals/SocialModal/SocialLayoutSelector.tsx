// @ts-nocheck
import React from 'react'
import { cn } from '@/lib/utils'
import { KNOWN_PLATFORMS } from './SocialPlatformItem'

// Define layout types
export type SocialLayoutType = 'horizontal' | 'vertical' | 'showLinks'

// Props for the component
interface SocialLayoutSelectorProps {
  selectedLayout: SocialLayoutType
  onLayoutChange: (layout: SocialLayoutType) => void
}

// Preview colors for icons (peach, salmon, pink from FARE_COLORS)
const previewColors = ['#ffcd9e', '#ff5e4f', '#d900d5']

// Sample platforms for previews
const samplePlatforms = ['twitter', 'discord', 'telegram']

// Social icon circle component
const SocialIconCircle: React.FC<{ platform: string; color: string }> = ({ platform, color }) => (
  <div
    className={cn(
      'w-7 h-7 rounded-full bg-[rgba(40,40,40,0.85)]',
      'flex items-center justify-center border-2'
    )}
    style={{ borderColor: color }}
  >
    <img
      src={KNOWN_PLATFORMS[platform]?.icon}
      alt={platform}
      className="w-4 h-4 object-contain"
    />
  </div>
)

// Layout option button
const LayoutOption: React.FC<{
  isSelected: boolean
  onClick: () => void
  children: React.ReactNode
}> = ({ isSelected, onClick, children }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex-1 rounded-md p-2.5 cursor-pointer bg-[#1a1a1a]',
      'transition-all duration-200 flex flex-col items-center justify-center',
      'min-h-[80px] border-2',
      isSelected ? 'border-[#ff5e4f]' : 'border-white/10',
      !isSelected && 'hover:border-white/30'
    )}
  >
    {children}
  </button>
)

/**
 * Component for selecting social link layout style
 */
export const SocialLayoutSelector: React.FC<SocialLayoutSelectorProps> = ({
  selectedLayout,
  onLayoutChange,
}) => {
  return (
    <>
      {/* Section Title */}
      <h3 className="text-base text-white m-0 mb-2">Layout Style</h3>

      {/* Layout Options */}
      <div className="flex gap-2 mb-3 w-full">
        {/* Show Links Layout */}
        <LayoutOption
          isSelected={selectedLayout === 'showLinks'}
          onClick={() => onLayoutChange('showLinks')}
        >
          <div className="flex flex-col gap-1 items-start">
            {samplePlatforms.map((platform, index) => (
              <div key={platform} className="flex items-center gap-1">
                <SocialIconCircle platform={platform} color={previewColors[index % 3]} />
                <div className="text-white whitespace-nowrap overflow-hidden text-ellipsis text-xs">
                  {platform === 'twitter'
                    ? 'x.com/user'
                    : platform === 'discord'
                      ? 'discord.gg/link'
                      : 't.me/user'}
                </div>
              </div>
            ))}
          </div>
        </LayoutOption>

        {/* Vertical Layout */}
        <LayoutOption
          isSelected={selectedLayout === 'vertical'}
          onClick={() => onLayoutChange('vertical')}
        >
          <div className="flex flex-col gap-1.5 items-center">
            {samplePlatforms.map((platform, index) => (
              <SocialIconCircle
                key={platform}
                platform={platform}
                color={previewColors[index % 3]}
              />
            ))}
          </div>
        </LayoutOption>

        {/* Horizontal Layout */}
        <LayoutOption
          isSelected={selectedLayout === 'horizontal'}
          onClick={() => onLayoutChange('horizontal')}
        >
          <div className="flex gap-1.5 justify-center">
            {samplePlatforms.map((platform, index) => (
              <SocialIconCircle
                key={platform}
                platform={platform}
                color={previewColors[index % 3]}
              />
            ))}
          </div>
        </LayoutOption>
      </div>
    </>
  )
}
