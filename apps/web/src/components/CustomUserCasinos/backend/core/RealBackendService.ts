// @ts-nocheck
import { nanoid } from 'nanoid'
import { api } from '@/services/api'
import { ConfigManager } from '../../config/ConfigManager'
import { type IGameConfigData } from '../../config/GameConfig'
import {
  type CasinoEntity,
  type CasinoPreview,
  type FeaturedCasinoPreview,
  type CustomCasinoGame,
} from '../../shared/types'
import { getImageUrl } from '../../shared/utils/cropDataUtils'
import { createDefaultGames } from '../../UserPage/GameSections/defaultGames'

type StoredTheme = {
  games?: CustomCasinoGame[]
  [key: string]: any
}

const defaultStats = {
  totalPlays: 0,
  totalWagered: 0,
  uniquePlayers: 0,
  jackpot: 0,
}

const toCasinoEntity = (theme: any, username: string): CasinoEntity => {
  const configManager = ConfigManager.getInstance()
  const config = configManager.loadConfig('page', theme ?? {}) as any

  const games: CustomCasinoGame[] =
    (Array.isArray(theme?.games) && theme.games.length > 0 ? theme.games : createDefaultGames()).map(
      (game: CustomCasinoGame, index: number) => ({
        ...game,
        order: game.order ?? index + 1,
      }),
    )

  return {
    id: username || 'singleton',
    username,
    createdAt: theme?.createdAt ?? new Date().toISOString(),
    updatedAt: theme?.updatedAt ?? new Date().toISOString(),
    games,
    stats: defaultStats,
    config,
  }
}

const toPreview = (casino: CasinoEntity): CasinoPreview => ({
  id: casino.id,
  username: casino.username,
  createdAt: casino.createdAt,
  updatedAt: casino.updatedAt,
  stats: casino.stats,
  config: {
    title: casino.config.title,
    shortDescription: casino.config.shortDescription,
    longDescription: casino.config.longDescription,
    bannerImage: casino.config.bannerImage,
    profileImage: casino.config.profileImage,
    colors: {
      themeColor1: casino.config.colors.themeColor1,
      themeColor2: casino.config.colors.themeColor2,
    },
  },
})

export class RealBackendService {
  static async loadUserCasino(userId: string, _force = false): Promise<CasinoEntity | null> {
    try {
      console.info('[TEMP] backend:load', { userId })
      const settings: any = await api.getCasinoSettings()
      const storedTheme = (settings?.theme as StoredTheme) ?? {}
      const casino = toCasinoEntity(storedTheme, settings?.name || userId || 'fare-casino')

      // Apply metadata from settings if available
      casino.config.title = settings?.name ?? casino.config.title
      casino.config.shortDescription =
        settings?.shortDescription ?? casino.config.shortDescription
      casino.config.longDescription = settings?.longDescription ?? casino.config.longDescription

      if (settings?.primaryColor) {
        casino.config.colors.themeColor1 = settings.primaryColor
      }
      if (settings?.bannerUrl) {
        casino.config.bannerImage = { url: settings.bannerUrl }
      }
      if (settings?.logoUrl) {
        casino.config.profileImage = { url: settings.logoUrl }
      }

      console.info('[TEMP] backend:ok', {
        name: settings?.name,
        games: casino.games?.length ?? 0,
      })
      return casino
    } catch (error) {
      console.warn('[TEMP] backend:error', error?.message ?? error)
      return null
    }
  }

  static async saveUserCasino(userId: string, casino: CasinoEntity): Promise<void> {
    const configPayload = casino.config.save()
    const themePayload = {
      ...configPayload,
      games: casino.games,
      updatedAt: new Date().toISOString(),
    }

    await api.updateCasinoSettings({
      name: casino.config.title,
      shortDescription: casino.config.shortDescription,
      longDescription: casino.config.longDescription,
      bannerUrl: getImageUrl(casino.config.bannerImage) || undefined,
      logoUrl: getImageUrl(casino.config.profileImage) || undefined,
      primaryColor: casino.config.colors.themeColor1,
      theme: themePayload,
    })

    console.log('[RealBackendService] Saved casino config for', userId)
  }

