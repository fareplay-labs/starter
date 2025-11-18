// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { styled } from 'styled-components'
import { SPACING, FARE_COLORS, COLORS } from '@/design'
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

// Styled components
const SModalContent = styled.div`
  margin: ${SPACING.md}px 0;
  min-height: 300px;
`

const SLoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 16rem;
`

const SSpinner = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: ${FARE_COLORS.blue};
  border-bottom-color: ${FARE_COLORS.blue};
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const SErrorContainer = styled.div`
  color: ${COLORS.error};
  padding: ${SPACING.md}px;
  text-align: center;
`

const STryAgainButton = styled.button`
  margin-left: ${SPACING.sm}px;
  text-decoration: underline;

  &:hover {
    color: ${COLORS.softError};
  }
`

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
      <SModalContent>
        {!readyAndAuth ? (
          <SErrorContainer>
            Link a wallet to view uploads.
          </SErrorContainer>
        ) : isLoading ?
          <SLoadingContainer>
            <SSpinner />
          </SLoadingContainer>
        : error ?
          <SErrorContainer>
            Error loading your images: {error.message}
            <STryAgainButton onClick={refreshFiles}>Try Again</STryAgainButton>
          </SErrorContainer>
        : filteredFiles.length === 0 ?
          <EmptyState onRefresh={refreshFiles} />
        : <UploadGrid
            files={filteredFiles}
            selectedUrl={selectedImageUrl}
            onSelect={handleImageSelect}
            onDelete={handleImageDelete}
          />
        }
      </SModalContent>

      <ModalActions
        onCancel={onClose}
        onConfirm={handleConfirm}
        disabled={isLoading || !readyAndAuth}
        confirmDisabled={!selectedImageUrl}
        confirmText='Use Selected Image'
      />

      {/* Tag selector */}
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 12, marginRight: 6 }}>Filter:</label>
        <select
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
          style={{ padding: '4px 6px', fontSize: 12 }}
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
