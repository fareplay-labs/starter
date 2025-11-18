// @ts-nocheck
import React, { useMemo, useCallback, useRef, useEffect, useState, memo } from 'react'
import { useBombsGrid } from '../hooks/useBombsGrid'
import { styled } from 'styled-components'
import { type TileShape } from '../types'
import CroppedImage from '../../../shared/ui/CroppedImage'
import { BombParticles } from './BombParticles'
import { createBackgroundValue, isImageValue } from '../../shared/utils/backgroundUtils'

interface GridContainerProps {
  $spacing: number
}

const GridWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
`

interface ScaledContainerProps {
  $scale: number
}

const ScaledContainer = styled.div<ScaledContainerProps>`
  transform: scale(${props => props.$scale});
  transform-origin: center;
  position: relative;
`

const GridContainer = styled.div<GridContainerProps>`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${props => props.$spacing}px;
  padding: 16px;
  width: max-content;
  position: relative;
  overflow: visible;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`

const ImageBackground = styled(CroppedImage)`
  position: relative;
  display: flex;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`

interface TileProps {
  $isRevealed: boolean
  $isSelected: boolean
  $isBomb: boolean
  $tileColor: string
  $selectedColor: string
  $bombColor: string
  $safeColor: string
  $tileShape: TileShape
  $size: number
  $borderColor: string
  $selectedBorderColor: string
  $winColor: string
  $lossColor: string
  $gameState: string
  $tileIndex: number
}

const TileContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: inherit;
  user-select: none;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
`

const Tile = styled.button<TileProps>`
  aspect-ratio: 1;
  width: ${props => props.$size}px;
  border: 2px solid
    ${props => {
      // Game is over and showing results
      if (props.$gameState === 'SHOWING_RESULT') {
        if (props.$isBomb) {
          return props.$lossColor // Bomb tiles always show loss color
        }
        return props.$winColor // Non-bomb tiles show win color
      }

      // During gameplay
      if (props.$isRevealed) {
        return props.$isBomb ? props.$lossColor : props.$winColor
      }
      if (props.$isSelected) {
        return props.$selectedBorderColor
      }
      return props.$borderColor
    }};
  padding: 0px;
  user-select: none;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  background: ${props => {
    // During reset animation, maintain the revealed state until animation completes
    const isResetting = props.$gameState === 'RESETTING'
    const showRevealed =
      (props.$isRevealed || props.$gameState === 'SHOWING_RESULT') && !isResetting

    const color =
      showRevealed ?
        props.$isBomb ?
          props.$bombColor
        : props.$safeColor
      : props.$isSelected ? props.$selectedColor
      : props.$tileColor
    return !isImageValue(color) ? createBackgroundValue(color) : 'transparent'
  }};
  cursor: ${props => (props.$isRevealed ? 'default' : 'pointer')};
  transition: all 0.3s ease;
  border-radius: ${props => {
    switch (props.$tileShape) {
      case 'square':
        return '4px'
      case 'round':
        return '50%'
      default:
        return 'none'
    }
  }};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => Math.max(16, props.$size / 2)}px;
  overflow: visible;

  /* Selection pulse animation */
  ${props => props.$isSelected && !props.$isRevealed && `
    animation: selectPulse 0.3s ease-out;
    @keyframes selectPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
  `}

  /* Flip animation for reveal and reset */
  ${props => {
    if (props.$gameState === 'RESETTING') {
      // Reset animation with wave effect based on tile position
      const row = Math.floor(props.$tileIndex / 5)
      const col = props.$tileIndex % 5
      const delay = (row + col) * 0.03 // Wave from top-left to bottom-right
      return `
        animation: flipOut 0.4s ease ${delay}s forwards;
        @keyframes flipOut {
          from { transform: rotateY(90deg); opacity: 0; }
          to { transform: rotateY(0deg); opacity: 1; }
        }
      `
    } else if (props.$isRevealed || props.$gameState === 'SHOWING_RESULT') {
      // Reveal animation (flipping forward)
      return `
        animation: flipIn 0.4s ease forwards;
        @keyframes flipIn {
          from { transform: rotateY(90deg); opacity: 0; }
          to { transform: rotateY(0deg); opacity: 1; }
        }
      `
    }
  }}

  &:hover {
    transform: ${props => (props.$isRevealed ? 'none' : 'scale(1.02)')};
    opacity: ${props => !props.$isRevealed && '0.9'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`

