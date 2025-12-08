// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ModalBase } from '../shared/ModalBase'
import { ModalActions } from '../shared/ModalActions'
import UploadGrid from './components/UploadGrid'
import EmptyState from './components/EmptyState'
import useUserUploads from './hooks/useUserUploads'
import { useActiveWallet } from '@/lib/privy/hooks'

interface UserUploadsModalProps {
  isOpen: boolean
  onClose: () => void
  publicAddress?: string
  onSelect: (imageUrl: string) => void
  /** Optional list of tags to filter by – if not provided defaults will be used */
  allowedTags?: string[]
}

/**
 * Modal for browsing and selecting previously uploaded user images
 */
const UserUploadsModal: React.FC<UserUploadsModalProps> = ({
  isOpen,
  onClose,
  publicAddress: _publicAddress,
  onSelect,
  allowedTags = ['all', 'icon', 'background', 'asset'],
}) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string>('all')

  const { userFiles, isLoading, error, fetchUserFiles, deleteUserFile, refreshFiles } =
    useUserUploads()

  // Auth-based gating (addresses no longer required)
  const { readyAndAuth } = useActiveWallet() as any

  useEffect(() => {
    if (isOpen) {
      fetchUserFiles()
    }
  }, [isOpen, fetchUserFiles])

  // Filter files by tag
  const filteredFiles = userFiles.filter(file => {
    if (selectedTag === 'all') return true
    const fileTags = (file as any).tags || []
    return fileTags.includes(selectedTag)
  })

  // Handle selection
  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl)
  }

  // Handle delete
  const handleImageDelete = async (filename: string) => {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      await deleteUserFile(filename)

      // If the deleted image was selected, clear selection
      if (selectedImageUrl && selectedImageUrl.includes(filename)) {
        setSelectedImageUrl(null)
      }
    }
  }

  // Handle confirm button click
  const handleConfirm = () => {
    if (selectedImageUrl) {
      onSelect(selectedImageUrl)
      onClose()
    }
  }

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title='Your Uploaded Images'>
      {/* Modal Content */}
      <div className="my-4 min-h-[300px]">
        {!readyAndAuth ? (
          <div className="text-[#ef4444] p-4 text-center">
            Link a wallet to view uploads.
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-[#410dff] border-b-[#410dff] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-[#ef4444] p-4 text-center">
            Error loading your images: {error.message}
            <button
              onClick={refreshFiles}
              className="ml-3 underline hover:text-[#fca5a5]"
            >
              Try Again
            </button>
          </div>
        ) : filteredFiles.length === 0 ? (
          <EmptyState onRefresh={refreshFiles} />
        ) : (
          <UploadGrid
            files={filteredFiles}
            selectedUrl={selectedImageUrl}
            onSelect={handleImageSelect}
            onDelete={handleImageDelete}
          />
        )}
      </div>

      <ModalActions
        onCancel={onClose}
        onConfirm={handleConfirm}
        disabled={isLoading || !readyAndAuth}
        confirmDisabled={!selectedImageUrl}
        confirmText='Use Selected Image'
      />

      {/* Tag selector */}
      <div className="mt-3">
        <label className="text-xs mr-1.5">Filter:</label>
        <select
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
          className="py-1 px-1.5 text-xs bg-black/30 border border-white/20 rounded text-white"
        >
          {allowedTags.map(tag => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
    </ModalBase>
  )
}

export default UserUploadsModal
