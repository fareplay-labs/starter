// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'

interface CatalogItem {
  id: number
  name: string
  tier?: 'common' | 'rare' | 'epic' | 'legendary'
}

interface PackType {
  id: string
  name: string
  cardCount: number
}

interface Assignment {
  packType: string
  cardId: number
  probability: number
}

interface AssignmentsControlProps {
  value?: Assignment[]
  onChange: (value: Assignment[]) => void
  label: string
  catalogRef?: string
  packTypes?: PackType[]
  allParameters?: Record<string, any>
}

const defaultPackTypes: PackType[] = [
  { id: 'explorer', name: 'Explorer (3 cards)', cardCount: 3 },
  { id: 'challenger', name: 'Challenger (6 cards)', cardCount: 6 },
  { id: 'cryptonaught', name: 'Cryptonaught (9 cards)', cardCount: 9 },
]

export const AssignmentsControl: React.FC<AssignmentsControlProps> = ({
  value,
  onChange,
  label,
  catalogRef = 'cardsCatalog',
  packTypes = defaultPackTypes,
  allParameters,
}) => {
  const assignments = Array.isArray(value) ? value : []
  
  // Get catalog items from referenced parameter
  const catalog = (allParameters?.[catalogRef] || []) as CatalogItem[]
  
  const addAssignment = (packType: string, cardId: number) => {
    const existing = assignments.find(a => a.packType === packType && a.cardId === cardId)
    if (existing) return
    
    onChange([...assignments, { packType, cardId, probability: 1.0 }])
  }

  const removeAssignment = (packType: string, cardId: number) => {
    onChange(assignments.filter(a => !(a.packType === packType && a.cardId === cardId)))
  }

  const updateProbability = (packType: string, cardId: number, probability: number) => {
    const updated = assignments.map(a => 
      a.packType === packType && a.cardId === cardId 
        ? { ...a, probability: Math.max(0, Math.min(1, probability)) }
        : a
    )
    onChange(updated)
  }

  const getAssignmentProbability = (packType: string, cardId: number): number => {
    const assignment = assignments.find(a => a.packType === packType && a.cardId === cardId)
    return assignment?.probability || 0
  }

  const isAssigned = (packType: string, cardId: number): boolean => {
    return assignments.some(a => a.packType === packType && a.cardId === cardId)
  }

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'common': return '#B0B0B0'
      case 'rare': return '#0088FF'
      case 'epic': return '#9932CC'
      case 'legendary': return '#FF8C00'
      default: return '#666'
    }
  }

  return (
    <Container>
      <Header>
        <Label>{label}</Label>
        <Info>{catalog.length} cards available</Info>
      </Header>

      {catalog.length === 0 && (
        <EmptyState>
          No cards in catalog. Please add cards to the catalog first.
        </EmptyState>
      )}

      {packTypes.map(packType => (
        <PackSection key={packType.id}>
          <PackHeader>
            <PackTitle>{packType.name}</PackTitle>
            <PackStats>
              {assignments.filter(a => a.packType === packType.id).length} / {catalog.length} assigned
            </PackStats>
          </PackHeader>

          <CardGrid>
            {catalog.map(card => {
              const assigned = isAssigned(packType.id, card.id)
              const probability = getAssignmentProbability(packType.id, card.id)
              
              return (
                <CardItem 
                  key={card.id} 
                  $assigned={assigned}
                  $tierColor={getTierColor(card.tier)}
                >
                  <CardHeader>
                    <CardName>{card.name}</CardName>
                    <CardTier $tierColor={getTierColor(card.tier)}>
                      {card.tier || 'common'}
                    </CardTier>
                  </CardHeader>
                  
                  <CardControls>
                    <AssignmentToggle
                      $assigned={assigned}
                      onClick={() => 
                        assigned 
                          ? removeAssignment(packType.id, card.id)
                          : addAssignment(packType.id, card.id)
                      }
                    >
                      {assigned ? 'Remove' : 'Add'}
                    </AssignmentToggle>
                    
                    {assigned && (
                      <ProbabilityInput
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={probability}
                        onChange={e => updateProbability(
                          packType.id, 
                          card.id, 
                          parseFloat(e.target.value) || 0
                        )}
                        placeholder="0.0-1.0"
                      />
                    )}
                  </CardControls>
                </CardItem>
              )
            })}
          </CardGrid>
        </PackSection>
      ))}
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Label = styled.h3`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`

const Info = styled.span`
  color: #aaa;
  font-size: 12px;
`

const PackSection = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
`

const PackHeader = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`

const PackTitle = styled.h4`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`

const PackStats = styled.span`
  color: #aaa;
  font-size: 12px;
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 8px;
  padding: 16px;
`

const CardItem = styled.div<{ $assigned: boolean; $tierColor: string }>`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${props => props.$assigned ? props.$tierColor + '40' : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 4px;
  padding: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.$assigned ? props.$tierColor + '60' : 'rgba(255, 255, 255, 0.15)'};
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const CardName = styled.span`
  color: #fff;
  font-size: 13px;
  font-weight: 500;
`

const CardTier = styled.span<{ $tierColor: string }>`
  color: ${props => props.$tierColor};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const CardControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const AssignmentToggle = styled.button<{ $assigned: boolean }>`
  padding: 4px 8px;
  border: 1px solid ${props => props.$assigned ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)'};
  background: ${props => props.$assigned ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)'};
  color: ${props => props.$assigned ? '#ff6b6b' : '#51cf66'};
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$assigned ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)'};
  }
`

const ProbabilityInput = styled.input`
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
  border-radius: 3px;
  color: #fff;
  font-size: 11px;
  width: 60px;

  &:focus {
    outline: none;
    border-color: #5f5fff;
  }
`

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 32px 16px;
  font-style: italic;
`

export default AssignmentsControl