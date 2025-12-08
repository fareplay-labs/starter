import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { type CasinoEntity } from '../../shared/types'
import { type PageConfig } from '../../config/PageConfig'
import { useEditStore } from '@/features/custom-casino/UserPage/editor/useEditStore'
import { EditableContainer, EditCircle } from '../editor/EditCircle'
import EditableText from '../editor/EditableText'
import { Socials } from '../Socials'
import { type EditableField } from '../utils/UserPageUtils'
import { detectPlatform } from '../../shared/modals/SocialModal/SocialPlatformItem'
import CroppedImage from '../../shared/ui/CroppedImage'
import profilePlaceholder from '@/assets/png/profile-pic-placeholder.png'
import bannerPlaceholder from '@/assets/png/banner-placeholder.png'

interface UserHeroSectionProps {
  casino: CasinoEntity
  isEditMode: boolean
  onEdit: (field: EditableField, value: string) => void
  config: PageConfig
}

// Hero container
interface HeroContainerProps {
  borderColor?: string
  children: React.ReactNode
}

const HeroContainer: React.FC<HeroContainerProps> = ({ borderColor, children }) => (
  <div
    className="w-full min-h-[280px] relative rounded-xl overflow-hidden transition-transform duration-200 max-sm:min-h-[200px] max-sm:w-[99%]"
    style={{
      border: `2px solid ${borderColor || '#1a2744'}`,
      boxShadow: borderColor ? `0 4px 20px ${borderColor}40` : 'none',
    }}
  >
    {children}
  </div>
)

// Hero background with gradient overlay
const HeroBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute inset-0 z-[1] bg-casino-card">
    {children}
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40 pointer-events-none z-[2]" />
  </div>
)

// Content container
const HeroContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative z-[3] px-8 py-6 h-full min-h-[inherit] flex flex-col justify-end gap-6 max-sm:p-4">
    {children}
  </div>
)

// Profile section
const ProfileSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-end gap-6 w-full z-[4] mb-4 max-sm:gap-4 max-sm:mb-3">
    {children}
  </div>
)

// Profile picture
interface ProfilePicProps {
  themeColor?: string
  children: React.ReactNode
}

const ProfilePic: React.FC<ProfilePicProps> = ({ themeColor, children }) => (
  <div
    className="w-[90px] h-[90px] rounded-full bg-[#333] shadow-lg relative -top-[5px] flex-shrink-0 overflow-hidden max-sm:w-[70px] max-sm:h-[70px]"
    style={{ border: `4px solid ${themeColor || '#5f5fff'}` }}
  >
    {children}
  </div>
)

// Profile info
const ProfileInfo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex-1 max-w-[calc(100%-120px)] max-sm:max-w-[calc(100%-90px)]">
    {children}
  </div>
)

// Title wrapper
interface TitleWrapperProps {
  isEditMode?: boolean
  themeColor?: string
  children: React.ReactNode
}

const TitleWrapper: React.FC<TitleWrapperProps> = ({ isEditMode, themeColor, children }) => (
  <div
    className={cn(
      'text-4xl font-bold text-white mb-3 w-full max-w-[600px] flex items-center relative leading-tight',
      'max-sm:text-2xl max-sm:mb-2 max-sm:pl-0',
      isEditMode ? 'pl-10' : 'pl-0',
      '[&>button]:absolute [&>button]:left-0 [&>button]:top-1/2 [&>button]:-translate-y-1/2 [&>button]:z-10'
    )}
    style={{
      textShadow: themeColor ? `0 0 10px ${themeColor}40, 0 0 15px ${themeColor}20` : 'none',
    }}
  >
    {children}
  </div>
)

// Description wrapper
interface DescriptionWrapperProps {
  isEditMode?: boolean
  children: React.ReactNode
}

const DescriptionWrapper: React.FC<DescriptionWrapperProps> = ({ isEditMode, children }) => (
  <div
    className={cn(
      'text-lg text-[#aaa] m-0 w-full max-w-[800px] relative leading-snug',
      'max-sm:text-sm max-sm:pl-0 max-sm:pb-5',
      isEditMode ? 'pl-10' : 'pl-5',
      '[&>button]:absolute [&>button]:left-0 [&>button]:top-1/2 [&>button]:-translate-y-1/2 [&>button]:z-10'
    )}
  >
    {children}
  </div>
)

// Banner edit circle wrapper
const BannerEditWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute top-6 left-6 z-10">
    {children}
  </div>
)

