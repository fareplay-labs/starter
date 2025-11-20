import type { CustomCasinoGame } from '@/features/custom-casino/shared/types'

export interface NewSection {
  id: string
  title: string
  games: CustomCasinoGame[]
  layout: 'carousel' | 'smallTiles' | 'largeTiles'
}

export const createNewSection = (): NewSection => {
  return {
    id: `section-${Date.now()}`,
    title: 'New Section',
    games: [],
    layout: 'carousel',
  }
}

export const updatedSection = (
  casino: { config: { sections: NewSection[] } },
  newSection: NewSection,
  handleEdit: (key: string, value: string) => void
): void => {
  const updatedSections = [...casino.config.sections, newSection]
  handleEdit('sections', JSON.stringify(updatedSections))
}
