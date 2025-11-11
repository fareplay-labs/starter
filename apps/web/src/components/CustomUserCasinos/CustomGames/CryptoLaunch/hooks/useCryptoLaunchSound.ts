// @ts-nocheck
import { useEffect, useRef } from 'react'
import { useSound } from '@/components/CustomUserCasinos/shared/SoundSystem/SoundContext'
import { type CryptoLaunchParameters } from '../types'

// Import sound files as modules for Vercel build compatibility
import beepSound from '@/components/CustomUserCasinos/assets/audio/mouse-over-slider.wav'
import coinSound from '@/components/CustomUserCasinos/assets/audio/coin-flip.wav'

export const useCryptoLaunchSound = (customSounds?: CryptoLaunchParameters['customSounds']) => {
  const sound = useSound()
  const winningLoopIntervalRef = useRef<any>(null)

  useEffect(() => {
    // Load default CryptoLaunch game sounds - using beep sound at various pitches
    sound.loadSound('cryptoBeep', beepSound)
    sound.loadSound('cryptoCoin', coinSound)

    // Load custom sounds if provided
    if (customSounds?.gameStart?.url) {
      sound.loadSound('customGameStart', customSounds.gameStart.url)
    }
    if (customSounds?.positiveBeep?.url) {
      sound.loadSound('customPositiveBeep', customSounds.positiveBeep.url)
    }
    if (customSounds?.negativeBeep?.url) {
      sound.loadSound('customNegativeBeep', customSounds.negativeBeep.url)
    }
    if (customSounds?.win?.url) {
      sound.loadSound('customWin', customSounds.win.url)
    }
    if (customSounds?.loss?.url) {
      sound.loadSound('customLoss', customSounds.loss.url)
    }
    if (customSounds?.winningLoop?.url) {
      sound.loadSound('customWinningLoop', customSounds.winningLoop.url)
    }

    // Cleanup on unmount
    return () => {
      // Stop winning loop if playing
      if (winningLoopIntervalRef.current) {
        clearInterval(winningLoopIntervalRef.current)
        winningLoopIntervalRef.current = null
      }
      
      sound.unloadSound('cryptoBeep')
      sound.unloadSound('cryptoCoin')
      sound.unloadSound('customGameStart')
      sound.unloadSound('customPositiveBeep')
      sound.unloadSound('customNegativeBeep')
      sound.unloadSound('customWin')
      sound.unloadSound('customLoss')
      sound.unloadSound('customWinningLoop')
    }
  }, [sound, customSounds])

  const playGameStart = () => {
    if (customSounds?.gameStart?.url) {
      const volume = customSounds.gameStart.volume ?? 0.5
      sound.playSound('customGameStart', volume)
    } else {
      // Default beep for game start
      sound.playSound('cryptoBeep', 0.5, 1.0)
    }
  }

  const playPositiveBeep = () => {
    if (customSounds?.positiveBeep?.url) {
      const volume = customSounds.positiveBeep.volume ?? 0.4
      sound.playSound('customPositiveBeep', volume)
    } else {
      // High pitch beep for positive crossing
      sound.playSound('cryptoBeep', 0.4, 1.4)
    }
  }

  const playNegativeBeep = () => {
    if (customSounds?.negativeBeep?.url) {
      const volume = customSounds.negativeBeep.volume ?? 0.4
      sound.playSound('customNegativeBeep', volume)
    } else {
      // Low pitch beep for negative crossing
      sound.playSound('cryptoBeep', 0.4, 0.6)
    }
  }

  const playGameWin = () => {
    if (customSounds?.win?.url) {
      const volume = customSounds.win.volume ?? 0.7
      sound.playSound('customWin', volume)
    } else {
      // Coin sound for win
      sound.playSound('cryptoCoin', 0.7, 1.0)
    }
  }

  const playGameLoss = () => {
    if (customSounds?.loss?.url) {
      const volume = customSounds.loss.volume ?? 0.5
      sound.playSound('customLoss', volume)
    } else {
      // Low beep for loss
      sound.playSound('cryptoBeep', 0.5, 0.4)
    }
  }

  const startWinningLoop = () => {
    // Don't start if already playing
    if (winningLoopIntervalRef.current) return

    const playLoop = () => {
      if (customSounds?.winningLoop?.url) {
        const volume = customSounds.winningLoop.volume ?? 0.3
        sound.playSound('customWinningLoop', volume)
      } else {
        // Default to coin sound
        sound.playSound('cryptoCoin', 0.3)
      }
    }

    // Play immediately
    playLoop()
    
    // Then set up interval to repeat (coin sound is typically short, around 500-1000ms)
    winningLoopIntervalRef.current = setInterval(playLoop, 800) // Play every 800ms
  }

  const stopWinningLoop = () => {
    if (winningLoopIntervalRef.current) {
      clearInterval(winningLoopIntervalRef.current)
      winningLoopIntervalRef.current = null
      // Stop any currently playing sound
      if (customSounds?.winningLoop?.url) {
        sound.stopSound('customWinningLoop')
      } else {
        sound.stopSound('cryptoCoin')
      }
    }
  }

  return {
    playGameStart,
    playPositiveBeep,
    playNegativeBeep,
    playGameWin,
    playGameLoss,
    startWinningLoop,
    stopWinningLoop,
  }
}
