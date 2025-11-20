// @ts-nocheck
import React, { useEffect, useRef } from 'react'
import { type CustomCasinoGame } from '../types'
import { useEditStore, type ModalType, ID_TO_MODAL_TYPE } from '../../UserPage/editor/useEditStore'

// Import modals
import { ImageEditModal } from './ImageEditModal'
import LinkEditModal from './LinkEditModal'
import TextEditModal from './TextEditModal'
import ColorEditModal from './ColorEditModal'
import FontEditModal from './FontEditModal'
import { GameSelectModal } from './GameSelectModal'
import { SectionCreateModal } from './SectionCreateModal'
import { SocialsEditModal } from './SocialModal/SocialsEditModal'

interface EditModalsProps {
  onSave: (fieldName: string, value: string) => void
  availableGames?: CustomCasinoGame[]
  userId?: string
}

/**
 * Coordinator component for managing all edit modals
 * Uses Zustand store for state management
 */
export const EditModals: React.FC<EditModalsProps> = ({ onSave, availableGames = [], userId }) => {
  const { casinoConfig, activeModal, activeField, modalState, openModal, closeModal } =
    useEditStore()

  // Add a ref to track whether modals have been processed
  const processedModalRef = useRef<string | null>(null)

  // Get the current value for the field being edited
  const getCasinoConfigValue = (fieldName: string): string | undefined => {
    if (!casinoConfig || !fieldName) return undefined

    // Handle nested properties like socialLinks.discord
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.')
      if (parent === 'socialLinks' && casinoConfig.socialLinks) {
        // Check if the child is a direct property of socialLinks
        const value = casinoConfig.socialLinks[child as keyof typeof casinoConfig.socialLinks]
        if (typeof value === 'string') {
          return value
        }
        // If it's not a string (e.g., it's an array), return JSON string
        if (value !== undefined) {
          return JSON.stringify(value)
        }
      }
      if (parent === 'colors' && casinoConfig.colors) {
        return casinoConfig.colors[child as keyof typeof casinoConfig.colors]
      }
    }

    // Handle direct properties
    if (fieldName === 'font') {
      return casinoConfig.font
    }
    if (fieldName === 'title') {
      return casinoConfig.title
    }
    if (fieldName === 'description') {
      return casinoConfig.longDescription
    }
    if (fieldName === 'bannerImage') {
      const image = casinoConfig.bannerImage
      // Handle potential ImageCropData object
      return typeof image === 'object' && image !== null && 'url' in image ? image.url : image
    }
    if (fieldName === 'profileImage') {
      const image = casinoConfig.profileImage
      // Handle potential ImageCropData object
      return typeof image === 'object' && image !== null && 'url' in image ? image.url : image
    }

    return undefined
  }

  // Handle generic modal save logic
  const handleGenericModalSave = (fieldName: string, value: string) => {
    // Pass directly to the parent save handler
    onSave(fieldName, value)
  }

  // Handle section creation
  const handleSectionCreate = (_fieldName: string, value: string) => {
    try {
      // Value contains the new section data
      const newSection = JSON.parse(value)

      // Get existing sections
      const existingSections = casinoConfig?.sections || []

      // Add the new section
      const updatedSections = [...existingSections, ...newSection]

      // Save the updated sections
      onSave('sections', JSON.stringify(updatedSections))
    } catch (e) {
      console.error('Error creating section:', e)
    }
  }

  // TEMP: Determine image type based on fieldName as placeholder
  const determineImageType = (fieldName: string): string => {
    if (fieldName.toLowerCase().includes('profile')) return 'profile-picture'
    if (fieldName.toLowerCase().includes('banner')) return 'banner'
    if (fieldName.toLowerCase().includes('logo')) return 'logo'
    return 'general' // Default
  }

  // Helper to determine aspect ratio based on field name
  const determineAspectRatio = (fieldName: string): number => {
    const lowerCaseField = fieldName.toLowerCase()
    if (lowerCaseField.includes('profile')) return 1 // Profile pics are round (1:1)
    if (lowerCaseField.includes('banner')) return 5 / 1 // Compromise banner ratio
    if (lowerCaseField.includes('gamebackground')) return 16 / 9 // Example game background
    if (lowerCaseField.includes('square')) return 1 // Example square
    // Add more cases as needed
    return 16 / 5 // Default aspect ratio
  }

  // Listen for activeModal changes and open the appropriate modal
  useEffect(() => {
    // Prevent opening the same modal multiple times
    if (activeModal && processedModalRef.current !== `${activeModal}-${activeField}`) {
      processedModalRef.current = `${activeModal}-${activeField}`

      if (ID_TO_MODAL_TYPE[activeModal]) {
        // Convert legacy modal ID to new modal type
        const modalType = ID_TO_MODAL_TYPE[activeModal]
        openModal(modalType, activeField || undefined)
      }
    }
  }, [activeModal, activeField, openModal])

  // Helper for modal close handlers
  const handleCloseModal = (modalType: ModalType) => () => {
    closeModal(modalType)
  }

  return (
    <>
      {/* Image Edit Modal */}
      {modalState.imageModal.isOpen && (
        <ImageEditModal
          isOpen={true}
          onClose={handleCloseModal('image')}
          fieldName={modalState.imageModal.fieldName}
          onSave={onSave}
          currentValue={getCasinoConfigValue(modalState.imageModal.fieldName)}
          imageType={determineImageType(modalState.imageModal.fieldName)}
          contextKey={modalState.imageModal.fieldName}
          elementIdentifier={modalState.imageModal.fieldName}
          targetAspectRatio={determineAspectRatio(modalState.imageModal.fieldName)}
        />
      )}

      {/* Link Edit Modal */}
      {modalState.linkModal.isOpen && (
        <LinkEditModal
          isOpen={true}
          onClose={handleCloseModal('link')}
          fieldName={modalState.linkModal.fieldName}
          onSave={onSave}
          currentValue={getCasinoConfigValue(modalState.linkModal.fieldName)}
        />
      )}

      {/* Text Edit Modal */}
      {modalState.textModal.isOpen && (
        <TextEditModal
          isOpen={true}
          onClose={handleCloseModal('text')}
          fieldName={modalState.textModal.fieldName}
          onSave={onSave}
          currentValue={getCasinoConfigValue(modalState.textModal.fieldName)}
        />
      )}

      {/* Color Edit Modal */}
      {modalState.colorModal.isOpen && (
        <ColorEditModal
          isOpen={true}
          onClose={handleCloseModal('color')}
          fieldName={modalState.colorModal.fieldName}
          onSave={onSave}
          currentValue={getCasinoConfigValue(modalState.colorModal.fieldName)}
        />
      )}

      {/* Font Edit Modal */}
      {modalState.fontModal.isOpen && (
        <FontEditModal
          isOpen={true}
          onClose={handleCloseModal('font')}
          fieldName={modalState.fontModal.fieldName}
          onSave={onSave}
          currentValue={getCasinoConfigValue(modalState.fontModal.fieldName) || 'Arial, Helvetica, sans-serif'}
        />
      )}

      {/* Game Select Modal */}
      {modalState.gameSelectModal.isOpen && (
        <GameSelectModal
          isOpen={true}
          onClose={handleCloseModal('gameSelect')}
          onSave={handleGenericModalSave}
          selectedGames={modalState.gameSelectModal.selectedGames}
          availableGames={availableGames}
          sectionId={modalState.gameSelectModal.sectionId}
          currentLayout={modalState.gameSelectModal.currentLayout}
          userId={userId}
        />
      )}

      {/* Section Create Modal */}
      {modalState.sectionCreateModal.isOpen && (
        <SectionCreateModal
          isOpen={true}
          onClose={handleCloseModal('sectionCreate')}
          onSave={handleSectionCreate}
          title={modalState.sectionCreateModal.title}
          userId={userId}
        />
      )}

      {/* Socials Edit Modal */}
      {modalState.socialsModal.isOpen && (
        <SocialsEditModal
          isOpen={true}
          onClose={handleCloseModal('socials')}
          onSave={onSave}
          socialLinks={casinoConfig?.socialLinks}
        />
      )}
    </>
  )
}
