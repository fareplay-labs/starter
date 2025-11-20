// @ts-nocheck
import { type CasinoPreview } from '../../shared/types'
import { STag } from '../DiscoverPage.styles'
import { useCasinoSections } from '../hooks/useCasinoSections'
import { PlaceholderSections } from '../Placeholders/PlaceholderSections'
import { TagPageWrapper } from '../shared/TagPageWrapper'
interface CasinoTagSectionProps {
  casinoPreviews: CasinoPreview[]
  selectedSection: string | null
  setSelectedSection: (section: string | null) => void
  title: string
  scrollAmount?: number // Percentage of visible width to scroll (0-1)
}

export const CasinoTagSection = ({
  casinoPreviews,
  selectedSection,
  setSelectedSection,
  title,
  scrollAmount = 0.8, // Default to 80% of visible width
}: CasinoTagSectionProps) => {
  const sections = useCasinoSections(casinoPreviews)

  const allSections = [...sections]

  if (allSections.length === 0) {
    return (
      <TagPageWrapper
        title={title}
        scrollAmount={scrollAmount}
        key={`tag-page-wrapper-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {PlaceholderSections().map((tag, idx) => (
          <STag
            key={tag.title + idx}
            $isActive={selectedSection === tag.title}
            onClick={() => setSelectedSection(selectedSection === tag.title ? null : tag.title)}
            aria-label={
              selectedSection === tag.title ?
                `Unselect ${tag.title} section`
              : `Select ${tag.title} section`
            }
            title={
              selectedSection === tag.title ?
                `Click to unselect ${tag.title}`
              : `Click to filter by ${tag.title}`
            }
          >
            {tag.title}
          </STag>
        ))}
      </TagPageWrapper>
    )
  }

  return (
    <TagPageWrapper
      title={title}
      scrollAmount={scrollAmount}
      key={`tag-page-wrapper-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {allSections.map(
        section =>
          section && (
            <STag
              $isActive={selectedSection === section.title}
              key={section.title}
              onClick={() =>
                setSelectedSection(selectedSection === section.title ? null : section.title)
              }
              aria-label={
                selectedSection === section.title ?
                  `Unselect ${section.title} section`
                : `Select ${section.title} section`
              }
              title={
                selectedSection === section.title ?
                  `Click to unselect ${section.title}`
                : `Click to filter by ${section.title}`
              }
            >
              {section.title}
            </STag>
          )
      )}
    </TagPageWrapper>
  )
}
