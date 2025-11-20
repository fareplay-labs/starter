// @ts-nocheck
import React from 'react'
import { GameRules } from '../shared/CustomGamePage/GameRules'

const CoinFlipRulesData = {
  title: 'Coin Flip Game Rules',
  objective: 'Choose heads or tails and flip the coin to win!',
  rules: [
    'Choose your side: Heads or Tails',
    'Set your bet amount',
    'Click "FLIP COIN" to start the animation',
    'Watch the coin spin and land on a side',
    'Win if the coin lands on your chosen side',
  ],
  winningConditions: [
    'Win: If the coin lands on your chosen side (Heads or Tails)',
    'Winning pays out 2x your bet amount',
  ],
  losingConditions: [
    'Lose: If the coin lands on the opposite side of your choice',
    'You lose your entire bet amount',
  ],
  gameFeatures: [
    'Fair 50/50 chance for each outcome',
    '2.00x multiplier on wins',
    '0% house edge - completely fair game',
    'Animated coin flip with visual feedback',
  ],
  tips: [
    'This is a fair game - no strategy can improve your odds',
    "Each flip is independent - past results don't affect future flips",
    'Set a budget and stick to it',
    'Remember: gambling should be fun, not a way to make money',
  ],
  fairness: [
    'All coin flips are provably fair and cannot be manipulated',
    'Each flip is completely random and independent of previous results',
    'True 50/50 probability with no house edge',
  ],
}

export const CoinFlipRules: React.FC = () => {
  return <GameRules {...CoinFlipRulesData} />
}
