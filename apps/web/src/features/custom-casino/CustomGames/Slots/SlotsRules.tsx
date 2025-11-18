// @ts-nocheck
import React from 'react'
import { GameRules } from '../shared/CustomGamePage/GameRules'

const SlotsRulesData = {
  title: 'Slots Game Rules',
  objective: 'Spin the reels and match symbols across paylines to win!',
  rules: [
    'Set your bet amount before spinning',
    'Click "SPIN" to start the reels',
    'Reels will stop automatically to reveal symbols',
    'Win by matching symbols on center payline from left to right',
    'Payouts are calculated based on symbol combinations and bet amount',
  ],
  winningConditions: [
    'Win: Match 3 or more identical symbols on center payline',
  ],
  losingConditions: [
    'Lose: No matching symbols on center payline',
  ],
  tips: [
    'Check the paytable to understand symbol values',
  ],
  fairness: [
    'All spin results are provably fair and cannot be manipulated',
  ],
}

export const SlotsRules: React.FC = () => {
  return <GameRules {...SlotsRulesData} />
}