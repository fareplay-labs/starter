// @ts-nocheck
import { GameRules } from '../shared/CustomGamePage/GameRules'

const BombsRulesData = {
  title: 'Bombs Game Rules',
  objective: 'Select tiles on the grid and avoid the hidden bombs to win!',
  rules: [
    'Choose your bet amount and number of bombs (1-24)',
    'Select tiles on the 5x5 grid that you want to reveal',
    'Bombs are randomly hidden throughout the grid',
    'Click "REVEAL TILES" to see if you avoided all bombs',
    'Win if none of your selected tiles contain bombs',
  ],
  winningConditions: [
    'Win: All your selected tiles are safe (no bombs)',
    'Payout increases with more bombs and more tiles selected',
  ],
  losingConditions: ['Lose: Any of your selected tiles contains a bomb'],
  tips: [
    'More bombs = Higher multipliers but lower win chances',
    'Select fewer tiles for safer plays with lower payouts',
    'Select more tiles for riskier plays with higher payouts',
    'Use "Keep Selection" to replay the same tile pattern',
  ],
  fairness: [
    'All outcomes are provably fair and cannot be manipulated',
    'No patterns or predictable sequences in bomb placement',
  ],
}

export const BombsRules = () => {
  return <GameRules {...BombsRulesData} />
}
