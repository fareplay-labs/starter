// @ts-nocheck
import { createGameStore, validateBaseEntry } from '../../shared/gameStoreFactory'
import {
  type BombsParameters,
  type BombsResult,
  type BombsEntry,
  DEFAULT_BOMBS_PARAMETERS,
  DEFAULT_BOMBS_ENTRY,
} from '../types'
import {
  generateBombPositions,
  generateWinningBombPositions,
  generateLosingBombPositions,
  createGameResult,
} from '../logic/BombsGameLogic'
import { entryEvent } from '@/features/custom-casino/events/entryEvent'

// Fixed gameplay values
const FIXED_GAMEPLAY = {
  MIN_BOMBS: 1,
  MAX_BOMBS: 24,
  DEFAULT_BOMBS: 3,
  MIN_BET: 1,
  MAX_BET: 1000,
}

interface BombsRuntimeState {
  revealedCells: number[]
  bombCells: number[]
  isRevealing: boolean
  keepSelection: boolean
}

interface BombsActions {
  resetGame: () => void
  selectTile: (index: number) => void
  showResult: (bombPositions: number[]) => Promise<BombsResult>  // Pure function - required parameter
  playRandom: () => Promise<BombsResult>
  revealCell: (cellIndex: number) => Promise<BombsResult>
  simulateWin: () => Promise<BombsResult>
  simulateLoss: () => Promise<BombsResult>
  validateEntry: () => { isValid: boolean; errors: Record<string, string> }
  revealTilesSequentially: (tiles: number[], onEachReveal: (tile: number) => void) => Promise<void>
  handleGameCompletion: (result: BombsResult, selectedTiles: number[]) => Promise<void>
  resetGameSpecificState: (state: any) => void
}

export type BombsGameStore = any

export const useBombsGameStore = createGameStore<
  BombsParameters,
  BombsResult,
  BombsEntry,
  BombsRuntimeState,
  BombsActions
