// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { GameCard, GameSearchAndFilter, LayoutSelector, type LayoutType } from './index'
import { type CustomCasinoGame } from '../../types'
import { ModalBase } from '../shared/ModalBase'
import { ModalActions } from '../shared/ModalActions'
import { type GameSelectModalProps, type ThemeColors } from '../shared/modalTypes'
import { ConfirmationModal } from '../shared/ConfirmationModal'
import { useEditStore } from '@/features/custom-casino/UserPage/editor/useEditStore'
import { DEFAULT_GAMES } from '@/features/custom-casino/UserPage/GameSections/defaultGames'
import { useSectionManagement } from '@/features/custom-casino/backend/hooks/useSectionManagement'
import { useBackendService } from '@/features/custom-casino/backend/hooks'
import useNotiStore from '@/store/useNotiStore'
import {
  SmallTile,
  GameIcon,
} from '@/features/custom-casino/UserPage/GameSections/components'

/**
 * Modal for selecting games and layout for a section
 */
export const GameSelectModal: React.FC<GameSelectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  sectionId,
  selectedGames = [],
  availableGames,
  themeColors,
  currentLayout = 'carousel',
  userId,
}) => {
  // Use section management hook for real-time API updates
  const { updateSectionGames } = useSectionManagement()
  const { createGame } = useBackendService()
  const addAppNoti = useNotiStore(state => state.addAppNoti)

  /*
   * Separate basic games from user's customized games
   */
  const { basicGames, userGames } = useMemo(() => {
    // Basic games are the default templates
    const basicGamesList = DEFAULT_GAMES

    // User games are the ones passed via availableGames prop
    // These could include AI-generated versions or customized games
    const userGamesList = availableGames.sort((a, b) => {
      // Sort by order if it exists, then by name
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      if (a.order !== undefined) return -1
      if (b.order !== undefined) return 1
      return a.name.localeCompare(b.name)
    })

    return {
      basicGames: basicGamesList,
      userGames: userGamesList,
    }
  }, [availableGames])

  // State for selected games, layout, and search term
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>(selectedGames)
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>(currentLayout as LayoutType)
  const [searchTerm, setSearchTerm] = useState('')

  // State for tracking which basic games are being created
  const [creatingGames, setCreatingGames] = useState<Record<string, 'loading' | 'success'>>({})
  const [localUserGames, setLocalUserGames] = useState<CustomCasinoGame[]>(userGames)
  const [confirmDelete, setConfirmDelete] = useState<{ gameId: string; gameName: string } | null>(null)

  // Track if we just created a game (to prevent selection reset)
  const justCreatedGameIdRef = useRef<string | null>(null)

  // Initialize selected games when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      // If we just created a game, don't reset the selection
      if (justCreatedGameIdRef.current) {
        // Clear the flag for next time
        justCreatedGameIdRef.current = null
      } else {
        // Normal initialization from props
        setSelectedGameIds(selectedGames)
      }
      setSelectedLayout(currentLayout as LayoutType)
    }
  }, [isOpen, sectionId, selectedGames, currentLayout])

  // Reset search term when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      setCreatingGames({})
    }
  }, [isOpen])

  // Update local user games when prop changes
  useEffect(() => {
    setLocalUserGames(userGames)
  }, [userGames])

  // Filter games based on search term
  const filteredUserGames = localUserGames.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle creating a new game from basic template
  const handleCreateGame = async (template: CustomCasinoGame) => {
    if (!userId) {
      addAppNoti({
        type: 'error',
        msg: 'Cannot create game: User ID not available'
      })
      return
    }

    // Set loading state
    setCreatingGames(prev => ({ ...prev, [template.id]: 'loading' }))

    try {
      // Create the game in the backend using the hook
      const newGame = await createGame(userId, template.type, template.name)

      if (!newGame) {
        throw new Error('Failed to create game')
      }

      // Add the new game to local state with the real backend ID
      const gameWithDetails: CustomCasinoGame = {
        ...template,
        id: newGame.id, // Use the real backend ID
        name: newGame.name,
        type: newGame.type as any,
        order: localUserGames.length + 1,
      }

      setLocalUserGames(prev => [...prev, gameWithDetails])

      // Auto-select the newly created game
      setSelectedGameIds(prev => [...prev, gameWithDetails.id])

      // Mark that we just created this game to prevent selection reset
      justCreatedGameIdRef.current = gameWithDetails.id

      // Update the parent's available games list
      const updatedGamesList = [...availableGames, gameWithDetails]
      onSave('casino.games', JSON.stringify(updatedGamesList))

      // Set success state
      setCreatingGames(prev => ({ ...prev, [template.id]: 'success' }))

      // Show success notification
      addAppNoti({
        type: 'success',
        msg: `Created new ${template.name} game`
      })

      // Clear success state after a delay
      setTimeout(() => {
        setCreatingGames(prev => {
          const next = { ...prev }
          delete next[template.id]
          return next
        })
      }, 1500)

    } catch (error) {

      // Remove loading state on error
      setCreatingGames(prev => {
        const next = { ...prev }
        delete next[template.id]
        return next
      })

      // Show error notification
      addAppNoti({
        type: 'error',
        msg: `Failed to create game: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  // Handle game selection toggle
  const handleGameToggle = (gameId: string) => {
    setSelectedGameIds(prevSelected => {
      // Check if game is already selected
      if (prevSelected.includes(gameId)) {
        // Remove the game from selection
        return prevSelected.filter(id => id !== gameId)
      } else {
        // Make sure we don't add duplicates
        if (!prevSelected.includes(gameId)) {
          return [...prevSelected, gameId]
        }
        // If it was already included (shouldn't happen but just in case), return unchanged
        return prevSelected
      }
    })
  }

  // Handle layout selection
  const handleLayoutChange = (layout: LayoutType) => {
    setSelectedLayout(layout)
  }

  // Handle search term change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  // Handle game deletion
  const handleDeleteGame = async (gameId: string) => {
    const game = localUserGames.find(g => g.id === gameId)
    if (!game) return

    // Show confirmation
    setConfirmDelete({ gameId, gameName: game.name })
  }

  // Confirm deletion
  const confirmDeleteGame = async () => {
    if (!confirmDelete) return

    try {
      // Call the DELETE API endpoint if we have a userId
      if (userId) {
        try {
          const BackendService = (await import('@/features/custom-casino/backend/core/BackendService')).BackendService
          await BackendService.deleteGameFromCasino(userId, confirmDelete.gameId)

          addAppNoti({
            type: 'success',
            msg: `${confirmDelete.gameName} deleted successfully`
          })
        } catch (error) {
          console.error('Failed to delete game:', error)
          addAppNoti({
            type: 'error',
            msg: 'Failed to delete game'
          })
          return // Don't update local state if API call failed
        }
      }

      // Remove from local state (only after successful API call or if no userId)
      setLocalUserGames(prev => prev.filter(g => g.id !== confirmDelete.gameId))

      // Remove from selected games if it was selected
      setSelectedGameIds(prev => prev.filter(id => id !== confirmDelete.gameId))

      // Update the parent games list
      const updatedGamesList = availableGames.filter(g => g.id !== confirmDelete.gameId)
      onSave('casino.games', JSON.stringify(updatedGamesList))

      // Close confirmation
      setConfirmDelete(null)
    } catch (error) {
      console.error('Error in confirmDeleteGame:', error)
    }
  }

  // Handle save button click
  const handleSave = async () => {
    // WORKAROUND: Filter out temporary IDs that haven't been saved to backend
    // TODO: Remove temp_ check once frontend/backend ID sync is reliable
    const validGameIds = selectedGameIds.filter(id =>
      !id.startsWith('temp_') &&
      id.length > 0 &&
      localUserGames.some(game => game.id === id)
    )

    // If we have a userId, use the real-time API
    if (userId) {
      try {
        // Call the real-time API to update section games
        const success = await updateSectionGames(userId, sectionId, validGameIds)

        if (!success) {
          addAppNoti({
            type: 'error',
            msg: 'Failed to update section games'
          })
        }
      } catch (error) {
        addAppNoti({
          type: 'error',
          msg: 'Error updating section games'
        })
      }
    }

    // Also update the local state for immediate UI feedback
    const { casinoConfig } = useEditStore.getState()

    if (casinoConfig?.sections) {
      // Create a deep copy of the sections
      const sectionsCopy = JSON.parse(JSON.stringify(casinoConfig.sections))

      // Find the section we're updating
      const sectionIndex = sectionsCopy.findIndex((s: any) => s.id === sectionId)

      if (sectionIndex !== -1) {
        // Update game IDs for the section (use validated IDs)
        sectionsCopy[sectionIndex].gameIds = validGameIds

        // Always update the layout with the currently selected value
        const oldLayout = sectionsCopy[sectionIndex].layout
        sectionsCopy[sectionIndex].layout = selectedLayout

        // If layout has changed, update it via API
        if (userId && oldLayout !== selectedLayout) {
          try {
            const BackendService = (await import('@/features/custom-casino/backend/core/BackendService')).BackendService
            await BackendService.updateSection(userId, sectionId, { layout: selectedLayout })
          } catch (error) {
            console.error('Failed to update section layout:', error)
            addAppNoti({
              type: 'error',
              msg: 'Failed to update section layout'
            })
          }
        }

        // Save all sections at once - this matches what UserPage expects
        onSave('sections', JSON.stringify(sectionsCopy))
      } else {
      }
    } else {
    }

    onClose()
  }

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title='Select Games' maxWidth='800px'>
      {/* Layout Selection */}
      <LayoutSelector
        selectedLayout={selectedLayout}
        onLayoutChange={handleLayoutChange}
        themeColor={themeColors?.themeColor1 || '#ff5e4f'}
      />

      {/* New Basic Game Section */}
      <div className="mb-6">
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: themeColors?.themeColor1 || '#ffffff' }}
        >
          New Basic Game
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-xs">
          {basicGames.map((game, _index) => {
            const gameState = creatingGames[game.id]
            const isDisabled = gameState === 'loading' || gameState === 'success'

            return (
              <div key={game.id} className="w-20 h-20 flex-shrink-0">
                <SmallTile
                  onClick={() => !isDisabled && handleCreateGame(game)}
                  $borderColor={themeColors?.themeColor1}
                  $hoverColors={{
                    secondary: themeColors?.themeColor2 || '#ff7a6e',
                    tertiary: themeColors?.themeColor3 || '#ff9c92',
                  }}
                  style={{
                    background: 'rgba(10, 10, 10, 0.65)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.8 : 1,
                  }}
                  aria-label={`Create new ${game.name}`}
                  role='button'
                >
                  {gameState === 'loading' ? (
                    <div className="w-6 h-6 border-[3px] border-white/10 border-t-white/80 rounded-full animate-spin" />
                  ) : gameState === 'success' ? (
                    <div
                      className="w-6 h-6 relative after:content-['✓'] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:text-xl after:font-bold"
                      style={{ color: themeColors?.themeColor1 || '#4CAF50' }}
                    />
                  ) : (
                    <GameIcon
                      icon={game.icon}
                      type={game.type}
                      size='small'
                      alt={`${game.name} icon`}
                    />
                  )}
                </SmallTile>
              </div>
            )
          })}
        </div>
      </div>

      {/* Your Games Section */}
      <div className="mb-6">
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: themeColors?.themeColor1 || '#ffffff' }}
        >
          Your Games
        </h3>

        {/* Search and Filter */}
        <GameSearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          totalCount={localUserGames.length}
          filteredCount={filteredUserGames.length}
          selectedCount={selectedGameIds.filter(id => localUserGames.some(g => g.id === id)).length}
          showCounts={true}
        />

        {/* Your Games Grid */}
        {filteredUserGames.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            <div
              className="grid grid-cols-4 gap-3 max-[992px]:grid-cols-3 max-[640px]:grid-cols-2 max-[640px]:gap-2"
              role='listbox'
              aria-label='Your games'
              aria-multiselectable='true'
            >
              {filteredUserGames.map(game => {
                // Define a default theme object that conforms to ThemeColors
                const defaultFullTheme: ThemeColors = {
                  themeColor1: '#ff5e4f',
                  themeColor2: '#ff7a6e',
                  themeColor3: '#ff9c92',
                  backgroundColor: '#0a0a0a',
                }

                const cardThemeColors: ThemeColors =
                  themeColors ?
                    {
                      themeColor1: themeColors.themeColor1,
                      themeColor2: themeColors.themeColor2 ?? defaultFullTheme.themeColor2,
                      themeColor3: themeColors.themeColor3 ?? defaultFullTheme.themeColor3,
                    }
                  : defaultFullTheme

                return (
                  <GameCard
                    key={game.id}
                    id={game.id}
                    name={game.name}
                    icon={game.icon}
                    type={game.type}
                    isSelected={selectedGameIds.includes(game.id)}
                    themeColors={cardThemeColors}
                    onClick={handleGameToggle}
                    onDelete={handleDeleteGame}
                  />
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center p-10 text-white/50">
            {searchTerm ? 'No games found matching your search' : 'No custom games available yet'}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSave}
        confirmText={`Accept (${selectedGameIds.length})`}
      />

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteGame}
        title='Delete Game'
        message={`Are you sure you want to delete "${confirmDelete?.gameName}"? This game will be removed from all sections.`}
        confirmText='Delete'
        cancelText='Cancel'
        confirmButtonVariant='danger'
      />
    </ModalBase>
  )
}
