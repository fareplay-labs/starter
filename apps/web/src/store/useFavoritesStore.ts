import { create } from 'zustand'

const STORAGE_KEY = 'customCasinoFavorites'

interface FavoritesStore {
  favoriteCasinos: string[]
  loadFromLocalStorage: () => void
  toggleFavorite: (casinoId: string) => void
  isFavorite: (casinoId: string) => boolean
}

const readFavorites = (): string[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteCasinos: [],
  loadFromLocalStorage: () => {
    const favorites = readFavorites()
    set({ favoriteCasinos: favorites })
  },
  toggleFavorite: (casinoId: string) => {
    const current = get().favoriteCasinos
    const exists = current.includes(casinoId)
    const next = exists ? current.filter(id => id !== casinoId) : [...current, casinoId]
    set({ favoriteCasinos: next })
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
  },
  isFavorite: (casinoId: string) => get().favoriteCasinos.includes(casinoId),
}))
