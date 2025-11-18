// @ts-nocheck
import { type GameHelperFunctions } from './types'
import { parseEther, parseUnits } from 'viem'

interface IQK {
  q: bigint[]
  k: bigint[]
}

// @NOTE: Will work for bigint type qk arrays, not sure about if type is decimal
// @NOTE: It sorts it so that k values are increasing
// @NOTE: Reason to indicate that it is BigInt is, in the backend realm, there is Decimal type qks as well because of db, so in the backend we have sortDecimalQK function as well and we have to differentiate them
const sortBigIntQK = (qk: IQK): IQK => {
  const { q, k } = qk
  if (k.length !== q.length) {
    throw new Error('Arrays must have the same length')
  }

  // Create an array of indices
  const indices = k.map((_, i) => i)

  // Sort the indices based on the values in k
  indices.sort((a, b) => {
    if (k[a] < k[b]) return -1
    if (k[a] > k[b]) return 1
    return 0
  })

  // Create new sorted arrays
  const sortedK = indices.map(i => k[i])
  const sortedQ = indices.map(i => q[i])

  return { q: sortedQ, k: sortedK }
}

export enum CardPackSelection {
  Explorer = 0,
  Challenger = 1,
  Cryptonaught = 2,
}

export const isValidCardsSide = (side = 0) => {
  return side < 3 && side >= 0
}

export const cardDrawCountToOpenAPack = 6

const getMaxCountForCards = (side: number) => {
  return cardDrawCountToOpenAPack
}

export const cardsHelperFunctions: GameHelperFunctions<number> = {
  isValidSide: isValidCardsSide,
  getMaxCount: getMaxCountForCards,
}

// @NOTE: Using String to represent the numbers because of possible problems that can be caused by precision lose using numbers
const sortedQKForPack0 = sortBigIntQK({
  // EV: 0.71175
  q: ['0.8625', '0.11', '0.0275'].map(val => parseUnits(val, 60)),
  k: ['0.06', '3', '12'].map(val => parseEther(val)),
})
const sortedQKForPack1 = sortBigIntQK({
  // EV: 0.831549
  q: ['0.004583', '0.009167', '0.0275', '0.1375', '0.275', '0.54625'].map(val =>
    parseUnits(val, 60)
  ),
  // k: ['36', '18', '6', '1.2', '0.6', '0.012'].map(val => parseEther(val)),
  k: ['36', '18', '6', '1.2', '0.6', '0.012'].map(val => parseEther(val)),
})
const sortedQKForPack2 = sortBigIntQK({
  // EV: 0.986271527...
  q: [
    '0.001433333333333333',
    '0.002291666666666667',
    '0.003055555555555557',
    '0.018333333333333333',
    '0.03666666666666667',
    '0.055',
    '0.18333333333333335',
    '0.5499999999999999',
    '0.14988611111111119',
  ].map(val => parseUnits(val, 60)),
  k: ['48', '24', '12', '6', '3', '2', '1', '0.5', '0.25'].map(val => parseEther(val)),
})

export const packIndexToPackQKForACardDraw = [
  {
    q: sortedQKForPack0.q,
    k: sortedQKForPack0.k,
  },
  {
    q: sortedQKForPack1.q,
    k: sortedQKForPack1.k,
  },
  {
    q: sortedQKForPack2.q,
    k: sortedQKForPack2.k,
  },
]
