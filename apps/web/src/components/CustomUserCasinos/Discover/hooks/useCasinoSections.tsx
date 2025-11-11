// @ts-nocheck
import { useMemo, useCallback } from 'react'
import { type CasinoPreview, type CasinoPreviewSection } from '../../shared/types'

export function useCasinoSections(casinoPreviews: CasinoPreview[], searchQuery = '') {
  const CASINO_TAG_KEYWORDS = useMemo(
    () => ({
      medieval: ['king', 'royal', 'crown'],
      cyberpunk: ['neon', 'digital', 'futuristic', 'glowing'],
      mafia: ['heist', 'vip', 'luxury', 'vegas'],
    }),
    []
  )

  const autoTagGame = useCallback(
    (title: string): string[] => {
      const tags: string[] = []
      const lowerTitle = title.toLowerCase()
      Object.entries(CASINO_TAG_KEYWORDS).forEach(([tag, keywords]) => {
        if (keywords.some(word => lowerTitle.includes(word))) {
          tags.push(tag)
        }
      })
      return tags
    },
    [CASINO_TAG_KEYWORDS]
  )

  const filteredCasinos = useMemo(() => {
    if (!searchQuery.trim()) return casinoPreviews
    const q = searchQuery.trim().toLowerCase()
    return casinoPreviews.filter(
      casino =>
        casino.config.title.toLowerCase().includes(q) ||
        casino.id.toLowerCase().includes(q) ||
        casino.stats.totalPlays.toString().includes(q)
    )
  }, [casinoPreviews, searchQuery])

  return useMemo<CasinoPreviewSection[]>(() => {
    if (!filteredCasinos?.length) return []

    return [
      {
        title: 'Popular',
        casinos: [...filteredCasinos].sort((a, b) => b.stats.totalPlays - a.stats.totalPlays),
      },
      {
        title: 'Jackpots',
        casinos: [...filteredCasinos].sort((a, b) => b.stats.jackpot - a.stats.jackpot).slice(0, 5),
      },
      {
        title: 'New',
        casinos: [...filteredCasinos].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      },
      {
        title: 'Most Wagered',
        casinos: [...filteredCasinos].sort((a, b) => b.stats.totalWagered - a.stats.totalWagered),
      },
      {
        title: 'Recently Updated',
        casinos: [...filteredCasinos].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
      },
      ...Object.keys(CASINO_TAG_KEYWORDS)
        .map(tag => ({
          title: tag.charAt(0).toUpperCase() + tag.slice(1),
          casinos: filteredCasinos.filter(casino => {
            const idLower = casino.id?.toLowerCase?.() ?? ''
            return idLower.includes(tag) || autoTagGame(casino.config?.title ?? '').includes(tag)
          }),
        }))
        .filter(section => section.casinos.length > 0),
    ]
  }, [autoTagGame, filteredCasinos, CASINO_TAG_KEYWORDS])
}
