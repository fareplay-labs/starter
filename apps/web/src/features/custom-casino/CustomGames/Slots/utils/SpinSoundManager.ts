// @ts-nocheck
/**
 * SpinSoundManager - Manages perpetual sound effects during slot spinning
 * Creates an immersive audio experience with symbol clicks, mechanical whirrs,
 * and dynamic sound modulation based on reel velocity
 */

import { soundSynthesizer } from './SoundSynthesizer'
import type { SynthConfig } from '../types'

export interface ReelSoundState {
  index: number
  velocity: number // pixels per second
  lastClickTime: number
  lastSymbolPosition: number
  isSpinning: boolean
  symbolHeight: number
  symbolCount: number
}

export interface SpinSoundConfig {
  clickDebounceMs?: number // Minimum time between clicks per reel
  ambientVolume?: number // Volume for background whirr (0-1)
  clickVolume?: number // Volume for symbol clicks (0-1)
  enabled?: boolean
  style?: 'classic' | 'modern' | 'minimal'
}

export class SpinSoundManager {
  private reelStates: Map<number, ReelSoundState> = new Map()
  private config: Required<SpinSoundConfig>
  private ambientSoundId: string | null = null
  private isAmbientPlaying = false
  private lastAmbientUpdate = 0
  private ambientUpdateInterval = 100 // Update ambient every 100ms
  private volumeGetter: (() => number) | null = null
  private synthConfig: SynthConfig | null = null

  // Reel-specific base frequencies for harmonic progression (C major chord)
  private readonly reelFrequencies = [261.63, 329.63, 392.0, 523.25, 659.25] // C4, E4, G4, C5, E5

  constructor(config: SpinSoundConfig = {}) {
    this.config = {
      clickDebounceMs: config.clickDebounceMs ?? 50,
      ambientVolume: config.ambientVolume ?? 0.3,
      clickVolume: config.clickVolume ?? 0.5,
      enabled: config.enabled ?? true,
      // style: config.style ?? 'classic',
      style: config.style ?? 'modern',
    }
  }

  /**
   * Initialize or update a reel's sound state
   */
  updateReelState(
    reelIndex: number,
    velocity: number,
    isSpinning: boolean,
    symbolHeight: number,
    symbolCount: number
  ): void {
    if (!this.config.enabled) return

    const existingState = this.reelStates.get(reelIndex)

    if (existingState) {
      existingState.velocity = velocity
      existingState.isSpinning = isSpinning
      existingState.symbolHeight = symbolHeight
      existingState.symbolCount = symbolCount
    } else {
      this.reelStates.set(reelIndex, {
        index: reelIndex,
        velocity,
        lastClickTime: 0,
        lastSymbolPosition: -1,
        isSpinning,
        symbolHeight,
        symbolCount,
      })
    }

    // Start/stop ambient sound based on spinning state
    this.updateAmbientSound()
  }

  /**
   * Check if a symbol has passed the payline and trigger click sound
   */
  checkSymbolPass(
    reelIndex: number,
    currentOffset: number,
    timestamp: number = performance.now()
  ): void {
    if (!this.config.enabled) return

    const state = this.reelStates.get(reelIndex)
    if (!state || !state.isSpinning) return

    // Calculate current symbol position
    const symbolPosition = Math.abs(currentOffset / state.symbolHeight)
    const currentSymbolIndex = Math.floor(symbolPosition) % state.symbolCount

    // Check if we've crossed to a new symbol
    if (state.lastSymbolPosition !== -1) {
      const prevSymbolIndex = Math.floor(state.lastSymbolPosition) % state.symbolCount

      if (currentSymbolIndex !== prevSymbolIndex) {
        // Symbol boundary crossed - check debounce
        const timeSinceLastClick = timestamp - state.lastClickTime

        if (timeSinceLastClick >= this.config.clickDebounceMs) {
          this.playSymbolClick(reelIndex, state.velocity)
          state.lastClickTime = timestamp
        }
      }
    }

    state.lastSymbolPosition = symbolPosition
  }

  /**
   * Play a click sound for a symbol passing the payline
   */
  private playSymbolClick(reelIndex: number, velocity: number): void {
    // Check if click sounds are disabled via synthConfig
    if (!this.synthConfig?.clickEnabled) return

    const baseFreq = this.reelFrequencies[reelIndex % this.reelFrequencies.length]

    // Modulate pitch based on velocity (faster = higher pitch)
    const speedRatio = Math.min(Math.max(velocity / 500, 0.5), 2.0) // Clamp between 0.5x and 2x
    const frequency = baseFreq * speedRatio

    // Modulate volume based on speed (faster = louder)
    const volumeScale = Math.min(Math.max(velocity / 800, 0.3), 1.0)
    // Apply global volume if available
    const globalVolume = this.volumeGetter ? this.volumeGetter() : 1
    const volume = this.config.clickVolume * volumeScale * globalVolume

    // Use synth config style if available, otherwise use SpinSoundManager config
    const style = this.synthConfig?.clickStyle || this.config.style

    // Different click styles
    switch (style) {
      case 'modern':
        soundSynthesizer.playElectronicClick(frequency, volume)
        break
      case 'minimal':
        soundSynthesizer.playSoftTick(frequency, volume * 0.5)
        break
      case 'classic':
      default:
        soundSynthesizer.playMechanicalClick(frequency, volume)
        break
    }
  }

