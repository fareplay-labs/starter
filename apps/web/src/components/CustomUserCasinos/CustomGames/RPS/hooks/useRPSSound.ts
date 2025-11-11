// @ts-nocheck
import { useEffect } from 'react'
import { useSound } from '@/components/CustomUserCasinos/shared/SoundSystem/SoundContext'
import { type RPSGameParameters } from '../types'

// Import sound files as modules for Vercel build compatibility
import beepSound from '@/components/CustomUserCasinos/assets/audio/mouse-over-slider.wav'
import hitSound from '@/components/CustomUserCasinos/assets/audio/Click 12.wav'
import challengerSound from '@/components/CustomUserCasinos/assets/audio/ChallengerPack.wav'
import errorSound from '@/components/CustomUserCasinos/assets/audio/Error 20.wav'
import deviceStopSound from '@/components/CustomUserCasinos/assets/audio/Device 7 Stop.wav'

export const useRPSSound = (customSounds?: RPSGameParameters['customSounds']) => {
  const sound = useSound()

  useEffect(() => {
    // Load default RPS game sounds
    sound.loadSound('beep', beepSound)
    sound.loadSound('impact', hitSound)
    sound.loadSound('gameWin', challengerSound)
    sound.loadSound('gameLoss', errorSound)
    sound.loadSound('gameDraw', deviceStopSound)

    // Load custom sounds if provided
    if (customSounds?.beep?.url) {
      sound.loadSound('customBeep', customSounds.beep.url)
    }
    if (customSounds?.impact?.url) {
      sound.loadSound('customImpact', customSounds.impact.url)
    }
    if (customSounds?.gameWin?.url) {
      sound.loadSound('customGameWin', customSounds.gameWin.url)
    }
    if (customSounds?.gameLoss?.url) {
      sound.loadSound('customGameLoss', customSounds.gameLoss.url)
    }
    if (customSounds?.gameDraw?.url) {
      sound.loadSound('customGameDraw', customSounds.gameDraw.url)
    }

    // Cleanup on unmount
    return () => {
      sound.unloadSound('beep')
      sound.unloadSound('impact')
      sound.unloadSound('gameWin')
      sound.unloadSound('gameLoss')
      sound.unloadSound('gameDraw')
      sound.unloadSound('customBeep')
      sound.unloadSound('customImpact')
      sound.unloadSound('customGameWin')
      sound.unloadSound('customGameLoss')
      sound.unloadSound('customGameDraw')
    }
  }, [sound, customSounds])

  const playBeep = (count = 0) => {
    if (customSounds?.beep?.url) {
      const volume = customSounds.beep.volume ?? 0.35
      const pitch = 1 + count * 0.05
      sound.playSound('customBeep', volume, pitch)
    } else {
      const pitch = 1 + count * 0.05
      sound.playSound('beep', 0.35, pitch)
    }
  }

  const playImpact = () => {
    if (customSounds?.impact?.url) {
      const volume = customSounds.impact.volume ?? 0.6
      sound.playSound('customImpact', volume)
    } else {
      sound.playSound('impact', 0.6, 0.9)
    }
  }

  const playGameWin = () => {
    if (customSounds?.gameWin?.url) {
      const volume = customSounds.gameWin.volume ?? 0.7
      sound.playSound('customGameWin', volume)
    } else {
      sound.playSound('gameWin', 0.7, 1.0)
    }
  }

  const playGameLoss = () => {
    if (customSounds?.gameLoss?.url) {
      const volume = customSounds.gameLoss.volume ?? 0.5
      sound.playSound('customGameLoss', volume)
    } else {
      sound.playSound('gameLoss', 0.5, 0.9)
    }
  }

  const playGameDraw = () => {
    if (customSounds?.gameDraw?.url) {
      const volume = customSounds.gameDraw.volume ?? 0.4
      sound.playSound('customGameDraw', volume)
    } else {
      sound.playSound('gameDraw', 0.4, 1.0)
    }
  }

  return {
    playBeep,
    playImpact,
    playGameWin,
    playGameLoss,
    playGameDraw,
  }
}
