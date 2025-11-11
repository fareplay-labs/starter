// @ts-nocheck
import { type StoredSound } from '../types/sound.types'
import { getMediaStorageApi, type MediaStorageResponse } from './mediaStorageApi'

export interface ISoundService {
  uploadSounds(files: File[]): Promise<StoredSound[]>
  getUserSounds(): Promise<StoredSound[]>
  deleteSound(soundId: string): Promise<void>
  getSound(soundId: string): Promise<StoredSound | null>
}

/**
 * Real Media Storage API-based sound service
 */
class RealSoundService implements ISoundService {
  private api = getMediaStorageApi()

  /**
   * Convert MediaStorageResponse to StoredSound format
   */
  private mediaToStoredSound(media: MediaStorageResponse): StoredSound {
    // Extract name from filename (remove extension)
    const name = media.fileName.replace(/\.[^/.]+$/, '')

    return {
      id: media.id,
      filename: media.fileName,
      data: {
        url: media.url,
        name: name,
        fileSize: media.size,
        format: media.fileType.includes('mp3') ? 'mp3' : 'wav',
        // Duration is not provided by the API, will be undefined (shows as "Unknown" in UI)
        // volume defaults to 0.7 in the UI if not set
        metadata: {
          uploadDate: media.createdAt || new Date().toISOString(),
        },
      },
    }
  }

  async uploadSounds(files: File[]): Promise<StoredSound[]> {
    try {
      const uploadPromises = files.map(file => this.api.uploadMedia(file))
      const mediaResponses = await Promise.all(uploadPromises)
      return mediaResponses.map(media => this.mediaToStoredSound(media))
    } catch (error) {
      console.error('[RealSoundService] Upload failed:', error)
      throw error
    }
  }

  async getUserSounds(): Promise<StoredSound[]> {
    const mediaList = await this.api.getUserMedia('audio')
    return mediaList.map(media => this.mediaToStoredSound(media))
  }

  async deleteSound(soundId: string): Promise<void> {
    await this.api.deleteMedia(soundId)
  }

  async getSound(soundId: string): Promise<StoredSound | null> {
    try {
      const media = await this.api.getMediaById(soundId)
      return this.mediaToStoredSound(media)
    } catch (error) {
      console.error('Failed to get sound:', error)
      return null
    }
  }
}

// Singleton instance to prevent recreating service
let soundServiceInstance: ISoundService | null = null

/**
 * Factory to return the real sound service
 */
export const createSoundService = (): ISoundService => {
  // Return existing instance if already created
  if (soundServiceInstance) {
    return soundServiceInstance
  }

  // Always use real sound service
  soundServiceInstance = new RealSoundService()
  return soundServiceInstance
}
