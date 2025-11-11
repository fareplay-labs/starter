// @ts-nocheck
import { FareAA__factory, FareVaultV3__factory, USDCMock__factory } from './typechain'
import { diceHelperFunctions } from './dice'
import { coinFlipHelperFunctions } from './coinFlip'
import { rpsHelperFunctions } from './rps'
import { bombsHelperFunctions, type IBombsSide } from './bombs'
import { crashHelperFunctions } from './crash'
import { type ICryptoLaunchSide, cryptoLaunchHelperFunctions } from './cryptoLaunch'
import { type IRouletteSide, rouletteHelperFunctions } from './roulette'
import { type AppGameName } from '@/chains/types'
import { type GameHelperFunctions } from './types'
import { type IPlinkoSide, plinkoHelperFunctions } from './plinko'
import { cards_1HelperFunctions } from './cards_1'
import { slots_1HelperFunctions } from './slots_1'

export const USDCContractInterface = USDCMock__factory.createInterface()
export const BankrollContractInterface = FareAA__factory.createInterface()
export const FareVaultV3ContractInterface = FareVaultV3__factory.createInterface()

// @NOTE: This might get out of hand with new games, will have to find a better way at some point
const gameTypeHelperFunctionsMap: {
  [key in AppGameName]: key extends AppGameName.Bombs ? GameHelperFunctions<IBombsSide>
  : key extends AppGameName.Plinko ? GameHelperFunctions<IPlinkoSide>
  : key extends AppGameName.Roulette ? GameHelperFunctions<IRouletteSide>
  : key extends AppGameName.CryptoLaunch_1 ? GameHelperFunctions<ICryptoLaunchSide>
  : GameHelperFunctions
} = {
  dice: diceHelperFunctions,
  rps: rpsHelperFunctions,
  coinFlip: coinFlipHelperFunctions,
  bombs: bombsHelperFunctions,
  plinko: plinkoHelperFunctions,
  crash: crashHelperFunctions,
  roulette: rouletteHelperFunctions,
  cards_1: cards_1HelperFunctions,
  cryptoLaunch_1: cryptoLaunchHelperFunctions,
  slots_1: slots_1HelperFunctions,
} as const

export type GameSide = number & IBombsSide & IPlinkoSide & IRouletteSide & ICryptoLaunchSide
export const gameTypeIsHelperFunctionsWithSideMap: { [key in AppGameName]: boolean } = {
  dice: true,
  rps: false,
  coinFlip: false,
  bombs: true,
  plinko: true,
  crash: true,
  roulette: true,
  cards_1: true,
  cryptoLaunch_1: true,
  slots_1: true,
} as const

// USED
export const isValidSide = (gameName: AppGameName, side: GameSide) => {
  return gameTypeHelperFunctionsMap[gameName].isValidSide(side)
}

// USED
export const getMaxCount = (gameName: AppGameName, side: GameSide) => {
  return gameTypeHelperFunctionsMap[gameName].getMaxCount(side)
}
