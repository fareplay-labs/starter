// @ts-nocheck
/**
 * Type Converters for API Response Mapping
 * Converts backend API responses to frontend types and vice versa
 */

import { type CasinoEntity, type CasinoPreview, type FeaturedCasinoPreview } from '../types'
import { type CasinoApiResponse, type CasinoPreviewResponse, type FeaturedCasinoResponse, type CasinoCreateRequest } from '../services/casinoApi'
import { type GameConfigResponse } from '../services/gameApi'
import { type IGameConfigData } from '../../config/GameConfig'
import { type ImageData } from '../../config/PageConfig'
import { type AppGameName } from '@/chains/types'
import { getImageUrl } from './cropDataUtils'
import { ConfigManager } from '../../config/ConfigManager'

/**
 * Convert API response to CasinoEntity
 */
export function apiResponseToCasinoEntity(apiResponse: CasinoApiResponse): CasinoEntity {
  const configManager = ConfigManager.getInstance()
  const pageConfig = configManager.loadConfig('page', {
    title: apiResponse.config.title,
    shortDescription: apiResponse.config.shortDescription,
    longDescription: apiResponse.config.longDescription,
    font: apiResponse.config.font,
    colors: {
      themeColor1: apiResponse.config.colors.themeColor1,
      themeColor2: apiResponse.config.colors.themeColor2,
      themeColor3: apiResponse.config.colors.themeColor3,
      backgroundColor: '#0a0a0a',
    },
    bannerImage: convertStringToImageData(apiResponse.config.bannerImage),
    profileImage: convertStringToImageData(apiResponse.config.profileImage),
    socialLinks: {
      links: apiResponse.config.socialLinks.links,
      layoutType: apiResponse.config.socialLinks.layoutType as 'horizontal' | 'vertical' | 'showLinks',
    },
    sections: apiResponse.config.sections.map(section => ({
      id: section.id,
      title: section.title,
      gameIds: (section.gameIds || []).filter(id => id && id !== ''),
      layout: section.layout as 'carousel' | 'smallTiles' | 'largeTiles',
    })),
    styleName: 'default',
    featuredGames: [],
    customSections: [],
    welcomeMessage: '',
    displayOptions: {
      gridDensity: 'medium',
      sortOrder: 'popular',
    },
    enabledGames: [],
  })
  return {
    id: apiResponse.id,
    username: apiResponse.username,
    createdAt: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt,
    
    stats: {
      totalPlays: apiResponse.stats.totalPlays,
      totalWagered: apiResponse.stats.totalWagered,
      uniquePlayers: 0, // Not provided by API, default to 0
      jackpot: apiResponse.stats.jackpot,
    },
    
    config: pageConfig as any,
    
    games: apiResponse.games.map((game, index) => ({
      id: game.id,
      name: game.name,
      icon: '', // Not provided by API
      type: game.type as AppGameName,
      config: {}, // Default empty config
      order: index,
    })),
  }
}

/**
 * Convert CasinoEntity to API request format
 */
export function casinoEntityToApiRequest(casino: CasinoEntity): CasinoCreateRequest {
  // Use the getImageUrl utility to properly extract URLs from ImageData
  const bannerUrl = getImageUrl(casino.config.bannerImage)
  const profileUrl = getImageUrl(casino.config.profileImage)
  
  return {
    // Map games, including those without IDs (new games) but excluding frontend-only temp IDs
    games: casino.games
      .filter(game => !game.id?.startsWith('temp_')) // Only filter out temp IDs
      .map(game => ({
        // Only include ID if it exists and is not a temp ID
        ...(game.id && !game.id.startsWith('temp_') ? { id: game.id } : {}),
        type: game.type,
        name: game.name,
      })),
    config: {
      title: casino.config.title,
      shortDescription: casino.config.shortDescription,
      longDescription: casino.config.longDescription,
      font: casino.config.font,
      colors: {
        themeColor1: casino.config.colors.themeColor1,
        themeColor2: casino.config.colors.themeColor2,
        themeColor3: casino.config.colors.themeColor3,
      },
      bannerImage: bannerUrl,
      profileImage: profileUrl,
      sections: casino.config.sections.map(section => ({
        // WORKAROUND: Only include ID if it's a real backend ID (not temporary frontend ID)
        // TODO: Remove temp ID check once frontend/backend ID generation is consistent
        ...(section.id && !section.id.startsWith('section_') ? { id: section.id } : {}),
        title: section.title,
        gameIds: section.gameIds || [],
        layout: section.layout,
      })),
      socialLinks: {
        layoutType: casino.config.socialLinks.layoutType,
        links: casino.config.socialLinks.links,
      },
      tags: [], // Default empty tags - would need to be mapped from casinoTags if available
    },
  }
}

