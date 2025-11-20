// @ts-nocheck
/**
 * Helper functions for working with entry-based state management
 * These helpers make it easier to connect form components to the entry update pattern
 */

/**
 * Creates a change handler for entry.side properties
 * @param updateEntry - The updateEntry function from the game store
 * @param key - The key in entry.side to update
 * @returns A change handler function
 */
export function createEntryChangeHandler<T, K extends keyof T>(
  updateEntry: (update: Partial<{ side: Partial<T> }>) => void,
  key: K
) {
  return (value: T[K]) => {
    updateEntry({ side: { [key]: value } as unknown as Partial<T> })
  }
}

/**
 * Creates change handlers for multiple entry.side properties
 * @param updateEntry - The updateEntry function from the game store
 * @returns An object with change handlers for each key
 */
export function createEntryChangeHandlers<T>(
  updateEntry: (update: Partial<{ side: Partial<T> }>) => void
) {
  return <K extends keyof T>(key: K) => createEntryChangeHandler<T, K>(updateEntry, key)
}

/**
 * Helper to update entry amount
 * @param updateEntry - The updateEntry function from the game store
 * @returns A change handler for entryAmount
 */
export function createAmountChangeHandler(
  updateEntry: (update: Partial<{ entryAmount?: number }>) => void
) {
  return (amount: number) => {
    updateEntry({ entryAmount: amount })
  }
}

/**
 * Helper to update entry count
 * @param updateEntry - The updateEntry function from the game store
 * @returns A change handler for entryCount
 */
export function createCountChangeHandler(
  updateEntry: (update: Partial<{ entryCount?: number }>) => void
) {
  return (count: number) => {
    updateEntry({ entryCount: count })
  }
}
