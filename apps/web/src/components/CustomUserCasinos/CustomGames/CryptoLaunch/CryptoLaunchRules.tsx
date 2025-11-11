// @ts-nocheck
import React from 'react'
import { GameRules } from '../shared/CustomGamePage/GameRules'

const CryptoLaunchRulesData = {
  title: 'Crypto Launch Game Rules',
  objective:
    'Grow your virtual portfolio by trading during the token launch simulation. Buy low, sell high, and beat the market!',
  rules: [
    'Each simulation represents the first 100 days of a new token launch',
    'You start with a fixed cash balance and no tokens',
    'A default DCA (dollar-cost averaging) strategy is pre-configured but can be adjusted in the editor',
    'Prices follow a procedurally-generated curve with bull and bear phases',
    'Trading is turn-based: one "day" advances on every animation tick',
  ],
  winningConditions: ['Finish the simulation with a higher portfolio value than you started'],
  losingConditions: ['Finish with less than your initial cash balance'],
  tips: [
    'Watch the market sentiment indicator for clues on upcoming trends',
    'Increase your DCA amount in early bull phases, scale back in bear phases',
    'Consider taking profits when sharp spikes occur',
  ],
  fairness: [
    'Price data is procedurally generated using random seeds – no two runs are identical',
    'All calculations are deterministic once the seed is set, ensuring reproducibility',
  ],
}

export const CryptoLaunchRules: React.FC = () => {
  return <GameRules {...CryptoLaunchRulesData} />
}