  static async createGame(_userId: string, type: string, name: string) {
    return {
      id: nanoid(),
      type,
      name,
    }
  }

  static async deleteGameFromCasino(_userId: string, _gameId: string): Promise<void> {
    return Promise.resolve()
  }

  static async createSection(_userId: string, _title: string, _layout: string): Promise<string> {
    return `section_${nanoid(8)}`
  }

  static async updateSection(
    _userId: string,
    _sectionId: string,
    _updates: { title?: string; layout?: string }
  ): Promise<void> {
    return Promise.resolve()
  }

  static async deleteSection(_userId: string, _sectionId: string): Promise<void> {
    return Promise.resolve()
  }

  static async updateSectionGames(
    _userId: string,
    _sectionId: string,
    _newGameIds: string[]
  ): Promise<void> {
    return Promise.resolve()
  }

  static async getGameConfig(
    _username: string,
    gameId: string,
    gameType?: string
  ): Promise<IGameConfigData<any> | null> {
    const settings: any = await api.getCasinoSettings()
    const theme = (settings?.theme as StoredTheme) ?? {}
    const games = Array.isArray(theme.games) ? theme.games : []

    const match =
      games.find((g: any) => g?.id === gameId) ||
      games.find((g: any) => g?.type === gameType)

    if (!match) return null

    // If the saved config is already in IGameConfigData shape, use it directly
    if (match.config && typeof match.config === 'object') {
      const cfg = match.config as IGameConfigData<any>
      // Backward compatibility: if parameters are missing but config itself is parameters, wrap it
      if (!cfg.parameters) {
        return {
          name: cfg.name ?? match.name,
          icon: cfg.icon ?? match.icon,
          parameters: cfg as any,
        }
      }
      return {
        ...cfg,
        name: cfg.name ?? match.name,
        icon: cfg.icon ?? match.icon,
      }
    }

    return null
  }

  static async saveGameConfig(
    _username: string,
    gameId: string,
    config: IGameConfigData<any>,
    gameType?: string
  ): Promise<void> {
    const settings: any = await api.getCasinoSettings()
    const theme: StoredTheme = (settings?.theme as StoredTheme) ?? {}
    const games: CustomCasinoGame[] = Array.isArray(theme.games) ? [...theme.games] : []

    const idx = games.findIndex(g => g.id === gameId)
    const nextConfig = {
      name: config.name,
      icon: config.icon,
      description: config.description,
      layout: config.layout,
      colors: config.colors,
      window: config.window,
      parameters: config.parameters ?? {},
    } as IGameConfigData<any>

    if (idx >= 0) {
      games[idx] = {
        ...games[idx],
        name: config.name ?? games[idx].name,
        icon: config.icon ?? games[idx].icon,
        type: games[idx].type ?? (gameType as any),
        config: nextConfig,
      }
    } else {
      games.push({
        id: gameId,
        type: (gameType as any) ?? '',
        name: config.name ?? gameType ?? 'Game',
        icon: config.icon ?? '',
        order: games.length + 1,
        config: nextConfig,
      })
    }

    theme.games = games

    await api.updateCasinoSettings({
      theme,
    })
  }

  static async getCasinoPreviews(): Promise<CasinoPreview[]> {
    const casino = await this.loadUserCasino('fare-casino')
    if (!casino) return []
    return [toPreview(casino)]
  }

  static async getFeaturedCasinoPreviews(limit = 1): Promise<FeaturedCasinoPreview[]> {
    const previews = await this.getCasinoPreviews()
    return previews.slice(0, limit).map(preview => ({
      ...preview,
      featuredReason: 'Official Fare Casino configuration',
      featuredUntil: new Date().toISOString(),
    }))
  }

  static async getAllCasinos(): Promise<CasinoEntity[]> {
    const casino = await this.loadUserCasino('fare-casino')
    return casino ? [casino] : []
  }

  static async loadUserCasinoByUsername(username: string): Promise<CasinoEntity | null> {
    return this.loadUserCasino(username)
  }

  static async clearAllUserData(_userId: string): Promise<void> {
    // No-op now that configs are stored in the backend
  }
}
