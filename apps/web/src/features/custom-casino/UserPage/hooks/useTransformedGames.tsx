// @ts-nocheck
import { useMemo } from 'react'
import { type CustomCasinoGame, type CasinoEntity } from '../../shared/types'
import { DEFAULT_GAMES } from '../GameSections/defaultGames'

export interface TransformedSection {
  id: string
  title: string
  games: CustomCasinoGame[]
  layout?: 'carousel' | 'smallTiles' | 'largeTiles'
}

export const useTransformedGames = (casino: CasinoEntity | null): TransformedSection[] => {
  const transformedSections = useMemo<TransformedSection[]>(() => {
    if (!casino?.config?.sections) return []
    
    return casino.config.sections.map(section => ({
      id: section.id,
      title: section.title,
      layout: section.layout,
      games: section.gameIds
        .map(id => {
          // 1. Exact ID match within casino.games
          let game = casino.games?.find(g => g.id === id)

          // 2. Fallback: The ID might actually equal the game `type` (e.g. 'cryptoLaunch_1').
          if (!game && casino.games) {
            game = casino.games.find(g => g.type === id)
          }

          // 3. Final fallback: look in our DEFAULT_GAMES list (by id or type)
          if (!game) {
            game = DEFAULT_GAMES.find(g => g.id === id || g.type === id)
          }


          return game
        })
        .filter((g): g is CustomCasinoGame => g !== undefined),
    }))
  }, [casino?.config?.sections, casino?.games])

  return transformedSections
}
