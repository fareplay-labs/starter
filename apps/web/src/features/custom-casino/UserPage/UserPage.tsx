import React, { useEffect } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

// Components and Utilities
import { UserHeroSection } from './UserHeroSection/UserHeroSection'
import { GameSections } from './GameSections/GameSections'
import { EditModals } from '../shared/modals/EditModals'
import { EditToolbar } from './editor/EditToolbar'
import { useEditStore } from '@/features/custom-casino/UserPage/editor/useEditStore'
// Backend Integration
import { useBackendService } from '../backend/hooks'

import { applyFontToPage, usePreloadFonts } from '../shared/utils/fontUtils'
import { useThemeOverride } from '../shared/hooks'

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

// Layout components
interface PageContainerProps {
  fontFamily: string
  children: React.ReactNode
}

const PageContainer: React.FC<PageContainerProps> = ({ fontFamily, children }) => (
  <div
    className={cn(
      'h-[calc(100%-32px)] overflow-y-auto w-full scrollbar-thin',
      'max-[992px]:min-h-[calc(100%-32px)] max-[992px]:mx-auto',
      // Force child elements to inherit font
      '[&_button]:!font-inherit [&_input]:!font-inherit [&_textarea]:!font-inherit',
      '[&_select]:!font-inherit [&_h1]:!font-inherit [&_h2]:!font-inherit',
      '[&_h3]:!font-inherit [&_h4]:!font-inherit [&_h5]:!font-inherit',
      '[&_h6]:!font-inherit [&_p]:!font-inherit [&_span]:!font-inherit',
      '[&_div]:!font-inherit [&_a]:!font-inherit',
      '[&_.game-card]:!font-inherit [&_.section-title]:!font-inherit',
      '[&_.modal-content]:!font-inherit [&_.user-hero]:!font-inherit'
    )}
    style={{
      fontFamily: `${fontFamily} !important`,
    }}
  >
    {children}
  </div>
)

const UserPageGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div
    className={cn(
      'w-[95%] min-h-screen text-white p-0 pt-4 justify-center',
      'grid grid-cols-[auto_4fr] gap-6 mx-auto',
      'max-[992px]:flex',
      className
    )}
  >
    {children}
  </div>
)

const Content: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full min-w-0 max-w-[100vw] mx-auto max-[992px]:max-w-full">
    {children}
  </div>
)

const HeroLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative w-full mb-8">
    {children}
  </div>
)

const HeroMainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full">
    {children}
  </div>
)

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

  // Apply theme colors and font as CSS variables for site-wide theming
  // This propagates the custom casino's colors to all Tailwind/shadcn components
  useThemeOverride(casino?.config?.colors, casino?.config?.font)

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
      <PageContainer fontFamily={casino.config.font || 'Arial, Helvetica, sans-serif'}>
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
        <UserPageGrid className='user-page-content'>
          {/* Edit Toolbar */}
          <EditToolbar
            isEditMode={isEditMode}
            pageConfig={casino.config}
            toggleEditMode={toggleEditMode}
            openModal={openModal}
            saveConfig={saveConfig}
            isBackendLoading={isLoading}
          />{' '}
          <Content>
            {/* Hero layout with toolbar */}
            <HeroLayout>
              {/* Hero Section */}
              <HeroMainContent>
                <UserHeroSection
                  casino={casino}
                  isEditMode={isEditMode}
                  onEdit={handleEdit}
                  config={casino.config}
                />
              </HeroMainContent>
            </HeroLayout>
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

          </Content>
        </UserPageGrid>

        {/* Onboarding Modal */}
        <CreateCasinoModal
          isOpen={showOnboarding}
          onClose={closeOnboarding}
          username={userId}
        />
      </PageContainer>
    </PageWrapper>
  )
}