// Socials wrapper
const SocialsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex gap-6 z-[5] absolute bottom-8 right-8 max-sm:bottom-4 max-sm:right-4">
    {children}
  </div>
)

export const UserHeroSection: React.FC<UserHeroSectionProps> = ({
  casino,
  isEditMode,
  onEdit,
  config,
}) => {
  // Get casinoConfig and setters from the edit store
  const { setEditMode, setCasinoConfig, openModal } = useEditStore()

  // Use a ref to track if we've updated the store config already
  const hasUpdatedConfig = useRef(false)

  // Add state to control whether border animation is active
  const [animateBorder, setAnimateBorder] = useState(false)

  // Sync the edit mode state with the Zustand store
  useEffect(() => {
    setEditMode(isEditMode)

    // Only update config in store once on mount or when explicitly changed
    if (config && (!hasUpdatedConfig.current || isEditMode)) {
      // Process social links data
      let processedSocialLinks = config.socialLinks || {}

      // Check if socialLinks is a string that needs to be parsed
      if (typeof processedSocialLinks === 'string') {
        try {
          processedSocialLinks = JSON.parse(processedSocialLinks)
        } catch (e) {
          console.error('[UserHeroSection] Failed to parse socialLinks string for store:', e)
          processedSocialLinks = { layoutType: 'horizontal', links: [] }
        }
      }

      // Extract layout type if it exists
      const { layoutType, ...otherSocialLinks } = processedSocialLinks || {}

      // Use a stable reference for comparison
      const newConfig = {
        casinoId: casino.id || 'default',
        title: config.title || casino.config.title,
        shortDescription: config.shortDescription || casino.config.shortDescription,
        bannerImage: config.bannerImage || casino.config.bannerImage,
        profileImage: config.profileImage || casino.config.profileImage,
        socialLinks: {
          layoutType: (layoutType || 'horizontal') as 'horizontal' | 'vertical' | 'showLinks',
          ...otherSocialLinks,
        },
        colors: {
          themeColor1: config.colors.themeColor1 || '#ffcd9e',
          themeColor2: config.colors.themeColor2 || '#ff5e4f',
          themeColor3: config.colors.themeColor3 || '#d900d5',
          backgroundColor: config.colors.backgroundColor || '#0a0a0a',
        },
        font: config.font || 'Arial, Helvetica, sans-serif',
        sections: config.sections || [],
      }

      setCasinoConfig(newConfig)
      hasUpdatedConfig.current = true
    }
  }, [casino, config, isEditMode, setCasinoConfig, setEditMode])

  // Activate border animation on component mount
  useEffect(() => {
    // Enable animation when component mounts
    const timer = setTimeout(() => setAnimateBorder(true), 300)

    return () => clearTimeout(timer)
  }, [])

  // Prepare theme colors object for the animated border
  const themeColors = {
    themeColor1: config.colors.themeColor1,
    themeColor2: config.colors.themeColor2,
    themeColor3: config.colors.themeColor3,
  }

  const handleEdit = (field: string, value: string) => {
    if (!isEditMode || !onEdit) return
    onEdit(field as EditableField, value)
  }

  // Use config values if available, otherwise fall back to casino data with null checks
  const title = config?.title || casino?.config?.title || 'Default Title'
  const description =
    config?.shortDescription || casino?.config?.shortDescription || 'Welcome to this casino'

  // Get raw image paths from config or casino - these are already the imported URLs
  const bannerImage = config?.bannerImage || casino?.config?.bannerImage || ''
  const profileImage = config?.profileImage || casino?.config?.profileImage || ''
  
  // Check if images are placeholder strings (for ImageData or string types)
  const hasBannerImage = bannerImage && 
    (typeof bannerImage === 'string' ? 
      bannerImage !== 'placeholder' : 
      (bannerImage.url && bannerImage.url !== 'placeholder'))
  const hasProfileImage = profileImage && 
    (typeof profileImage === 'string' ? 
      profileImage !== 'placeholder' : 
      (profileImage.url && profileImage.url !== 'placeholder'))

  const themeColor = config?.colors?.themeColor1 || FARE_COLORS.blue
  const themeColor2 = config?.colors?.themeColor2
  const themeColor3 = config?.colors?.themeColor3

  // Extract links from config
  const links: Array<{ platform: string; url: string }> = []
  const socialConfig = config?.socialLinks || {}

  // Check if socialConfig is a string that needs to be parsed
  let processedSocialConfig: {
    layoutType?: string
    links?: string[]
    [key: string]: any
  } = socialConfig

  if (typeof socialConfig === 'string') {
    try {
      processedSocialConfig = JSON.parse(socialConfig)
    } catch (e) {
      console.error('[UserHeroSection] Failed to parse socialConfig string:', e)
      processedSocialConfig = { layoutType: 'horizontal', links: [] }
    }
  }

  // Get layout type from config or use default
  const layoutType =
    (
      processedSocialConfig?.layoutType &&
      ['horizontal', 'vertical', 'showLinks'].includes(processedSocialConfig.layoutType)
    ) ?
      (processedSocialConfig.layoutType as 'horizontal' | 'vertical' | 'showLinks')
    : 'horizontal'

  // First check if we have links in the new format (array)
  if (Array.isArray(processedSocialConfig.links) && processedSocialConfig.links.length > 0) {
    // Process links from the array format
    processedSocialConfig.links.forEach(url => {
      if (typeof url === 'string' && url.trim() !== '') {
        try {
          // Try to detect platform from URL
          const cleanUrl = url.trim()
          const platform = detectPlatform ? detectPlatform(cleanUrl) : 'custom'
          links.push({ platform, url: cleanUrl })
        } catch (e) {
          console.error('[UserHeroSection] Error processing social link:', e)
        }
      }
    })
  } else {
    // Process social links from old format (key-value pairs)
    Object.entries(processedSocialConfig).forEach(([key, value]) => {
      // Skip special properties
      if (['layoutType', 'links'].includes(key)) return

      // Only add if it has a valid URL
      if (value && typeof value === 'string' && value.trim() !== '') {
        // Remove any custom_ prefix from the platform name
        const platform = key.replace('custom_', '')
        links.push({ platform, url: value })
      }
    })
  }

  // Sort links to ensure consistent order
  links.sort((a, b) => a.platform.localeCompare(b.platform))

  return (
    <HeroContainer borderColor={config.colors.themeColor1}>
      <HeroBackground>
        {hasBannerImage ? (
          <CroppedImage imageData={bannerImage} alt="Casino Banner" width="100%" height="100%" />
        ) : (
          <img
            src={bannerPlaceholder}
            alt="Banner Placeholder"
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 75%' }}
          />
        )}
      </HeroBackground>

      {isEditMode && (
        <BannerEditWrapper>
          <EditCircle onClick={() => openModal('image', 'bannerImage')} title="Edit Banner Image" />
        </BannerEditWrapper>
      )}

      <HeroContent>
        {/* Profile section with avatar, title, description */}
        <ProfileSection>
          {/* Profile picture with edit circle */}
          <EditableContainer isEditable={isEditMode}>
            <ProfilePic themeColor={themeColor}>
              {hasProfileImage ? (
                <CroppedImage imageData={profileImage} alt="Profile" width="100%" height="100%" />
              ) : (
                <img
                  src={profilePlaceholder}
                  alt="Profile Placeholder"
                  className="w-full h-full scale-[1.4]"
                />
              )}
            </ProfilePic>
            {isEditMode && (
              <EditCircle
                $position="center"
                onClick={() => openModal('image', 'profileImage')}
                title="Edit Profile Image"
              />
            )}
          </EditableContainer>

          <ProfileInfo>
            {/* Title - using EditableText if in edit mode */}
            <TitleWrapper isEditMode={isEditMode} themeColor={themeColor}>
              {isEditMode ? (
                <EditableText
                  value={title}
                  onChange={value => handleEdit('title', value)}
                  placeholder="Enter Title"
                />
              ) : (
                title
              )}
            </TitleWrapper>

            {/* Description - using EditableText if in edit mode */}
            <DescriptionWrapper isEditMode={isEditMode}>
              {isEditMode ? (
                <EditableText
                  value={description}
                  onChange={value => handleEdit('shortDescription', value)}
                  placeholder="Enter Description"
                  multiline
                />
              ) : (
                description
              )}
            </DescriptionWrapper>
          </ProfileInfo>
        </ProfileSection>

        {/* Social links - simplified rendering */}
        <SocialsWrapper>
          <EditableContainer isEditable={isEditMode}>
            {(links.length > 0 || isEditMode) && (
              <Socials
                links={links}
                layoutType={layoutType}
                themeColor={themeColor}
                themeColor2={themeColor2}
                themeColor3={themeColor3}
              />
            )}
            {isEditMode && (
              <EditCircle
                $position="topRight"
                onClick={() => openModal('socials')}
                title="Edit Social Links"
              />
            )}
          </EditableContainer>
        </SocialsWrapper>
      </HeroContent>
    </HeroContainer>
  )
}
