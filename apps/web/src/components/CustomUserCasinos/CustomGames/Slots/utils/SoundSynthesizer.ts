// @ts-nocheck
/**
 * Sound Synthesizer for Slots Game
 * Direct implementation without unnecessary backward compatibility layers
 */

import { AudioEngine } from './synthesizer/core/AudioEngine'
import { ClickGenerator } from './synthesizer/generators/ClickGenerator'
import { ReelGenerator } from './synthesizer/generators/ReelGenerator'
import type { SynthConfig } from './synthesizer/types'

export class SoundSynthesizer {
  private engine: AudioEngine
  private clickGenerator: ClickGenerator
  private reelGenerator: ReelGenerator
  private config: SynthConfig
  private isInitialized = false

  constructor() {
    this.engine = new AudioEngine()
    this.clickGenerator = new ClickGenerator(this.engine)
    this.reelGenerator = new ReelGenerator(this.engine)
    
    // Default configuration
    this.config = {
      clickEnabled: true,
      clickStyle: 'modern',
      clickPitch: 0,
      clickVolume: 0.5,
      whirrEnabled: false,
      whirrPitch: 0.5,
      whirrVolume: 0.05,
    }
  }

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  init(): void {
    if (this.isInitialized) return
    this.engine.init()
    this.isInitialized = true
  }

  /**
   * Apply configuration
   */
  applyConfig(config: Partial<SynthConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    this.engine.setVolume(volume)
  }

  /**
   * Play a click sound
   */
  async playClick(frequency = 600, volume = 0.3): Promise<void> {
    if (!this.config.clickEnabled) return
    const adjustedVolume = volume * (this.config.clickVolume ?? 1)
    await this.clickGenerator.playClick(
      this.config.clickStyle ?? 'classic',
      frequency,
      adjustedVolume,
      this.config.clickPitch
    )
  }

  /**
   * Play mechanical click (classic style)
   */
  async playMechanicalClick(frequency = 400, volume = 0.3): Promise<void> {
    if (!this.config.clickEnabled) return
    const adjustedVolume = volume * (this.config.clickVolume ?? 1)
    // Force classic style for mechanical click
    await this.clickGenerator.playClick(
      'classic',
      frequency,
      adjustedVolume,
      this.config.clickPitch
    )
  }

  /**
   * Play electronic click (modern style)
   */
  async playElectronicClick(frequency = 800, volume = 0.3): Promise<void> {
    if (!this.config.clickEnabled) return
    const adjustedVolume = volume * (this.config.clickVolume ?? 1)
    // Force modern style for electronic click
    await this.clickGenerator.playClick(
      'modern',
      frequency,
      adjustedVolume,
      this.config.clickPitch
    )
  }

  /**
   * Play soft tick (minimal style)
   */
  async playSoftTick(frequency = 600, volume = 0.2): Promise<void> {
    if (!this.config.clickEnabled) return
    const adjustedVolume = volume * (this.config.clickVolume ?? 1)
    // Force minimal style for soft tick
    await this.clickGenerator.playClick(
      'minimal',
      frequency,
      adjustedVolume,
      this.config.clickPitch
    )
  }

  /**
   * Start ambient whirr sound
   */
  startAmbientWhirr(id: string, frequency = 100, volume = 0.1): void {
    if (!this.config.whirrEnabled) return
    const adjustedVolume = volume * (this.config.whirrVolume ?? 1)
    this.reelGenerator.startAmbientWhirr(id, frequency, adjustedVolume, this.config.whirrPitch)
  }

  /**
   * Modulate ambient whirr
   */
  modulateAmbientWhirr(id: string, frequency: number, volume: number): void {
    if (!this.config.whirrEnabled) return
    const adjustedVolume = volume * (this.config.whirrVolume ?? 1)
    this.reelGenerator.modulateAmbientWhirr(id, frequency, adjustedVolume, this.config.whirrPitch)
  }

  /**
   * Stop ambient whirr
   */
  stopAmbientWhirr(id: string): void {
    this.reelGenerator.stopAmbientWhirr(id)
  }

  /**
   * Fade out ambient whirr
   */
  fadeOutAmbientWhirr(id: string, durationMs = 500): void {
    this.reelGenerator.fadeOutAmbientWhirr(id, durationMs)
  }

  /**
   * Clean up and destroy
   */
  destroy(): void {
    this.reelGenerator.stopAllAmbientSounds()
    this.engine.destroy()
    this.isInitialized = false
  }

  /**
   * Check if ready
   */
  isReady(): boolean {
    return this.isInitialized && this.engine.isReady()
  }
}

// Export singleton instance for convenience
export const soundSynthesizer = new SoundSynthesizer()

// Re-export types
export type { SynthConfig } from './synthesizer/types'