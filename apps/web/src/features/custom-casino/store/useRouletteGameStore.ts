// @ts-nocheck
import { type BetType } from '@/features/custom-casino/CustomGames/Roulette/types'

export type { BetType }

export const validBetTypes: BetType[] = [
  'straight',
  'split',
  'street',
  'corner',
  'line',
  'column',
  'dozen',
  'redBlack',
  'oddEven',
  'highLow',
  'trio',
]
