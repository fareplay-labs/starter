// @ts-nocheck
import { useEffect } from 'react'
import { type CoinFlipParameters } from '../types'

// Import sound files as modules for Vercel build compatibility
import { useSound } from '@/features/custom-casino/shared/SoundSystem/SoundContext'
import coinFlipSound from '@/features/custom-casino/assets/audio/coin-flip.wav'
import winSound from '@/features/custom-casino/assets/audio/bombs-win.wav'
import loseSound from '@/features/custom-casino/assets/audio/bombs-lose.wav'

export const useCoinFlipSound = (customSounds?: CoinFlipParameters['customSounds']) => {
  const sound = useSound()

  useEffect(() => {
    // Load default sounds for fallback
    sound.loadSound('coinFlip', coinFlipSound)
    sound.loadSound('gameWin', winSound)
    sound.loadSound('gameLoss', loseSound)

    // Load custom sounds if provided
    if (customSounds?.coinFlip?.url) {
      sound.loadSound('customCoinFlip', customSounds.coinFlip.url)
    }
    if (customSounds?.gameWin?.url) {
      sound.loadSound('customGameWin', customSounds.gameWin.url)
    }
    if (customSounds?.gameLoss?.url) {
      sound.loadSound('customGameLoss', customSounds.gameLoss.url)
    }

    return () => {
      // Cleanup all sounds
      sound.unloadSound('coinFlip')
      sound.unloadSound('gameWin')
      sound.unloadSound('gameLoss')
      sound.unloadSound('customCoinFlip')
      sound.unloadSound('customGameWin')
      sound.unloadSound('customGameLoss')
    }
  }, [sound, customSounds])

  const playCoinFlip = () => {
    if (customSounds?.coinFlip?.url) {
      const volume = customSounds.coinFlip.volume ?? 0.5
      sound.playSound('customCoinFlip', volume)
    } else {
      sound.playSound('coinFlip', 0.5, 1.0)
    }
  }

  const playWin = () => {
    if (customSounds?.gameWin?.url) {
      const volume = customSounds.gameWin.volume ?? 0.8
      sound.playSound('customGameWin', volume)
    } else {
      sound.playSound('gameWin', 0.8, 1.0)
    }
  }

  const playLoss = () => {
    if (customSounds?.gameLoss?.url) {
      const volume = customSounds.gameLoss.volume ?? 0.7
      sound.playSound('customGameLoss', volume)
    } else {
      sound.playSound('gameLoss', 0.7, 1.0)
    }
  }

  return {
    playCoinFlip,
    playWin,
    playLoss,
  }
}
