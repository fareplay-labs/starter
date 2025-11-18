// @ts-nocheck
/**
 * Reel sound generator for slot machine mechanics
 */

import { type AudioEngine } from '../core/AudioEngine'
import { OscillatorFactory } from '../core/OscillatorFactory'
import { NoiseGenerator } from '../core/NoiseGenerator'
import { Filters } from '../effects/Filters'
import { Envelope } from '../effects/Envelope'
import type { AmbientSound } from '../types'

export class ReelGenerator {
  private oscillatorFactory?: OscillatorFactory
  private noiseGenerator?: NoiseGenerator
  private filters?: Filters
  private envelope?: Envelope
  private ambientSounds: Map<string, AmbientSound> = new Map()

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
   * Play reel stop sound
   */
  async playReelStop(pitch = 1, pitchAdjust = 0): Promise<void> {
    if (!this.ensureInitialized()) return
    const context = this.engine.getContext()
    if (!context || !this.engine.getMasterGain()) return

    await this.engine.ensureResumed()

    const pitchMultiplier = pitch * Math.pow(2, pitchAdjust * 0.5)
    const now = context.currentTime

    // Mechanical thud
    const thudFreq = 80 * pitchMultiplier
    const thudGain = context.createGain()
    thudGain.gain.value = 0

    // Low frequency oscillator for thud
    const thudOsc = context.createOscillator()
    thudOsc.frequency.value = thudFreq
    thudOsc.type = 'sine'

    // Quick punch envelope
    this.envelope!.createPercussionEnvelope(thudGain.gain, 0.4, 0.005, 0.1, now)

    // Mechanical click
    const clickBuffer = this.noiseGenerator!.createImpulse(0.8)
    const clickSource = context.createBufferSource()
    clickSource.buffer = clickBuffer

    const clickGain = context.createGain()
    clickGain.gain.value = 0.3

    // Filter for mechanical character
    const clickFilter = this.filters!.createBandPass(1000 * pitchMultiplier, 10)

    // Spring/metal resonance
    const resonanceGain = context.createGain()
    resonanceGain.gain.value = 0

    const resonanceOsc = context.createOscillator()
    resonanceOsc.frequency.value = 400 * pitchMultiplier
    resonanceOsc.type = 'triangle'

    // Resonance envelope
    this.envelope!.applyExponentialADSR(
      resonanceGain.gain,
      {
        attack: 0.001,
        decay: 0.15,
        sustain: 0.05,
        release: 0.1,
        peakLevel: 0.15,
      },
      now
    )

    // Connect thud
    thudOsc.connect(thudGain)
    thudGain.connect(this.engine.getMasterGain()!)

    // Connect click
    clickSource.connect(clickFilter)
    clickFilter.connect(clickGain)
    clickGain.connect(this.engine.getMasterGain()!)

    // Connect resonance
    resonanceOsc.connect(resonanceGain)
    resonanceGain.connect(this.engine.getMasterGain()!)

    // Start sounds
    thudOsc.start(now)
    thudOsc.stop(now + 0.2)
    clickSource.start(now)
    resonanceOsc.start(now)
    resonanceOsc.stop(now + 0.3)
  }

  /**
   * Start ambient mechanical whirr
   */
  startAmbientWhirr(id: string, frequency = 100, volume = 0.1, pitchAdjust = 0): void {
    if (!this.ensureInitialized()) return
    const context = this.engine.getContext()
    if (!context || !this.engine.getMasterGain()) return

    // Stop existing whirr if any
    this.stopAmbientWhirr(id)

    const pitchMultiplier = Math.pow(2, pitchAdjust * 0.5)
    const adjustedFreq = frequency * pitchMultiplier

    // Create oscillator for softer mechanical hum
    const osc = context.createOscillator()
    osc.frequency.value = adjustedFreq
    osc.type = 'sine' // Softer than sawtooth

    // Create modulation for realistic mechanical sound
    const lfoData = this.oscillatorFactory!.createLFO(0.5, 2)
    lfoData.gain.connect(osc.frequency)

    // Gain control
    const gain = context.createGain()
    gain.gain.value = volume

    // Filter for softer mechanical character
    const filter = this.filters!.createLowPass(adjustedFreq * 2, 1) // More filtering for softer sound

    // Add some noise for realism
    const noiseBuffer = this.noiseGenerator!.createPinkNoise(1)
    const noiseSource = context.createBufferSource()
    noiseSource.buffer = noiseBuffer
    noiseSource.loop = true

    const noiseGain = context.createGain()
    noiseGain.gain.value = volume * 0.05 // Much less noise for softer sound

    const noiseFilter = this.filters!.createBandPass(adjustedFreq * 2, 5)

    // Connect oscillator chain
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.engine.getMasterGain()!)

