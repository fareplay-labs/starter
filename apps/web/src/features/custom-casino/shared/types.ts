// @ts-nocheck
import { type AppGameName } from '@/chains/types'
import { type PageConfig, type ImageData } from '../config/PageConfig'

export interface CustomCasinoGame {
  id: string
  name: string
  icon: string
  type: AppGameName
  config: Record<string, any>
  order: number
}

/**
 * Casino Entity - type to be stored on the backend
 */
export interface CasinoEntity {
  id: string
  username: string
  createdAt: string
  updatedAt: string

  stats: {
    totalPlays: number
    totalWagered: number
    uniquePlayers: number
    jackpot: number
  }

  // Core Configuration - single source of truth for UI
  config: PageConfig

  // Game Data
  games: CustomCasinoGame[]
}

/**
 * Lightweight version of CasinoEntity containing only data needed for preview cards
 * Used to optimize data loading on the Discover page
 */
export interface CasinoPreview {
  id: string
  username: string
  createdAt: string
  updatedAt: string

  stats: {
    totalPlays: number
    totalWagered: number
    uniquePlayers: number
    jackpot: number
  }

  // Only the preview-relevant config properties
  config: {
    title: string
    shortDescription: string
    bannerImage: ImageData
    profileImage: ImageData
    longDescription?: string
    colors?: {
      themeColor1?: string
      themeColor2?: string
    }
  }
}

export interface FeaturedCasinoPreview extends CasinoPreview {
  featuredReason: string
  featuredUntil: string
}

export interface FeaturedCasino extends CasinoEntity {
  featuredReason: string
  featuredUntil: string
}

export interface CasinoPreviewSection {
  title: string
  casinos: CasinoPreview[]
}
