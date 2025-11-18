// @ts-nocheck
import React from 'react'
import { GameRules } from '../shared/CustomGamePage/GameRules'

const CrashRulesData = {
  title: 'Crash Game Rules',
  objective: 'Predict when the multiplier will crash and cash out before it does!',
  rules: [
    'Set your auto cash-out multiplier before the game starts',
    'The multiplier starts at 1.0x and rises along an exponential curve',
    'You will automatically cash out when your target multiplier is reached',
    'If the game crashes before reaching your target, you lose your bet',
    'Lower multipliers are more likely to be reached than higher ones',
  ],
  winningConditions: ['Win: The multiplier reaches your auto cash-out target before crashing'],
  losingConditions: ['Lose: The multiplier crashes before reaching your auto cash-out target'],
  tips: [
    'Lower targets are safer but give smaller returns',
    'Higher targets are riskier but give bigger payouts',
    'Most crashes happen at lower multipliers',
  ],
  fairness: [
    'All number generations are provably fair and cannot be manipulated',
    'Each crash point is random and completely independent of previous results',
  ],
}

export const CrashRules: React.FC = () => {
  return <GameRules {...CrashRulesData} />
}
