// @ts-nocheck
import React from 'react'
import { GameRules } from '../shared/CustomGamePage/GameRules'

const CardsRulesData = {
  title: 'Cards Game Rules',
  objective: 'Open card packs to collect rare cards and build your collection!',
  rules: [
    'Purchase card packs with your bet amount',
    'Each pack contains 5 random cards',
    'Cards have different rarities: Common, Rare, Epic, and Legendary',
    'Higher rarity cards have lower drop rates but higher values',
    'The total value of your cards determines your payout',
  ],
  winningConditions: [
    'Win: When the total value of your cards exceeds your bet amount',
  ],
  losingConditions: [
    'Lose: When the total value of your cards is less than your bet amount',
  ],
  tips: [
    'Higher bet amounts unlock better pack types with improved odds',
    'Legendary cards are extremely rare but offer massive multipliers',
    'Epic and Rare cards provide the best balance of probability and value',
    'Common cards appear frequently but have lower multipliers',
  ],
  fairness: [
    'All card pulls are provably fair and cannot be manipulated',
    'Each card is randomly generated based on preset probability tables',
    'Pack contents are determined at purchase, not at opening',
  ],
}

export const CardsRules: React.FC = () => {
  return <GameRules {...CardsRulesData} />
}