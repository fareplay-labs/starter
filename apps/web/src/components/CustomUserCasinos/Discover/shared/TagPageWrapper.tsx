// @ts-nocheck
import { STagWrapper } from '../DiscoverPage.styles'
import { HorizontalScrollContainer } from '../Scroller'

interface TagPageWrapperProps {
  scrollAmount?: number
  title: string
  children: React.ReactNode
}

export const TagPageWrapper = ({ scrollAmount, title, children }: TagPageWrapperProps) => {
  const slug = `section-${title.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <STagWrapper>
      <HorizontalScrollContainer
        scrollAmount={scrollAmount}
        aria-labelledby={slug}
        id={`${slug}-content`}
      >
        {children}
      </HorizontalScrollContainer>
    </STagWrapper>
  )
}
