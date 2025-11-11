// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react'
import { styled } from 'styled-components'
import { SPACING, TEXT_COLORS, BORDER_COLORS } from '@/design'
import { useGameStore } from './GameStoreContext'
import { ImageEditModal } from '@/components/CustomUserCasinos/shared/modals/ImageEditModal'
import { addAppNoti } from '@/store/useNotiStore'
import { GAME_ICONS } from '@/components/CustomUserCasinos/UserPage/GameSections/utils'
import { type AppGameName } from '@/chains/types'
import { SVGS } from '@/assets'

const SHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm}px;
  margin-bottom: ${SPACING.sm}px;
  padding-bottom: ${SPACING.sm}px;
  border-bottom: 1px solid ${BORDER_COLORS.one};
`

const SThumbnail = styled.div<{ $hasImage: boolean }>`
  width: 48px;
  height: 48px;
  background: transparent;
  border: 1px solid ${BORDER_COLORS.one};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    /* border-color: ${BORDER_COLORS.two}; */
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const SEditableTitle = styled.input`
  background: transparent;
  border: none;
  color: ${TEXT_COLORS.one};
  font-size: 20px;
  font-weight: 600;
  padding: ${SPACING.xs}px 0;
  flex: 1;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    cursor: text;
  }
`

interface EditPanelHeaderProps {
  gameType: string
}

export const EditPanelHeader: React.FC<EditPanelHeaderProps> = ({ gameType }) => {
  const gameName = useGameStore(state => state.gameName)
  const gameIcon = useGameStore(state => state.gameIcon)
  const updateGameName = useGameStore(state => state.updateGameName)
  const updateGameIcon = useGameStore(state => state.updateGameIcon)

  // Get the default icon for this game type
  const defaultIcon = GAME_ICONS[gameType as AppGameName] || SVGS.questionMarkIcon

  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(gameName)
  const [showImageModal, setShowImageModal] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTempName(gameName)
  }, [gameName])

  const handleNameClick = () => {
    if (!isEditingName) {
      setIsEditingName(true)
      setTimeout(() => {
        nameInputRef.current?.focus()
        nameInputRef.current?.select()
      }, 0)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(e.target.value)
  }

  const handleNameBlur = () => {
    const trimmedName = tempName.trim()
    if (trimmedName && trimmedName !== gameName) {
      updateGameName(trimmedName)
    } else {
      setTempName(gameName) // Reset to original if empty
    }
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      nameInputRef.current?.blur()
    } else if (e.key === 'Escape') {
      setTempName(gameName)
      setIsEditingName(false)
    }
  }

  const handleIconClick = () => {
    setShowImageModal(true)
  }

  const handleImageSave = (fieldName: string, value: string) => {
    // Extract URL from ImageData structure if needed
    let imageUrl = value
    try {
      const parsed = JSON.parse(value)
      if (parsed && parsed.url) {
        imageUrl = parsed.url
      }
    } catch {
      // If it's not JSON, use the value as-is
    }

    updateGameIcon(imageUrl)
    setShowImageModal(false)
    addAppNoti({ type: 'success', msg: 'Game icon updated' })
  }

  return (
    <>
      <SHeaderContainer>
        <SThumbnail $hasImage={!!gameIcon} onClick={handleIconClick} title='Click to set game icon'>
          <img
            src={gameIcon || defaultIcon}
            alt={`${gameName} icon`}
            onError={e => {
              // Fallback to default icon if custom icon fails to load
              if (gameIcon) {
                ;(e.target as HTMLImageElement).src = defaultIcon
              }
            }}
          />
        </SThumbnail>

        <SEditableTitle
          ref={nameInputRef}
          value={tempName}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          onClick={handleNameClick}
          readOnly={!isEditingName}
          maxLength={50}
        />
      </SHeaderContainer>

      {showImageModal && (
        <ImageEditModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          fieldName='gameIcon'
          onSave={handleImageSave}
          currentValue={gameIcon}
          title='Edit Game Icon'
          imageType='icon'
          contextKey='game'
          elementIdentifier={gameName}
          targetAspectRatio={1}
          cropShape='rect'
        />
      )}
    </>
  )
}
