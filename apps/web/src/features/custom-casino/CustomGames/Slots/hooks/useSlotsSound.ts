// @ts-nocheck
import { useEffect, useRef } from 'react'
import { useSlotsGameStore } from '../store/SlotsGameStore'

/**
 * Hook to manage sound effects for the slots game
 */
export const useSlotsSound = () => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const { parameters, isSpinning, winningLines, gameState } = useSlotsGameStore()

  // Initialize audio elements
  useEffect(() => {
    // Default sounds
    const defaultSounds = {
      leverPull: '/sounds/slots/lever-pull.mp3',
      reelSpin: '/sounds/slots/reel-spin.mp3',
      reelStop: '/sounds/slots/reel-stop.mp3',
      winSmall: '/sounds/slots/win-small.mp3',
      winBig: '/sounds/slots/win-big.mp3',
      winJackpot: '/sounds/slots/win-jackpot.mp3',
    }

    // Create audio elements for each sound with error handling
    Object.entries(defaultSounds).forEach(([key, url]) => {
      const customSound = parameters.customSounds?.[key as keyof typeof parameters.customSounds]
      const soundUrl = customSound?.url || url

      if (soundUrl && !soundUrl.startsWith('/sounds/')) {
        // Skip if not a valid sound path
        return
      }

      try {
        const audio = new Audio(soundUrl)
        audio.volume = 0.7

        // Add error handler to prevent console spam
        audio.addEventListener('error', e => {
          console.warn(`Sound not available: ${key}`, e)
          // Remove the broken audio reference
          delete audioRefs.current[key]
        })

        audioRefs.current[key] = audio
      } catch (e) {
        console.warn(`Failed to create audio for ${key}:`, e)
      }
    })

    // Cleanup
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause()
        audio.src = ''
      })
      audioRefs.current = {}
    }
  }, [parameters.customSounds])

  // Play lever pull sound when starting spin with enhanced timing
  useEffect(() => {
    if (isSpinning && audioRefs.current.leverPull) {
      // Play anticipation sound immediately
      audioRefs.current.leverPull.currentTime = 0
      audioRefs.current.leverPull.playbackRate = 0.9 // Slightly slower for dramatic effect
      audioRefs.current.leverPull.play().catch(() => {})

      // Start reel spin sound synchronized with actual spinning animation
      setTimeout(() => {
        if (audioRefs.current.reelSpin) {
          audioRefs.current.reelSpin.currentTime = 0
          audioRefs.current.reelSpin.loop = true
          audioRefs.current.reelSpin.playbackRate = 1.2 // Slightly faster for excitement
          audioRefs.current.reelSpin.play().catch(() => {})
        }
      }, 200) // Matches anticipation phase duration
    } else if (!isSpinning && audioRefs.current.reelSpin) {
      // Gradually slow down reel spin sound
      if (audioRefs.current.reelSpin && audioRefs.current.reelSpin.playbackRate > 0.5) {
        audioRefs.current.reelSpin.playbackRate = 0.8
        setTimeout(() => {
          // Check if audio still exists before accessing properties
          if (audioRefs.current.reelSpin) {
            audioRefs.current.reelSpin.loop = false
            audioRefs.current.reelSpin.pause()
          }
        }, 300)
      }

      // Play reel stop sound with impact
      if (audioRefs.current.reelStop) {
        audioRefs.current.reelStop.currentTime = 0
        audioRefs.current.reelStop.volume = 1 // Full volume for impact
        audioRefs.current.reelStop.play().catch(() => {})
      }
    }
  }, [isSpinning])

  // Play win sounds
  useEffect(() => {
    if (gameState === 'SHOWING_RESULT' && winningLines.length > 0) {
      const totalPayout = winningLines.reduce((sum, line) => sum + line.payout, 0)

      let winSound: keyof typeof audioRefs.current
      if (totalPayout >= 100) {
        winSound = 'winJackpot'
      } else if (totalPayout >= 10) {
        winSound = 'winBig'
      } else {
        winSound = 'winSmall'
      }

      if (audioRefs.current[winSound]) {
        setTimeout(() => {
          // Check if audio still exists after timeout
          if (audioRefs.current[winSound]) {
            audioRefs.current[winSound].currentTime = 0
            audioRefs.current[winSound].play().catch(e => console.log('Sound play failed:', e))
          }
        }, 500)
      }
    }
  }, [gameState, winningLines])

  // Expose play function for manual sound triggers
  const playSound = (soundKey: string, options?: { volume?: number; playbackRate?: number }) => {
    if (audioRefs.current[soundKey]) {
      const audio = audioRefs.current[soundKey]
      audio.currentTime = 0

      if (options?.volume !== undefined) {
        audio.volume = Math.min(1, options.volume)
      }

      if (options?.playbackRate !== undefined) {
        audio.playbackRate = options.playbackRate
      }

      audio.play().catch(() => {}) // Silently fail if sound unavailable
    }
  }

  // Play reel stop sound for individual reels with subtle variation
  const playReelStop = (reelIndex: number, totalReels: number) => {
    const pitch = 0.95 + reelIndex * 0.02 // Very subtle pitch variation
    const volume = 0.7

    playSound('reelStop', {
      playbackRate: pitch,
      volume: volume,
    })
  }

  return { playSound, playReelStop }
}
