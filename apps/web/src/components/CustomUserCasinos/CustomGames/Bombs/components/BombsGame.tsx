// @ts-nocheck
import React, { memo, useEffect, useRef, useMemo } from 'react'
import { BombsGrid } from './BombsGrid'
import { FloatingMultiplier } from './FloatingMultiplier'
import { useBombsGameInitialization } from '../hooks/useBombsGameInitialization'
import { useBombsSound } from '../hooks/useBombsSound'
import { useBombsGameStore } from '../store/BombsGameStore'
import { useBombsBlockchainResult } from '../hooks/useBombsBlockchainResult'
import {
  Loading,
  Error,
  GameContainer,
} from '@/components/CustomUserCasinos/CustomGames/shared/LoadingComponents'
import { withStandardBackground } from '@/components/CustomUserCasinos/CustomGames/shared/backgrounds'

interface BombsGameProps {
  editorMode?: boolean
}

// Use HOC to add background support to the base GameContainer
const BombsGameContainerWithBackground = withStandardBackground(GameContainer, {
  overlay: {
    gradient: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)',
    opacity: 1,
  },
})

const BombsGame: React.FC<BombsGameProps> = memo(() => {
  const { isLoading, error, parameters } = useBombsGameInitialization()
  
  // Hook automatically handles blockchain results when not in demo mode
  useBombsBlockchainResult()
  
  // Convert flat parameters to nested structure for custom sounds
  const customSounds = useMemo(() => {
    if (!parameters) return undefined
    
    return {
      tileClick: parameters['customSounds.tileClick'],
      coinReveal: parameters['customSounds.coinReveal'],
      bombExplosion: parameters['customSounds.bombExplosion'],
      gameWin: parameters['customSounds.gameWin'],
      gameLoss: parameters['customSounds.gameLoss'],
    }
  }, [parameters])

  const bombsSound = useBombsSound(customSounds)

  // Track game state for sound effects
  const revealedCells = useBombsGameStore(state => state.revealedCells)
  const bombCells = useBombsGameStore(state => state.bombCells)
  const gameState = useBombsGameStore(state => state.gameState)
  const lastResult = useBombsGameStore(state => state.lastResult)
  const selectedTiles = useBombsGameStore(state => state.entry.side.selectedTiles)

  // Track previous values to detect changes
  const prevRevealedCount = useRef(0)
  const prevGameState = useRef(gameState)
  const prevSelectedTiles = useRef(selectedTiles.length)
  const consecutiveCoinCount = useRef(0)

  // Play sounds when tiles are revealed during the sequential reveal
  useEffect(() => {
    if (revealedCells.length > prevRevealedCount.current && gameState === 'PLAYING') {
      // A new tile was revealed, play appropriate sound
      const newlyRevealedTile = revealedCells[revealedCells.length - 1]
      const isBomb = bombCells.includes(newlyRevealedTile)

      if (isBomb) {
        bombsSound.playBombExplosion()
        consecutiveCoinCount.current = 0 // Reset consecutive count when bomb is hit
      } else {
        bombsSound.playCoinSound(consecutiveCoinCount.current)
        consecutiveCoinCount.current += 1
      }
    }
    prevRevealedCount.current = revealedCells.length
  }, [revealedCells, bombCells, gameState, bombsSound])

  // Play click sound when tiles are selected
  useEffect(() => {
    if (selectedTiles.length > prevSelectedTiles.current && gameState === 'IDLE') {
      bombsSound.playTileClick()
    }
    prevSelectedTiles.current = selectedTiles.length
  }, [selectedTiles, gameState, bombsSound])

  // Play win/loss sounds when game completes
  useEffect(() => {
    if (prevGameState.current === 'PLAYING' && gameState === 'SHOWING_RESULT' && lastResult) {
      if (lastResult.isWin) {
        bombsSound.playGameWin()
      } else {
        // Play loss sound during the particle explosion phase
        bombsSound.playGameLoss()
      }
    }
    prevGameState.current = gameState
  }, [gameState, lastResult, bombsSound])

  // Reset consecutive coin count when game starts
  useEffect(() => {
    if (gameState === 'PLAYING') {
      consecutiveCoinCount.current = 0
    }
  }, [gameState])

  if (isLoading) {
    return <Loading message='Loading bombs game configuration...' />
  }

  if (error) {
    return <Error error={error} />
  }

  return (
    <BombsGameContainerWithBackground
      backgroundColor={parameters.background}
      data-testid='bombs-game-container'
    >
      <FloatingMultiplier />
      <BombsGrid />
    </BombsGameContainerWithBackground>
  )
})

BombsGame.displayName = 'BombsGame'

export default BombsGame
