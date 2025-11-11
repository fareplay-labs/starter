// @ts-nocheck
/**
 * Helper to determine if a value is an image URL
 */
export const isImageValue = (value: string): boolean => {
  // Handle image with opacity format: 'imageUrl|opacity'
  const imageUrl = value.includes('|') ? value.split('|')[0] : value

  return (
    imageUrl.trim().startsWith('url(') ||
    imageUrl.includes('://') ||
    imageUrl.includes('/static/') ||
    imageUrl.includes('/uploads/')
  )
}

/**
 * Helper to determine if a value is a gradient
 */
export const isGradientValue = (value: string): boolean => {
  return value.trim().startsWith('linear-gradient(') || value.trim().startsWith('radial-gradient(')
}

/**
 * Parse image value with opacity format: 'imageUrl|opacity'
 */
export const parseImageValue = (value: string): { url: string; opacity: number } => {
  if (!value.includes('|')) {
    return { url: value, opacity: 1 }
  }

  const [url, opacityStr] = value.split('|')
  const opacity = parseFloat(opacityStr)

  return {
    url: url.trim(),
    opacity: isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity)),
  }
}

/**
 * Build image value with opacity format: 'imageUrl|opacity'
 */
export const buildImageValue = (url: string, opacity = 1): string => {
  if (opacity === 1) {
    return url
  }
  return `${url}|${opacity}`
}

/**
 * Determine the background type
 */
export type BackgroundType = 'solid' | 'gradient' | 'image'

export const getBackgroundType = (value: string | { url: string } | any): BackgroundType => {
  // Handle ImageData objects
  if (typeof value === 'object' && value !== null && 'url' in value) {
    return getBackgroundType(value.url)
  }

  // Handle string values
  if (typeof value === 'string') {
    if (isImageValue(value)) return 'image'
    if (isGradientValue(value)) return 'gradient'
    return 'solid'
  }

  // Fallback for any other case
  return 'solid'
}

/**
 * Create CSS background value from string
 */
export const createBackgroundValue = (value: string): string => {
  if (isImageValue(value)) {
    const { url } = parseImageValue(value)
    // If it already has url() format, use it directly, otherwise wrap it
    return url.includes('url(') ? url : `url(${url})`
  }
  return value
}
