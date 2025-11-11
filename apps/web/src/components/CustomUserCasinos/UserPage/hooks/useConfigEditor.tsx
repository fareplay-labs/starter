// @ts-nocheck
import { useCallback } from 'react'
import { handleConfigEdit, type EditableField } from '../utils/UserPageUtils'
import { applyFontToPage } from '../../shared/utils/fontUtils'
import { useEditStore } from '../editor/useEditStore'
import { type IPageConfigData } from '../../config/PageConfig'
import { type CasinoEntity } from '../../shared/types'
import useNotiStore from '@/store/useNotiStore'
import { useAuth } from '@/hooks/useAuth'

interface UseConfigEditorProps {
  casino: CasinoEntity | null
  setCasino: React.Dispatch<React.SetStateAction<CasinoEntity | null>>
}

export const useConfigEditor = ({ casino, setCasino }: UseConfigEditorProps) => {
  // Access the edit store to manage edit state
  const { updateConfig: storeUpdateConfig } = useEditStore()
  const { user } = useAuth()
  const userId = user?.address?.toLowerCase()
  const addAppNoti = useNotiStore(state => state.addAppNoti)

  // Handle edit for fields
  const handleEdit = useCallback(
    async (fieldName: EditableField, fieldValue: string) => {
      if (!casino) return

      // Special handling for casino-level fields (not in config)
      if (fieldName === 'casino.games') {
        try {
          const newGames = JSON.parse(fieldValue)
          // Update the casino with new games array
          setCasino({
            ...casino,
            games: newGames,
            updatedAt: new Date().toISOString()
          })
          return
        } catch (error) {
          console.error('Failed to parse games data:', error)
          return
        }
      }

      // Check if this is a section field edit (title or layout)
      if (fieldName.startsWith('section.')) {
        const parts = fieldName.split('.')
        if (parts.length === 3) {
          const sectionId = parts[1]
          const field = parts[2] as 'title' | 'layout'
          
          // Update section via API immediately
          if (userId && (field === 'title' || field === 'layout')) {
            try {
              // Call the backend service directly
              const RealBackendService = (await import('@/components/CustomUserCasinos/backend/core/RealBackendService')).RealBackendService
              await RealBackendService.updateSection(userId, sectionId, { [field]: fieldValue })
              
              // Show success notification for title changes
              if (field === 'title') {
                addAppNoti({
                  type: 'success',
                  msg: 'Section title updated'
                })
              }
            } catch (error) {
              console.error(`Failed to update section ${field}:`, error)
              addAppNoti({
                type: 'error',
                msg: `Failed to update section ${field}`
              })
            }
          }
        }
      }

      // Handle config-level fields
      if (!casino.config) return

      // Use the correct field name and value format for updateConfig
      // This is a workaround for the type mismatch between EditableField and keyof IPageConfigData
      const newConfig = handleConfigEdit(casino.config, fieldName, fieldValue, (field, value) => {
        // Type assertion to match what updateConfig expects
        // This is safe because EditableField includes most of the keys in IPageConfigData
        storeUpdateConfig(field as keyof IPageConfigData | 'sections', value)
      })

      if (newConfig) {
        // Special handling for font changes to ensure immediate update
        if (fieldName === 'font') {
          applyFontToPage(fieldValue)
        }

        setCasino({
          ...casino,
          config: newConfig,
        })
      }
    },
    [casino, storeUpdateConfig, setCasino, userId, addAppNoti]
  )

  return { handleEdit }
}