    // Connect noise chain
    noiseSource.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(this.engine.getMasterGain()!)

    // Start sounds
    const now = context.currentTime
    osc.start(now)
    lfoData.lfo.start(now)
    noiseSource.start(now)

    // Store for later control
    this.ambientSounds.set(id, {
      oscillator: osc,
      gain,
      filter,
    })
  }

  /**
   * Modulate existing whirr sound
   */
  modulateAmbientWhirr(id: string, frequency: number, volume: number, pitchAdjust = 0): void {
    const sound = this.ambientSounds.get(id)
    if (!sound) return

    const context = this.engine.getContext()
    if (!context) return

    const pitchMultiplier = Math.pow(2, pitchAdjust * 0.5)
    const now = context.currentTime

    // Smooth frequency change
    sound.oscillator.frequency.cancelScheduledValues(now)
    sound.oscillator.frequency.setValueAtTime(sound.oscillator.frequency.value, now)
    sound.oscillator.frequency.linearRampToValueAtTime(frequency * pitchMultiplier, now + 0.1)

    // Smooth volume change
    sound.gain.gain.cancelScheduledValues(now)
    sound.gain.gain.setValueAtTime(sound.gain.gain.value, now)
    sound.gain.gain.linearRampToValueAtTime(volume, now + 0.1)

    // Adjust filter
    if (sound.filter) {
      sound.filter.frequency.cancelScheduledValues(now)
      sound.filter.frequency.setValueAtTime(sound.filter.frequency.value, now)
      sound.filter.frequency.linearRampToValueAtTime(frequency * pitchMultiplier * 3, now + 0.1)
    }
  }

  /**
   * Stop ambient whirr immediately
   */
  stopAmbientWhirr(id: string): void {
    const sound = this.ambientSounds.get(id)
    if (!sound) return

    const context = this.engine.getContext()
    if (!context) return

    const now = context.currentTime

    // Quick fade out to avoid clicks
    sound.gain.gain.cancelScheduledValues(now)
    sound.gain.gain.setValueAtTime(sound.gain.gain.value, now)
    sound.gain.gain.linearRampToValueAtTime(0, now + 0.05)

    // Stop and cleanup
    setTimeout(() => {
      sound.oscillator.stop()
      this.ambientSounds.delete(id)
    }, 50)
  }

  /**
   * Fade out ambient whirr
   */
  fadeOutAmbientWhirr(id: string, durationMs = 500): void {
    const sound = this.ambientSounds.get(id)
    if (!sound) return

    const context = this.engine.getContext()
    if (!context) return

    const now = context.currentTime
    const duration = durationMs / 1000

    // Gradual fade out
    sound.gain.gain.cancelScheduledValues(now)
    sound.gain.gain.setValueAtTime(sound.gain.gain.value, now)
    sound.gain.gain.linearRampToValueAtTime(0, now + duration)

    // Stop and cleanup after fade
    setTimeout(() => {
      sound.oscillator.stop()
      this.ambientSounds.delete(id)
    }, durationMs)
  }

  /**
   * Play mechanical spin start sound
   */
  async playSpinStart(pitchAdjust = 0): Promise<void> {
    if (!this.ensureInitialized()) return
    const context = this.engine.getContext()
    if (!context || !this.engine.getMasterGain()) return

    await this.engine.ensureResumed()

    const pitchMultiplier = Math.pow(2, pitchAdjust * 0.5)
    const now = context.currentTime

    // Lever pull sound
    const leverFreq = 200 * pitchMultiplier
    const leverGain = context.createGain()
    leverGain.gain.value = 0

    // Create metallic lever sound
    const leverOsc = context.createOscillator()
    leverOsc.frequency.setValueAtTime(leverFreq, now)
    leverOsc.frequency.exponentialRampToValueAtTime(leverFreq * 0.5, now + 0.1)
    leverOsc.type = 'square'

    // Lever envelope
    this.envelope!.applyADSR(
      leverGain.gain,
      {
        attack: 0.01,
        decay: 0.05,
        sustain: 0.3,
        release: 0.1,
        peakLevel: 0.3,
      },
      now
    )

    // Spring tension release
    const springBuffer = this.noiseGenerator!.createMetallicNoise(0.15, 1500 * pitchMultiplier)
    const springGain = context.createGain()

    this.envelope!.createPercussionEnvelope(springGain.gain, 0.2, 0.02, 0.1, now + 0.05)

    // Motor start sound
    const motorGain = context.createGain()
    motorGain.gain.value = 0

    const motorOsc = context.createOscillator()
    motorOsc.frequency.setValueAtTime(30 * pitchMultiplier, now)
    motorOsc.frequency.exponentialRampToValueAtTime(100 * pitchMultiplier, now + 0.3)
    motorOsc.type = 'sawtooth'

    // Motor envelope
    this.envelope!.createSwellEnvelope(motorGain.gain, 0.15, 0.2, 0.1, 0.1, now)

    // Filter for motor
    const motorFilter = this.filters!.createLowPass(200 * pitchMultiplier, 3)

    // Connect lever
    leverOsc.connect(leverGain)
    leverGain.connect(this.engine.getMasterGain()!)

    // Connect spring
    springBuffer.connect(springGain)
    springGain.connect(this.engine.getMasterGain()!)

    // Connect motor
    motorOsc.connect(motorFilter)
    motorFilter.connect(motorGain)
    motorGain.connect(this.engine.getMasterGain()!)

    // Start sounds
    leverOsc.start(now)
    leverOsc.stop(now + 0.2)
    springBuffer.start(now + 0.05)
    motorOsc.start(now)
    motorOsc.stop(now + 0.5)
  }

  /**
   * Play reel acceleration sound
   */
  async playReelAcceleration(reelIndex: number, duration = 500, pitchAdjust = 0): Promise<void> {
    if (!this.ensureInitialized()) return
    const context = this.engine.getContext()
    if (!context || !this.engine.getMasterGain()) return

    await this.engine.ensureResumed()

    const pitchMultiplier = Math.pow(2, pitchAdjust * 0.5)
    const now = context.currentTime
    const durationSec = duration / 1000

    // Frequency sweep for acceleration
    const startFreq = 50 * pitchMultiplier * (1 + reelIndex * 0.1)
    const endFreq = 200 * pitchMultiplier * (1 + reelIndex * 0.1)

    const gain = context.createGain()
    gain.gain.value = 0.1

    const osc = context.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(startFreq, now)
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + durationSec)

    // Filter sweep for whoosh effect
    const filter = this.filters!.createLowPass(startFreq * 2, 2)
    this.filters!.createFilterSweep(filter, startFreq * 2, endFreq * 4, durationSec, now)

    // Volume envelope
    this.envelope!.createSwellEnvelope(
      gain.gain,
      0.15,
      durationSec * 0.3,
      durationSec * 0.4,
      durationSec * 0.3,
      now
    )

    // Connect
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.engine.getMasterGain()!)

    // Start
    osc.start(now)
    osc.stop(now + durationSec)
  }

  /**
   * Clean up all ambient sounds
   */
  stopAllAmbientSounds(): void {
    for (const id of this.ambientSounds.keys()) {
      this.stopAmbientWhirr(id)
    }
  }
}
