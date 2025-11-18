// @ts-nocheck
/**
 * Common type definitions for modal components
 */

// Props for the SocialsEditModal
export interface SocialsEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (fieldName: string, value: string) => void
  socialLinks?: {
    discord?: string
    telegram?: string
    twitter?: string
    instagram?: string
    youtube?: string
    [key: string]: string | undefined
  }
}

// Props for the GameSelectModal
export interface GameSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (fieldName: string, value: string) => void
  selectedGames?: string[]
}

// Props for the ProfileEditModal
export interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (fieldName: string, value: string) => void
  username?: string
  bio?: string
}

// Props for the SettingsEditModal
export interface SettingsEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (fieldName: string, value: string) => void
  settings?: {
    theme?: string
    notifications?: boolean
    privacy?: string
    [key: string]: any
  }
}
