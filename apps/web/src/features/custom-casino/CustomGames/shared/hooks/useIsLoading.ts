// @ts-nocheck
import { type FareGameState } from '../types'

interface UseIsLoadingOptions {
  gameState: FareGameState
  loadingStates?: FareGameState[]
}

/**
 * Hook to manage loading state based on game state
 * @param gameState - Current game state
 * @param loadingStates - Array of game states that should show loading (defaults to ['PLAYING', 'SHOWING_RESULT'])
 * @returns boolean indicating if the game is in a loading state
 */
export const useIsLoading = ({
  gameState,
  loadingStates = ['PLAYING', 'SHOWING_RESULT'],
}: UseIsLoadingOptions): boolean => {
  // Directly compute the loading state without useState/useEffect
  return loadingStates.includes(gameState)
}
