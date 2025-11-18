// @ts-nocheck
import React, { createContext, useContext } from 'react'
import { type StoreApi } from 'zustand'
import { useStore } from 'zustand'

// Accept either a vanilla StoreApi or a Zustand hook (function with getState/setState/subscribe)
export const GameStoreContext = createContext<any>(null)

export function GameStoreProvider({ store, children }: { store: any; children: React.ReactNode }) {
  return <GameStoreContext.Provider value={store}>{children}</GameStoreContext.Provider>
}

/** selector helper */
export function useGameStore<T>(selector: (t: any) => T) {
  const api = useContext(GameStoreContext)
  if (!api) throw new Error('Missing GameStoreProvider')

  return useStore(api as StoreApi<any>, selector)
}
