// @ts-nocheck
import React, { useEffect } from 'react'
import { styled } from 'styled-components'

interface Pack {
  id: string
  name: string
  price: number
  cardCount: number
  slots: Array<{
    slotIndex: number
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    multiplier: number
    assignedCardId?: number
  }>
}

interface CatalogCard {
  id: number
  name: string
  tier: 'common' | 'rare' | 'epic' | 'legendary'
  iconUrl?: string
}

interface PackConfigurationControlProps {
  value?: any
  onChange: (value: any) => void
  label: string
  allParameters?: Record<string, any>
}

const defaultPacks: Pack[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    price: 1,
    cardCount: 3,
    slots: [
      { slotIndex: 1, rarity: 'common', multiplier: 0.3, assignedCardId: 1 },
      { slotIndex: 2, rarity: 'common', multiplier: 0.5, assignedCardId: 2 },
      { slotIndex: 3, rarity: 'rare', multiplier: 1.5, assignedCardId: 5 },
    ],
  },
  {
    id: 'challenger',
    name: 'Challenger',
    price: 5,
    cardCount: 6,
    slots: [
      { slotIndex: 1, rarity: 'common', multiplier: 0.2, assignedCardId: 1 },
      { slotIndex: 2, rarity: 'common', multiplier: 0.4, assignedCardId: 2 },
      { slotIndex: 3, rarity: 'common', multiplier: 0.6, assignedCardId: 3 },
      { slotIndex: 4, rarity: 'rare', multiplier: 1.0, assignedCardId: 5 },
      { slotIndex: 5, rarity: 'rare', multiplier: 1.5, assignedCardId: 6 },
      { slotIndex: 6, rarity: 'epic', multiplier: 5.0, assignedCardId: 8 },
    ],
  },
  {
    id: 'cryptonaught',
    name: 'Cryptonaught',
    price: 15,
    cardCount: 9,
    slots: [
      { slotIndex: 1, rarity: 'common', multiplier: 0.1, assignedCardId: 1 },
      { slotIndex: 2, rarity: 'common', multiplier: 0.2, assignedCardId: 2 },
      { slotIndex: 3, rarity: 'common', multiplier: 0.4, assignedCardId: 3 },
      { slotIndex: 4, rarity: 'rare', multiplier: 0.8, assignedCardId: 5 },
      { slotIndex: 5, rarity: 'rare', multiplier: 1.2, assignedCardId: 6 },
      { slotIndex: 6, rarity: 'rare', multiplier: 2.0, assignedCardId: 7 },
      { slotIndex: 7, rarity: 'epic', multiplier: 6.0, assignedCardId: 8 },
      { slotIndex: 8, rarity: 'epic', multiplier: 10.0, assignedCardId: 9 },
      { slotIndex: 9, rarity: 'legendary', multiplier: 25.0, assignedCardId: 11 },
    ],
  },
]

