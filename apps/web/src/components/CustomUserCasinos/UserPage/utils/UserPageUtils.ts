// @ts-nocheck
import { FARE_COLORS } from '@/design'
import { type CasinoEntity, type CustomCasinoGame } from '../../shared/types'
import { type PageConfig } from '../../config/PageConfig'
import { ConfigManager } from '../../config/ConfigManager'

// Type for editable fields to improve type safety
export type EditableField =
  | 'title'
  | 'shortDescription'
  | 'longDescription'
  | 'welcomeMessage'
  | 'font'
  | 'bannerImage'
  | 'profileImage'
  | 'colors.themeColor1'
  | 'colors.themeColor2'
  | 'colors.themeColor3'
  | `section.${string}.title`
  | `section.${string}.games`
  | string

// Create a default config from the casino data
export const createDefaultConfig = (casino: CasinoEntity): PageConfig => {
  const defaultConfigData = {
    title: casino.config?.title || 'Default Casino',
    shortDescription: casino.config?.shortDescription || 'A casino with games',
    longDescription: '',
    bannerImage: casino.config?.bannerImage || '',
    profileImage: casino.config?.profileImage || '',
    socialLinks: {
      discord: '',
      telegram: '',
      twitter: '',
      instagram: '',
      youtube: '',
    },
    colors: {
      themeColor1: casino.config?.colors?.themeColor1 || FARE_COLORS.peach,
      themeColor2: casino.config?.colors?.themeColor2 || FARE_COLORS.salmon,
      themeColor3: casino.config?.colors?.themeColor3 || FARE_COLORS.pink,
      backgroundColor: '#0a0a0a',
    },
    font: casino.config?.font || 'Arial, Helvetica, sans-serif',
    styleName: 'default',
    featuredGames: casino.config?.featuredGames || [],
    sections: casino.config?.sections || [
      {
        id: 'default',
        title: 'Games',
        gameIds: casino.games?.map(game => game.id) || [],
        layout: 'smallTiles' as const,
      },
    ],
    customSections: [],
    welcomeMessage: `Welcome to ${casino.config?.title || 'our casino'}!`,
    displayOptions: {
      gridDensity: 'medium',
      sortOrder: 'popular',
    },
    enabledGames: casino.games || [],
  }

  return ConfigManager.getInstance().loadConfig('page', defaultConfigData) as PageConfig
}

// Get game sections for rendering
export const getGameSections = (pageConfig: PageConfig, availableGames: CustomCasinoGame[]) => {
  if (!pageConfig) return []

  return pageConfig.sections.map(section => {
    const sectionGames = section.gameIds
      .map(id => availableGames.find(game => game.id === id))
      .filter(Boolean) as CustomCasinoGame[]

    return {
      id: section.id,
      title: section.title,
      games: sectionGames,
      layout: section.layout,
    }
  })
}

// Handle editing of config fields
export const handleConfigEdit = (
  pageConfig: PageConfig,
  fieldName: EditableField,
  fieldValue: string,
  updateConfig: (field: keyof PageConfig | 'sections', value: any) => void
): PageConfig | null => {
  if (!pageConfig) return null

  const newConfig = JSON.parse(JSON.stringify(pageConfig)) as PageConfig

  // Special handling for section title fields
  if (fieldName.startsWith('section.') && fieldName.endsWith('.title')) {
    // Extract section ID from field name
    const sectionId = fieldName.match(/section\.([^.]+)\.title/)?.[1]

    if (sectionId && newConfig.sections) {
      const section = newConfig.sections.find(s => s.id === sectionId)

      if (section) {
        section.title = fieldValue

        // Pass the entire sections array to updateConfig to ensure complete update
        updateConfig('sections', JSON.stringify(newConfig.sections))
        return newConfig
      } else {
        console.error('handleConfigEdit - Section not found:', sectionId)
      }
    } else {
      console.error('handleConfigEdit - Invalid section ID or no sections array')
    }
  }

  if (fieldName === 'sections') {
    try {
      const parsedSections = JSON.parse(fieldValue)
      newConfig.sections = parsedSections
      updateConfig('sections', fieldValue)
    } catch (error) {
      console.error('Error updating sections:', error)
      return null
    }
  } else {
    // Handle nested fields (e.g., colors.themeColor1)
    const parts = fieldName.split('.')
    let current: any = newConfig

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {}
      }
      current = current[parts[i]]
    }

    current[parts[parts.length - 1]] = fieldValue
    updateConfig(fieldName as keyof PageConfig, fieldValue)
  }

  return newConfig
}
