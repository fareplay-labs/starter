// @ts-nocheck
import { nanoid } from 'nanoid'

export interface MediaStorageResponse {
  id: string
  fileName: string
  fileType: string
  mediaType: 'image' | 'audio'
  url: string
  size: number
  createdAt?: string
}

const MEDIA_STORAGE_KEY = 'custom_casino_media_library'

type StoredMedia = MediaStorageResponse & { dataUrl: string }

const readStore = (): StoredMedia[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(MEDIA_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredMedia[]
  } catch {
    return []
  }
}

const writeStore = (items: StoredMedia[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items))
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })

export class MediaStorageApi {
  private detectType(file: File): 'image' | 'audio' {
    if (file.type.startsWith('audio/')) return 'audio'
    return 'image'
  }

  /**
   * Upload a media file to storage (local fallback)
   */
  async uploadMedia(file: File): Promise<MediaStorageResponse> {
    const dataUrl = await fileToDataUrl(file)
    const record: StoredMedia = {
      id: nanoid(),
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      mediaType: this.detectType(file),
      url: dataUrl,
      dataUrl,
      size: file.size,
      createdAt: new Date().toISOString(),
    }

    const current = readStore()
    current.unshift(record)
    writeStore(current)

    return record
  }

  /**
   * Get all media files for a user (local fallback)
   */
  async getUserMedia(mediaType?: 'audio' | 'image'): Promise<MediaStorageResponse[]> {
    const items = readStore()
    return mediaType ? items.filter(item => item.mediaType === mediaType) : items
  }

  /**
   * Get a single media file by ID
   */
  async getMediaById(id: string): Promise<MediaStorageResponse> {
    const item = readStore().find(media => media.id === id)
    if (!item) {
      throw new Error('Media not found')
    }
    return item
  }

  /**
   * Delete a media file
   */
  async deleteMedia(id: string): Promise<void> {
    const remaining = readStore().filter(media => media.id !== id)
    writeStore(remaining)
  }

  /**
   * Get audio file duration in seconds using Web Audio API
   */
  static async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          const duration = audioBuffer.duration
          audioContext.close()
          resolve(duration)
        } catch (error) {
          audioContext.close()
          reject(new Error('Failed to decode audio file'))
        }
      }

      reader.onerror = () => {
        audioContext.close()
        reject(new Error('Failed to read audio file'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Validate if an audio file is supported (synchronous checks only)
   */
  static validateAudioFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please upload MP3 or WAV files only',
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be under 10MB',
      }
    }

    return { valid: true }
  }

  /**
   * Validate audio file including duration check (async)
   */
  static async validateAudioFileWithDuration(file: File): Promise<{ valid: boolean; error?: string }> {
    // First do synchronous validation
    const basicValidation = this.validateAudioFile(file)
    if (!basicValidation.valid) {
      return basicValidation
    }

    // Then check duration
    try {
      const duration = await this.getAudioDuration(file)
      const maxDuration = 8 // 8 seconds

      if (duration > maxDuration) {
        return {
          valid: false,
          error: `Audio duration (${duration.toFixed(1)}s) exceeds maximum of ${maxDuration} seconds`,
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to validate audio duration',
      }
    }
  }

  /**
   * Validate if an image file is supported
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please upload PNG, JPG, GIF, or WebP files only',
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be under 5MB',
      }
    }

    return { valid: true }
  }
}

let apiInstance: MediaStorageApi | null = null

export const getMediaStorageApi = (): MediaStorageApi => {
  if (!apiInstance) {
    apiInstance = new MediaStorageApi()
  }
  return apiInstance
}
