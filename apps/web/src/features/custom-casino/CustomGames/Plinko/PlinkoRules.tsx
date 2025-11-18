// @ts-nocheck
import React from 'react'
import { GameRules } from '../shared/CustomGamePage/GameRules'

const PlinkoRulesData = {
  title: 'Plinko Game Rules',
  objective: 'Drop a ball and watch it bounce through pegs to win based on where it lands!',
  rules: [
    'Choose your risk level (Low, Medium, High)',
    'Select the number of rows of pegs (8-16)',
    'Place your bet amount',
    'Drop your ball and watch it bounce through the pegs',
    'Win based on the multiplier where your ball lands',
    'Higher risk levels offer bigger multipliers but lower probabilities',
  ],
  winningConditions: ['Win: ball lands in a slot with a multiplier greater than 1x'],
  losingConditions: ['Lose: ball lands in a slot with a multiplier less than 1x'],
  gameFeatures: [
    'Risk Levels: Low (safer), Medium (balanced), High (riskier)',
    'Adjustable Rows: More rows = more bounce variety',
    'Physics-based: Realistic ball bouncing simulation',
    'Multiple Betting: Play multiple balls simultaneously',
  ],
  tips: [
    'Low risk = More consistent wins but smaller payouts',
    'High risk = Bigger potential wins but more losing slots',
    'More rows = More unpredictable bouncing patterns',
    'Center slots typically offer the best balance of probability and payout',
  ],
  fairness: [
    'All ball bounces are provably fair and cannot be manipulated',
    'Each peg collision uses cryptographically secure randomness',
    'Physics simulation ensures realistic and fair ball movement',
    'Multipliers are calculated transparently based on probability distribution',
  ],
}

export const PlinkoRules: React.FC = () => {
  return <GameRules {...PlinkoRulesData} />
}
