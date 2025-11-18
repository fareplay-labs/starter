// @ts-nocheck
import { type ImageData } from '../../config/PageConfig'

/**
 * Extracts just the URL from image data that could be either a string or ImageData
 * @param imageData String or ImageData
 * @returns Just the URL string
 */
export const getImageUrl = (imageData: string | ImageData | undefined): string => {
  if (!imageData) return ''

  if (typeof imageData === 'string') {
    try {
      // Check if it's a JSON string with image data
      const parsed = JSON.parse(imageData)
      if (parsed && typeof parsed === 'object' && typeof parsed.url === 'string') {
        return parsed.url
      }
      // If parsing succeeds but it's not the expected format, return the original string
      return imageData
    } catch (e) {
      // If it's not valid JSON, assume it's just a URL string
      return imageData
    }
  } else {
    // If it's already an ImageData object
    return imageData.url
  }
}

/**
 * Formats image data with standardized structure for storage
 * @param imageUrl URL of the image
 * @param cropData Optional crop data
 * @param aiData Optional AI generation data
 * @returns Formatted ImageData object as string
 */
export const formatImageData = (
  imageUrl: string,
  cropData?: { points: number[]; zoom: number } | null,
  aiData?: {
    prompt: string
    model: 'dall-e-3' | 'gpt-image-1'
    status: 'pending' | 'generating' | 'completed' | 'failed'
  } | null
): string => {
  // Create a standardized image data object
  const dataObject: Partial<ImageData> = {
    url: imageUrl,
  }

  // Only add crop property if cropData is provided
  if (cropData && cropData.points && cropData.points.length === 4) {
    dataObject.crop = {
      points: cropData.points,
      zoom: cropData.zoom,
    }
  }

  // Add AI generation data if provided
  if (aiData) {
    dataObject.aiGeneration = {
      ...aiData,
      fileName: `ai_generated_${Date.now()}.png`,
      timestamp: new Date().toISOString(),
    }
  }

  return JSON.stringify(dataObject)
}

/**
 * Checks if an image is AI-generated and still in progress
 * @param imageData The image data to check
 * @returns Whether the image is still being generated
 */
export const isGeneratingAIImage = (imageData: string | ImageData | undefined): boolean => {
  if (!imageData) return false

  try {
    const data = typeof imageData === 'string' ? JSON.parse(imageData) : imageData
    return !!(data.aiGeneration && ['pending', 'generating'].includes(data.aiGeneration.status))
  } catch {
    return false
  }
}

/**
 * Gets the AI generation status of an image
 * @param imageData The image data to check
 * @returns The AI generation status or null if not AI-generated
 */
export const getAIGenerationStatus = (
  imageData: string | ImageData | undefined
): { prompt: string; status: string; model: string; timestamp: string } | null => {
  if (!imageData) return null

  try {
    const data = typeof imageData === 'string' ? JSON.parse(imageData) : imageData
    return data.aiGeneration || null
  } catch {
    return null
  }
}

/**
 * Updates the AI generation status of an image
 * @param imageData The current image data
 * @param status The new status
 * @returns Updated image data as a string
 */
export const updateAIGenerationStatus = (
  imageData: string | ImageData,
  status: 'pending' | 'generating' | 'completed' | 'failed'
): string => {
  const data = typeof imageData === 'string' ? JSON.parse(imageData) : imageData

  if (data.aiGeneration) {
    data.aiGeneration.status = status
    data.aiGeneration.timestamp = new Date().toISOString()
  }

  return JSON.stringify(data)
}
