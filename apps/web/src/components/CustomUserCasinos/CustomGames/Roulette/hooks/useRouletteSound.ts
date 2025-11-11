// @ts-nocheck
import { useEffect } from 'react'
import { useSound } from '@/components/CustomUserCasinos/shared/SoundSystem/SoundContext'
import { type RouletteParameters } from '../types'

// Import sound files as modules for Vercel build compatibility
import beepSound from '@/components/CustomUserCasinos/assets/audio/mouse-over-slider.wav'
import coinSound from '@/components/CustomUserCasinos/assets/audio/coins/Coins 15.wav'

export const useRouletteSound = (customSounds?: RouletteParameters['customSounds']) => {
  const sound = useSound()

  useEffect(() => {
    // Load default Roulette game sounds
    sound.loadSound('rouletteBeep', beepSound)
    sound.loadSound('rouletteCoin', coinSound)

    // Load custom sounds if provided
    if (customSounds?.spinStart?.url) {
      sound.loadSound('customSpinStart', customSounds.spinStart.url)
    }
    if (customSounds?.spinResult?.url) {
      sound.loadSound('customSpinResult', customSounds.spinResult.url)
    }
    if (customSounds?.spinReset?.url) {
      sound.loadSound('customSpinReset', customSounds.spinReset.url)
    }
    if (customSounds?.tileHighlight?.url) {
      sound.loadSound('customTileHighlight', customSounds.tileHighlight.url)
    }
    if (customSounds?.tilesResult?.url) {
      sound.loadSound('customTilesResult', customSounds.tilesResult.url)
    }

    // Cleanup on unmount
    return () => {
      sound.unloadSound('rouletteBeep')
      sound.unloadSound('rouletteCoin')
      sound.unloadSound('customSpinStart')
      sound.unloadSound('customSpinResult')
      sound.unloadSound('customSpinReset')
      sound.unloadSound('customTileHighlight')
      sound.unloadSound('customTilesResult')
    }
  }, [sound, customSounds])

  // For Spin Layout:
  const playSpinStart = () => {
    if (customSounds?.spinStart?.url) {
      const volume = customSounds.spinStart.volume ?? 0.4
      sound.playSound('customSpinStart', volume)
    } else {
      // Beep on start (when transition to playing)
      sound.playSound('rouletteBeep', 0.4, 1.0)
    }
  }

  const playSpinResult = (isWin: boolean) => {
    if (customSounds?.spinResult?.url) {
      const volume = customSounds.spinResult.volume ?? 0.5
      sound.playSound('customSpinResult', volume)
    } else {
      if (isWin) {
        // Coin sound for win
        sound.playSound('rouletteCoin', 0.6, 1.0)
      } else {
        // Beep (low) for loss
        sound.playSound('rouletteBeep', 0.3, 0.4)
      }
    }
  }

  const playSpinReset = () => {
    if (customSounds?.spinReset?.url) {
      const volume = customSounds.spinReset.volume ?? 0.4
      sound.playSound('customSpinReset', volume)
    } else {
      // Beep on reset complete (when transition back to idle)
      sound.playSound('rouletteBeep', 0.4, 0.8)
    }
  }

  // For Tiles Layout:
  const playTileHighlight = () => {
    if (customSounds?.tileHighlight?.url) {
      const volume = customSounds.tileHighlight.volume ?? 0.2
      sound.playSound('customTileHighlight', volume)
    } else {
      // Beep every time a tile is highlighted
      sound.playSound('rouletteBeep', 0.2, 1.2)
    }
  }

  const playTilesResult = (isWin: boolean) => {
    if (customSounds?.tilesResult?.url) {
      const volume = customSounds.tilesResult.volume ?? 0.5
      sound.playSound('customTilesResult', volume)
    } else {
      if (isWin) {
        // Coin sound for win
        sound.playSound('rouletteCoin', 0.6, 1.0)
      } else {
        // Beep (low) for loss
        sound.playSound('rouletteBeep', 0.3, 0.4)
      }
    }
  }

  return {
    // Spin layout sounds
    playSpinStart,
    playSpinResult,
    playSpinReset,
    // Tiles layout sounds
    playTileHighlight,
    playTilesResult,
  }
}
