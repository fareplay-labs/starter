// @ts-nocheck
export interface SoundData {
  url: string
  volume?: number // 0-1 range
  name?: string
  duration?: number
  fileSize?: number
  format?: 'mp3' | 'wav'
  metadata?: {
    uploadDate: string
    lastModified?: string
  }
}

// Lightweight reference to sound for game parameters (no large base64 data)
export interface SoundReference {
  soundId: string
  volume?: number // 0-1 range
  name?: string
}

export interface StoredSound {
  id: string
  filename: string
  data: SoundData
  localStorageKey?: string // For mock service
}

export interface SoundUploadProgress {
  fileId: string
  filename: string
  progress: number // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  error?: string
}

// Media Storage API types
export interface MediaStorageSound {
  id: string
  fileName: string
  fileType: string
  url: string // CDN URL
  size: number
  createdAt?: string
}

// Mapping function types
export type MediaToStoredSound = (media: MediaStorageSound) => StoredSound
export type StoredSoundToMedia = (sound: StoredSound) => MediaStorageSound
