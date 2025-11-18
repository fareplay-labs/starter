// @ts-nocheck
import { useEffect } from 'react'
import { useSound } from '@/features/custom-casino/shared/SoundSystem/SoundContext'
import { type PlinkoParameters } from '../types'

// Import sound files as modules for Vercel build compatibility
import beepSound from '@/features/custom-casino/assets/audio/mouse-over-slider.wav'

export const usePlinkoSound = (customSounds?: PlinkoParameters['customSounds']) => {
  const sound = useSound()

  useEffect(() => {
    // Load default Plinko game sounds
    sound.loadSound('ballDrop', beepSound)
    sound.loadSound('bucketLand', beepSound)

    // Load custom sounds if provided
    if (customSounds?.ballDrop?.url) {
      sound.loadSound('customBallDrop', customSounds.ballDrop.url)
    }
    if (customSounds?.bucketLanding?.url) {
      sound.loadSound('customBucketLanding', customSounds.bucketLanding.url)
    }

    // Cleanup on unmount
    return () => {
      sound.unloadSound('ballDrop')
      sound.unloadSound('bucketLand')
      sound.unloadSound('customBallDrop')
      sound.unloadSound('customBucketLanding')
    }
  }, [sound, customSounds])

  const playBallDrop = () => {
    if (customSounds?.ballDrop?.url) {
      const volume = customSounds.ballDrop.volume ?? 0.4
      sound.playSound('customBallDrop', volume)
    } else {
      sound.playSound('ballDrop', 0.4, 0.7)
    }
  }

  const playBucketLanding = (multiplier = 1) => {
    if (customSounds?.bucketLanding?.url) {
      const volume = customSounds.bucketLanding.volume ?? 0.4
      sound.playSound('customBucketLanding', volume)
    } else {
      let pitch: number
      let volume: number

      if (multiplier <= 1) {
        // Low multipliers get a low "thud" pitch
        pitch = 0.2
        volume = 0.2
      } else {
        // Higher multipliers get increasing pitch
        const basePitch = 0.6
        const pitchIncrement = Math.min(((multiplier - 1) / 20) * 0.8, 1.0) // Cap at +1.0
        pitch = basePitch + pitchIncrement
        volume = 0.6
      }

      sound.playSound('bucketLand', volume, pitch)
    }
  }

  return {
    playBallDrop,
    playBucketLanding,
  }
}