export const PackConfigurationControl: React.FC<PackConfigurationControlProps> = ({
  value,
  onChange,
  label,
  allParameters,
}) => {
  // Initialize with default packs if no value provided
  const packs = Array.isArray(value) && value.length > 0 ? value : defaultPacks
  const cardsCatalog = (allParameters?.cardsCatalog || []) as CatalogCard[]

  // Initialize the value if it's empty
  React.useEffect(() => {
    if (!Array.isArray(value) || value.length === 0) {
      onChange(defaultPacks)
    }
  }, [value, onChange])

  const updatePackName = (packId: string, name: string) => {
    const updatedPacks = packs.map((pack: Pack) =>
      pack.id === packId ? { ...pack, name } : pack
    )
    onChange(updatedPacks)
  }

  const updatePackPrice = (packId: string, price: number) => {
    const updatedPacks = packs.map((pack: Pack) =>
      pack.id === packId ? { ...pack, price: Math.max(0, price) } : pack
    )
    onChange(updatedPacks)
  }

  const updateSlotCard = (packId: string, slotIndex: number, cardId: number | null) => {
    const updatedPacks = packs.map((pack: Pack) => {
      if (pack.id !== packId) return pack
      
      const updatedSlots = pack.slots.map(slot =>
        slot.slotIndex === slotIndex
          ? { ...slot, assignedCardId: cardId || undefined }
          : slot
      )
      
      return { ...pack, slots: updatedSlots }
    })
    onChange(updatedPacks)
  }

  const getCardsForRarity = (rarity: string): CatalogCard[] => {
    return cardsCatalog.filter(card => card.tier === rarity)
  }

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
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
      </Header>

      {packs.map((pack: Pack) => (
        <PackSection key={pack.id}>
          <PackHeader>
            <PackTitle>{pack.name} Pack ({pack.cardCount} cards)</PackTitle>
          </PackHeader>

          <PackSettings>
            <SettingGroup>
              <SettingLabel>Pack Name</SettingLabel>
              <NameInput
                value={pack.name}
                onChange={e => updatePackName(pack.id, e.target.value)}
              />
            </SettingGroup>
            
            <SettingGroup>
              <SettingLabel>Price</SettingLabel>
              <PriceInput
                type="number"
                value={pack.price}
                onChange={e => updatePackPrice(pack.id, parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </SettingGroup>
          </PackSettings>

          <SlotsContainer>
            <SlotsHeader>Card Slots</SlotsHeader>
            <SlotsGrid>
              {pack.slots.map(slot => {
                const availableCards = getCardsForRarity(slot.rarity)
                const selectedCard = availableCards.find(card => card.id === slot.assignedCardId)
                
                return (
                  <SlotCard key={slot.slotIndex} $rarityColor={getRarityColor(slot.rarity)}>
                    <SlotHeader>
                      <SlotNumber>Slot {slot.slotIndex}</SlotNumber>
                      <SlotRarity $rarityColor={getRarityColor(slot.rarity)}>
                        {slot.rarity.charAt(0).toUpperCase() + slot.rarity.slice(1)}
                      </SlotRarity>
                      <SlotMultiplier>{slot.multiplier}x</SlotMultiplier>
                    </SlotHeader>
                    
                    <CardSelector
                      value={slot.assignedCardId || ''}
                      onChange={e => updateSlotCard(
                        pack.id, 
                        slot.slotIndex, 
                        e.target.value ? parseInt(e.target.value) : null
                      )}
                    >
                      <option value="">Select card...</option>
                      {availableCards.map(card => (
                        <option key={card.id} value={card.id}>
                          {card.name}
                        </option>
                      ))}
                    </CardSelector>
                    
                    {availableCards.length === 0 && (
                      <NoCardsMessage>
                        No {slot.rarity} cards available
                      </NoCardsMessage>
                    )}
                  </SlotCard>
                )
              })}
            </SlotsGrid>
          </SlotsContainer>
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

const PackSection = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
`

const PackHeader = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`

const PackTitle = styled.h4`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`

const PackSettings = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.01);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const SettingLabel = styled.label`
  color: #bbb;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const NameInput = styled.input`
  width: 100%;
  max-width: 100%;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #5f5fff;
    box-shadow: 0 0 0 2px rgba(95, 95, 255, 0.2);
  }
`

const PriceInput = styled.input`
  width: 100%;
  max-width: 120px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #5f5fff;
    box-shadow: 0 0 0 2px rgba(95, 95, 255, 0.2);
  }
`

const SlotsContainer = styled.div`
  padding: 16px;
`

const SlotsHeader = styled.h5`
  color: #ccc;
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const SlotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`

const SlotCard = styled.div<{ $rarityColor: string }>`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${props => props.$rarityColor + '40'};
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.$rarityColor + '60'};
  }
`

const SlotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const SlotNumber = styled.span`
  color: #fff;
  font-size: 11px;
  font-weight: 600;
`

const SlotRarity = styled.span<{ $rarityColor: string }>`
  color: ${props => props.$rarityColor};
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const SlotMultiplier = styled.span`
  color: #aaa;
  font-size: 10px;
  font-weight: 500;
`

const CardSelector = styled.select`
  width: 100%;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: #5f5fff;
  }

  option {
    background: #2a2a2a;
    color: #fff;
  }
`

const NoCardsMessage = styled.div`
  color: #666;
  font-size: 11px;
  font-style: italic;
  text-align: center;
  padding: 8px;
`

export default PackConfigurationControl