/**
 * Simplified tile component with pre-calculated properties
 * Uses enhanced tile data to eliminate redundant calculations
 */
interface BombsTileProps {
  tile: {
    index: number
    isRevealed: boolean
    isSelected: boolean
    isBomb: boolean
    mainParticleVisible: boolean
    explosionParticleVisible: boolean
    additionalParticleVisible: boolean
  }
  gridConfig: {
    parameters: any
    gameState: string
    handleTileClick: (index: number) => void
    handleMouseDown: (index: number) => void
    handleMouseEnter: (index: number) => void
    handleMouseUp: () => void
    isDragging: boolean
  }
}

const BombsTile = memo<BombsTileProps>(({ tile, gridConfig }) => {
  const { parameters, gameState, handleMouseDown } = gridConfig
  const {
    index,
    isRevealed,
    isSelected,
    isBomb,
    mainParticleVisible,
    explosionParticleVisible,
    additionalParticleVisible,
  } = tile

  // Memoized background calculation
  const tileBackground = useMemo(() => {
    const isResetting = gameState === 'RESETTING'
    const showRevealed = (isRevealed || gameState === 'SHOWING_RESULT') && !isResetting

    const backgroundValue =
      showRevealed ?
        isBomb ? parameters.bombColor
        : parameters.safeColor
      : isSelected ? parameters.selectedTileColor
      : parameters.tileColor

    if (isImageValue(backgroundValue)) {
      return <ImageBackground imageData={backgroundValue} alt='' />
    }
    return null
  }, [
    isRevealed,
    isSelected,
    isBomb,
    gameState,
    parameters.bombColor,
    parameters.safeColor,
    parameters.selectedTileColor,
    parameters.tileColor,
  ])

  // Memoized event handlers
  const handleMouseDownEvent = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      handleMouseDown(index)
    },
    [index, handleMouseDown]
  )

  return (
    <Tile
      $isRevealed={isRevealed}
      $isSelected={isSelected}
      $isBomb={isBomb}
      $tileColor={parameters.tileColor}
      $selectedColor={parameters.selectedTileColor}
      $bombColor={parameters.bombColor}
      $safeColor={parameters.safeColor}
      $tileShape={parameters.tileShape}
      $size={parameters.tileSize}
      $borderColor={parameters.borderColor}
      $selectedBorderColor={parameters.selectedBorderColor}
      $winColor={parameters.winColor}
      $lossColor={parameters.lossColor}
      $gameState={gameState}
      $tileIndex={index}
      onMouseDown={handleMouseDownEvent}
      disabled={gameState !== 'IDLE'}
    >
      <TileContent>{tileBackground}</TileContent>
      {parameters.particleEffects !== 'none' && (
        <>
          {/* Main reveal particles */}
          <BombParticles
            isVisible={mainParticleVisible}
            color={isBomb ? parameters.lossColor : parameters.winColor}
            tileSize={parameters.tileSize}
            tileShape={parameters.tileShape as TileShape}
            particleCount={isBomb ? 32 : 12}
            isExplosion={isBomb}
            effectConfig={
              isBomb ?
                {
                  sizeMultiplier: 1.0,
                  speedMultiplier: 0.8,
                  distanceMultiplier: 1.5,
                  rotationMultiplier: 1.2,
                  burstIntensity: 1.3,
                }
              : undefined
            }
          />
          {/* Big explosion for selected bomb tiles */}
          {explosionParticleVisible && (
            <BombParticles
              isVisible={true}
              color={parameters.lossColor}
              tileSize={parameters.tileSize}
              tileShape={parameters.tileShape as TileShape}
              particleCount={48}
              isExplosion={true}
              effectConfig={{
                sizeMultiplier: 1.2,
                speedMultiplier: 0.7,
                distanceMultiplier: 1.5,
                rotationMultiplier: 1.5,
                burstIntensity: 2,
              }}
            />
          )}
          {/* Additional particles for 'more' effect */}
          {additionalParticleVisible && (
            <BombParticles
              isVisible={true}
              color={isBomb ? parameters.lossColor : parameters.winColor}
              tileSize={parameters.tileSize * 0.6}
              tileShape={parameters.tileShape as TileShape}
              particleCount={isBomb ? 16 : 8}
              isExplosion={isBomb}
              effectConfig={
                isBomb ?
                  {
                    sizeMultiplier: 0.9,
                    speedMultiplier: 0.9,
                    distanceMultiplier: 1.2,
                    burstIntensity: 1.2,
                  }
                : undefined
              }
            />
          )}
        </>
      )}
    </Tile>
  )
})

