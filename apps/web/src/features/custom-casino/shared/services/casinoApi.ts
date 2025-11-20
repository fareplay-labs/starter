// @ts-nocheck
/**
 * Casino API Client
 * Handles communication with the backend Casino service for CRUD operations
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { type CasinoEntity, type CasinoPreview } from '../types'

export interface CasinoApiResponse {
  id: string
  username: string
  createdAt: string
  updatedAt: string
  games: Array<{
    id: string
    type: string
    name: string
  }>
  stats: {
    totalPlays: number
    totalWagered: number
    jackpot: number
  }
  config: {
    title: string
    shortDescription: string
    longDescription: string
    font: string
    colors: {
      themeColor1: string
      themeColor2: string
      themeColor3: string
    }
    bannerImage: string
    profileImage: string
    sections: Array<{
      id: string
      title: string
      gameIds: string[]
      layout: string
    }>
    socialLinks: {
      layoutType: string
      links: string[]
    }
    tags: Array<{
      id: string
      name: string
      slug: string
    }>
  }
}

export interface CasinoCreateRequest {
  games: Array<{
    id?: string  // Optional ID for existing games
    type: string
    name: string
  }>
  config: {
    title: string
    shortDescription: string
    longDescription: string
    font: string
    colors: {
      themeColor1: string
      themeColor2: string
      themeColor3: string
    }
    bannerImage: string
    profileImage: string
    sections: Array<{
      title: string
      layout: string
      id?: string
      gameIds?: string[]  // Optional - managed separately via section endpoints
    }>
    socialLinks: {
      layoutType: string
      links: string[]
    }
    tags: Array<{
      name: string
      slug: string
      id?: string
    }>
  }
}

export interface CasinoUpdateRequest {
  title?: string
  shortDescription?: string
  longDescription?: string
  font?: string
  colors?: {
    themeColor1?: string
    themeColor2?: string
    themeColor3?: string
  }
  bannerImage?: string
  profileImage?: string
  // Note: sections removed - managed via PATCH /sections/:id endpoint
  socialLinks?: {
    layoutType?: string
    links?: string[]
  }
  tags?: Array<{
    name: string
    slug: string
    id?: string
  }>
}

export interface CasinoPreviewResponse {
  id: string
  username: string
  createdAt: string
  updatedAt: string
  stats: {
    totalPlays: number
    totalWagered: string
  }
  config: {
    title: string
    shortDescription: string
    bannerImage: string
    profileImage: string
    colors: {
      [key: string]: string
    }
    tags: Array<{
      id: string
      name: string
      slug: string
    }>
  }
}

export interface FeaturedCasinoResponse extends CasinoPreviewResponse {
  featuredReason: string
  order: number
}

export class CasinoApi {
  private axiosInstance: AxiosInstance

  constructor() {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || ''
    if (!baseUrl) {
      console.warn('Backend URL not configured, Casino API will not work')
    }

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      withCredentials: true, // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    })

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`[CasinoApi] ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('[CasinoApi] Request error:', error)
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[CasinoApi] Response error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        })
        return Promise.reject(error)
      }
    )
  }

  /**
   * Get a casino by username
   */
  async getCasino(username: string): Promise<CasinoApiResponse> {
    try {
      const response: AxiosResponse<CasinoApiResponse> = await this.axiosInstance.get(
        `/casinos/${encodeURIComponent(username)}`
      )
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Casino not found for username: ${username}`)
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get casino'
      throw new Error(`Failed to get casino: ${errorMessage}`)
    }
  }

  /**
   * Create or update a casino
   */
  async createOrUpdateCasino(username: string, casinoData: CasinoCreateRequest): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.axiosInstance.post(
        `/casinos/${encodeURIComponent(username)}`,
        casinoData
      )
      return response.data
    } catch (error: any) {
      console.error('[CasinoApi] Error response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save casino'
      throw new Error(`Failed to save casino: ${errorMessage}`)
    }
  }

  /**
   * Add a new game to a casino
   */
  async addGame(username: string, gameData: { type: string; name: string }): Promise<{ id: string; type: string; name: string }> {
    try {
      const response: AxiosResponse<{ id: string; type: string; name: string }> = await this.axiosInstance.post(
        `/casinos/${encodeURIComponent(username)}/games`,
        gameData
      )
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add game'
      throw new Error(`Failed to add game: ${errorMessage}`)
    }
  }

  /**
   * Create a new section in a casino
   */
  async createSection(username: string, sectionData: { title: string; layout: string }): Promise<{ id: string; title: string; layout: string }> {
    try {
      const response: AxiosResponse<{ id: string; title: string; layout: string }> = await this.axiosInstance.post(
        `/casinos/${encodeURIComponent(username)}/sections`,
        sectionData
      )
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create section'
      throw new Error(`Failed to create section: ${errorMessage}`)
    }
  }

  /**
   * Add a game to a section
   */
  async addGameToSection(username: string, sectionId: string, gameId: string): Promise<{ id: string; gameIds: string[] }> {
    try {
      const response: AxiosResponse<{ id: string; gameIds: string[] }> = await this.axiosInstance.post(
        `/casinos/${encodeURIComponent(username)}/sections/${sectionId}/games`,
        { gameId }
      )
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add game to section'
      throw new Error(`Failed to add game to section: ${errorMessage}`)
    }
  }

  /**
   * Remove a game from a section
   */
  async removeGameFromSection(username: string, sectionId: string, gameId: string): Promise<{ id: string; gameIds: string[] }> {
    try {
      const response: AxiosResponse<{ id: string; gameIds: string[] }> = await this.axiosInstance.delete(
        `/casinos/${encodeURIComponent(username)}/sections/${sectionId}/games/${gameId}`
      )
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove game from section'
      throw new Error(`Failed to remove game from section: ${errorMessage}`)
    }
  }

  /**
   * Update a section's title and/or layout
   */
  async updateSection(username: string, sectionId: string, updates: { title?: string; layout?: string }): Promise<{ id: string; title: string; layout: string }> {
    try {
      const response: AxiosResponse<{ id: string; title: string; layout: string }> = await this.axiosInstance.patch(
        `/casinos/${encodeURIComponent(username)}/sections/${sectionId}`,
        updates
      )
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update section'
      throw new Error(`Failed to update section: ${errorMessage}`)
    }
  }

  /**
   * Delete a section from a casino
   */
  async deleteSection(username: string, sectionId: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.axiosInstance.delete(
        `/casinos/${encodeURIComponent(username)}/sections/${sectionId}`
      )
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete section'
      throw new Error(`Failed to delete section: ${errorMessage}`)
    }
  }

  /**
   * Delete a game from a casino
   */
  async deleteGame(username: string, gameId: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.axiosInstance.delete(
        `/casinos/${encodeURIComponent(username)}/games/${gameId}`
      )
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete game'
      throw new Error(`Failed to delete game: ${errorMessage}`)
    }
  }

  /**
   * Partial update casino configuration (PATCH)
   * Use this for updating specific fields without affecting games/sections
   */
  async updateCasino(username: string, updates: CasinoUpdateRequest): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.axiosInstance.patch(
        `/casinos/${encodeURIComponent(username)}`,
        updates
      )
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update casino'
      throw new Error(`Failed to update casino: ${errorMessage}`)
    }
  }

  /**
   * Get casino previews for discovery page
   */
  async getCasinoPreviews(): Promise<CasinoPreviewResponse[]> {
    try {
      const response: AxiosResponse<CasinoPreviewResponse[]> = await this.axiosInstance.get(
        '/casinos/previews'
      )
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get casino previews'
      throw new Error(`Failed to get casino previews: ${errorMessage}`)
    }
  }

  /**
   * Get featured casinos
   */
  async getFeaturedCasinos(limit = 3): Promise<FeaturedCasinoResponse[]> {
    try {
      const response: AxiosResponse<FeaturedCasinoResponse[]> = await this.axiosInstance.get(
        `/casinos/featured?limit=${limit}`
      )
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get featured casinos'
      throw new Error(`Failed to get featured casinos: ${errorMessage}`)
    }
  }
}

// Singleton instance
let apiInstance: CasinoApi | null = null

export const getCasinoApi = (): CasinoApi => {
  if (!apiInstance) {
    apiInstance = new CasinoApi()
  }
  return apiInstance
}