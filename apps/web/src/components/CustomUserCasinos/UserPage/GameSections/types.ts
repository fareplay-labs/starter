// @ts-nocheck
import { type CustomCasinoGame } from '../../shared/types'
import { type ThemeColors } from './utils'

export interface GameSectionProps {
  sectionId: string
  title: string
  games: CustomCasinoGame[]
  isEditMode?: boolean
  themeColors: ThemeColors
  layout?: 'carousel' | 'smallTiles' | 'largeTiles'
  ownerUsername?: string
  onEdit?: (field: string, value: string) => void
  onAddGame?: (sectionId: string) => void
  onRemoveGame?: (sectionId: string, gameId: string) => void
  onRemoveSection?: (sectionId: string) => void
  onSectionOrderChange?: (
    newSections: Array<{
      id: string
      title: string
      games: CustomCasinoGame[]
      layout?: 'carousel' | 'smallTiles' | 'largeTiles'
    }>
  ) => void
}

export interface GameSectionsProps {
  sections: Array<{
    id: string
    title: string
    games: CustomCasinoGame[]
    layout?: 'carousel' | 'smallTiles' | 'largeTiles'
  }>
  games: CustomCasinoGame[]
  ownerUsername?: string
  isEditMode?: boolean
  themeColors: ThemeColors
  onEdit?: (field: string, value: string) => void
  onAddSection?: () => void
  onAddGame?: (sectionId: string) => void
  onRemoveGame?: (sectionId: string, gameId: string) => void
  onRemoveSection?: (sectionId: string) => void
  onSectionOrderChange?: (
    newSections: Array<{
      id: string
      title: string
      games: CustomCasinoGame[]
      layout?: 'carousel' | 'smallTiles' | 'largeTiles'
    }>
  ) => void
}
