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

const GAME_CONFIG_STORAGE_KEY = 'customCasino_game_configs'

const readGameConfigStore = (): Record<string, IGameConfigData<any>> => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(GAME_CONFIG_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeGameConfigStore = (store: Record<string, IGameConfigData<any>>) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(GAME_CONFIG_STORAGE_KEY, JSON.stringify(store))
}

const makeGameConfigKey = (username: string, gameId: string) => `${username}:${gameId}`

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
    username: string,
    gameId: string,
    _gameType?: string
  ): Promise<IGameConfigData<any> | null> {
    const store = readGameConfigStore()
    return store[makeGameConfigKey(username, gameId)] ?? null
  }

  static async saveGameConfig(
    username: string,
    gameId: string,
    config: IGameConfigData<any>,
    _gameType?: string
  ): Promise<void> {
    const store = readGameConfigStore()
    store[makeGameConfigKey(username, gameId)] = config
    writeGameConfigStore(store)
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
    writeGameConfigStore({})
  }
}
