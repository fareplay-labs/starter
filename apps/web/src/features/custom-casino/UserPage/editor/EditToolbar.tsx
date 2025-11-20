// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { type ModalType } from '../editor/useEditStore'
import { type PageConfig } from '../../config/PageConfig'
import { EditButton, type EditButtonState } from './EditButton'
import { addAppNoti } from '@/store/useNotiStore'
import {
  SEditToolbar,
  SToolbarSection,
  SToolbarLabel,
  SThemeLabel,
  SToolbarDivider,
  SThemeSection,
  SColorControls,
  SColorButtonContainer,
  SColorButton,
  SFontLabel,
  SFontButton,
} from '../styles'

interface EditToolbarProps {
  isEditMode: boolean
  pageConfig: PageConfig
  toggleEditMode: () => void
  openModal: (modalType: ModalType, fieldName?: string) => void
  saveConfig?: () => Promise<void> // Now optional and async
  isBackendLoading?: boolean // Optional prop to track loading state from the backend
}

export const EditToolbar: React.FC<EditToolbarProps> = ({
  isEditMode,
  pageConfig,
  toggleEditMode,
  openModal,
  saveConfig,
  isBackendLoading = false,
}) => {
  // State to track save button state
  const [saveState, setSaveState] = useState<EditButtonState>(isEditMode ? 'active' : 'edit')
  // State to track if there was a save error
  const [_saveError, setSaveError] = useState<string | null>(null)
  // State to track if the toolbar is closing (for animation)
  const [isClosing, setIsClosing] = useState(false)
  // Track the visual edit mode state (for animation purposes)
  const [visualEditMode, setVisualEditMode] = useState(isEditMode)

  // Sync visual edit mode with actual edit mode when not closing
  useEffect(() => {
    if (!isClosing) {
      setVisualEditMode(isEditMode)
    }
  }, [isEditMode, isClosing])

  // Handle the actual mode toggle with delay for animations
  const handleModeToggle = () => {
    if (isEditMode) {
      // If we're in edit mode and want to exit, animate the closing first
      setIsClosing(true)
      // Set a timeout to match the animation duration before actually toggling
      setTimeout(() => {
        toggleEditMode()
        setIsClosing(false)
      }, 300) // Animation duration
    } else {
      // Entering edit mode - no delay needed
      toggleEditMode()
    }
  }

  // Open color edit modal
  const openColorModal = (colorKey: string) => {
    openModal('color', `colors.${colorKey}`)
  }

  // Handle font selection
  const handleFontSelect = (_fontFamily: string) => {
    openModal('font', 'font')
  }

  // Handle edit/save button click with state transitions
  const handleEditButtonClick = async () => {
    // Clear any previous errors
    setSaveError(null)

    if (isEditMode) {
      // If backend is already in a loading state, don't allow another save
      if (isBackendLoading) return

      // Set to saving state
      setSaveState('saving')

      try {
        // Start the closing animation but delay the actual toggle
        handleModeToggle()

        // If saveConfig is provided, execute it to save changes
        if (saveConfig) {
          await saveConfig()

          // Show saved state briefly
          setSaveState('saved')

          // Show success notification
          addAppNoti({
            type: 'success',
            msg: 'Changes saved successfully',
          })

          // Reset to edit state after a brief delay
          setTimeout(() => {
            setSaveState('edit')
          }, 800)
        } else {
          // If no saveConfig provided, just reset state
          setSaveState('edit')
        }
      } catch (error) {
        console.error('Error saving config:', error)
        // Set state to failed
        setSaveState('failed')
        // Store the error message
        const errorMessage = error instanceof Error ? error.message : 'Failed to save changes'
        setSaveError(errorMessage)

        // Show error notification with the specific error message
        addAppNoti({
          type: 'error',
          msg: errorMessage,
        })

        // Reset to edit state after a brief delay
        setTimeout(() => {
          setSaveState('edit')
        }, 1200)
      }
    } else {
      // Just toggle to edit mode
      handleModeToggle()
      setSaveState('active')
    }
  }

  // Get the label based on the current save state and backend loading state
  const getButtonLabel = () => {
    // If backend is loading but not from our save operation
    if (isBackendLoading && saveState !== 'saving' && saveState !== 'saved') {
      return 'Loading'
    }

    switch (saveState) {
      case 'active':
        return 'Save'
      case 'saving':
        return 'Saving'
      case 'saved':
        return 'Saved'
      case 'failed':
        return 'Failed'
      default:
        return 'Edit'
    }
  }

  return (
    <SEditToolbar $isEditMode={visualEditMode || isClosing}>
      {/* Toggle Edit Mode */}
      <SToolbarSection>
        <SToolbarLabel>{getButtonLabel()}</SToolbarLabel>
        <EditButton
          onClick={handleEditButtonClick}
          state={
            isBackendLoading && saveState !== 'saving' && saveState !== 'saved' ?
              'saving'
            : saveState
          }
          disabled={isBackendLoading || saveState === 'saving' || isClosing}
        />
      </SToolbarSection>

      {(isEditMode || isClosing) && (
        <div className={isClosing ? 'closing' : ''}>
          <SToolbarDivider />
          {/* Theme Color Controls */}
          <SThemeSection>
            <SThemeLabel>Theme</SThemeLabel>
            <SColorControls>
              <SColorButtonContainer>
                <SColorButton
                  $color={pageConfig.colors.themeColor1}
                  onClick={() => openColorModal('themeColor1')}
                  title='Primary Color'
                />
              </SColorButtonContainer>

              <SColorButtonContainer>
                <SColorButton
                  $color={pageConfig.colors.themeColor2}
                  onClick={() => openColorModal('themeColor2')}
                  title='Secondary Color'
                />
              </SColorButtonContainer>

              <SColorButtonContainer>
                <SColorButton
                  $color={pageConfig.colors.themeColor3}
                  onClick={() => openColorModal('themeColor3')}
                  title='Tertiary Color'
                />
              </SColorButtonContainer>
            </SColorControls>
          </SThemeSection>

          <SToolbarDivider />
          {/* Font Selection */}
          <SThemeSection>
            <SFontLabel>Font</SFontLabel>
            <SFontButton onClick={() => handleFontSelect(pageConfig.font)} title='Change Font'>
              T
            </SFontButton>
          </SThemeSection>

        </div>
      )}
    </SEditToolbar>
  )
}
