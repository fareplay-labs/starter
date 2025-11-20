// @ts-nocheck
/**
 * Utility to normalize an array of section objects for config persistence.
 *
 * Accepts sections that may have either a `games` array (with full game objects)
 * or a `gameIds` array (with just string IDs), and returns a new array of sections
 * with only `id`, `title`, `gameIds`, and `layout` properties. This ensures the
 * data is in the correct format for saving to backend or local config.
 *
 * Usage:
 *   const configSections = serializeSectionsForConfig(sectionsWithGames)
 *   handleSectionOrderChange(configSections)
 */
import { type CustomCasinoGame } from '../../shared/types'

export type SectionWithGames = {
  id: string
  title: string
  games?: CustomCasinoGame[]
  gameIds?: string[]
  layout?: 'carousel' | 'smallTiles' | 'largeTiles'
}

type SectionForConfig = {
  id: string
  title: string
  gameIds: string[]
  layout: 'carousel' | 'smallTiles' | 'largeTiles'
}

export function serializeSectionsForConfig(
  sectionsWithGames: SectionWithGames[]
): SectionForConfig[] {
  return sectionsWithGames.map(section => ({
    id: section.id,
    title: section.title,
    gameIds: section.games ? section.games.map(game => game.id) : section.gameIds || [],
    layout: section.layout ?? 'carousel',
  }))
}
