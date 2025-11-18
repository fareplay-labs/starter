// @ts-nocheck
import { type BaseGameParameters, type BaseGameResult, type BaseGameEntry } from '../shared/types'
import { AppGameName } from '@/chains/types'
import { type SoundData } from '../../shared/types/sound.types'

// Live game tier mapping: 0=common, 1=rare, 2=epic/legendary
export const LIVE_GAME_TIER_TO_STRING = {
  0: 'common',
  1: 'rare',
  2: 'epic', // Epic and legendary both map to tier 2 in live game
} as const

export const STRING_TIER_TO_LIVE_GAME = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 2, // Legendary also maps to tier 2
} as const

// Card catalog item - represents a card design in the catalog matching live game structure
export interface CardsCatalogItem {
  id: number
  name: string
  iconUrl: string
  description?: string
  tier?: 'common' | 'rare' | 'epic' | 'legendary' // For filtering/organization
  packId?: number // Which pack this card belongs to (0=Explorer, 1=Challenger, 2=Cryptonaught)
  indexInsidePack?: number // Position within the pack (0-based)
}

// Live game uses fixed q/k arrays instead of configurable pack slots

// Game parameters - simplified to match live game structure
export interface CardsParameters extends BaseGameParameters {
  // Visual configuration
  background: { url: string }
  commonColor?: string
  rareColor?: string
  epicColor?: string
  legendaryColor?: string
  iconSize?: number

  // Pack names
  packNames?: string[]

  // Sound configuration
  customSounds?: {
    packSelect?: SoundData
    packOpen?: SoundData
    cardFlip?: SoundData
    cardReveal?: SoundData
    win?: SoundData
    lose?: SoundData
  }

  // Game data - card catalog matches live game exactly
  cardsCatalog: CardsCatalogItem[]
}

// Entry for a game round
export interface CardsEntry extends BaseGameEntry {
  side: number // 0 = explorer, 1 = challenger, 2 = cryptonaught
}

// Single card draw result
export interface CardDraw {
  catalogId: number // ID from catalog
  slotIndex: number // Which slot was drawn (for probability)
  multiplier: number // Multiplier applied
  value: number // Final value (price * multiplier)
}

// Game result
export interface CardsResult extends BaseGameResult {
  packType: number
  cardsDrawn: CardDraw[]
  totalPayout: number
}

// Runtime state for the game
export interface CardsRuntimeState {
  selectedPack: number | null
  isPackOpening: boolean
  revealedCards: CardDraw[]
  currentRevealIndex: number
  autoOpen: boolean
}

// Actions for the game store
export interface CardsActions {
  selectPack: (packType: number) => void
  startGame: () => Promise<void>
  revealNextCard: () => void
  reset: () => void
  showResult: (cardIndices: number[]) => Promise<CardsResult>
}

