// @ts-nocheck
import React from 'react'
import { SVGS } from '@/assets'
import { AppGameName } from '@/chains/types'

// Color utility function
export const hexToRgba = (hex: string, alpha = 1): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(255, 255, 255, ${alpha})`

  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Game icons mapping
export const GAME_ICONS: Record<AppGameName, string> = {
  [AppGameName.CoinFlip]: SVGS.coin,
  [AppGameName.Dice]: SVGS.diceIcon,
  [AppGameName.RPS]: SVGS.scissorIcon,
  [AppGameName.Bombs]: SVGS.bombIcon,
  [AppGameName.Crash]: SVGS.crashIcon,
  [AppGameName.Plinko]: SVGS.plinkoIcon,
  [AppGameName.Roulette]: SVGS.rouletteIcon,
  [AppGameName.Cards_1]: SVGS.cardsIcon,
  [AppGameName.CryptoLaunch_1]: SVGS.cryptoLaunchIcon,
  [AppGameName.Slots_1]: SVGS.slotsIcon,
}

// Control Icons
export const GearIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z' />
  </svg>
)

export const RemoveIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M19 13H5v-2h14v2z' />
  </svg>
)

export const LayoutIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M4 11h16v2H4zm0-4h16v2H4zm0 8h16v2H4z' />
  </svg>
)

// Theme type used across components
export interface ThemeColors {
  themeColor1: string
  themeColor2: string
  themeColor3: string
}

// Layout type used across components
export type LayoutType = 'carousel' | 'smallTiles' | 'largeTiles'
