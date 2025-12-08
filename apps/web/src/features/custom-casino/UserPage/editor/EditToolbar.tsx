import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { type ModalType } from '../editor/useEditStore'
import { type PageConfig } from '../../config/PageConfig'
import { EditButton, type EditButtonState } from './EditButton'
import { addAppNoti } from '@/store/useNotiStore'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Toolbar container
interface ToolbarContainerProps {
  isEditMode: boolean
  children: React.ReactNode
}

const ToolbarContainer: React.FC<ToolbarContainerProps> = ({ isEditMode, children }) => (
  <div
    className={cn(
      'h-fit w-16 rounded-xl flex flex-col items-center p-3 z-10 border transition-all duration-300',
      'max-sm:absolute max-sm:left-[10px] max-sm:top-[325px]',
      isEditMode
        ? 'bg-[rgba(20,20,20,0.85)] shadow-lg border-white/10 backdrop-blur-[5px]'
        : 'bg-[rgba(20,20,20,0.5)] shadow-md border-white/5 backdrop-blur-[3px]'
    )}
  >
    {children}
  </div>
)

// Toolbar section
const ToolbarSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col items-center w-full">{children}</div>
)

// Toolbar label
const ToolbarLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-xs text-[#aaa] mb-2 whitespace-nowrap text-center uppercase tracking-wide">
    {children}
  </div>
)

// Theme label with animation
const ThemeLabel: React.FC<{ children: React.ReactNode; isClosing: boolean }> = ({ children, isClosing }) => (
  <div
    className={cn(
      'text-xs text-[#aaa] mb-2 whitespace-nowrap text-center uppercase tracking-wide',
      isClosing ? 'animate-fade-out' : 'opacity-0 animate-fade-in [animation-delay:0.25s] [animation-fill-mode:forwards]'
    )}
  >
    {children}
  </div>
)

// Toolbar divider with animation
const ToolbarDivider: React.FC<{ isClosing: boolean }> = ({ isClosing }) => (
  <div
    className={cn(
      'w-full h-px bg-white/10 my-4',
      isClosing ? 'animate-fade-out' : 'opacity-0 animate-fade-in [animation-delay:0.15s] [animation-fill-mode:forwards]'
    )}
  />
)

// Theme section with animation
const ThemeSection: React.FC<{ children: React.ReactNode; isClosing: boolean }> = ({ children, isClosing }) => (
  <div
    className={cn(
      'w-full flex flex-col items-center overflow-hidden',
      isClosing
        ? 'animate-fade-out'
        : 'opacity-0 animate-fade-in [animation-delay:0.1s] [animation-fill-mode:forwards]'
    )}
  >
    {children}
  </div>
)

// Color controls container
const ColorControls: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col items-center gap-3 w-full">{children}</div>
)

// Color button with tooltip
interface ColorButtonProps {
  color: string
  onClick: () => void
  title: string
}

const ColorButton: React.FC<ColorButtonProps> = ({ color, onClick, title }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="flex flex-col items-center mb-3">
        <button
          onClick={onClick}
          className="w-8 h-8 rounded-full border-2 border-white/80 cursor-pointer transition-all duration-200 relative overflow-hidden my-2 hover:scale-110 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          style={{ backgroundColor: color || '#ffffff' }}
        >
          {/* Gradient overlay */}
          <span className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
        </button>
      </div>
    </TooltipTrigger>
    <TooltipContent side="right" className="bg-popover border-border">
      <p className="text-xs">{title}</p>
    </TooltipContent>
  </Tooltip>
)

// Font button with tooltip
interface FontButtonProps {
  onClick: () => void
  title: string
}

const FontButton: React.FC<FontButtonProps> = ({ onClick, title }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        className="w-8 h-8 rounded-full border-2 border-white/80 bg-[rgba(40,40,40,0.85)] cursor-pointer transition-all duration-200 relative overflow-hidden my-2 flex items-center justify-center text-white text-lg font-bold hover:scale-110 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
      >
        T
        {/* Gradient overlay */}
        <span className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="right" className="bg-popover border-border">
      <p className="text-xs">{title}</p>
    </TooltipContent>
  </Tooltip>
)

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
    <TooltipProvider>
      <ToolbarContainer isEditMode={visualEditMode || isClosing}>
        {/* Toggle Edit Mode */}
        <ToolbarSection>
          <ToolbarLabel>{getButtonLabel()}</ToolbarLabel>
          <EditButton
            onClick={handleEditButtonClick}
            state={
              isBackendLoading && saveState !== 'saving' && saveState !== 'saved'
                ? 'saving'
                : saveState
            }
            disabled={isBackendLoading || saveState === 'saving' || isClosing}
          />
        </ToolbarSection>

        {(isEditMode || isClosing) && (
          <>
            <ToolbarDivider isClosing={isClosing} />
            {/* Theme Color Controls */}
            <ThemeSection isClosing={isClosing}>
              <ThemeLabel isClosing={isClosing}>Theme</ThemeLabel>
              <ColorControls>
                <ColorButton
                  color={pageConfig.colors.themeColor1}
                  onClick={() => openColorModal('themeColor1')}
                  title="Primary Color"
                />
                <ColorButton
                  color={pageConfig.colors.themeColor2}
                  onClick={() => openColorModal('themeColor2')}
                  title="Secondary Color"
                />
                <ColorButton
                  color={pageConfig.colors.themeColor3}
                  onClick={() => openColorModal('themeColor3')}
                  title="Tertiary Color"
                />
              </ColorControls>
            </ThemeSection>

            <ToolbarDivider isClosing={isClosing} />
            {/* Font Selection */}
            <ThemeSection isClosing={isClosing}>
              <ThemeLabel isClosing={isClosing}>Font</ThemeLabel>
              <FontButton
                onClick={() => handleFontSelect(pageConfig.font)}
                title="Change Font"
              />
            </ThemeSection>
          </>
        )}
      </ToolbarContainer>
    </TooltipProvider>
  )
}