>(
  'bombs',
  DEFAULT_BOMBS_PARAMETERS,

  // game-specific slice
  (set, get) => ({
    revealedCells: [],
    bombCells: [],
    isRevealing: false,
    keepSelection: true,

    selectTile(index: number) {
      const { gameState, entry, setEntry } = get()
      if (gameState !== 'IDLE') return

      const currentTiles = entry.side.selectedTiles
      const already = currentTiles.includes(index)
      const bombCount = entry.side.bombCount
      const maxSelectableTiles = 25 - bombCount

      let selected: number[]
      if (already) {
        // Always allow deselection
        selected = currentTiles.filter((i: number) => i !== index)
      } else {
        // Only allow selection if under the limit
        if (currentTiles.length < maxSelectableTiles) {
          selected = [...currentTiles, index]
        } else {
          // Don't select if at limit
          return
        }
      }

      setEntry({
        side: {
          ...entry.side,
          selectedTiles: selected,
        },
      })
    },

    // Common helper for sequential tile revealing with dynamic timing
    async revealTilesSequentially(tiles: number[], onEachReveal: (tile: number) => void) {
      const totalTiles = tiles.length
      for (let i = 0; i < totalTiles; i++) {
        onEachReveal(tiles[i])
        // Dynamic timing: starts fast, slows down slightly
        const baseDelay = 150
        const variableDelay = Math.min(50, i * 5) // Adds up to 50ms delay
        const delay = baseDelay + variableDelay
        await new Promise<void>(res => setTimeout(res, delay))
      }
    },

    // Common helper for game completion
    async handleGameCompletion(result: BombsResult, selectedTiles: number[]) {
      await new Promise<void>(res => setTimeout(res, 500))

      const allTiles = Array.from({ length: 25 }, (_, i) => i)
      const remainingTiles = allTiles.filter(i => !selectedTiles.includes(i))

      set((state: any) => {
        state.revealedCells = [...state.revealedCells, ...remainingTiles]
        state.lastResult = result
        state.gameState = 'SHOWING_RESULT'
        state.isRevealing = false
      })

      // Update wallet balance
      entryEvent.pub('updateBalance')

      setTimeout(() => get().reset(), 1500)
    },

    // Pure animation function - just shows the given result
    async showResult(bombPositions: number[]) {
      const { entry } = get()

      set((state: any) => {
        state.isRevealing = true
        state.submittedEntry = { ...entry }
        state.gameState = 'PLAYING'
        state.revealedCells = []
      })

      const indices = [...entry.side.selectedTiles]
      const numberOfBombs = entry.side.bombCount

      // Use provided bomb positions
      set((state: any) => {
        state.bombCells = bombPositions
      })

      const result = createGameResult(indices, bombPositions, entry.entryAmount, numberOfBombs)

      await get().revealTilesSequentially(indices, (tile: number) => {
        set((state: any) => {
          state.revealedCells = [...state.revealedCells, tile]
        })
      })

      await get().handleGameCompletion(result, indices)
      return result
    },

    // Play with random bomb positions
    async playRandom() {
      const { entry, validateEntry } = get()

      // Validate before submission
      const validation = validateEntry()
      if (!validation.isValid) {
        throw new Error('Invalid entry data')
      }

      const numberOfBombs = entry.side.bombCount
      const bombCells = generateBombPositions(numberOfBombs)
      return get().showResult(bombCells)
    },

    async revealCell(cellIndex: number) {
      const { entry } = get()

      set((state: any) => {
        state.isRevealing = true
        state.submittedEntry = { ...entry }
        state.gameState = 'PLAYING'
      })

      const numberOfBombs = entry.side.bombCount
      const bombCells = generateBombPositions(numberOfBombs)
      const result = createGameResult([cellIndex], bombCells, entry.entryAmount, numberOfBombs)

      setTimeout(() => {
        set((state: any) => {
          state.lastResult = result
          state.revealedCells = [...state.revealedCells, cellIndex]
          state.bombCells = bombCells
          state.isRevealing = false
          state.gameState = 'SHOWING_RESULT'
        })
      }, 500)

      return result
    },

    async simulateWin() {
      const { entry, validateEntry, showResult } = get()

      // Validate before submission
      const validation = validateEntry()
      if (!validation.isValid) {
        throw new Error('Invalid entry data')
      }

      const indices = [...entry.side.selectedTiles]
      const numberOfBombs = entry.side.bombCount
      const bombCells = generateWinningBombPositions(numberOfBombs, indices)
      return showResult(bombCells)
    },

    async simulateLoss() {
      const { entry, validateEntry, showResult } = get()

      // Validate before submission
      const validation = validateEntry()
      if (!validation.isValid) {
        throw new Error('Invalid entry data')
      }

      const indices = [...entry.side.selectedTiles]
      const numberOfBombs = entry.side.bombCount
      const bombCells = generateLosingBombPositions(numberOfBombs, indices)
      return showResult(bombCells)
    },

    validateEntry: () => {
      const { entry } = get()
      
      // Get base validation
      const baseValidation = validateBaseEntry(entry)
      const errors = { ...baseValidation.errors }

      if (!entry.side.selectedTiles || entry.side.selectedTiles.length === 0) {
        errors.selectedTiles = 'Must select at least one tile'
      }

      if (
        entry.side.bombCount < FIXED_GAMEPLAY.MIN_BOMBS ||
        entry.side.bombCount > FIXED_GAMEPLAY.MAX_BOMBS
      ) {
        errors.bombCount = `Bomb count must be between ${FIXED_GAMEPLAY.MIN_BOMBS} and ${FIXED_GAMEPLAY.MAX_BOMBS}`
      }

      const maxSelectableTiles = 25 - entry.side.bombCount
      if (entry.side.selectedTiles.length > maxSelectableTiles) {
        errors.selectedTiles = `Cannot select more than ${maxSelectableTiles} tiles with ${entry.side.bombCount} bombs`
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      }
    },

    resetGame() {
      const { keepSelection, entry } = get()
      const selectedTilesToKeep = keepSelection ? [...entry.side.selectedTiles] : []

      set((state: any) => {
        state.gameState = 'RESETTING'
      })

      setTimeout(() => {
        // Call the base reset which publishes gameFinished event
        get().reset()
        
        // Also reset Bombs-specific state
        set((state: any) => {
          state.revealedCells = []
          state.bombCells = []
          state.isRevealing = false

          // Only reset selected tiles, keep all other entry values
          state.entry = {
            ...entry, // Keep all existing entry values
            side: {
              ...entry.side, // Keep bomb count and other side values
              selectedTiles: selectedTilesToKeep, // Only reset selected tiles based on keepSelection
            },
          }
        })
      }, 400)
    },


    resetGameSpecificState: (state: any) => {
      state.isRevealing = false
      state.revealedCells = []
      state.bombCells = []
    },
  }),

  DEFAULT_BOMBS_ENTRY
)
