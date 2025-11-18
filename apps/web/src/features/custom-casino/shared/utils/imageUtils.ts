// @ts-nocheck
/**
 * Utility functions for handling images in Vite environment
 */

/**
 * Dynamically imports an image from the assets directory
 * @param path The path to the image, starting from src/
 * @returns The resolved image URL
 */
export const resolveImagePath = async (path: string): Promise<string> => {
  if (!path) return 'none'
  if (path.startsWith('http')) return path

  try {
    // Remove /src/ prefix if present
    const normalizedPath = path.startsWith('/src/') ? path.slice(5) : path
    // Use dynamic import for the image
    const imageModule = await import(`@/${normalizedPath}`)
    return imageModule.default
  } catch (error) {
    console.error('Failed to load image:', path, error)
    return 'none'
  }
}

/**
 * Synchronously resolves an image path (use when async is not possible)
 */
export const resolveImagePathSync = (path: string): string => {
  if (!path) return 'none'
  if (path.startsWith('http')) return path

  try {
    // Remove /src/ prefix if present and use @ alias
    const normalizedPath =
      path.startsWith('/src/') ? path.replace('/src/', '@/')
      : path.startsWith('/assets/') ? path.replace('/assets/', '@/assets/')
      : path

    return normalizedPath
  } catch (error) {
    console.error('Failed to resolve image path:', path, error)
    return 'none'
  }
}