  /**
   * Update ambient whirr sound based on average reel velocity
   */
  private updateAmbientSound(): void {
    const now = performance.now()

    // Throttle ambient updates
    if (now - this.lastAmbientUpdate < this.ambientUpdateInterval) return
    this.lastAmbientUpdate = now

    // Calculate average velocity of spinning reels
    let totalVelocity = 0
    let spinningCount = 0

    this.reelStates.forEach(state => {
      if (state.isSpinning) {
        totalVelocity += state.velocity
        spinningCount++
      }
    })

    if (spinningCount === 0) {
      // No reels spinning - stop ambient
      this.stopAmbientSound()
      return
    }

    const avgVelocity = totalVelocity / spinningCount

    // Start or update ambient sound
    if (!this.isAmbientPlaying) {
      this.startAmbientSound(avgVelocity)
    } else {
      this.modulateAmbientSound(avgVelocity)
    }
  }

  /**
   * Start the ambient whirr sound
   */
  private startAmbientSound(velocity: number): void {
    // Check if whirr sounds are enabled
    if (!this.synthConfig?.whirrEnabled) return
    if (this.isAmbientPlaying) return

    const baseFreq = 150 // Higher frequency for softer whirr
    const freqModulation = Math.min(Math.max(velocity / 500, 0.5), 2.0)

    this.ambientSoundId = `whirr_${Date.now()}`
    soundSynthesizer.startAmbientWhirr(
      this.ambientSoundId,
      baseFreq * freqModulation,
      this.config.ambientVolume
    )

    this.isAmbientPlaying = true
  }

  /**
   * Modulate the ambient sound based on velocity
   */
  private modulateAmbientSound(velocity: number): void {
    if (!this.synthConfig?.whirrEnabled) return
    if (!this.isAmbientPlaying || !this.ambientSoundId) return

    const baseFreq = 150 // Higher frequency for softer whirr
    const freqModulation = Math.min(Math.max(velocity / 500, 0.5), 1.5) // Less extreme modulation

    soundSynthesizer.modulateAmbientWhirr(
      this.ambientSoundId,
      baseFreq * freqModulation,
      this.config.ambientVolume
    )
  }

  /**
   * Stop the ambient whirr sound
   */
  private stopAmbientSound(): void {
    if (!this.synthConfig?.whirrEnabled) return
    if (!this.isAmbientPlaying || !this.ambientSoundId) return

    soundSynthesizer.stopAmbientWhirr(this.ambientSoundId)
    this.ambientSoundId = null
    this.isAmbientPlaying = false
  }

  /**
   * Stop a specific reel
   */
  stopReel(reelIndex: number): void {
    const state = this.reelStates.get(reelIndex)
    if (state) {
      state.isSpinning = false
      state.velocity = 0
    }

    // Note: Reel stop sound is handled by the component using file-based sounds
    // The component calls sfx.playReelStop() when appropriate

    this.updateAmbientSound() // Update whirr sound when reel stops
  }

  /**
   * Stop all sounds and reset state
   */
  stopAll(): void {
    this.stopAmbientSound()
    this.reelStates.clear()
  }

  /**
   * Fade out all sounds (useful during win celebrations)
   */
  fadeOut(durationMs = 500): void {
    if (this.synthConfig?.whirrEnabled && this.ambientSoundId) {
      soundSynthesizer.fadeOutAmbientWhirr(this.ambientSoundId, durationMs)
      setTimeout(() => {
        this.ambientSoundId = null
        this.isAmbientPlaying = false
      }, durationMs)
    }
  }

  /**
   * Set configuration
   */
  setConfig(config: Partial<SpinSoundConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
    if (!enabled) {
      // this.stopAll() // Just clear states, no whirr to stop
      this.reelStates.clear()
    }
  }

  /**
   * Set sound style preset
   */
  setStyle(style: 'classic' | 'modern' | 'minimal'): void {
    this.config.style = style
  }

  /**
   * Set volume getter function for global volume integration
   */
  setVolumeGetter(getter: () => number): void {
    this.volumeGetter = getter
  }

  /**
   * Set synthesizer configuration
   */
  setSynthConfig(config: SynthConfig): void {
    this.synthConfig = config
    // Pass all config to soundSynthesizer, not just enabled
    soundSynthesizer.applyConfig(config)
  }

  /**
   * Cleanup
   */
  destroy(): void {
    // this.stopAll() // Just clear states, no whirr to stop
    this.reelStates.clear()
  }
}

// Singleton instance
export const spinSoundManager = new SpinSoundManager()
