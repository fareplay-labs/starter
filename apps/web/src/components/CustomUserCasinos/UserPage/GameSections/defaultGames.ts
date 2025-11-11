// @ts-nocheck
import { AppGameName } from '@/chains/types'
import { type CustomCasinoGame } from '../../shared/types'
import { v4 as uuidv4 } from 'uuid'

// Game template definitions
const GAME_TEMPLATES = [
  {
    name: 'Coin Flip',
    icon: '🪙',
    type: AppGameName.CoinFlip,
    config: {},
  },
  {
    name: 'Dice',
    icon: '🎲',
    type: AppGameName.Dice,
    config: {},
  },
  {
    name: 'Rock Paper Scissors',
    icon: '✂️',
    type: AppGameName.RPS,
    config: {},
  },
  {
    name: 'Bombs',
    icon: '💣',
    type: AppGameName.Bombs,
    config: {},
  },
  {
    name: 'Crash',
    icon: '💥',
    type: AppGameName.Crash,
    config: {},
  },
  {
    name: 'Plinko',
    icon: '🔵',
    type: AppGameName.Plinko,
    config: {},
  },
  {
    name: 'Roulette',
    icon: '🎰',
    type: AppGameName.Roulette,
    config: {},
  },
  {
    name: 'Slots',
    icon: '🎡',
    type: AppGameName.Slots_1,
    config: {},
  },
  {
    name: 'Cards',
    icon: '🃏',
    type: AppGameName.Cards_1,
    config: {},
  },
  {
    name: 'Crypto Launch',
    icon: '🛰️',
    type: AppGameName.CryptoLaunch_1,
    config: {},
  },
]

/**
 * Creates default games with unique IDs
 * @returns Array of games with unique instance IDs
 */
export function createDefaultGames(): CustomCasinoGame[] {
  return GAME_TEMPLATES.map((template, index) => ({
    ...template,
    id: uuidv4(),
    order: index + 1,
  }))
}

/**
 * @deprecated Use createDefaultGames() instead to ensure unique IDs
 */
export const DEFAULT_GAMES: CustomCasinoGame[] = createDefaultGames()
