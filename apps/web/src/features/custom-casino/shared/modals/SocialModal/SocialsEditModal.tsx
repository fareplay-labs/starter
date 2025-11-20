// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { styled } from 'styled-components'
import { TEXT_COLORS } from '@/design'
import { SocialPlatformItem, SocialLayoutSelector, type SocialLayoutType, detectPlatform } from '.'
import { ModalBase } from '../../../shared/modals/shared/ModalBase'
import { ModalActions } from '../../../shared/modals/shared/ModalActions'
import {
  type SocialsEditModalProps,
  type SocialLinksConfig,
} from '../../../shared/modals/shared/modalTypes'

// Define a link entry format
interface LinkEntry {
  platform: string
  url: string
  id: string
}

// Styled components
const SectionTitle = styled.h3`
  font-size: 16px;
  color: ${TEXT_COLORS.one};
  margin: 0 0 8px 0;
`

const LinksContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

/**
 * Modal for editing social link settings
 */
export const SocialsEditModal: React.FC<SocialsEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  socialLinks = {},
}) => {
  // Layout options
  const [layoutType, setLayoutType] = useState<SocialLayoutType>('showLinks')

  // State for dynamic link management - fixed size of 8
  const [links, setLinks] = useState<LinkEntry[]>([])

  // Initialize links from props when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('[SocialsEditModal] Modal opened with socialLinks:', socialLinks)
      const initialLinks: LinkEntry[] = []

      // Extract layout type if it exists
      let initialLayoutType: SocialLayoutType = 'showLinks'

      // Check if socialLinks is a string that needs to be parsed
      let processedSocialLinks = socialLinks
      if (typeof socialLinks === 'string') {
        try {
          console.log('[SocialsEditModal] Attempting to parse string socialLinks')
          processedSocialLinks = JSON.parse(socialLinks)
          console.log('[SocialsEditModal] Successfully parsed socialLinks:', processedSocialLinks)
        } catch (e) {
          console.error('[SocialsEditModal] Failed to parse socialLinks string:', e)
          processedSocialLinks = {}
        }
      }

      // Convert existing social links to our format
      if (processedSocialLinks) {
        // Handle layoutType
        if (processedSocialLinks.layoutType) {
          initialLayoutType = processedSocialLinks.layoutType
          console.log('[SocialsEditModal] Using layout type:', initialLayoutType)
        }

        // Handle links array if it exists in the new format
        if (Array.isArray(processedSocialLinks.links)) {
          console.log(
            '[SocialsEditModal] Processing links array format:',
            processedSocialLinks.links
          )
          processedSocialLinks.links.forEach(link => {
            if (typeof link === 'string') {
              const platform = detectPlatform(link)
              initialLinks.push({
                platform,
                url: link,
                id: Math.random().toString(36).substring(2, 9),
              })
            }
          })
        } else {
          // For backward compatibility, handle old format of key-value pairs
          console.log('[SocialsEditModal] Processing key-value pairs format')
          Object.entries(processedSocialLinks).forEach(([key, value]) => {
            if (key !== 'layoutType' && key !== 'links' && value && typeof value === 'string') {
              console.log('[SocialsEditModal] Found link:', key, value)
              initialLinks.push({
                platform: key,
                url: value,
                id: Math.random().toString(36).substring(2, 9),
              })
            }
          })
        }
      }

      console.log('[SocialsEditModal] Initial links before padding:', initialLinks)

      // Initialize exactly 8 input fields
      const filledLinksCount = initialLinks.length
      const emptyFieldsToAdd = 8 - filledLinksCount

      // Fill the rest with empty inputs
      for (let i = 0; i < emptyFieldsToAdd; i++) {
        initialLinks.push({
          platform: 'custom',
          url: '',
          id: Math.random().toString(36).substring(2, 9),
        })
      }

      setLinks(initialLinks)
      setLayoutType(initialLayoutType)
      console.log('[SocialsEditModal] Final initialized links:', initialLinks)
    }
  }, [isOpen, socialLinks])

  // Update link data when URL changes (with platform detection)
  const handleLinkChange = (id: string, url: string) => {
    setLinks(prev =>
      prev.map(link => {
        if (link.id === id) {
          const platform = detectPlatform(url)
          return { ...link, url, platform }
        }
        return link
      })
    )
  }

  // Remove a link (clear the input, don't remove from array)
  const handleClearLink = (id: string) => {
    setLinks(prev =>
      prev.map(link => {
        if (link.id === id) {
          return { ...link, url: '', platform: 'custom' }
        }
        return link
      })
    )
  }

  // Handle layout change
  const handleLayoutChange = (newLayout: SocialLayoutType) => {
    setLayoutType(newLayout)
  }

  // Save the social links
  const handleSave = () => {
    console.log('[SocialsEditModal] Starting save process with links:', links)
    // URL validation helper
    const isValidUrl = (url: string): boolean => {
      try {
        // Clean the URL and ensure it has a protocol
        const cleanUrl = url.trim()
        if (!cleanUrl) return false

        // Try to construct a URL object to validate
        new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`)
        return true
      } catch {
        return false
      }
    }

    // Filter out empty and invalid links
    const filledLinks = links.filter(link => {
      const trimmedUrl = link.url.trim()
      const isValid = trimmedUrl !== '' && isValidUrl(trimmedUrl)
      if (!isValid && trimmedUrl !== '') {
        console.log('[SocialsEditModal] Filtered out invalid URL:', trimmedUrl)
      }
      return isValid
    })

    console.log('[SocialsEditModal] Filtered valid links:', filledLinks)

    // Create links array with validated URLs
    const linkUrls = filledLinks.map(link => {
      const trimmedUrl = link.url.trim()
      return trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`
    })

    console.log('[SocialsEditModal] Processed URLs for links array:', linkUrls)

    // Convert to the format expected by the parent component
    const socialLinksData: SocialLinksConfig = {
      layoutType: layoutType,
      links: linkUrls,
    }

    // For backward compatibility, also include direct platform-URL mappings
    filledLinks.forEach(link => {
      const platform = link.platform === 'custom' ? `custom_${link.id}` : link.platform
      const url =
        link.url.trim().startsWith('http') ? link.url.trim() : `https://${link.url.trim()}`
      socialLinksData[platform] = url
    })

    console.log('[SocialsEditModal] Final socialLinksData to save:', socialLinksData)
    console.log('[SocialsEditModal] Stringified data:', JSON.stringify(socialLinksData))

    // Save the data
    onSave('socialLinks', JSON.stringify(socialLinksData))
    onClose()
  }

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title='Edit Social Links' maxWidth='580px'>
      {/* Layout Selector */}
      <SocialLayoutSelector selectedLayout={layoutType} onLayoutChange={handleLayoutChange} />

      {/* Social Link Inputs */}
      <SectionTitle>Your Social Links</SectionTitle>
      <LinksContainer>
        {/* First column of links */}
        <div>
          {links.slice(0, 4).map(link => (
            <SocialPlatformItem
              key={link.id}
              id={link.id}
              platform={link.platform}
              url={link.url}
              onChange={handleLinkChange}
              onClear={handleClearLink}
            />
          ))}
        </div>

        {/* Second column of links */}
        <div>
          {links.slice(4, 8).map(link => (
            <SocialPlatformItem
              key={link.id}
              id={link.id}
              platform={link.platform}
              url={link.url}
              onChange={handleLinkChange}
              onClear={handleClearLink}
            />
          ))}
        </div>
      </LinksContainer>

      {/* Action Buttons */}
      <ModalActions onCancel={onClose} onConfirm={handleSave} />
    </ModalBase>
  )
}
