// @ts-nocheck
import { useCallback } from 'react'
import { RealBackendService } from '../core/RealBackendService'

/**
 * Hook for real-time section management
 * Uses dedicated API endpoints for immediate updates
 */
export const useSectionManagement = () => {
  /**
   * Update games in a section
   * Called when GameSelectModal is accepted
   */
  const updateSectionGames = useCallback(async (
    userId: string,
    sectionId: string, 
    
    gameIds: string[]
  ) => {
    try {
      await RealBackendService.updateSectionGames(userId, sectionId, gameIds)
      // console.log('[useSectionManagement] Section games updated successfully')
      return true
    } catch (error) {
      console.error('[useSectionManagement] Failed to update section games:', error)
      return false
    }
  }, [])
  
  /**
   * Create a new section
   * Called when "Add Section" button is clicked
   */
  const createSection = useCallback(async (
    userId: string,
    title: string,
    layout: string = 'smallTiles'
  ) => {
    try {
      const sectionId = await RealBackendService.createSection(userId, title, layout)
      // console.log('[useSectionManagement] Section created with ID:', sectionId)
      return sectionId
    } catch (error) {
      console.error('[useSectionManagement] Failed to create section:', error)
      return null
    }
  }, [])
  
  /**
   * Delete a section
   * Called when "Delete Section" button is clicked
   */
  const deleteSection = useCallback(async (
    userId: string,
    sectionId: string
  ) => {
    try {
      await RealBackendService.deleteSection(userId, sectionId)
      // console.log('[useSectionManagement] Section deleted successfully')
      return true
    } catch (error) {
      console.error('[useSectionManagement] Failed to delete section:', error)
      return false
    }
  }, [])
  
  return {
    updateSectionGames,
    createSection,
    deleteSection
  }
}