BombsTile.displayName = 'BombsTile'

/**
 * Main grid component with optimized hook usage
 */
export const BombsGrid: React.FC = () => {
  const { tiles, gridConfig, handleMouseUp, handleMouseEnter, isDragging } = useBombsGrid()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Calculate the scale needed to fit the grid within the container
  useEffect(() => {
    const calculateScale = () => {
      if (!wrapperRef.current || !gridRef.current) return

      const wrapper = wrapperRef.current
      const grid = gridRef.current

      // Get the natural size of the grid (unscaled)
      const gridWidth = grid.scrollWidth
      const gridHeight = grid.scrollHeight

      // Get the available space in the wrapper
      const wrapperWidth = wrapper.clientWidth
      const wrapperHeight = wrapper.clientHeight

      // Calculate scale to fit within wrapper with some padding
      const padding = 32 // Leave some padding around the grid
      const scaleX = (wrapperWidth - padding) / gridWidth
      const scaleY = (wrapperHeight - padding) / gridHeight

      // Use the smaller scale to ensure it fits in both dimensions
      const newScale = Math.min(scaleX, scaleY, 1) // Never scale up, only down

      setScale(newScale)
    }

    // Calculate scale on mount and resize
    calculateScale()

    const resizeObserver = new ResizeObserver(calculateScale)
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [gridConfig.parameters.tileSize, gridConfig.parameters.tileSpacing])

  // Add global mouse up handler
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp()
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [handleMouseUp])

  // Handle mouse move over grid container to detect tiles during drag
  const handleGridMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (isDragging && gridConfig.gameState === 'IDLE' && gridRef.current) {
      // Get the scaled grid's bounding rect
      const rect = gridRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Calculate which tile we're over (5x5 grid)
      // Account for the scale transformation
      const scaledPadding = 16 * scale
      const containerWidth = rect.width - (scaledPadding * 2)
      const containerHeight = rect.height - (scaledPadding * 2)
      const tileWidth = containerWidth / 5
      const tileHeight = containerHeight / 5
      
      const col = Math.floor((x - scaledPadding) / tileWidth)
      const row = Math.floor((y - scaledPadding) / tileHeight)
      
      // Check bounds
      if (col >= 0 && col < 5 && row >= 0 && row < 5) {
        const tileIndex = row * 5 + col
        handleMouseEnter(tileIndex)
      }
    }
  }, [isDragging, gridConfig.gameState, handleMouseEnter, scale])

  return (
    <GridWrapper ref={wrapperRef}>
      <ScaledContainer $scale={scale}>
        <GridContainer 
          ref={gridRef}
          $spacing={gridConfig.parameters.tileSpacing}
          onMouseMove={handleGridMouseMove}
          onMouseUp={handleMouseUp}
        >
          {tiles.map(tile => (
            <BombsTile key={tile.index} tile={tile} gridConfig={gridConfig} />
          ))}
        </GridContainer>
      </ScaledContainer>
    </GridWrapper>
  )
}
