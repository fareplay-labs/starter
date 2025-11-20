// @ts-nocheck
import { type IConfig } from './IConfig'
import { FARE_COLORS } from '@/design'
import { type Area } from 'react-easy-crop'
import { type ICasinoTag } from './Tags'

export interface ImageData {
  url: string // This also (sometimes) accepts a hex code for a solid color
  crop?:
    | {
        points: number[] // [x1, y1, x2, y2] - Top-left and bottom-right coordinates
        zoom: number // Zoom level applied to image
      }
    | Area
  aiGeneration?: {
    prompt: string
    fileName: string
    model: 'gpt-image-1' | 'dall-e-3'
    status: 'pending' | 'generating' | 'completed' | 'failed'
    timestamp: string
  }
}

export interface IPageConfigData {
  // Basic Information
  casinoId: string // Unique ID - can be user address
  title?: string
  casinoTags?: ICasinoTag[]
  shortDescription?: string
  longDescription?: string

  // Theme
  bannerImage?: ImageData
  profileImage?: ImageData
  socialLinks?: {
    links?: string[]
    layoutType?: 'horizontal' | 'vertical' | 'showLinks'
  }
  colors?: {
    themeColor1?: string
    themeColor2?: string
    themeColor3?: string
    backgroundColor?: string
  }
  font?: string

  // Content Customization
  sections?: Array<{
    id: string
    title: string
    gameIds: string[]
    layout: 'carousel' | 'smallTiles' | 'largeTiles'
  }>
  customSections?: Array<{
    title: string
    gameIds: string[]
  }>
  welcomeMessage?: string
  displayOptions?: {
    gridDensity?: 'compact' | 'medium' | 'expanded'
    sortOrder?: 'alphabetical' | 'popular' | 'custom'
  }
}

export class PageConfig implements IConfig {
  // Basic Information
  title = 'Default Title'
  shortDescription = ''
  longDescription = ''

  bannerImage: ImageData = { url: '' }
  profileImage: ImageData = { url: '' }
  socialLinks = {
    links: [] as string[],
    layoutType: 'horizontal',
  }
  colors = {
    themeColor1: FARE_COLORS.peach as string,
    themeColor2: FARE_COLORS.salmon as string,
    themeColor3: FARE_COLORS.pink as string,
    backgroundColor: '#0a0a0a',
  }
  font = 'Arial, Helvetica, sans-serif' // Default font
  styleName = 'default' // Custom CSS style class

  // Content Customization
  featuredGames: string[] = [] // IDs of featured games
  sections: Array<{
    id: string
    title: string
    gameIds: string[]
    layout: 'carousel' | 'smallTiles' | 'largeTiles'
  }> = [
    {
      id: 'default',
      title: 'Games',
      gameIds: [],
      layout: 'carousel',
    },
  ]
  customSections: Array<{
    title: string
    gameIds: string[]
  }> = []
  welcomeMessage = ''
  displayOptions: {
    gridDensity: 'compact' | 'medium' | 'expanded'
    sortOrder: 'alphabetical' | 'popular' | 'custom'
  } = {
    gridDensity: 'medium',
    sortOrder: 'popular',
  }

  // Game Config
  enabledGames: any[] = []

  load(data: IPageConfigData): void {
    // Basic Information
    if (data.title !== undefined) this.title = data.title
    if (data.shortDescription !== undefined) this.shortDescription = data.shortDescription
    if (data.longDescription !== undefined) this.longDescription = data.longDescription

    // Visual & Identity
    if (data.bannerImage !== undefined) this.bannerImage = data.bannerImage
    if (data.profileImage !== undefined) this.profileImage = data.profileImage
    if (data.socialLinks) {
      if (data.socialLinks.links !== undefined) this.socialLinks.links = data.socialLinks.links
      if (data.socialLinks.layoutType !== undefined)
        this.socialLinks.layoutType = data.socialLinks.layoutType
    }
    if (data.colors) {
      if (data.colors.themeColor1 !== undefined) this.colors.themeColor1 = data.colors.themeColor1
      if (data.colors.themeColor2 !== undefined) this.colors.themeColor2 = data.colors.themeColor2
      if (data.colors.themeColor3 !== undefined) this.colors.themeColor3 = data.colors.themeColor3
      if (data.colors.backgroundColor !== undefined)
        this.colors.backgroundColor = data.colors.backgroundColor
    }
    if (data.font !== undefined) this.font = data.font

    // Content Customization
    if (data.sections !== undefined) this.sections = data.sections
    if (data.customSections !== undefined) this.customSections = data.customSections
    if (data.welcomeMessage !== undefined) this.welcomeMessage = data.welcomeMessage
    if (data.displayOptions) {
      if (data.displayOptions.gridDensity !== undefined)
        this.displayOptions.gridDensity = data.displayOptions.gridDensity
      if (data.displayOptions.sortOrder !== undefined)
        this.displayOptions.sortOrder = data.displayOptions.sortOrder
    }
  }

  save(): any {
    return {
      // Basic Information
      title: this.title,
      shortDescription: this.shortDescription,
      longDescription: this.longDescription,

      // Visual & Identity
      bannerImage: this.bannerImage,
      profileImage: this.profileImage,
      socialLinks: this.socialLinks,
      colors: this.colors,
      font: this.font,
      styleName: this.styleName,

      // Content Customization
      featuredGames: this.featuredGames,
      sections: this.sections,
      customSections: this.customSections,
      welcomeMessage: this.welcomeMessage,
      displayOptions: this.displayOptions,

      // Game Config
      enabledGames: this.enabledGames,
    }
  }

  validate(): boolean {
    // @TODO: Add more complex validation (e.g. short description < 100 chars)
    // Simple validation: title should not be empty
    return this.title.trim().length > 0
  }

  apply(): void {
    // Placeholder for applying cascading defaults or any additional side effects
  }
}
