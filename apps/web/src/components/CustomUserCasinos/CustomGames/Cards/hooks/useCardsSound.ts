// @ts-nocheck
import { useCallback, useEffect, useMemo } from 'react'
import { useSound } from '@/components/CustomUserCasinos/shared/SoundSystem/SoundContext'
import { useCardsGameStore } from '../store/CardsGameStore'

// Import single beep sound for all effects with different pitches
import beepSound from '@/components/CustomUserCasinos/assets/audio/mouse-over-slider.wav'

export const useCardsSound = (shouldInitialize = false) => {
  const sound = useSound()
  const { parameters } = useCardsGameStore()
  // Support both nested and flattened editor keys (e.g., 'customSounds.win')
  const customSounds = useMemo(() => {
    const nested = parameters?.customSounds
    if (nested && Object.keys(nested).length > 0) return nested
    const p: any = parameters || {}
    const get = (k: string) => p?.[`customSounds.${k}`]
    const maybe = {
      packSelect: get('packSelect'),
      packOpen: get('packOpen'),
      cardFlip: get('cardFlip'),
      cardReveal: get('cardReveal'),
      win: get('win'),
      lose: get('lose'),
    }
    // If none present, return undefined to fall back to beeps
    return Object.values(maybe).some(Boolean) ? maybe : undefined
  }, [parameters])
  
  // Only initialize sounds if explicitly requested (from main component)
  useEffect(() => {
    if (!shouldInitialize) return
    
    // Load single beep sound for all effects
    sound.loadSound('cardsBeep', beepSound)
    
    // Load custom sounds if provided in parameters
    if (customSounds?.packSelect?.url)
      sound.loadSound('customPackSelect', customSounds.packSelect.url)
    if (customSounds?.packOpen?.url)
      sound.loadSound('customPackOpen', customSounds.packOpen.url)
    if (customSounds?.cardFlip?.url)
      sound.loadSound('customCardFlip', customSounds.cardFlip.url)
    // Map cardDisplay trigger to cardReveal config key
    if (customSounds?.cardReveal?.url)
      sound.loadSound('customCardReveal', customSounds.cardReveal.url)
    // Outcome sounds
    if (customSounds?.win?.url)
      sound.loadSound('customWin', customSounds.win.url)
    if (customSounds?.lose?.url)
      sound.loadSound('customLose', customSounds.lose.url)
    
    // Cleanup on unmount
    return () => {
      sound.unloadSound('cardsBeep')
      sound.unloadSound('customPackSelect')
      sound.unloadSound('customPackOpen')
      sound.unloadSound('customCardFlip')
      sound.unloadSound('customCardReveal')
      sound.unloadSound('customWin')
      sound.unloadSound('customLose')
    }
  }, [shouldInitialize, sound, customSounds])
  
  // Play sound helper - simplified to 4 sounds only.
  // Memoized to avoid re-renders thrashing effects that depend on it.
  const playSound = useCallback((soundKey: string) => {
    
    const custom = customSounds
    
    switch(soundKey) {
      case 'packSelect':
        if (custom?.packSelect?.url) {
          const volume = custom.packSelect.volume ?? 0.3
          sound.playSound('customPackSelect', volume)
        } else {
          // Low pitch beep for pack selection
          // Ensure default beep is registered even if init effect hasn't run yet
          sound.loadSound('cardsBeep', beepSound)
          sound.playSound('cardsBeep', 0.3, 0.5)
        }
        break
        
      case 'packOpen':
        if (custom?.packOpen?.url) {
          const volume = custom.packOpen.volume ?? 0.5
          sound.playSound('customPackOpen', volume)
        } else {
          // Mid pitch beep for pack opening
          sound.loadSound('cardsBeep', beepSound)
          sound.playSound('cardsBeep', 0.5, 0.8)
        }
        break
        
      case 'cardFlip':
        if (custom?.cardFlip?.url) {
          const volume = custom.cardFlip.volume ?? 0.4
          sound.playSound('customCardFlip', volume)
        } else {
          // Standard beep for card flip
          sound.loadSound('cardsBeep', beepSound)
          sound.playSound('cardsBeep', 0.4, 0.6)
        }
        break
        
      case 'cardDisplay': // maps to cardReveal param
      case 'cardReveal':
        if (custom?.cardReveal?.url) {
          const volume = custom.cardReveal.volume ?? 0.4
          sound.playSound('customCardReveal', volume)
        } else {
          // Higher pitch beep for cards moving to grid
          sound.loadSound('cardsBeep', beepSound)
          sound.playSound('cardsBeep', 0.4, 1.0)
        }
        break

      case 'win': {
        if (custom?.win?.url) {
          const volume = custom.win.volume ?? 0.8
          sound.playSound('customWin', volume)
        } else {
          sound.loadSound('cardsBeep', beepSound)
          sound.playSound('cardsBeep', 0.7, 1.1)
        }
        break
      }

      case 'lose': {
        if (custom?.lose?.url) {
          const volume = custom.lose.volume ?? 0.6
          sound.playSound('customLose', volume)
        } else {
          sound.loadSound('cardsBeep', beepSound)
          sound.playSound('cardsBeep', 0.4, 0.7)
        }
        break
      }
        
      default:
        return
    }
  }, [customSounds, sound])
  
  return { 
    playSound 
  }
}

export default useCardsSound
