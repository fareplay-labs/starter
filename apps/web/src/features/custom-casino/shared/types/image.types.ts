// @ts-nocheck
import { type ImageData } from '../../config/PageConfig'

/**
 * Stored image structure matching the pattern from sound service
 */
export interface StoredImage {
  id: string
  filename: string
  data: ImageData & {
    fileSize?: number
    format?: string
    tags?: string[]
    metadata?: {
      uploadDate: string
      aiGeneration?: ImageData['aiGeneration']
      crop?: ImageData['crop']
    }
  }
}

/**
 * Image upload options
 */
export interface ImageUploadOptions {
  tags?: string[]
  crop?: ImageData['crop']
  aiGeneration?: ImageData['aiGeneration']
}
