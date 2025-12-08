import React, { useState, useEffect } from 'react'
import { type SectionCreateModalProps } from './shared/modalTypes'
import { ModalBase } from './shared/ModalBase'
import { ModalActions } from './shared/ModalActions'
import { useSectionManagement } from '@/features/custom-casino/backend/hooks/useSectionManagement'

/**
 * Generates a unique section ID using a combination of timestamp and random string
 * This helps prevent collisions even if sections are created in quick succession
 */
const generateUniqueId = (): string => {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8) // 6 char random string
  return `section_${timestamp}_${randomStr}`
}

const SectionCreateModal: React.FC<SectionCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title: initialTitle = '',
  userId,
}) => {
  const [sectionTitle, setSectionTitle] = useState(initialTitle)
  const { createSection } = useSectionManagement()

  // Update local state when props change
  useEffect(() => {
    if (isOpen) {
      setSectionTitle(initialTitle)
    }
  }, [isOpen, initialTitle])

  const handleSave = async () => {
    // Create a new section with the current title
    if (sectionTitle.trim()) {
      // If we have a userId, use the real-time API
      if (userId) {
        try {
          // Call the real-time API to create the section
          const sectionId = await createSection(userId, sectionTitle, 'smallTiles')

          if (sectionId) {
            // Create the section data with the real ID from the backend
            const newSection = {
              id: sectionId,
              title: sectionTitle,
              gameIds: [],
              layout: 'smallTiles' as const,
            }

            // Update local state
            onSave('sections', JSON.stringify([newSection]))
          } else {
            console.error('[SectionCreateModal] Failed to create section via API')
          }
        } catch (error) {
          console.error('[SectionCreateModal] Error creating section:', error)
        }
      } else {
        // Fallback to local ID generation if no userId
        const sectionId = generateUniqueId()

        // Create the section data
        const newSection = {
          id: sectionId,
          title: sectionTitle,
          gameIds: [],
          layout: 'smallTiles' as const,
        }

        // We're creating a new section, so just pass the new section
        onSave('sections', JSON.stringify([newSection]))
      }

      onClose()
    }
  }

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title='Create New Section'>
      <div className="flex flex-col gap-3">
        <label htmlFor='section-title' className="text-[#aaaaaa] text-[0.9rem]">
          Section Title
        </label>
        <input
          id='section-title'
          type='text'
          placeholder='Enter section title'
          value={sectionTitle}
          onChange={e => setSectionTitle(e.target.value)}
          className="bg-[#1a1a1a] border border-[#2c3142] rounded-md text-white p-3 text-base w-full"
        />
      </div>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSave}
        confirmText='Create Section'
        disabled={!sectionTitle.trim()}
      />
    </ModalBase>
  )
}

export { SectionCreateModal }
