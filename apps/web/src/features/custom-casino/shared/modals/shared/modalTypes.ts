// @ts-nocheck
import { type CustomCasinoGame } from '../../types'

/**
 * Enum of all available modal IDs
 */
export const EDIT_MODAL_IDS = {
  IMAGE: 'image-edit',
  LINK: 'link-edit',
  TEXT: 'text-edit',
  COLOR: 'color-edit',
  FONT: 'font-edit',
  GAME_SELECT: 'game-select',
  SECTION_CREATE: 'section-create',
  SOCIALS: 'socials-edit',
} as const

// Type for modal IDs
export type EditModalId = (typeof EDIT_MODAL_IDS)[keyof typeof EDIT_MODAL_IDS]

/**
 * Base props interface that all modal components will share
 */
export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Interface for modals that edit a specific field
 */
export interface FieldEditModalProps extends BaseModalProps {
  fieldName: string
  onSave: (fieldName: string, value: string) => void
  currentValue?: string
}

/**
 * Interface for image edit modal
 */
export interface ImageEditModalProps extends FieldEditModalProps {
  previewUrl?: string
}

/**
 * Layout types for sections
 */
export type SectionLayoutType = 'carousel' | 'smallTiles' | 'largeTiles'

/**
 * Interface for game select modal
 */
export interface GameSelectModalProps extends BaseModalProps {
  onSave: (fieldName: string, value: string) => void
  sectionId: string
  selectedGames: string[]
  availableGames: CustomCasinoGame[]
  themeColors?: ThemeColors
  currentLayout?: SectionLayoutType
  userId?: string
}

/**
 * Interface for section creation modal
 */
export interface SectionCreateModalProps extends BaseModalProps {
  onSave: (fieldName: string, value: string) => void
  title?: string
  userId?: string
}

/**
 * Interface for representing theme colors
 */
export interface ThemeColors {
  themeColor1: string
  themeColor2: string
  themeColor3: string
  backgroundColor?: string
}

/**
 * Social platform type
 */
export type SocialPlatform =
  | 'twitter'
  | 'discord'
  | 'twitch'
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'telegram'
  | 'reddit'
  | 'linkedin'
  | 'github'
  | 'other'

/**
 * Layout type for social links display
 */
export type SocialLayoutType = 'horizontal' | 'vertical' | 'showLinks'

/**
 * Social links configuration interface
 */
export interface SocialLinksConfig {
  links?: string[]
  layoutType?: SocialLayoutType
  [key: string]: string | string[] | SocialLayoutType | undefined
}

/**
 * Interface for socials edit modal
 */
export interface SocialsEditModalProps extends BaseModalProps {
  onSave: (fieldName: string, value: string) => void
  socialLinks?: SocialLinksConfig
}
