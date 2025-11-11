// @ts-nocheck
import { useEffect } from 'react'
import { useSound } from '@/components/CustomUserCasinos/shared/SoundSystem/SoundContext'
import { type BombsParameters } from '../types'

// Import sound files as modules for Vercel build compatibility
import clickSound from '@/components/CustomUserCasinos/assets/audio/Click 11.wav'
import coinSound from '@/components/CustomUserCasinos/assets/audio/coins/Coins 01.wav'
import explosionSound from '@/components/CustomUserCasinos/assets/audio/Explosion49.wav'
import winSound from '@/components/CustomUserCasinos/assets/audio/bombs-win.wav'
import loseSound from '@/components/CustomUserCasinos/assets/audio/bombs-lose.wav'

export const useBombsSound = (customSounds?: BombsParameters['customSounds']) => {
  const sound = useSound()

  useEffect(() => {
    // Load default sounds for fallback
    sound.loadSound('tileClick', clickSound)
    sound.loadSound('coinReveal', coinSound)
    sound.loadSound('bombExplosion', explosionSound)
    sound.loadSound('gameWin', winSound)
    sound.loadSound('gameLoss', loseSound)

    // Load custom sounds if provided
    if (customSounds?.tileClick?.url) {
      sound.loadSound('customTileClick', customSounds.tileClick.url)
    }
    if (customSounds?.coinReveal?.url) {
      sound.loadSound('customCoinReveal', customSounds.coinReveal.url)
    }
    if (customSounds?.bombExplosion?.url) {
      sound.loadSound('customBombExplosion', customSounds.bombExplosion.url)
    }
    if (customSounds?.gameWin?.url) {
      sound.loadSound('customGameWin', customSounds.gameWin.url)
    }
    if (customSounds?.gameLoss?.url) {
      sound.loadSound('customGameLoss', customSounds.gameLoss.url)
    }

    return () => {
      // Cleanup all sounds
      sound.unloadSound('tileClick')
      sound.unloadSound('coinReveal')
      sound.unloadSound('bombExplosion')
      sound.unloadSound('gameWin')
      sound.unloadSound('gameLoss')
      sound.unloadSound('customTileClick')
      sound.unloadSound('customCoinReveal')
      sound.unloadSound('customBombExplosion')
      sound.unloadSound('customGameWin')
      sound.unloadSound('customGameLoss')
    }
  }, [sound, customSounds])

  const playCoinSound = (consecutiveCount = 0) => {
    if (customSounds?.coinReveal?.url) {
      const volume = customSounds.coinReveal.volume ?? 0.5
      sound.playSound('customCoinReveal', volume)
    } else {
      // Progressive pitch: start at 0.9, increase by 0.05 for each consecutive coin (max 1.3)
      const pitch = Math.min(0.9 + consecutiveCount * 0.05, 1.3)
      sound.playSound('coinReveal', 0.5, pitch)
    }
  }

  const playBombExplosion = () => {
    if (customSounds?.bombExplosion?.url) {
      const volume = customSounds.bombExplosion.volume ?? 0.7
      sound.playSound('customBombExplosion', volume)
    } else {
      sound.playSound('bombExplosion', 0.7, 0.8)
    }
  }

  const playGameWin = () => {
    if (customSounds?.gameWin?.url) {
      const volume = customSounds.gameWin.volume ?? 0.8
      sound.playSound('customGameWin', volume)
    } else {
      sound.playSound('gameWin', 0.8, 1.0)
    }
  }

  const playGameLoss = () => {
    if (customSounds?.gameLoss?.url) {
      const volume = customSounds.gameLoss.volume ?? 0.7
      sound.playSound('customGameLoss', volume)
    } else {
      sound.playSound('gameLoss', 0.7, 1.0)
    }
  }

  const playTileClick = () => {
    if (customSounds?.tileClick?.url) {
      const volume = customSounds.tileClick.volume ?? 0.4
      sound.playSound('customTileClick', volume)
    } else {
      sound.playSound('tileClick', 0.4, 1.0)
    }
  }

  return {
    playCoinSound,
    playBombExplosion,
    playGameWin,
    playGameLoss,
    playTileClick,
  }
}
