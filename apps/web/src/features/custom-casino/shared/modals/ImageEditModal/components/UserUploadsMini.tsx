// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { createImageService } from '../../../services/imageService'
import { type StoredImage } from '../../../types/image.types'
import UserUploadsModal from '../../UserUploadsModal'
import { useActiveWallet } from '@/lib/privy/hooks'

// Tag color mapping
const TAG_COLORS = {
  'image-type': '#ffcd9e',    // peach
  'game-or-general': '#d900d5', // pink
  'element': '#410dff',        // blue
  'user-tag': '#4af5d3',       // aqua
}

// Determine tag type for styling
const getTagType = (tag: string): string => {
  const lowerTag = tag.toLowerCase()
  if (['icon', 'background', 'banner', 'asset'].includes(lowerTag)) return 'image-type'
  if (['bombs', 'general', 'casino', 'games'].includes(lowerTag)) return 'game-or-general'
  if (lowerTag.startsWith('user-')) return 'user-tag'
  return 'element'
}

// Tag Item Component
const TagItem: React.FC<{
  tag: string
  isSelected: boolean
  onClick: () => void
}> = ({ tag, isSelected, onClick }) => {
  const type = tag === 'all' ? 'element' : getTagType(tag)
  const color = TAG_COLORS[type as keyof typeof TAG_COLORS] || '#f1f1f1'

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-center leading-[1.5] min-w-auto w-auto',
        'bg-transparent text-white rounded py-0 px-[7px] text-[0.9em]',
        'cursor-pointer transition-all duration-200 select-none',
        'relative z-[1] border',
        'hover:brightness-105 active:scale-[0.98]'
      )}
      style={{ borderColor: color }}
    >
      <div
        className="absolute inset-0 rounded -z-[1]"
        style={{ backgroundColor: color, opacity: isSelected ? 1 : 0.5 }}
      />
      {tag}
    </div>
  )
}

interface UserUploadsMiniProps {
  onSelect: (imageUrl: string) => void
  publicAddress?: string
  /** Optional list of tags to filter by */
  allowedTags?: string[]
}

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
      <div className="w-auto rounded-lg border border-[#1b1d26] p-3 mt-4 bg-black/15">
        {/* Section Title */}
        <div className="text-base mb-3 text-white flex items-center justify-between">
          Uploads
          <div className="flex items-center justify-between">
            <button
              onClick={openUserUploadsModal}
              className="bg-transparent border-none text-[#aaaaaa] text-[0.8em] cursor-pointer py-1 px-2 rounded h-6 hover:bg-white/10"
            >
              Manage
            </button>
            <button
              onClick={fetchFiles}
              className="bg-transparent border-none text-[#aaaaaa] text-[0.8em] cursor-pointer py-1 px-2 rounded h-6 hover:bg-white/10"
            >
              <i className='fa fa-refresh' /> Refresh
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="w-[42px] h-[42px] border-2 border-white/10 border-t-[#410dff] rounded-full animate-spin mx-auto my-5" />
        ) : error ? (
          <div className="text-center py-[30px] text-white/60 text-[0.9em]">
            Error loading uploads. <button onClick={fetchFiles}>Try again</button>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-[30px] text-white/50 text-[0.9em]">
            No uploads found matching the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 mb-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-xs">
            {filteredImages.map(image => {
              const displayUrl = image.data.url

              return (
                <div
                  key={image.id}
                  onClick={() => handleSelect(image)}
                  className={cn(
                    'relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 bg-black/20',
                    selectedUrl === displayUrl
                      ? 'border border-[#410dff]'
                      : 'border border-white/10 hover:border-[#410dff99]'
                  )}
                >
                  <div className="h-[60px] w-full flex items-center justify-center [&_img]:max-w-full [&_img]:max-h-full [&_img]:object-contain">
                    <img src={displayUrl} alt={image.filename} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Tags Container */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {allTags.map(tag => (
            <TagItem
              key={tag}
              tag={tag}
              isSelected={selectedTag === tag}
              onClick={() => setSelectedTag(tag)}
            />
          ))}
        </div>
      </div>

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
