// @ts-nocheck
import { useMemo, useCallback, useState, useRef } from 'react'
import { useBombsGameStore } from '../store/BombsGameStore'

/**
 * Enhanced tile data with pre-calculated properties
 */
interface EnhancedTileData {
  index: number
  isRevealed: boolean
  isSelected: boolean
  isBomb: boolean
  // Pre-calculated particle visibility to avoid repetitive calculations
  mainParticleVisible: boolean
  explosionParticleVisible: boolean
  additionalParticleVisible: boolean
}

/**
 * Custom hook for Bombs grid logic
 * Optimized to pre-calculate derived state and minimize prop drilling
 */
export const useBombsGrid = () => {
  // Granular store selectors - only subscribe to what we need
  const parameters = useBombsGameStore((state: any) => state.parameters)
  const revealedCells = useBombsGameStore((state: any) => state.revealedCells)
  const bombCells = useBombsGameStore((state: any) => state.bombCells)
  const gameState = useBombsGameStore((state: any) => state.gameState)
  const entry = useBombsGameStore((state: any) => state.entry)
  const lastResult = useBombsGameStore((state: any) => state.lastResult)
  const selectTile = useBombsGameStore((state: any) => state.selectTile)
  const setEntry = useBombsGameStore((state: any) => state.setEntry)

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'select' | 'deselect' | null>(null)
  const draggedTiles = useRef<Set<number>>(new Set())
  const originalSelectedTiles = useRef<number[]>([])

  // Memoized sets for faster lookups (O(1) instead of O(n))
  const revealedSet = useMemo(() => new Set(revealedCells), [revealedCells])
  const bombSet = useMemo(() => new Set(bombCells), [bombCells])
  const selectedSet = useMemo(() => new Set(entry.side.selectedTiles), [entry.side.selectedTiles])

  // Handle drag start
  const handleMouseDown = useCallback(
    (index: number) => {
      if (gameState === 'IDLE') {
        setIsDragging(true)
        draggedTiles.current = new Set([index])
        originalSelectedTiles.current = [...entry.side.selectedTiles]

        // Determine drag mode based on the first tile
        const isCurrentlySelected = selectedSet.has(index)
        setDragMode(isCurrentlySelected ? 'deselect' : 'select')

        // Apply the action to the first tile
        selectTile(index)
      }
    },
    [gameState, selectTile, selectedSet, entry.side.selectedTiles]
  )

  // Handle drag over tile
  const handleMouseEnter = useCallback(
    (index: number) => {
      if (isDragging && gameState === 'IDLE' && dragMode) {
        // Only process if we haven't already processed this tile
        if (!draggedTiles.current.has(index)) {
          draggedTiles.current.add(index)

          const bombCount = entry.side.bombCount
          const maxSelectableTiles = 25 - bombCount

          // Calculate new selection based on drag mode
          let newSelected: number[]
          if (dragMode === 'select') {
            // Add tile if not already selected and under limit
            if (selectedSet.has(index)) {
              newSelected = entry.side.selectedTiles
            } else if (entry.side.selectedTiles.length < maxSelectableTiles) {
              newSelected = [...entry.side.selectedTiles, index]
            } else {
              // Don't add if at limit
              return
            }
          } else {
            // Remove tile if selected
            newSelected = entry.side.selectedTiles.filter((i: number) => i !== index)
          }

          setEntry({
            side: {
              ...entry.side,
              selectedTiles: newSelected,
            },
          })
        }
      }
    },
    [isDragging, gameState, dragMode, entry, selectedSet, setEntry]
  )

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragMode(null)
    draggedTiles.current.clear()
    originalSelectedTiles.current = []
  }, [])

  // Memoized click handler (for non-drag clicks)
  const handleTileClick = useCallback(
    (index: number) => {
      if (gameState === 'IDLE' && !isDragging) {
        selectTile(index)
      }
    },
    [gameState, selectTile, isDragging]
  )

  // Enhanced tiles array with pre-calculated particle visibility
  const tiles = useMemo((): EnhancedTileData[] => {
    const isShowingResult = gameState === 'SHOWING_RESULT'
    const hasParticleEffects = parameters.particleEffects !== 'none'
    const hasMoreParticleEffects = parameters.particleEffects === 'more'

    return Array.from({ length: 25 }, (_, index) => {
      const isRevealed = revealedSet.has(index)
      const isSelected = selectedSet.has(index)
      const isBomb = bombSet.has(index)

      // Pre-calculate particle visibility for this tile
      const mainParticleVisible =
        hasParticleEffects &&
        isShowingResult &&
        isSelected &&
        ((lastResult?.isWin && !isBomb) || (!lastResult?.isWin && isBomb))

      const explosionParticleVisible =
        hasParticleEffects && isShowingResult && isSelected && isBomb && !lastResult?.isWin

      const additionalParticleVisible = hasMoreParticleEffects && isSelected && isRevealed

      return {
        index,
        isRevealed,
        isSelected,
        isBomb,
        mainParticleVisible,
        explosionParticleVisible,
        additionalParticleVisible,
      }
    })
  }, [revealedSet, selectedSet, bombSet, gameState, parameters.particleEffects, lastResult?.isWin])

  // Core grid state for components that need multiple values
  const gridConfig = useMemo(
    () => ({
      parameters,
      gameState,
      handleTileClick,
      handleMouseDown,
      handleMouseEnter,
      handleMouseUp,
      isDragging,
    }),
    [
      parameters,
      gameState,
      handleTileClick,
      handleMouseDown,
      handleMouseEnter,
      handleMouseUp,
      isDragging,
    ]
  )

  return {
    tiles,
    gridConfig,
    // Individual accessors for specific needs
    parameters,
    gameState,
    handleTileClick,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    isDragging,
  }
}
