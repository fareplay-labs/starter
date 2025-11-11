// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react'
import { styled } from 'styled-components'
import { BORDER_COLORS, FARE_COLORS, TEXT_COLORS } from '@/design'
import { TagItem } from '../styles/uploadSectionStyles'
import { createImageService } from '../../../services/imageService'
import { type StoredImage } from '../../../types/image.types'
import UserUploadsModal from '../../UserUploadsModal'
import { useActiveWallet } from '@/lib/privy/hooks'

interface UserUploadsMiniProps {
  onSelect: (imageUrl: string) => void
  publicAddress?: string
  /** Optional list of tags to filter by */
  allowedTags?: string[]
}

const Container = styled.div`
  width: auto;
  border-radius: 8px;
  border: 1px solid ${BORDER_COLORS.one};
  padding: 12px;
  margin-top: 16px;
  background-color: rgba(0, 0, 0, 0.15);
`

const SectionTitle = styled.div`
  font-size: 1em;
  margin-bottom: 12px;
  color: ${TEXT_COLORS.one};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ManagementSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ManagementButton = styled.button`
  background: none;
  border: none;
  color: ${TEXT_COLORS.two};
  font-size: 0.8em;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  height: 24px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${FARE_COLORS.blue}66;
    border-radius: 3px;
  }
`

const ItemContainer = styled.div<{ $isSelected: boolean }>`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${props => (props.$isSelected ? FARE_COLORS.blue : 'rgba(255, 255, 255, 0.1)')};
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: rgba(0, 0, 0, 0.2);

  &:hover {
    border: ${props =>
      props.$isSelected ? '1px solid ${FARE_COLORS.blue}' : `1px solid ${FARE_COLORS.blue}99`};
  }
`

const Thumbnail = styled.div`
  height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9em;
`

const LoadingSpinner = styled.div`
  width: 42px;
  height: 42px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: ${FARE_COLORS.blue};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`

const EmptyMsg = styled.div`
  text-align: center;
  padding: 30px 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9em;
`

const UserUploadsMini: React.FC<UserUploadsMiniProps> = ({
  onSelect,
  publicAddress,
  allowedTags = ['all', 'icon', 'background', 'banner', 'asset'],
}) => {
  const { walletAddress, privyWallet, externalWallet } = useActiveWallet() as any
  const canonical = (privyWallet?.address || externalWallet?.address || walletAddress || '').toLowerCase()
  const effectiveAddress = (publicAddress || canonical || '').toLowerCase()
  const [images, setImages] = useState<StoredImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [selectedTag, setSelectedTag] = useState('all')
  const [isUploadsModalOpen, setIsUploadsModalOpen] = useState(false)

  const imageService = createImageService()

  // Fetch user's uploaded images
  const fetchFiles = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const userImages = await imageService.getUserImages()
      setImages(userImages)
    } catch (err) {
      console.error('Error fetching user images:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch images'))
    } finally {
      setIsLoading(false)
    }
  }, [effectiveAddress])

  const openUserUploadsModal = () => {
    setIsUploadsModalOpen(true)
  }

  // Handle image selection from uploads modal
  const handleSelectUpload = (imageUrl: string) => {
    // Ensure the URL uses the proper CDN path if it's a relative path
    let fullImageUrl = imageUrl
    if (imageUrl.startsWith('uploads/')) {
      fullImageUrl = `https://fp-game-assets.nyc3.cdn.digitaloceanspaces.com/${imageUrl}`
    }

    setSelectedUrl(fullImageUrl)
    onSelect(fullImageUrl)
    setIsUploadsModalOpen(false)
  }

  // Load files on mount
  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // Filter images based on selected tag
  const filteredImages = images.filter(image => {
    if (selectedTag === 'all') return true
    const imageTags = image.data.tags || []
    return imageTags.includes(selectedTag)
  })

  // Extract all unique tags from images for the tag selector
  const imageTags = images.flatMap(image => image.data.tags || [])
  const uniqueImageTags = [...new Set(imageTags)].filter(tag => tag !== 'all') // Remove 'all' if it exists in image tags
  const allTags = ['all', ...uniqueImageTags]

  // Handle image selection
  const handleSelect = (image: StoredImage) => {
    const fullUrl = image.data.url
    setSelectedUrl(fullUrl)
    onSelect(fullUrl)
  }

  return (
    <>
      <Container>
        <SectionTitle>
          Uploads
          <ManagementSection>
            <ManagementButton onClick={openUserUploadsModal}>Manage</ManagementButton>
            <ManagementButton onClick={fetchFiles}>
              <i className='fa fa-refresh' /> Refresh
            </ManagementButton>
          </ManagementSection>
        </SectionTitle>

        {isLoading ?
          <LoadingSpinner />
        : error ?
          <EmptyState>
            Error loading uploads. <button onClick={fetchFiles}>Try again</button>
          </EmptyState>
        : filteredImages.length === 0 ?
          <EmptyMsg>No uploads found matching the selected filter.</EmptyMsg>
        : <GridContainer>
            {filteredImages.map(image => {
              const displayUrl = image.data.url

              return (
                <ItemContainer
                  key={image.id}
                  $isSelected={selectedUrl === displayUrl}
                  onClick={() => handleSelect(image)}
                >
                  <Thumbnail>
                    <img src={displayUrl} alt={image.filename} />
                  </Thumbnail>
                </ItemContainer>
              )
            })}
          </GridContainer>
        }

        <TagsContainer>
          {allTags.map(tag => (
            <TagItem
              key={tag}
              $isSelected={selectedTag === tag}
              $type={tag === 'all' ? 'element' : tag}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </TagItem>
          ))}
        </TagsContainer>
      </Container>

      {/* User Uploads Modal */}
      {isUploadsModalOpen && (
        <UserUploadsModal
          isOpen={isUploadsModalOpen}
          onClose={() => setIsUploadsModalOpen(false)}
          onSelect={handleSelectUpload}
          publicAddress={effectiveAddress || undefined}
        />
      )}
    </>
  )
}

export default UserUploadsMini
