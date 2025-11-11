// @ts-nocheck
import { useEffect } from 'react'
import { useSound } from '@/components/CustomUserCasinos/shared/SoundSystem/SoundContext'
import { type CrashParameters } from '../types'

// Import sound files as modules for Vercel build compatibility
import deviceStartSound from '@/components/CustomUserCasinos/assets/audio/Device 7 Start.wav'
import sparkSound from '@/components/CustomUserCasinos/assets/audio/Spark 20.wav'
import explosionSound from '@/components/CustomUserCasinos/assets/audio/Explosion49.wav'

export const useCrashSound = (customSounds?: CrashParameters['customSounds']) => {
  const sound = useSound()

  useEffect(() => {
    // Load default sounds for fallback
    sound.loadSound('rocketLaunch', deviceStartSound)
    sound.loadSound('cashOut', sparkSound)
    sound.loadSound('crashExplosion', explosionSound)

    // Load custom sounds if provided
    if (customSounds?.rocketLaunch?.url) {
      sound.loadSound('customRocketLaunch', customSounds.rocketLaunch.url)
    }
    if (customSounds?.cashOut?.url) {
      sound.loadSound('customCashOut', customSounds.cashOut.url)
    }
    if (customSounds?.crashExplosion?.url) {
      sound.loadSound('customCrashExplosion', customSounds.crashExplosion.url)
    }

    return () => {
      // Cleanup all sounds
      sound.unloadSound('rocketLaunch')
      sound.unloadSound('cashOut')
      sound.unloadSound('crashExplosion')
      sound.unloadSound('customRocketLaunch')
      sound.unloadSound('customCashOut')
      sound.unloadSound('customCrashExplosion')
    }
  }, [sound, customSounds])

  const playRocketLaunch = () => {
    if (customSounds?.rocketLaunch?.url) {
      const volume = customSounds.rocketLaunch.volume ?? 0.6
      sound.playSound('customRocketLaunch', volume)
    } else {
      sound.playSound('rocketLaunch', 0.6, 1.0)
    }
  }

  const playCashOut = () => {
    if (customSounds?.cashOut?.url) {
      const volume = customSounds.cashOut.volume ?? 0.7
      sound.playSound('customCashOut', volume)
    } else {
      sound.playSound('cashOut', 0.7, 1.1)
    }
  }

  const playCrashExplosion = () => {
    if (customSounds?.crashExplosion?.url) {
      const volume = customSounds.crashExplosion.volume ?? 0.8
      sound.playSound('customCrashExplosion', volume)
    } else {
      sound.playSound('crashExplosion', 0.8, 0.9)
    }
  }

  return {
    playRocketLaunch,
    playCashOut,
    playCrashExplosion,
  }
}
