// @ts-nocheck
import { create } from 'zustand'

const useCurrencyStore = create(() => ({
  balances: {
    currency: '1000',
    balanceInUsdc: '1000',
  },
  setBalances: () => {},
}))

export default useCurrencyStore
