// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { type BaseGameParameters } from '../types'
import { GameBanner } from '../GameBanner/GameBanner'
import { EditPanel } from './EditPanel'
import { GameStoreProvider } from './GameStoreContext'
import { SoundProvider } from '@/components/CustomUserCasinos/shared/SoundSystem/SoundContext'
import { VolumeSlider, SVolumeSliderWrapper } from '@/components/CustomUserCasinos/shared/SoundSystem/VolumeSlider'
import { type AppGameName } from '@/chains/types'
import { type ImageData } from '../../../config/PageConfig'
import { PageWrapper } from '@/pages/style'
import { GameContractListener } from '@/components/CustomUserCasinos/Singletons/GameContractListener'
import {
  SBottomLeftPanel,
  SBottomPanelsContainer,
  SBottomRightPanel,
  SGamePageContainer,
  SLeftPanel,
  SMiddlePanel,
  SPanelContentContainer,
  SRightPanel,
  SThreePanelContainer,
} from './styled'
import { type CasinoEntity } from '@/components/CustomUserCasinos/shared/types'

interface CustomGamePageProps<T extends BaseGameParameters> {
  gameName: string
  GameComponent: React.ComponentType<{
    editorMode?: boolean
  }>
  FormComponent?: React.ComponentType<{
    editMode?: boolean
  }>
  GameRules?: React.ComponentType
  TestPanel?: React.ComponentType // Optional test panel
  useGameStore: any
  casinoName?: string
  bannerImage?: ImageData | string
  themeColor?: string
  editorMode?: boolean
  initialParameters?: Partial<T> | null
  gameType?: string
  parentCasino?: CasinoEntity | null
  instanceId?: string | null
}

function CustomGamePage<T extends BaseGameParameters>({
  gameName,
  GameComponent,
  FormComponent,
  GameRules,
  TestPanel,
  useGameStore,
  casinoName = 'Casino',
  bannerImage = '',
  themeColor,
  editorMode = false,
  initialParameters,
  gameType,
  parentCasino,
  instanceId,
}: CustomGamePageProps<T>) {
  const [isEditorVisible, setIsEditorVisible] = useState(editorMode)
  const store = useGameStore

  // Initialize store with loaded parameters
  useEffect(() => {
    if (
      store.getState().initializeParameters &&
      initialParameters &&
      Object.keys(initialParameters).length > 0
    ) {
      store.getState().initializeParameters(initialParameters as any)
    }
  }, [store, initialParameters])

  // Set casino context in store
  useEffect(() => {
    if (store.getState().setContext && parentCasino && instanceId) {
      store.getState().setContext(parentCasino, instanceId)
    }
  }, [store, parentCasino, instanceId])

  // Toggle editor visibility
  const toggleEditor = () => {
    setIsEditorVisible(prev => !prev)
  }

  return (
    <PageWrapper className='custom-casino'>
      <SoundProvider>
        <GameStoreProvider store={store}>
          <SGamePageContainer>
            <GameBanner
              bannerImage={bannerImage}
              casinoName={`${casinoName} - ${gameName}`}
              isEditMode={editorMode}
              themeColor={themeColor}
            />

            <SThreePanelContainer $isExpanded={isEditorVisible}>
              <SLeftPanel $isExpanded={isEditorVisible}>
                {gameType && (
                  <EditPanel
                    isEditorVisible={isEditorVisible}
                    toggleEditor={toggleEditor}
                    gameType={gameType as AppGameName}
                  />
                )}
              </SLeftPanel>

              <SMiddlePanel $isExpanded={isEditorVisible}>
                <GameComponent editorMode={isEditorVisible} />

                {/* Volume Slider - positioned relative to middle panel */}
                <SVolumeSliderWrapper>
                  <VolumeSlider />
                </SVolumeSliderWrapper>
              </SMiddlePanel>

              <SRightPanel $isExpanded={isEditorVisible}>
                {FormComponent && (
                  <SPanelContentContainer>
                    <FormComponent editMode={isEditorVisible} />
                  </SPanelContentContainer>
                )}
              </SRightPanel>
              <SBottomPanelsContainer $isExpanded={isEditorVisible}>
                <SBottomRightPanel $isExpanded={isEditorVisible}>
                  {GameRules && (
                    <SPanelContentContainer>
                      <GameRules />
                    </SPanelContentContainer>
                  )}
                </SBottomRightPanel>
                <SBottomLeftPanel $isExpanded={isEditorVisible}>
                  <SPanelContentContainer>
                    {TestPanel ?
                      <TestPanel />
                    : <div>
                        <h1>BET HISTORY</h1>
                      </div>
                    }
                  </SPanelContentContainer>
                </SBottomLeftPanel>
              </SBottomPanelsContainer>
            </SThreePanelContainer>
          </SGamePageContainer>
          {/* Ensure on-chain lifecycle hooks run for custom games */}
          <GameContractListener />
        </GameStoreProvider>
      </SoundProvider>
    </PageWrapper>
  )
}

export default CustomGamePage
