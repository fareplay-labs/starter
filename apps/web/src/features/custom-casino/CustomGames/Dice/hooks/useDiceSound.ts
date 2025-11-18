// @ts-nocheck
import { useEffect } from 'react'
import { useSound } from '@/features/custom-casino/shared/SoundSystem/SoundContext'
import { type DiceParameters } from '../types'

// Import sound files as modules for Vercel build compatibility
import beepSound from '@/features/custom-casino/assets/audio/mouse-over-slider.wav'

export const useDiceSound = (customSounds?: DiceParameters['customSounds']) => {
  const sound = useSound()

  useEffect(() => {
    // Load default beep sound for fallback
    sound.loadSound('diceBeep', beepSound)

    // Load custom sounds if provided
    if (customSounds?.rollStart?.url) {
      sound.loadSound('customRollStart', customSounds.rollStart.url)
    }
    if (customSounds?.diceWin?.url) {
      sound.loadSound('customDiceWin', customSounds.diceWin.url)
    }
    if (customSounds?.diceLoss?.url) {
      sound.loadSound('customDiceLoss', customSounds.diceLoss.url)
    }

    // Cleanup on unmount
    return () => {
      sound.unloadSound('diceBeep')
      sound.unloadSound('customRollStart')
      sound.unloadSound('customDiceWin')
      sound.unloadSound('customDiceLoss')
    }
  }, [sound, customSounds])

  const playDiceRollStart = () => {
    if (customSounds?.rollStart?.url) {
      const volume = customSounds.rollStart.volume ?? 0.6
      sound.playSound('customRollStart', volume)
    } else {
      // Fallback to default with medium pitch
      sound.playSound('diceBeep', 0.6, 0.8)
    }
  }

  const playDiceWin = () => {
    if (customSounds?.diceWin?.url) {
      const volume = customSounds.diceWin.volume ?? 0.8
      sound.playSound('customDiceWin', volume)
    } else {
      // Fallback to default with high pitch
      sound.playSound('diceBeep', 0.8, 1.2)
    }
  }

  const playDiceLoss = () => {
    if (customSounds?.diceLoss?.url) {
      const volume = customSounds.diceLoss.volume ?? 0.5
      sound.playSound('customDiceLoss', volume)
    } else {
      // Fallback to default with low pitch
      sound.playSound('diceBeep', 0.5, 0.4)
    }
  }

  return {
    playDiceRollStart,
    playDiceWin,
    playDiceLoss,
  }
}