/**
 * Convert API preview response to CasinoPreview
 */
export function apiPreviewToCasinoPreview(apiPreview: CasinoPreviewResponse): CasinoPreview {
  return {
    id: apiPreview.id,
    username: apiPreview.username,
    createdAt: apiPreview.createdAt,
    updatedAt: apiPreview.updatedAt,
    
    stats: {
      totalPlays: apiPreview.stats.totalPlays,
      totalWagered: parseFloat(apiPreview.stats.totalWagered), // Convert string to number
      uniquePlayers: 0, // Not provided by API
      jackpot: 0, // Not provided by API
    },
    
    config: {
      title: apiPreview.config.title,
      shortDescription: apiPreview.config.shortDescription,
      longDescription: apiPreview.config.shortDescription, // Use short description as fallback
      bannerImage: convertStringToImageData(apiPreview.config.bannerImage),
      profileImage: convertStringToImageData(apiPreview.config.profileImage),
      colors: {
        themeColor1: apiPreview.config.colors.themeColor1,
        themeColor2: apiPreview.config.colors.themeColor2,
      },
    },
  }
}

/**
 * Convert API featured response to FeaturedCasinoPreview
 */
export function apiFeaturedToFeaturedPreview(apiFeatured: FeaturedCasinoResponse): FeaturedCasinoPreview {
  const basePreview = apiPreviewToCasinoPreview(apiFeatured)
  return {
    ...basePreview,
    featuredReason: apiFeatured.featuredReason,
    featuredUntil: new Date().toISOString(), // API doesn't provide this, use current date
  }
}

/**
 * Convert GameConfigResponse to IGameConfigData
 */
export function apiGameConfigToGameConfigData(apiConfig: GameConfigResponse): IGameConfigData<any> {
  return {
    name: apiConfig.name,
    description: apiConfig.description,
    icon: apiConfig.icon,
    parameters: apiConfig.gameSpecificData,
  }
}

/**
 * Convert IGameConfigData to API request format
 */
export function gameConfigDataToApiRequest(configData: IGameConfigData<any>) {
  return {
    name: configData.name || 'Unnamed Game',
    description: configData.description || `${configData.name || 'Game'} configuration`,
    icon: configData.icon,
    gameSpecificData: configData.parameters || {},
  }
}

/**
 * Helper: Convert string URL to ImageData
 */
function convertStringToImageData(url: string): ImageData {
  return {
    url: url || '',
  }
}


/**
 * Generate a username from user ID
 * This is a temporary utility until we have proper username mapping
 */
export function generateUsernameFromUserId(userId: string): string {
  // If it's already a username format, return as is
  if (!userId.startsWith('0x')) {
    return userId
  }
  
  // For ethereum addresses, use the full address (lowercase) as the username slug
  return userId.toLowerCase()
}

/**
 * Extract user ID from username
 * This is a temporary utility until we have proper username mapping
 */
export function extractUserIdFromUsername(username: string): string {
  // If it's an ethereum address slug, return as-is (normalized lowercase)
  if (username.startsWith('0x')) return username.toLowerCase()
  
  // Otherwise, assume it's a direct mapping
  return username
}