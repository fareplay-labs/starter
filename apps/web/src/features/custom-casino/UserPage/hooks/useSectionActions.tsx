// @ts-nocheck
import { useCallback } from 'react'
import { useEditStore } from '../editor/useEditStore'
import { type CasinoEntity } from '../../shared/types'
import { useSectionManagement } from '../../backend/hooks/useSectionManagement'
import useNotiStore from '@/store/useNotiStore'

interface UseSectionActionsProps {
  casino: CasinoEntity | null
  handleEdit: (fieldName: string, fieldValue: string) => void
  userId: string
}

export const useSectionActions = ({ casino, handleEdit, userId }: UseSectionActionsProps) => {
  const { openModal } = useEditStore()
  const { createSection, deleteSection } = useSectionManagement()
  const addAppNoti = useNotiStore(state => state.addAppNoti)

  // Handle editing games for a section
  const handleEditGames = useCallback(
    (sectionId: string) => {
      if (!casino?.config) return

      // Open the game select modal with the section ID
      openModal('gameSelect', sectionId)
    },
    [casino, openModal]
  )

  // Handle creating a new section
  const handleCreateSection = useCallback(async () => {
    if (!casino?.config) return

    try {
      // Call the real-time API to create the section
      const sectionId = await createSection(userId, 'New Section', 'smallTiles')
      
      if (sectionId) {
        // Create the new section object with the real ID from the backend
        const newSection = {
          id: sectionId,
          title: 'New Section',
          gameIds: [],
          layout: 'smallTiles' as const,
        }

        // Update local state with the new section
        const updatedSections = [...casino.config.sections, newSection]
        handleEdit('sections', JSON.stringify(updatedSections))

        // Show success notification
        addAppNoti({
          type: 'success',
          msg: 'Section created successfully'
        })
      } else {
        // Show error notification
        addAppNoti({
          type: 'error',
          msg: 'Failed to create section'
        })
      }
    } catch (error) {
      console.error('Error creating section:', error)
      // Show error notification
      addAppNoti({
        type: 'error',
        msg: 'Failed to create section. Please try again.'
      })
    }
  }, [casino, handleEdit, userId, createSection, addAppNoti])

  // Handle changing layout for a section
  const handleSectionOrderChange = useCallback(
    (
      newSections: Array<{
        id: string
        title: string
        gameIds: string[]
        layout: 'carousel' | 'smallTiles' | 'largeTiles'
      }>
    ) => {
      if (!casino?.config) return
      // Save the new order to the config
      handleEdit('sections', JSON.stringify(newSections))
    },
    [casino, handleEdit]
  )

  // Handle deleting a section
  const handleDeleteSection = useCallback(async (sectionId: string) => {
    if (!casino?.config) return

    try {
      // Call the real-time API to delete the section
      const success = await deleteSection(userId, sectionId)
      
      if (success) {
        // Update local state by removing the section
        const updatedSections = casino.config.sections.filter(s => s.id !== sectionId)
        handleEdit('sections', JSON.stringify(updatedSections))

        // Show success notification
        addAppNoti({
          type: 'success',
          msg: 'Section deleted successfully'
        })
      } else {
        // Show error notification
        addAppNoti({
          type: 'error',
          msg: 'Failed to delete section'
        })
      }
    } catch (error) {
      console.error('Error deleting section:', error)
      // Show error notification
      addAppNoti({
        type: 'error',
        msg: 'Failed to delete section. Please try again.'
      })
    }
  }, [casino, handleEdit, userId, deleteSection, addAppNoti])

  return { handleEditGames, handleCreateSection, handleDeleteSection, handleSectionOrderChange }
}
