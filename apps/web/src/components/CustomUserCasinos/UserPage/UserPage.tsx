// @ts-nocheck
import React, { useEffect } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'

// Components and Utilities
import { UserHeroSection } from './UserHeroSection/UserHeroSection'
import { GameSections } from './GameSections/GameSections'
import { EditModals } from '../shared/modals/EditModals'
import { EditToolbar } from './editor/EditToolbar'
import { useEditStore } from '@/components/CustomUserCasinos/UserPage/editor/useEditStore'
// Backend Integration
import { useBackendService } from '../backend/hooks'

// Styles
import { SUserPage, SContent, SHeroLayout, SHeroMainContent, SPageContainer } from './styles'

import { applyFontToPage, usePreloadFonts } from '../shared/utils/fontUtils'

// AI Integration
import { CreateCasinoModal } from '../shared/modals/CreateCasinoModal/CreateCasinoModal'
import { PageWrapper } from '@/pages/style'
import { LoadingUserPage } from './LoadingUserPage'

// Hooks
import { useCasinoData } from './hooks/useCasinoData'
import { useTransformedGames } from './hooks/useTransformedGames'
import { useEditModeToggle } from './hooks/useEditModeToggle'
import { useConfigEditor } from './hooks/useConfigEditor'
import { useConfigSaver } from './hooks/useConfigSaver'
import { useSectionActions } from './hooks/useSectionActions'
import { serializeSectionsForConfig } from './utils/SerializeSectionForConfig'

export const UserPage: React.FC = () => {
  const [searchParams, _setSearchParams] = useSearchParams()
  const { username } = useParams()
  const isEditMode = searchParams.get('mode') === 'edit'
  const userId = username ?? ''


  const {
    casino,
    setCasino,
    showOnboarding,
    setShowOnboarding,
  } = useCasinoData(userId)

  // Toggle edit mode function
  const { toggleEditMode } = useEditModeToggle()

  // Transform sections to include games array
  const transformedSections = useTransformedGames(casino)

  // Backend service integration
  const { isLoading } = useBackendService()

  // Access the edit store to manage edit state
  const { openModal } = useEditStore()


  // Save config to backend
  const { saveConfig } = useConfigSaver({ casino, userId, setCasino })

  // Handle edit for fields
  const { handleEdit } = useConfigEditor({ casino, setCasino })

  // Handle editing games for a section
  const { handleEditGames, handleCreateSection, handleSectionOrderChange, handleDeleteSection } =
    useSectionActions({
      casino,
      handleEdit,
      userId,
    })

  // Preload fonts when the component mounts - prevents flash of unstyled text
  usePreloadFonts(true)

  // Apply AI-generated casino configuration
  // When the font changes in the config, apply it to the page
  useEffect(() => {
    if (casino?.config?.font) {
      applyFontToPage(casino.config.font)
    }
  }, [casino?.config?.font])


  // Include this before the return statement
  const closeOnboarding = () => {
    setShowOnboarding(false)
  }

  // If config isn't loaded yet, show loading or use default casino data
  if (!casino?.config) {
    return <LoadingUserPage />
  }

  return (
    <PageWrapper className='custom-casino'>
      <SPageContainer $fontFamily={casino.config.font || 'Arial, Helvetica, sans-serif'}>
        <style id='dynamic-font-style'>{`
        /* Global font application */
        :root {
          --user-selected-font: ${casino.config.font || 'Arial, Helvetica, sans-serif'};
        }

        /* Ensure our font takes precedence, but exclude font selector buttons */
        .user-page-content, .user-page-content *:not(.font-selector-button) {
          font-family: ${casino.config.font || 'Arial, Helvetica, sans-serif'} !important;
        }
        .font-selector-button {
          /* Font selector buttons maintain their own fonts */
        }
      `}</style>
        <SUserPage className='user-page-content'>
          {/* Edit Toolbar */}
          <EditToolbar
            isEditMode={isEditMode}
            pageConfig={casino.config}
            toggleEditMode={toggleEditMode}
            openModal={openModal}
            saveConfig={saveConfig}
            isBackendLoading={isLoading}
          />{' '}
          <SContent>
            {/* Hero layout with toolbar */}
            <SHeroLayout>
              {/* Hero Section */}
              <SHeroMainContent>
                <UserHeroSection
                  casino={casino}
                  isEditMode={isEditMode}
                  onEdit={handleEdit}
                  config={casino.config}
                />
              </SHeroMainContent>
            </SHeroLayout>
            {/* Game Sections */}
            <GameSections
              sections={transformedSections}
              ownerUsername={casino.username}
              games={casino.games}
              isEditMode={isEditMode}
              themeColors={{
                themeColor1: casino.config.colors.themeColor1,
                themeColor2: casino.config.colors.themeColor2,
                themeColor3: casino.config.colors.themeColor3,
              }}
              onEdit={handleEdit}
              onSectionOrderChange={newSectionsWithGames => {
                handleSectionOrderChange(serializeSectionsForConfig(newSectionsWithGames))
              }}
              onAddSection={handleCreateSection}
              onAddGame={handleEditGames}
              onRemoveGame={(sectionId, gameId) => {
                // Find the section and remove the game
                if (!casino?.config) return

                // Create a deep copy of sections to avoid direct mutations
                const sectionsCopy = JSON.parse(JSON.stringify(casino.config.sections))

                // Type for section based on PageConfig
                type Section = {
                  id: string
                  title: string
                  gameIds: string[]
                  layout: 'carousel' | 'smallTiles' | 'largeTiles'
                }

                const sectionIndex = sectionsCopy.findIndex((s: Section) => s.id === sectionId)

                if (sectionIndex !== -1) {
                  // Create new gameIds array filtering out the removed game
                  sectionsCopy[sectionIndex].gameIds = sectionsCopy[sectionIndex].gameIds.filter(
                    (id: string) => id !== gameId
                  )
                  handleEdit('sections', JSON.stringify(sectionsCopy))
                }
              }}
              onRemoveSection={handleDeleteSection}
            />

            {/* Edit Modals */}
            <EditModals onSave={handleEdit} availableGames={casino.games} userId={userId} />

          </SContent>
        </SUserPage>

        {/* Onboarding Modal */}
        <CreateCasinoModal
          isOpen={showOnboarding}
          onClose={closeOnboarding}
          username={userId}
        />
      </SPageContainer>
    </PageWrapper>
  )
}
