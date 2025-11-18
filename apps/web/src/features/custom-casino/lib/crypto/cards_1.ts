// @ts-nocheck
import { type GameHelperFunctions } from './types'

const isValidCards_1Side = (side = 0) => {
  return side < 3 && side >= 0
}

const cardDrawCountToOpenAPack = 6

const getMaxCountForCards_1 = (side: number) => {
  return cardDrawCountToOpenAPack
}

export const cards_1HelperFunctions: GameHelperFunctions<number> = {
  isValidSide: isValidCards_1Side,
  getMaxCount: getMaxCountForCards_1,
}

// NOTE: Add QK for cards because it makes use of the data (wait, only the probabilities has changes, so probably I dont need such qk things)
// NOTE: Yeap, since the payouts do not change and only the odds do change, there is no need for that
