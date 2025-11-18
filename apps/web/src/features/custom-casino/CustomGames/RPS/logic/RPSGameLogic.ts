// @ts-nocheck
import { type RPSChoice, type RPSGameParameters, type RPSGameResult } from '../types'

/**
 * Pure game logic functions for Rock Paper Scissors game
 */

/**
 * Determine the winner of RPS game
 */
export const determineRPSWinner = (
  playerChoice: RPSChoice,
  computerChoice: RPSChoice
): 'win' | 'lose' | 'draw' => {
  if (playerChoice === computerChoice) return 'draw'
  
  const winConditions = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  }
  
  return winConditions[playerChoice] === computerChoice ? 'win' : 'lose'
}

/**
 * Calculate multiplier for RPS (always 2.0 for standard game)
 */
export const calculateRPSMultiplier = (): number => {
  return 2.0
}

/**
 * Calculate the win chance for RPS game (always 33.33% chance to win, 33.33% to lose, 33.33% to draw)
 */
export const calculateWinChance = (): number => {
  return 33.33
}

/**
 * Generate random computer choice
 */
export const generateComputerChoice = (): RPSChoice => {
  const choices: RPSChoice[] = ['rock', 'paper', 'scissors']
  return choices[Math.floor(Math.random() * choices.length)]
}

/**
 * Validate RPS choice
 */
export const validateRPSChoice = (choice: string): choice is RPSChoice => {
  return choice === 'rock' || choice === 'paper' || choice === 'scissors'
}

/**
 * Get the choice that beats the given choice
 */
export const getWinningChoice = (choice: RPSChoice): RPSChoice => {
  const winningMap = {
    rock: 'paper' as RPSChoice,
    paper: 'scissors' as RPSChoice,
    scissors: 'rock' as RPSChoice
  }
  return winningMap[choice]
}

/**
 * Get the choice that loses to the given choice
 */
export const getLosingChoice = (choice: RPSChoice): RPSChoice => {
  const losingMap = {
    rock: 'scissors' as RPSChoice,
    paper: 'rock' as RPSChoice,
    scissors: 'paper' as RPSChoice
  }
  return losingMap[choice]
}

/**
 * Create RPS game result
 */
export const createRPSResult = (
  parameters: RPSGameParameters,
  betAmount: number,
  numberOfEntries: number,
  playerChoice: RPSChoice,
  overrideChoice?: RPSChoice // For win/loss simulation
): RPSGameResult => {
  const computerChoice = overrideChoice ?? generateComputerChoice()
  const outcome = determineRPSWinner(playerChoice, computerChoice)
  const isWin = outcome === 'win'
  const multiplier = calculateRPSMultiplier()
  
  // Calculate payout: win = 2x, draw = 1x (return bet), lose = 0
  const payout = isWin ? betAmount * multiplier * numberOfEntries : 
                 outcome === 'draw' ? betAmount * numberOfEntries : 0

  return {
    timestamp: Date.now(),
    entryAmount: betAmount,
    numberOfEntries,
    payout,
    isWin,
    playerChoice,
    computerChoice,
    resultSides: [playerChoice, computerChoice]
  }
}

/**
 * Generate winning result for simulation
 */
export const generateWinningResult = (
  parameters: RPSGameParameters,
  betAmount: number,
  numberOfEntries: number,
  playerChoice: RPSChoice
): RPSGameResult => {
  const losingChoice = getLosingChoice(playerChoice)
  return createRPSResult(parameters, betAmount, numberOfEntries, playerChoice, losingChoice)
}

/**
 * Generate losing result for simulation
 */
export const generateLosingResult = (
  parameters: RPSGameParameters,
  betAmount: number,
  numberOfEntries: number,
  playerChoice: RPSChoice
): RPSGameResult => {
  const winningChoice = getWinningChoice(playerChoice)
  return createRPSResult(parameters, betAmount, numberOfEntries, playerChoice, winningChoice)
}

/**
 * Generate draw result for simulation
 */
export const generateDrawResult = (
  parameters: RPSGameParameters,
  betAmount: number,
  numberOfEntries: number,
  playerChoice: RPSChoice
): RPSGameResult => {
  return createRPSResult(parameters, betAmount, numberOfEntries, playerChoice, playerChoice)
}