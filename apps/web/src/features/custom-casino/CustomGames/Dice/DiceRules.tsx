// @ts-nocheck
import React from 'react'
import { GameRules } from '../shared/CustomGamePage/GameRules'

const DiceRulesData = {
  title: 'Dice Game Rules',
  objective: 'Set a target number and roll higher to win!',
  rules: [
    'Choose a target number between 5 and 99.9',
    'Place your bet amount',
    'The game generates a random number from 0 to 99',
    'Win if your number is HIGHER than your target',
    'Higher targets = Higher payouts but lower win chances',
  ],
  winningConditions: ['Win: If your rolled number is greater than your target number'],
  losingConditions: ['Lose: If your rolled number is less than or equal to your target number'],
  tips: [
    'Lower targets = Higher win chance, lower payout',
    'Higher targets = Lower win chance, higher payout',
    'Find your perfect balance between risk and reward!',
  ],
  fairness: [
    'All number generations are provably fair and cannot be manipulated',
    'Each roll is completely random and independent of previous results',
    'Multipliers are calculated transparently based on probability',
  ],
}

export const DiceRules: React.FC = () => {
  return <GameRules {...DiceRulesData} />
}
