// @ts-nocheck
import { GameRules } from '../shared/CustomGamePage/GameRules'

const RPSRulesData = {
  title: 'Rock-Paper-Scissors Game Rules',
  objective: 'Choose Rock, Paper, or Scissors to beat the computer and win!',
  rules: [
    'Choose Rock, Paper, or Scissors before playing',
    'Rock beats Scissors, Scissors beats Paper, Paper beats Rock',
  ],
  winningConditions: ["Win: Your choice beats the computer's choice"],
  losingConditions: ["Lose: The computer's choice beats your choice"],
  tips: [
    'Each choice has equal probability against the computer',
    "There's no strategy to predict computer choices - they're random",
  ],
  fairness: [
    'All number generations are provably fair and cannot be manipulated',
    'Each computer choice is random and completely independent of previous results',
  ],
}

export const RPSRules: React.FC = () => {
  return <GameRules {...RPSRulesData} />
}
