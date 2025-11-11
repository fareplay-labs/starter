// @ts-nocheck
import { validBetTypes, type BetType } from '@/components/CustomUserCasinos/store/useRouletteGameStore'
import { type GameHelperFunctions } from './types'
import { unit } from '../vault/helpers'
import { parseEther } from 'viem'

export interface IUISingleRouletteSide {
  type: BetType
  numbers: number[] // each number has to be between 0-36 (inclusive)
  amount: number // amount has to be > 0  // amount for this single bet so, if there is 2 numbers inside the numbers array, you can assume that half of the amount is bet on that number and the other half is for the other number
}

export interface IRouletteSide {
  uiRepresentation: IUISingleRouletteSide[] // uiRepresentation and rouletteNumberToBetFraction should correspond to each other, like based on some uiRepresentation we can create rouletteNumberToBetFraction and provided RouletteSide requires rouletteNumberToBetFraction to be the correspondong one for uiRepresentation
  rouletteNumberToBetFraction: { [key: number]: string } // fractions should add up to 1 // @NOTE: Also, note that there is a problem with sending bigint values as api requests, thats why we are sending these values as strings
}

export const convertRouletteUIRepresentationToRouletteNumberToBetFraction = (
  rouletteUIRepresentation: IUISingleRouletteSide[]
): { [key: number]: string } => {
  const rouletteNumberToBetFraction: { [key: number]: bigint } = {}
  for (let i = 0; i <= 36; i++) {
    rouletteNumberToBetFraction[i] = 0n
  }
  const totalAmount = rouletteUIRepresentation.reduce(
    (acc: bigint, curr: IUISingleRouletteSide) => {
      return acc + parseEther(String(curr.amount))
    },
    0n
  )
  rouletteUIRepresentation.forEach(singleRouletteSide => {
    const amountOfNumbersForBetType = singleRouletteSide.numbers.length
    const amountPerNumber =
      parseEther(String(singleRouletteSide.amount)) / BigInt(amountOfNumbersForBetType)
    // first just add up the amounts, we will go over again and will divide by bet amount to get the fraction. As this should lead up to less of a precision loss
    singleRouletteSide.numbers.forEach(num => {
      rouletteNumberToBetFraction[num] += amountPerNumber
    })
  })
  Object.values(rouletteNumberToBetFraction).forEach((currentBetAmount, index) => {
    rouletteNumberToBetFraction[index] = (currentBetAmount * unit) / (totalAmount || 1n)
  })
  // @NOTE: If fractions do not add up to 1 because of precision loss on divisions, increase the first non 0 entry's weight to cause the sum to be 1
  // @TODO: Hmm, then does this make it a different bet? Because build qk will be a bit different?
  // @TODO: Maybe do not require this, we dont specifically have to have the fractions add up to 1? (maybe)
  // const sumOfFractions = Object.values(rouletteNumberToBetFraction).reduce((a, b) => a + b, 0n)
  // if (sumOfFractions !== unit) {
  //   for (let i = 0; i <= 36; i++) {
  //     if (rouletteNumberToBetFraction[i] !== 0n) {
  //       rouletteNumberToBetFraction[i] += unit - sumOfFractions
  //       break
  //     }
  //   }
  // }
  const res: { [key: number]: string } = {}
  Object.values(rouletteNumberToBetFraction).forEach((val, index) => {
    res[index] = val.toString()
  })
  return res
}

// used
// @TODO: Hmm, maybe check if the sum of fractions is around 1 (just below), I guess when we are dividing we lose '1' value so rather than 0.333...333 it becomes 0.333...332, so what we can do is, add '36' and check if it overflows, if so thats totally fine and we would understand it is just below 1 because of divisions
const isValidRouletteSide = (side: IRouletteSide): boolean => {
  // @NOTE: Validate that given uiRepresenteation causes to create rouletteNumberToBetFraction
  return (
    isRouletteUIRepresentation(side.uiRepresentation) &&
    JSON.stringify(side.rouletteNumberToBetFraction) ===
      JSON.stringify(
        convertRouletteUIRepresentationToRouletteNumberToBetFraction(side.uiRepresentation)
      )
  )
}
// used
const getMaxCountForRoulette = (_side: IRouletteSide): number => {
  return 1 // @NOTE: We are not supporting multiple bets for roulette for now, so you can only play with count = 1
}

export const rouletteHelperFunctions: GameHelperFunctions<IRouletteSide> = {
  isValidSide: isValidRouletteSide,
  getMaxCount: getMaxCountForRoulette,
}

// Type guard for BetType
const isBetType = (value: any): value is BetType => {
  return typeof value === 'string' && validBetTypes.includes(value as BetType)
}

// Type guard for IUISingleRouletteSide
const isSingleRouletteSide = (value: any): value is IUISingleRouletteSide => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    isBetType(value.type) &&
    Array.isArray(value.numbers) &&
    value.numbers.every((item: any) => typeof item === 'number' && item >= 0 && item <= 36) &&
    typeof value.amount === 'number' &&
    value.amount > 0
  )
}

// Type guard for IUISingleRouletteSide[]
const isRouletteUIRepresentation = (value: any): value is IRouletteSide => {
  return Array.isArray(value) && value.every(isSingleRouletteSide)
}
