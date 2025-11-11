// @ts-nocheck
import { GameRules } from '../shared/CustomGamePage/GameRules'

const RouletteRulesData = {
  title: 'Roulette Game Rules',
  objective: 'Place your bets and predict where the ball will land on the roulette wheel!',
  rules: [
    'Select your chip value from the available denominations',
    'Click on the betting area to place bets on numbers, colors, or combinations',
    'The wheel spins and determines the winning number (0-36)',
    'Winning bets are paid out based on their probability and payout multiplier',
    'You can place multiple different bets in a single round',
  ],
  winningConditions: ['Win: If any of your bets match the winning number or category'],
  losingConditions: ['Lose: If none of your bets match the winning outcome'],
  gameFeatures: [
    'European Roulette: Single zero wheel with numbers 0-36',
    'Multiple Bet Types: Straight (35:1), Split (17:1), Street (11:1), Corner (8:1)',
    'Outside Bets: Red/Black, Odd/Even, High/Low (1:1), Columns/Dozens (2:1)',
    'Chip System: Select from multiple chip denominations for flexible betting',
    'Multi-Bet Support: Place several different bets in one round',
  ],
  tips: [
    'Inside bets (single numbers) have higher payouts but lower win chances',
    'Outside bets (red/black, odd/even) have lower payouts but higher win chances',
    'You can combine multiple bet types for different risk strategies',
    'The zero (0) wins only for direct bets placed on it',
    'Show or hide the bet table at any time with the drawer at the bottom of the game window',
  ],
  fairness: [
    'All outcomes are provably fair and cannot be manipulated',
    'All spins are completely random and independent of previous results',
  ],
}

export const RouletteRules: React.FC = () => {
  return <GameRules {...RouletteRulesData} />
}