// Default parameters
export const DEFAULT_CARDS_PARAMETERS: CardsParameters = {
  // Base parameters
  icon: { url: '' },
  description: 'Open card packs and reveal your fortune! Always draws 6 cards per pack.',
  background: { url: '#0f0f23' },

  // Visual configuration - typical MMO rarity colors
  commonColor: '#B0B0B0', // Gray
  rareColor: '#0088FF', // Blue
  epicColor: '#9932CC', // Purple
  legendaryColor: '#FF8C00', // Orange
  iconSize: 1.0,

  // Pack names
  packNames: ['Explorer', 'Challenger', 'Cryptonaught'],

  // Live game card catalog - matches exactly with CardsData.tsx
  cardsCatalog: [
    // Explorer Pack (packId: 0) - 3 cards
    {
      id: 1,
      name: 'Ramen',
      iconUrl: '🍜',
      tier: 'common', // tier 0 in live game
      description: 'A simple yet comforting meal from the heart of Neo-Tokyo.',
      packId: 0,
      indexInsidePack: 0,
    },
    {
      id: 2,
      name: 'Token',
      iconUrl: '🏺',
      tier: 'rare', // tier 1 in live game
      description: 'A common currency in the AstroPunk underworld.',
      packId: 0,
      indexInsidePack: 1,
    },
    {
      id: 3,
      name: 'Luck Charm',
      iconUrl: '🍀',
      tier: 'epic', // tier 2 in live game
      description: 'A talisman believed to bring good fortune to its bearer.',
      packId: 0,
      indexInsidePack: 2,
    },

    // Challenger Pack (packId: 1) - 6 cards
    {
      id: 4,
      name: 'Ramen',
      iconUrl: '🍜',
      tier: 'common', // tier 0 in live game
      description: 'A simple yet comforting meal from the heart of Neo-Tokyo.',
      packId: 1,
      indexInsidePack: 0,
    },
    {
      id: 5,
      name: 'Token',
      iconUrl: '🏺',
      tier: 'common', // tier 0 in live game (note: tier changes between packs)
      description: 'A common currency in the AstroPunk underworld.',
      packId: 1,
      indexInsidePack: 1,
    },
    {
      id: 6,
      name: 'Luck Charm',
      iconUrl: '🍀',
      tier: 'rare', // tier 1 in live game
      description: 'A talisman believed to bring good fortune to its bearer.',
      packId: 1,
      indexInsidePack: 2,
    },
    {
      id: 7,
      name: 'Pleasure Class Rocket',
      iconUrl: '🚀',
      tier: 'rare', // tier 1 in live game
      description: 'A luxurious craft for those who prefer to travel the stars in style.',
      packId: 1,
      indexInsidePack: 3,
    },
    {
      id: 8,
      name: 'Fighter Class Rocket',
      iconUrl: '⚡',
      tier: 'epic', // tier 2 in live game
      description: 'A sleek, fast rocket designed for dogfights in deep space.',
      packId: 1,
      indexInsidePack: 4,
    },
    {
      id: 9,
      name: 'Frigate Class Rocket',
      iconUrl: '🔥',
      tier: 'epic', // tier 2 in live game
      description: 'A heavily armored vessel equipped for long-term missions and combat.',
      packId: 1,
      indexInsidePack: 5,
    },

    // Cryptonaught Pack (packId: 2) - 9 cards
    {
      id: 10,
      name: 'Nebula Nexus',
      iconUrl: '⭐',
      tier: 'common', // tier 0 in live game
      description: 'A vibrant, neon-lit casino floating in the heart of a distant nebula.',
      packId: 2,
      indexInsidePack: 0,
    },
    {
      id: 11,
      name: 'Cyber Spire',
      iconUrl: '🏢',
      tier: 'common', // tier 0 in live game
      description: 'A towering casino known for its high-tech games and elite clientele.',
      packId: 2,
      indexInsidePack: 1,
    },
    {
      id: 12,
      name: 'Holo Heaven',
      iconUrl: '✨',
      tier: 'common', // tier 0 in live game
      description: 'An exclusive casino where reality bends with stunning holographic displays.',
      packId: 2,
      indexInsidePack: 2,
    },
    {
      id: 13,
      name: 'Bog24',
      iconUrl: '🐸',
      tier: 'rare', // tier 1 in live game
      description:
        'A mysterious swamp planet with a hidden casino known for its high-stakes games.',
      packId: 2,
      indexInsidePack: 3,
    },
    {
      id: 14,
      name: 'Synthwave Sanctuary',
      iconUrl: '🎶',
      tier: 'rare', // tier 1 in live game
      description: 'A retro-futuristic casino with an atmosphere steeped in synthwave culture.',
      packId: 2,
      indexInsidePack: 4,
    },
    {
      id: 15,
      name: 'Eclipse Elysium',
      iconUrl: '🌙',
      tier: 'rare', // tier 1 in live game
      description:
        'A legendary casino known for hosting the most intense games under the shadow of a perpetual eclipse.',
      packId: 2,
      indexInsidePack: 5,
    },
    {
      id: 16,
      name: 'Lumina Arcadia',
      iconUrl: '🏛️',
      tier: 'epic', // tier 2 in live game
      description: 'The pinnacle of luxury and fortune, a casino only the most elite can enter.',
      packId: 2,
      indexInsidePack: 6,
    },
    {
      id: 17,
      name: 'Solarium Oasis',
      iconUrl: '🌴',
      tier: 'legendary', // tier 2 in live game
      description:
        'A hidden paradise on the edge of the galaxy, where the wealthy come to relax and unwind.',
      packId: 2,
      indexInsidePack: 7,
    },
    {
      id: 18,
      name: 'Allen',
      iconUrl: '👤',
      tier: 'legendary', // tier 2 in live game
      description: 'A mysterious figure, known for their hidden talents and high stakes.',
      packId: 2,
      indexInsidePack: 8,
    },
  ],
}

// Game metadata
export const CARDS_GAME_INFO = {
  type: AppGameName.Cards_1,
  name: 'Cards',
  icon: '🃏',
  description: 'Open card packs and reveal your fortune!',
}
