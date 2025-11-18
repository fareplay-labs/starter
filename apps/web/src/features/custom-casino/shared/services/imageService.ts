// @ts-nocheck
import { type StoredImage, type ImageUploadOptions } from '../types/image.types'
import { getMediaStorageApi, type MediaStorageResponse } from './mediaStorageApi'

export interface IImageService {
  uploadImages(
    files: File[],
    options?: ImageUploadOptions
  ): Promise<StoredImage[]>
  getUserImages(): Promise<StoredImage[]>
  deleteImage(imageId: string): Promise<void>
  getImage(imageId: string): Promise<StoredImage | null>
  updateImageMetadata(imageId: string, metadata: Partial<ImageUploadOptions>): Promise<void>
}

/**
 * Real Media Storage API-based image service
 */
class ImageService implements IImageService {
  private api = getMediaStorageApi()
  private metadataService: ImageMetadataService

  constructor() {
    this.metadataService = new ImageMetadataService()
  }

  /**
   * Convert MediaStorageResponse to StoredImage format
   */
  private mediaToStoredImage(media: MediaStorageResponse): StoredImage {
    // Get locally stored metadata
    const localMetadata = this.metadataService.getMetadata(media.id)

    return {
      id: media.id,
      filename: media.fileName,
      data: {
        url: media.url,
        fileSize: media.size,
        format: media.fileType.split('/')[1] || 'png',
        tags: localMetadata?.tags,
        crop: localMetadata?.crop,
        aiGeneration: localMetadata?.aiGeneration,
        metadata: {
          uploadDate: media.createdAt || new Date().toISOString(),
          aiGeneration: localMetadata?.aiGeneration,
          crop: localMetadata?.crop,
        },
      },
    }
  }

  /**
   * Convert image to PNG format if needed
   */
  private async ensurePNGFormat(file: File): Promise<File> {
    if (file.type === 'image/png') return file

    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob(
          blob => {
            if (blob) {
              const pngFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.png'), {
                type: 'image/png',
              })
              resolve(pngFile)
            } else {
              reject(new Error('Failed to convert image to PNG'))
            }
          },
          'image/png',
          1.0
        )
      }

      img.onerror = () => reject(new Error('Failed to load image for conversion'))

      const reader = new FileReader()
      reader.onload = e => {
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  async uploadImages(
    files: File[],
    options?: ImageUploadOptions
  ): Promise<StoredImage[]> {
    try {
      const processedFiles = await Promise.all(files.map(file => this.ensurePNGFormat(file)))

      const uploadPromises = processedFiles.map(async file => {
        const media = await this.api.uploadMedia(file)

        // Store metadata locally until backend supports it
        if (options) {
          this.metadataService.setMetadata(media.id, {
            tags: options.tags,
            crop: options.crop,
            aiGeneration: options.aiGeneration,
          })
        }

        return this.mediaToStoredImage(media)
      })

      return Promise.all(uploadPromises)
    } catch (error) {
      console.error('[ImageService] Upload failed:', error)
      throw error
    }
  }

  async getUserImages(): Promise<StoredImage[]> {
    const mediaList = await this.api.getUserMedia('image')
    return mediaList.map(media => this.mediaToStoredImage(media))
  }

  async deleteImage(imageId: string): Promise<void> {
    await this.api.deleteMedia(imageId)
    this.metadataService.deleteMetadata(imageId)
  }

  async getImage(imageId: string): Promise<StoredImage | null> {
    try {
      const media = await this.api.getMediaById(imageId)
      return this.mediaToStoredImage(media)
    } catch (error) {
      console.error('Failed to get image:', error)
      return null
    }
  }

  async updateImageMetadata(imageId: string, metadata: Partial<ImageUploadOptions>): Promise<void> {
    // Store metadata locally until backend supports it
    const existing = this.metadataService.getMetadata(imageId)
    this.metadataService.setMetadata(imageId, {
      ...existing,
      ...metadata,
    })
  }
}

/**
 * Local metadata service for storing image metadata until backend supports it
 */
class ImageMetadataService {
  private storageKey = 'image_metadata'

  getMetadata(imageId: string): ImageUploadOptions | undefined {
    try {
      const allMetadata = this.getAllMetadata()
      return allMetadata[imageId]
    } catch {
      return undefined
    }
  }

  setMetadata(imageId: string, metadata: ImageUploadOptions): void {
    const allMetadata = this.getAllMetadata()
    allMetadata[imageId] = metadata
    localStorage.setItem(this.storageKey, JSON.stringify(allMetadata))
  }

  deleteMetadata(imageId: string): void {
    const allMetadata = this.getAllMetadata()
    delete allMetadata[imageId]
    localStorage.setItem(this.storageKey, JSON.stringify(allMetadata))
  }

  private getAllMetadata(): Record<string, ImageUploadOptions> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }
}

// Singleton instance to prevent recreating service
let imageServiceInstance: IImageService | null = null

/**
 * Factory to create the image service.
 * Currently uses an in-browser media store (MediaStorageApi) only.
 */
export const createImageService = (): IImageService => {
  if (imageServiceInstance) {
    return imageServiceInstance
  }

  imageServiceInstance = new ImageService()
  return imageServiceInstance
}
