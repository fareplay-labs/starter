// @ts-nocheck
/**
 * Click sound generator with multiple styles
 */

import { type AudioEngine } from '../core/AudioEngine'
import { OscillatorFactory } from '../core/OscillatorFactory'
import { NoiseGenerator } from '../core/NoiseGenerator'
import { Filters } from '../effects/Filters'
import { Envelope } from '../effects/Envelope'

export class ClickGenerator {
  private oscillatorFactory?: OscillatorFactory
  private noiseGenerator?: NoiseGenerator
  private filters?: Filters
  private envelope?: Envelope

  constructor(private engine: AudioEngine) {}

  private ensureInitialized(): boolean {
    const context = this.engine.getContext()
    if (!context) return false

    if (!this.oscillatorFactory) {
      this.oscillatorFactory = new OscillatorFactory(context)
      this.noiseGenerator = new NoiseGenerator(context)
      this.filters = new Filters(context)
      this.envelope = new Envelope(context)
    }
    return true
  }

  /**
   * Play classic mechanical click
   */
  async playClassicClick(frequency = 400, volume = 0.3, pitchAdjust = 0): Promise<void> {
    if (!this.ensureInitialized()) return
    const context = this.engine.getContext()
    if (!context || !this.engine.getMasterGain()) return

    await this.engine.ensureResumed()

    const adjustedFreq = frequency * Math.pow(2, pitchAdjust * 0.5)
    const now = context.currentTime
    const duration = 0.05

    // Create click oscillator with envelope
    const clickGain = context.createGain()
    clickGain.gain.value = volume

    // Add mechanical noise
    const noiseSource = context.createBufferSource()
    noiseSource.buffer = this.noiseGenerator!.createWhiteNoise(0.01)
    const noiseGain = context.createGain()
    noiseGain.gain.value = volume * 0.3

    // Filter for mechanical sound
    const filter = this.filters!.createBandPass(adjustedFreq * 2, 5)

    // Create main click tone
    const osc = this.oscillatorFactory!.createOscillator(
      { frequency: adjustedFreq, type: 'square', duration },
      clickGain
    )

    // Apply sharp envelope
    this.envelope!.createPercussionEnvelope(clickGain.gain, volume, 0.002, 0.02, now)

    // Connect
    clickGain.connect(filter)
    filter.connect(this.engine.getMasterGain()!)
    noiseSource.connect(noiseGain)
    noiseGain.connect(this.engine.getMasterGain()!)

    // Start
    osc.start(now)
    osc.stop(now + duration)
    noiseSource.start(now)
    noiseSource.stop(now + 0.01)
  }

  /**
   * Play modern electronic click
   */
  async playModernClick(frequency = 600, volume = 0.3, pitchAdjust = 0): Promise<void> {
    if (!this.ensureInitialized()) return
    const context = this.engine.getContext()
    if (!context || !this.engine.getMasterGain()) return

    await this.engine.ensureResumed()

    const adjustedFreq = frequency * Math.pow(2, pitchAdjust * 0.5)
    const now = context.currentTime
    const duration = 0.03

    // Create click with multiple harmonics
    const clickGain = context.createGain()
    clickGain.gain.value = 0

    // Base tone
    const osc1 = context.createOscillator()
    osc1.frequency.value = adjustedFreq
    osc1.type = 'sine'

    // Harmonic
    const osc2 = context.createOscillator()
    osc2.frequency.value = adjustedFreq * 2.5
    osc2.type = 'sine'

    // Sub harmonic for punch
    const osc3 = context.createOscillator()
    osc3.frequency.value = adjustedFreq * 0.5
    osc3.type = 'sine'

    // Mix harmonics
    const mix1 = context.createGain()
    const mix2 = context.createGain()
    const mix3 = context.createGain()
    mix1.gain.value = 1
    mix2.gain.value = 0.5
    mix3.gain.value = 0.3

    // Connect oscillators
    osc1.connect(mix1)
    osc2.connect(mix2)
    osc3.connect(mix3)
    mix1.connect(clickGain)
    mix2.connect(clickGain)
    mix3.connect(clickGain)

    // Apply snappy envelope
    this.envelope!.createPercussionEnvelope(clickGain.gain, volume, 0.001, 0.015, now)

    // Add slight filter sweep for modern feel
    const filter = this.filters!.createLowPass(adjustedFreq * 4, 2)
    this.filters!.createFilterSweep(filter, adjustedFreq * 6, adjustedFreq * 2, duration, now)

    clickGain.connect(filter)
    filter.connect(this.engine.getMasterGain()!)

    // Start all oscillators
    osc1.start(now)
    osc2.start(now)
    osc3.start(now)
    osc1.stop(now + duration)
    osc2.stop(now + duration)
    osc3.stop(now + duration)
  }

  /**
   * Play minimal subtle click
   */
  async playMinimalClick(frequency = 800, volume = 0.2, pitchAdjust = 0): Promise<void> {
    if (!this.ensureInitialized()) return
    const context = this.engine.getContext()
    if (!context || !this.engine.getMasterGain()) return

    await this.engine.ensureResumed()

    const adjustedFreq = frequency * Math.pow(2, pitchAdjust * 0.5)
    const now = context.currentTime
    const duration = 0.01

    // Simple sine wave click
    const clickGain = context.createGain()
    clickGain.gain.value = 0

    const osc = context.createOscillator()
    osc.frequency.value = adjustedFreq
    osc.type = 'sine'

    // Very short envelope for minimal sound
    clickGain.gain.setValueAtTime(0, now)
    clickGain.gain.linearRampToValueAtTime(volume, now + 0.001)
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    // Gentle high-pass to remove low frequencies
    const filter = this.filters!.createHighPass(200, 0.5)

    osc.connect(clickGain)
    clickGain.connect(filter)
    filter.connect(this.engine.getMasterGain()!)

    osc.start(now)
    osc.stop(now + duration)
  }

  /**
   * Play a click based on style setting
   */
  async playClick(
    style: 'classic' | 'modern' | 'minimal',
    frequency?: number,
    volume?: number,
    pitchAdjust?: number
  ): Promise<void> {
    switch (style) {
      case 'classic':
        return this.playClassicClick(frequency, volume, pitchAdjust)
      case 'modern':
        return this.playModernClick(frequency, volume, pitchAdjust)
      case 'minimal':
        return this.playMinimalClick(frequency, volume, pitchAdjust)
    }
  }
}
