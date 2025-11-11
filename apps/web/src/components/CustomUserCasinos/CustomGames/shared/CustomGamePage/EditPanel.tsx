// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react'
import {
  EditButton,
  type EditButtonState,
} from '@/components/CustomUserCasinos/UserPage/editor/EditButton'
import { addAppNoti } from '@/store/useNotiStore'
import { useGameStore } from './GameStoreContext'
import { type BaseGameParameters } from '@/components/CustomUserCasinos/CustomGames/shared/types'
import GameParameterEditor from '@/components/CustomUserCasinos/CustomGames/shared/GameParameterEditor/GameParameterEditor'
import { AppGameName } from '@/chains/types'
import { SEditorButtonContainer, SEditorContent, SEditorPanel } from './styled'
import { EditPanelHeader } from './EditPanelHeader'
import { useActiveWallet } from '@/lib/privy/hooks/useActiveWallet'

// Interface for EditPanel props
interface EditPanelProps {
  isEditorVisible: boolean
  toggleEditor: () => void
  gameType: AppGameName
}

// Editor panel component
export const EditPanel: React.FC<EditPanelProps> = ({
  isEditorVisible,
  toggleEditor,
  gameType,
}) => {
  // Get wallet address from active wallet - using same pattern as ImageEditModal/SoundEditModal
  const { walletAddress, privyWallet, externalWallet } = useActiveWallet() as any
  const backendAddress = (privyWallet?.address || externalWallet?.address || walletAddress || '').toLowerCase()

  // Use individual selectors to avoid unnecessary re-renders
  const isSaving = useGameStore(state => state.isSaving)
  const parameters = useGameStore(state => state.parameters)
  const updateParameters = useGameStore(state => state.updateParameters)
  const saveCurrentConfig = useGameStore(state => state.saveCurrentConfig)
  const parentCasino = useGameStore(state => state.parentCasino)
  const instanceId = useGameStore(state => state.instanceId)

  const [shouldRenderContent, setShouldRenderContent] = useState(isEditorVisible)
  const [saveState, setSaveState] = useState<EditButtonState>(isEditorVisible ? 'active' : 'edit')
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (isEditorVisible) {
      setShouldRenderContent(true)
      setSaveState('active')
    } else {
      timer = setTimeout(() => {
        setShouldRenderContent(false)
      }, 250)
    }
    return () => clearTimeout(timer)
  }, [isEditorVisible])

  // Wrap handleModeToggle in useCallback for consistency, though less likely the cause
  const handleModeToggle = useCallback(() => {
    if (isEditorVisible) {
      setIsClosing(true)
      setTimeout(() => {
        toggleEditor()
        setIsClosing(false)
      }, 280)
    } else {
      toggleEditor()
    }
  }, [isEditorVisible, toggleEditor])

  // Wrap the save handler in useCallback to ensure it always uses the latest scope
  const handleEditButtonClick = useCallback(async () => {

    if (saveState === 'edit') {
      handleModeToggle()
    } else if (saveState === 'active') {
      if (isSaving) return

      if (!parentCasino?.id || !instanceId) {
        console.error('Missing data for saving: userId, instanceId, or gameType')
        addAppNoti({ type: 'error', msg: 'Cannot save: missing context.' })
        setSaveState('failed')
        setTimeout(() => setSaveState('active'), 2000)
        return
      }

      if (!saveCurrentConfig) {
        console.error('saveCurrentConfig function is not available in the store')
        addAppNoti({ type: 'error', msg: 'Cannot save: configuration function not available.' })
        setSaveState('failed')
        setTimeout(() => setSaveState('active'), 2000)
        return
      }

      setSaveState('saving')

      try {
        // Call the save action from the game store context
        const success = await saveCurrentConfig()

        if (success) {
          setSaveState('saved')
          addAppNoti({ type: 'success', msg: 'Game settings saved successfully' })
          setTimeout(() => {
            handleModeToggle() // Close panel on successful save
            setTimeout(() => setSaveState('edit'), 300) // Reset button state after animation
          }, 1000)
        } else {
          setSaveState('failed')
          addAppNoti({ type: 'error', msg: 'Failed to save game settings' })
          setTimeout(() => setSaveState('active'), 2000)
        }
      } catch (error) {
        console.error('Error saving game config:', error)
        setSaveState('failed')
        const errorMessage = error instanceof Error ? error.message : 'Error saving game settings'
        addAppNoti({ type: 'error', msg: errorMessage })
        setTimeout(() => setSaveState('active'), 2000)
      }
    }
  }, [saveState, isSaving, parentCasino, instanceId, saveCurrentConfig, handleModeToggle])

  return (
    <SEditorPanel $isExpanded={isEditorVisible || isClosing}>
      <SEditorButtonContainer>
        <EditButton state={saveState} onClick={handleEditButtonClick} />
      </SEditorButtonContainer>
      {shouldRenderContent && (
        <SEditorContent $isVisible={isEditorVisible && !isClosing}>
          <EditPanelHeader gameType={gameType} />
          {gameType && parameters && updateParameters ?
            <GameParameterEditor
              gameType={gameType}
              parameters={parameters as BaseGameParameters}
              onChange={updateParameters}
              userAddress={backendAddress || undefined}
              onSave={saveCurrentConfig}
            />
          : <div>Loading editor...</div>}
        </SEditorContent>
      )}
    </SEditorPanel>
  )
}
