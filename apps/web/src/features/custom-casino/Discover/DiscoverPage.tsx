// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { type FeaturedCasinoPreview, type CasinoPreview } from '../shared/types'
import { CasinoHeroSection } from './CasinoHeroSection/CasinoHeroSection'
import { CasinoScrollSection } from './CasinoScrollSection/CasinoScrollSection'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useCasinoSections } from './hooks/useCasinoSections'
import { useBackendService } from '../backend/hooks'
import CasinoGridSection from './CasinoScrollSection/CasinoGridSection'
import { CasinoTagSection } from './CasinoTagSection'
import { ActionTiles } from './ActionTiles'
import { DiscoverPageWrapper } from './shared/DiscoverPageWrapper'
import { PlaceholderCard } from './Placeholders/PlaceholderCard'
import { SSection, STitle } from './CasinoScrollSection/CasinoScrollSection.styles'
import { PlaceholderSections } from './Placeholders/PlaceholderSections'

export const DiscoverPage: React.FC = () => {
  const [searchQuery, _setSearchQuery] = useState('')
  const { loadFromLocalStorage } = useFavoritesStore()
  const { getCasinoPreviews, getFeaturedCasinoPreviews, isLoading } = useBackendService()
  // Helper to create slug-safe section IDs
  function toSectionId(section: string): string {
    return section
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  // State for casino previews and featured casinos
  const [casinoPreviews, setCasinoPreviews] = useState<CasinoPreview[]>([])
  const [featuredPreviews, setFeaturedPreviews] = useState<FeaturedCasinoPreview[]>([])

  // Load casino previews from backend service
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load preview data from backend service
        const previews = await getCasinoPreviews()
        const featured = await getFeaturedCasinoPreviews()

        setCasinoPreviews(previews)
        setFeaturedPreviews(featured)
      } catch (error) {
        console.error('Error loading casino previews:', error)
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sections = useCasinoSections(casinoPreviews, searchQuery)

  // Clear placeholder section selection when real data loads
  useEffect(() => {
    if (casinoPreviews.length > 0 && selectedSection && sections.length > 0) {
      const realSectionTitles = sections.map(s => s.title)
      if (!realSectionTitles.includes(selectedSection)) {
        setSelectedSection(null)
      }
    }
  }, [casinoPreviews, selectedSection, sections])

  const placeholderSections =
    sections.length === 0 ? [...PlaceholderSections().map(section => section.title)] : []

  useEffect(() => {
    loadFromLocalStorage()
  }, [loadFromLocalStorage])

  if (isLoading) {
    return (
      <DiscoverPageWrapper>
        <div>Loading casinos...</div>
      </DiscoverPageWrapper>
    )
  }

  return (
    <DiscoverPageWrapper>
      <CasinoHeroSection featuredItems={featuredPreviews} />

      <ActionTiles />
      <CasinoTagSection
        casinoPreviews={casinoPreviews}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        title='Sections'
      />

      {sections.length === 0 && (
        <>
          {selectedSection ?
            placeholderSections
              .filter(section => section === selectedSection)
              .map(section => (
                <SSection key={section}>
                  <STitle id={toSectionId(section)}>{section}</STitle>
                  <PlaceholderCard />
                </SSection>
              ))
          : placeholderSections.slice(0, 3).map(section => (
              <SSection key={section}>
                <STitle id={toSectionId(section)}>{section}</STitle>
                <PlaceholderCard />
              </SSection>
            ))
          }
          {selectedSection && !placeholderSections.includes(selectedSection) && (
            <SSection>
              <STitle id={toSectionId(selectedSection)}>{selectedSection}</STitle>
              <div>No content available for this section yet.</div>
            </SSection>
          )}
        </>
      )}

      {selectedSection ?
        sections
          .filter(section => section.title === selectedSection)
          .map(section => <CasinoGridSection key={section.title} casinos={section.casinos} />)
      : sections.map(section => (
          <CasinoScrollSection
            key={section.title}
            title={section.title}
            casinos={section.casinos}
          />
        ))
      }
    </DiscoverPageWrapper>
  )
}
