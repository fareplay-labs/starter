// @ts-nocheck
import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useSound } from '@/features/custom-casino/shared/SoundSystem/SoundContext'
import { type SlotsParameters } from '../types'
import { SOUND_MANIFEST, getCustomSoundIds, type SoundId } from '../utils/soundManifest'

export const useSlotsSoundEffects = (
  customSounds?: SlotsParameters['customSounds'],
  synthConfig?: SlotsParameters['synthConfig']
) => {
  const sound = useSound()
  const playingWinSounds = useRef<Set<string>>(new Set())

  // Global guards to prevent multi-mount/StrictMode duplicates across instances
  // These are intentionally module-scoped singletons for the Slots page
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _singleton = (() => {
    // no-op to document intent
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis as any
  if (g.__slotsSfxGuards === undefined) {
    g.__slotsSfxGuards = {
      winLastStart: 0,
      megaLastStart: 0,
      coinsActive: false,
      coinsTimer: null as ReturnType<typeof setTimeout> | null,
      globalWinActiveUntil: 0,
      lastTierPlay: { small: 0, medium: 0, large: 0, mega: 0 },
    }
  }
  const guards = g.__slotsSfxGuards as {
    winLastStart: number
    megaLastStart: number
    coinsActive: boolean
    coinsTimer: ReturnType<typeof setTimeout> | null
    globalWinActiveUntil: number
    lastTierPlay: { small: number; medium: number; large: number; mega: number }
  }

  useEffect(() => {
    // Load all default sounds from manifest
    Object.entries(SOUND_MANIFEST).forEach(([id, url]) => {
      sound.loadSound(id, url)
    })

    // Load custom sounds if provided
    const customSoundIds = getCustomSoundIds(customSounds)
    Object.entries(customSoundIds).forEach(([id, url]) => {
      sound.loadSound(id, url)
    })

    // Cleanup on unmount
    return () => {
      // Unload all default sounds
      Object.keys(SOUND_MANIFEST).forEach(id => {
        sound.unloadSound(id)
      })
      // Unload all custom sounds
      Object.keys(customSoundIds).forEach(id => {
        sound.unloadSound(id)
      })
      // Clear any outstanding loop guards
      if (guards.coinsTimer) {
        clearTimeout(guards.coinsTimer)
        guards.coinsTimer = null
      }
      guards.coinsActive = false
    }
  }, [sound, customSounds])

  const playSpinStart = useCallback(() => {
    if (customSounds?.spinStart?.url) {
      const volume = customSounds.spinStart.volume ?? 0.7
      sound.playSound('customSpinStart', volume)
    } else {
      sound.playSound('spinStart', 0.7, 1.0)
    }
  }, [customSounds?.spinStart, sound])

  const playReelStop = useCallback((reelIndex: number, totalReels: number) => {
    if (customSounds?.reelStop?.url) {
      const volume = customSounds.reelStop.volume ?? 0.5
      sound.playSound('customReelStop', volume)
    } else {
      // Subtle pitch variation based on reel index
      const pitch = 0.9 + (reelIndex / totalReels) * 0.3
      sound.playSound('reelStop', 0.5, pitch)
    }
  }, [customSounds?.reelStop, sound])

  const playClick = useCallback((volume = 0.3, pitch = 1.0) => {
    sound.playSound('click', volume, pitch)
  }, [sound])

  const playWinSound = useCallback((multiplier: number, _betAmount: number) => {
    // Clear any previously playing win sounds
    playingWinSounds.current.clear()

    const now = Date.now()
    // Global celebration window guard
    if (now < guards.globalWinActiveUntil) {
      return
    }

    // Tier-aware debouncing
    const tier: 'small' | 'medium' | 'large' | 'mega' =
      multiplier < 2 ? 'small' : multiplier < 5 ? 'medium' : multiplier < 10 ? 'large' : 'mega'
    const perTierCooldown: Record<typeof tier, number> = {
      small: 300,
      medium: 600,
      large: 2000,
      mega: 4000,
    }
    
    const timeSinceLastPlay = now - guards.lastTierPlay[tier]
    if (timeSinceLastPlay < perTierCooldown[tier]) {
      return
    }
    guards.lastTierPlay[tier] = now

    if (customSounds?.winSound?.url) {
      const volume = customSounds.winSound.volume ?? 0.8
      sound.playSound('customWin', volume)
      guards.globalWinActiveUntil = now + perTierCooldown[tier]
      return
    }

    // Tiered win sounds based on multiplier
    if (multiplier < 2) {
      // Small win - single coin sound
      sound.playSound('winSmall1', 0.5, 1.0)
      playingWinSounds.current.add('winSmall1')
    } else if (multiplier < 5) {
      // Medium win - two coin sounds layered
      sound.playSound('winSmall2', 0.6, 1.1)
      setTimeout(() => sound.playSound('winMedium', 0.5, 0.9), 100)
      playingWinSounds.current.add('winSmall2')
      playingWinSounds.current.add('winMedium')
      guards.globalWinActiveUntil = now + perTierCooldown[tier]
    } else if (multiplier < 10) {
      // Big win - check for custom sound first
      if (customSounds?.bigWin?.url) {
        const volume = customSounds.bigWin.volume ?? 0.7
        sound.playSound('customBigWin', volume)
        playingWinSounds.current.add('customBigWin')
      } else {
        // Default big win - multiple coin sounds
        sound.playSound('winMedium', 0.7, 1.2)
        setTimeout(() => sound.playSound('winLarge', 0.6, 1.0), 150)
        playingWinSounds.current.add('winMedium')
        playingWinSounds.current.add('winLarge')
      }
      guards.globalWinActiveUntil = now + perTierCooldown[tier]
    } else {
      // Mega win - epic sound combination
      if (customSounds?.megaWin?.url) {
        // Guard specifically for mega win repeats
        const nowMega = Date.now()
        if (nowMega - guards.megaLastStart < 1200) {
          return
        }
        guards.megaLastStart = nowMega
        const volume = customSounds.megaWin.volume ?? 0.8
        sound.playSound('customMegaWin', volume)
        playingWinSounds.current.add('customMegaWin')
        guards.globalWinActiveUntil = now + perTierCooldown[tier]
      } else {
        sound.playSound('winMega1', 0.8, 1.0)
        setTimeout(() => sound.playSound('winMega2', 0.6, 1.0), 200)
        setTimeout(() => sound.playSound('winSpark', 0.7, 1.3), 500)
        playingWinSounds.current.add('winMega1')
        playingWinSounds.current.add('winMega2')
        playingWinSounds.current.add('winSpark')
        guards.globalWinActiveUntil = now + perTierCooldown[tier]
      }
    }
  }, [customSounds, sound])

  const playCoinsCollecting = useCallback((duration: number, intensity = 1.0) => {
    // Prevent overlapping coin loops across instances/components
    if (guards.coinsActive) {
      return
    }
    guards.coinsActive = true
    if (guards.coinsTimer) {
      clearTimeout(guards.coinsTimer)
      guards.coinsTimer = null
    }

    if (customSounds?.coinDrop?.url) {
      // Use custom coin sound in a loop
      const volume = customSounds.coinDrop.volume ?? 0.4
      const interval = Math.max(100, 300 / intensity)
      let count = 0
      const maxSounds = Math.floor(duration / interval)

      const playNextCoin = () => {
        if (count < maxSounds) {
          sound.playSound('customCoinDrop', volume * (0.8 + Math.random() * 0.4))
          count++
          setTimeout(playNextCoin, interval)
        }
      }

      setTimeout(playNextCoin, 200)
    } else {
      // Play a series of coin sounds during the win animation
      const coinSounds = ['winSmall1', 'winSmall2', 'winMedium']
      const interval = Math.max(100, 300 / intensity)
      let count = 0
      const maxSounds = Math.floor(duration / interval)

      const playNextCoin = () => {
        if (count < maxSounds && playingWinSounds.current.size > 0) {
          const soundIndex = count % coinSounds.length
          const pitch = 0.8 + (count / maxSounds) * 0.6 // Rising pitch
          const volume = 0.3 + intensity * 0.2
          sound.playSound(coinSounds[soundIndex], volume, pitch)
          count++
          setTimeout(playNextCoin, interval)
        }
      }

      setTimeout(playNextCoin, 200) // Start after initial win sound
    }

    // Reset loop guard after intended duration
    guards.coinsTimer = setTimeout(() => {
      guards.coinsActive = false
      guards.coinsTimer = null
    }, Math.max(0, duration + 300))
  }, [customSounds?.coinDrop, sound])

  const playError = useCallback(() => {
    sound.playSound('error', 0.4, 0.8)
  }, [sound])

  const stopAllWinSounds = useCallback(() => {
    playingWinSounds.current.forEach(soundName => {
      sound.stopSound(soundName)
    })
    playingWinSounds.current.clear()
    // Also reset guards controlling duplicate triggers
    guards.winLastStart = 0
    guards.megaLastStart = 0
    guards.coinsActive = false
    if (guards.coinsTimer) {
      clearTimeout(guards.coinsTimer)
      guards.coinsTimer = null
    }
    guards.globalWinActiveUntil = 0
    guards.lastTierPlay.small = 0
    guards.lastTierPlay.medium = 0
    guards.lastTierPlay.large = 0
    guards.lastTierPlay.mega = 0
  }, [sound])

  return useMemo(() => ({
    playSpinStart,
    playReelStop,
    playClick,
    playWinSound,
    playCoinsCollecting,
    playError,
    stopAllWinSounds,
  }), [playSpinStart, playReelStop, playClick, playWinSound, playCoinsCollecting, playError, stopAllWinSounds])
}
