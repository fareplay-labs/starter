// @ts-nocheck
import React from 'react'
import { useCardsGameStore } from '../store/CardsGameStore'
import { GameStoreContext } from '../../shared/CustomGamePage/GameStoreContext'
import { withStandardBackground } from '../../shared/backgrounds'
import { GameContainer } from '../../shared/LoadingComponents'
import { GameplayScene } from './GameplayScene'
import { useCardsSound } from '../hooks/useCardsSound'
import { useCardsBlockchainResult } from '../hooks/useCardsBlockchainResult'
import styled from 'styled-components'

// Use HOC to add background support to the shared GameContainer
const CardsGameContainerWithBackground = withStandardBackground(GameContainer, {
  overlay: {
    gradient: 'linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)',
    opacity: 1,
  },
})

const GameArea = styled.div`
  width: 100%;
  height: 100%;
  flex: 1 1 auto;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  position: relative;
  overflow: hidden;
  min-height: 0;
`

const SceneContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  position: relative;
  overflow: hidden;
  flex: 1;
`

export const CardsGame: React.FC = () => {
  // Get parameters from store like other games
  const { parameters } = useCardsGameStore(state => ({
    parameters: state.parameters,
  }))
  const store = useCardsGameStore()
  
  // Initialize sounds only once in the main component
  useCardsSound(true)
  
  // Hook automatically handles blockchain results when not in demo mode
  useCardsBlockchainResult()

  return (
    <GameStoreContext.Provider value={store}>
      <CardsGameContainerWithBackground
        backgroundColor={parameters?.background || '#1a1a2e'}
        data-testid='cards-game-container'
      >
        <GameArea>
          <SceneContainer>
            <GameplayScene 
              selectedPack={store.selectedPack ?? undefined}
            />
          </SceneContainer>
        </GameArea>
      </CardsGameContainerWithBackground>
    </GameStoreContext.Provider>
  )
}

export default CardsGame
