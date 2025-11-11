// @ts-nocheck
// File: components/CasinoScrollSection/CasinoScrollSection.tsx
import React, { memo } from 'react'
import { type CasinoPreview } from '../../shared/types'
import { CasinoCard } from '../CasinoCard/CasinoCard'
import { SSection, STitle, SScrollWrapper } from './CasinoScrollSection.styles'
import { HorizontalScrollContainer } from '../Scroller'

interface CasinoScrollSectionProps {
  title: string
  casinos: CasinoPreview[]
  scrollAmount?: number // Percentage of visible width to scroll (0-1)
}

const CasinoScrollSectionComponent: React.FC<CasinoScrollSectionProps> = ({
  title,
  casinos,
  scrollAmount = 0.8, // Default to 80% of visible width
}) => {
  return (
    <SSection>
      <STitle id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</STitle>
      <SScrollWrapper>
        <HorizontalScrollContainer
          scrollAmount={scrollAmount}
          ariaLabelledBy={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
          id={`section-${title.replace(/\s+/g, '-').toLowerCase()}-content`}
        >
          {casinos.map(casino => (
            <CasinoCard key={casino.id} casino={casino} />
          ))}
        </HorizontalScrollContainer>
      </SScrollWrapper>
    </SSection>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const CasinoScrollSection = memo(CasinoScrollSectionComponent)
