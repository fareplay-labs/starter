import { useCallback } from 'react'
import { useEvent } from 'react-use'

type EntryEventName = 'entryFinished' | 'gameFinished' | 'updateBalance'

interface IEntryFinishedData {
  pos?: [number, number]
  deltaAmount?: number
  delaySecs?: number
}

interface IGameFinishedData {
  totalDeltaNumber?: number
  lingerMs?: number
  liveEntryDelay?: number
  balanceUpdateDelay?: number
}

type DetermineListenerData<T extends EntryEventName> =
  T extends 'entryFinished' ? IEntryFinishedData : IGameFinishedData

type EntryCustomEvent<T extends EntryEventName> = CustomEvent<DetermineListenerData<T>>

export type EntryEventListener<T extends EntryEventName> = (data: EntryCustomEvent<T>) => void

export const entryEvent = {
  useSub<T extends EntryEventName>(eventName: T, listener: EntryEventListener<T>) {
    return useEvent(eventName, listener)
  },

  usePub<T extends EntryEventName>(eventName: T, defaultData?: DetermineListenerData<T>) {
    return useCallback(
      (data: DetermineListenerData<T> = defaultData || {}) => {
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }))
      },
      [eventName]
    )
  },

  pub<T extends EntryEventName>(eventName: T, defaultData: DetermineListenerData<T> = {}) {
    return window.dispatchEvent(new CustomEvent(eventName, { detail: defaultData }))
  },
}
