// @ts-nocheck
/**
 * Game API Client
 * Handles communication with the backend Game service for game configuration operations
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

export interface GameConfigResponse {
  name: string
  description: string
  icon?: string
  gameSpecificData: Record<string, any>
}

export interface GameConfigRequest {
  name: string
  description: string
  icon?: string
  gameSpecificData: Record<string, any>
}

export class GameApi {
  private axiosInstance: AxiosInstance

  constructor() {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || ''
    if (!baseUrl) {
      console.warn('Backend URL not configured, Game API will not work')
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
        console.log(`[GameApi] ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('[GameApi] Request error:', error)
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[GameApi] Response error:', {
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
   * Get game configuration for a specific game
   */
  async getGameConfig(username: string, gameId: string): Promise<GameConfigResponse> {
    try {
      const response: AxiosResponse<GameConfigResponse> = await this.axiosInstance.get(
        `/casinos/${encodeURIComponent(username)}/games/${encodeURIComponent(gameId)}/config`
      )
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Game config not found for game: ${gameId}`)
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get game config'
      throw new Error(`Failed to get game config: ${errorMessage}`)
    }
  }

  /**
   * Create or update game configuration
   */
  async createOrUpdateGameConfig(
    username: string,
    gameId: string,
    configData: GameConfigRequest
  ): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.axiosInstance.post(
        `/casinos/${encodeURIComponent(username)}/games/${encodeURIComponent(gameId)}/config`,
        configData
      )
      return response.data
    } catch (error: any) {
      console.error('[GameApi] Create/update game config failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save game config'
      throw new Error(`Failed to save game config: ${errorMessage}`)
    }
  }

  /**
   * Upsert game configuration (legacy endpoint)
   * This maps to the /game/upsert-game-config endpoint mentioned in the API docs
   */
  async upsertGameConfig(configData: Record<string, any>): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.axiosInstance.post(
        '/game/upsert-game-config',
        configData
      )
      return response.data
    } catch (error: any) {
      console.error('[GameApi] Upsert game config failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upsert game config'
      throw new Error(`Failed to upsert game config: ${errorMessage}`)
    }
  }
}

// Singleton instance
let apiInstance: GameApi | null = null

export const getGameApi = (): GameApi => {
  if (!apiInstance) {
    apiInstance = new GameApi()
  }
  return apiInstance
}