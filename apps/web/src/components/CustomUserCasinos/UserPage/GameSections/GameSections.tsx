// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { AddSectionButton } from './components'
import { GameSection } from './GameSection'
import { Reorder } from 'framer-motion'
import { createNewSection } from '@/utils/sectionUtils'
import { type GameSectionsProps } from './types'

export const GameSections: React.FC<GameSectionsProps> = ({
  sections,
  ownerUsername,
  isEditMode = false,
  themeColors,
  onEdit,
  onAddSection,
  onAddGame,
  onRemoveGame,
  onRemoveSection,
  onSectionOrderChange,
}) => {
  const [sectionOrder, setSectionOrder] = useState(sections)

  useEffect(() => {
    setSectionOrder(sections)
  }, [sections])

  const handleReorder = (newOrder: any) => {
    setSectionOrder(newOrder)
    if (onSectionOrderChange) {
      onSectionOrderChange(newOrder)
    }
  }

  const handleRemoveSection = (sectionId: string) => {
    setSectionOrder(prevOrder => prevOrder.filter(section => section.id !== sectionId))
    if (onRemoveSection) {
      onRemoveSection(sectionId)
    }
  }

  const handleAddSection = () => {
    const newSection = createNewSection()
    setSectionOrder(prevOrder => [...prevOrder, newSection])
    if (onAddSection) {
      onAddSection()
    }
  }

  const handleAddGame = (sectionId: string) => {
    if (onAddGame) {
      onAddGame(sectionId)
    }
  }

  const renderSection = (section: (typeof sectionOrder)[number]) => {
    const sectionProps = {
      sectionId: section.id,
      title: section.title,
      games: section.games,
      isEditMode,
      themeColors,
      layout: section.layout,
      ownerUsername,
      onEdit,
      onAddGame: () => handleAddGame(section.id),
      onRemoveGame,
      onRemoveSection: () => handleRemoveSection(section.id),
      onSectionOrderChange,
    }
    return <GameSection {...sectionProps} />
  }

  return (
    <>
      {isEditMode ?
        <Reorder.Group
          axis='y'
          values={sectionOrder}
          onReorder={handleReorder}
          style={{ position: 'relative', paddingLeft: 0 }}
        >
          {sectionOrder.map(section => (
            <Reorder.Item key={section.id} value={section} style={{ listStyleType: 'none' }}>
              {renderSection(section)}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      : <ul style={{ paddingLeft: 0 }}>
          {sectionOrder.map(section => (
            <li key={section.id} style={{ listStyleType: 'none' }}>
              {renderSection(section)}
            </li>
          ))}
        </ul>
      }

      {isEditMode && <AddSectionButton colors={themeColors} onClick={handleAddSection} />}
    </>
  )
}

export default GameSections
