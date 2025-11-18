// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { BORDER_COLORS, BREAKPOINTS, SPACING, TEXT_COLORS, FARE_COLORS } from '@/design'
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

const SHeroContainer = styled.div<{
  $borderColor?: string
  $colors?: { themeColor1: string; themeColor2: string; themeColor3: string }
  $animateBorder?: boolean
}>`
  width: 100%;
  min-height: 280px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
  border: 2px solid ${props => props.$borderColor || BORDER_COLORS.one};
  box-shadow: ${props => (props.$borderColor ? `0 4px 20px ${props.$borderColor}40` : 'none')};

  @media (max-width: ${BREAKPOINTS.sm}px) {
    min-height: 200px;
    width: 99%;
  }
`

const SHeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: #1a1a1a;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%);
    pointer-events: none;
    z-index: 2;
  }
`

const SContent = styled.div`
  position: relative;
  z-index: 3;
  padding: ${SPACING.lg}px ${SPACING.xl}px;
  height: 100%;
  min-height: inherit;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: ${SPACING.lg}px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    padding: ${SPACING.md}px;
  }
`

const SProfileSection = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${SPACING.lg}px;
  width: 100%;
  z-index: 4;
  margin-bottom: ${SPACING.md}px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    gap: ${SPACING.md}px;
    margin-bottom: ${SPACING.sm}px;
  }
`

const SProfilePic = styled.div<{ $themeColor?: string }>`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 4px solid ${props => props.$themeColor || FARE_COLORS.blue};
  background: #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  top: -5px;
  flex-shrink: 0;
  overflow: hidden;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    width: 70px;
    height: 70px;
  }
`

const SProfileInfo = styled.div`
  flex: 1;
  max-width: calc(100% - 120px); /* Account for profile pic width + gap */

  @media (max-width: ${BREAKPOINTS.sm}px) {
    max-width: calc(100% - 90px);
  }
`

const STitle = styled.div<{ $isEditMode?: boolean; $themeColor?: string }>`
  font-size: 36px;
  font-weight: bold;
  color: ${TEXT_COLORS.one};
  margin: 0 0 ${SPACING.sm}px 0;
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  position: relative;
  padding-left: ${props => (props.$isEditMode ? '40px' : '0')};
  line-height: 1.2;
  text-shadow: ${props =>
    props.$themeColor ?
      `0 0 10px ${props.$themeColor}40, 0 0 15px ${props.$themeColor}20`
    : 'none'};

  > button {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    font-size: 24px;
    margin-bottom: ${SPACING.xs}px;
    padding-left: 0;
  }
`

const SDescription = styled.div<{ $isEditMode?: boolean }>`
  font-size: 18px;
  color: ${TEXT_COLORS.two};
  margin: 0;
  padding-left: ${props => (props.$isEditMode ? '40px' : '20px')};
  width: 100%;
  max-width: 800px;
  position: relative;
  line-height: 1.3;

  > button {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    font-size: 14px;
    padding-left: 0;
    padding-bottom: 20px;
  }
`

const BannerEditCircleWrapper = styled.div`
  position: absolute;
  top: ${SPACING.lg}px;
  left: ${SPACING.lg}px;
  z-index: 10;
`

const SSocials = styled.div`
  display: flex;
  gap: ${SPACING.lg}px;
  z-index: 5;
  position: absolute;
  bottom: ${SPACING.xl}px;
  right: ${SPACING.xl}px;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    bottom: ${SPACING.md}px;
    right: ${SPACING.md}px;
  }
`

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
    <SHeroContainer
      $borderColor={config.colors.themeColor1}
      $colors={themeColors}
      $animateBorder={animateBorder}
    >
      <SHeroBackground>
        {hasBannerImage ?
          <CroppedImage imageData={bannerImage} alt='Casino Banner' width='100%' height='100%' />
        : <img
            src={bannerPlaceholder}
            alt='Banner Placeholder'
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '50% 75%',
            }}
          />
        }
      </SHeroBackground>

      {isEditMode && (
        <BannerEditCircleWrapper>
          <EditCircle onClick={() => openModal('image', 'bannerImage')} title='Edit Banner Image' />
        </BannerEditCircleWrapper>
      )}

      <SContent>
        {/* Profile section with avatar, title, description */}
        <SProfileSection>
          {/* Profile picture with edit circle */}
          <EditableContainer isEditable={isEditMode}>
            <SProfilePic $themeColor={themeColor}>
              {hasProfileImage ?
                <CroppedImage imageData={profileImage} alt='Profile' width='100%' height='100%' />
              : <img
                  src={profilePlaceholder}
                  alt='Profile Placeholder'
                  style={{
                    width: '100%',
                    height: '100%',
                    transform: 'scale(1.4)',
                  }}
                />
              }
            </SProfilePic>
            {isEditMode && (
              <EditCircle
                $position='center'
                onClick={() => openModal('image', 'profileImage')}
                title='Edit Profile Image'
              />
            )}
          </EditableContainer>

          <SProfileInfo>
            {/* Title - using EditableText if in edit mode */}
            <STitle $isEditMode={isEditMode} $themeColor={themeColor}>
              {isEditMode ?
                <EditableText
                  value={title}
                  onChange={value => handleEdit('title', value)}
                  placeholder='Enter Title'
                />
              : title}
            </STitle>

            {/* Description - using EditableText if in edit mode */}
            <SDescription $isEditMode={isEditMode}>
              {isEditMode ?
                <EditableText
                  value={description}
                  onChange={value => handleEdit('shortDescription', value)}
                  placeholder='Enter Description'
                  multiline
                />
              : description}
            </SDescription>
          </SProfileInfo>
        </SProfileSection>

        {/* Social links - simplified rendering */}
        <SSocials>
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
                $position='topRight'
                onClick={() => openModal('socials')}
                title='Edit Social Links'
              />
            )}
          </EditableContainer>
        </SSocials>
      </SContent>
    </SHeroContainer>
  )
}
