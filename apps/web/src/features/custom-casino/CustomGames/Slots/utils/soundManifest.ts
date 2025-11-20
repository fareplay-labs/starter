// @ts-nocheck
// Import sound files

// Win sounds - coins with increasing intensity
import spinStartSound from '@/features/custom-casino/assets/audio/Device 7 Start.wav'
import reelStopSound from '@/features/custom-casino/assets/audio/Click 11.wav'
import clickSound from '@/features/custom-casino/assets/audio/Click 12.wav'
import coinSound1 from '@/features/custom-casino/assets/audio/coins/Coins 01.wav'
import coinSound2 from '@/features/custom-casino/assets/audio/coins/Coins 05.wav'

// Special effect sounds
import coinSound3 from '@/features/custom-casino/assets/audio/coins/Coins 10.wav'
import coinSound4 from '@/features/custom-casino/assets/audio/coins/Coins 15.wav'
import coinSound5 from '@/features/custom-casino/assets/audio/coins/Coins 20.wav'
import megaWinSound from '@/features/custom-casino/assets/audio/Explosion49.wav'
import sparkSound from '@/features/custom-casino/assets/audio/Spark 20.wav'
import errorSound from '@/features/custom-casino/assets/audio/Error 07.wav'

/**
 * Sound manifest for Slots game
 * Defines all sound resources and their IDs
 */
export const SOUND_MANIFEST = {
  // Core game sounds
  spinStart: spinStartSound,
  reelStop: reelStopSound,
  click: clickSound,

  // Win tier sounds
  winSmall1: coinSound1,
  winSmall2: coinSound2,
  winMedium: coinSound3,
  winLarge: coinSound4,
  winMega1: coinSound5,
  winMega2: megaWinSound,
  winSpark: sparkSound,

  // Error sound
  error: errorSound,
} as const

export type SoundId = keyof typeof SOUND_MANIFEST

/**
 * Get custom sound IDs based on provided configuration
 */
export function getCustomSoundIds(customSounds?: any): Record<string, string> {
  const customIds: Record<string, string> = {}

  if (customSounds?.spinStart?.url) {
    customIds.customSpinStart = customSounds.spinStart.url
  }
  if (customSounds?.reelStop?.url) {
    customIds.customReelStop = customSounds.reelStop.url
  }
  if (customSounds?.winSound?.url) {
    customIds.customWin = customSounds.winSound.url
  }
  if (customSounds?.bigWin?.url) {
    customIds.customBigWin = customSounds.bigWin.url
  }
  if (customSounds?.megaWin?.url) {
    customIds.customMegaWin = customSounds.megaWin.url
  }
  if (customSounds?.coinDrop?.url) {
    customIds.customCoinDrop = customSounds.coinDrop.url
  }

  return customIds
}
