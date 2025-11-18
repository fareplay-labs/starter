// @ts-nocheck
/**
 * Factory for creating and configuring oscillators
 */

import type { OscillatorParams, EnvelopeParams } from '../types'

export class OscillatorFactory {
  constructor(private audioContext: AudioContext) {}

  /**
   * Create a basic oscillator with envelope
   */
  createOscillator(
    params: OscillatorParams,
    gainNode: GainNode,
    envelope?: EnvelopeParams
  ): OscillatorNode {
    const oscillator = this.audioContext.createOscillator()
    oscillator.frequency.value = params.frequency
    oscillator.type = params.type

    if (params.detune !== undefined) {
      oscillator.detune.value = params.detune
    }

    oscillator.connect(gainNode)

    if (envelope) {
      this.applyEnvelope(gainNode, envelope, params.duration)
    }

    return oscillator
  }

  /**
   * Create multiple detuned oscillators for a richer sound
   */
  createDetunedOscillators(
    baseFrequency: number,
    count: number,
    detuneSpread: number,
    type: OscillatorType = 'sine'
  ): OscillatorNode[] {
    const oscillators: OscillatorNode[] = []

    for (let i = 0; i < count; i++) {
      const osc = this.audioContext.createOscillator()
      osc.frequency.value = baseFrequency
      osc.type = type

      // Spread detune evenly
      const detuneAmount = (i - count / 2) * detuneSpread
      osc.detune.value = detuneAmount

      oscillators.push(osc)
    }

    return oscillators
  }

  /**
   * Apply ADSR envelope to a gain node
   */
  applyEnvelope(gainNode: GainNode, envelope: EnvelopeParams, duration?: number): void {
    const now = this.audioContext.currentTime
    const { attack, decay, sustain, release, peakLevel = 1 } = envelope

    // Start at 0
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)

    // Attack
    gainNode.gain.linearRampToValueAtTime(peakLevel, now + attack)

    // Decay to sustain
    gainNode.gain.linearRampToValueAtTime(sustain * peakLevel, now + attack + decay)

    // Hold sustain if duration provided
    if (duration) {
      const sustainTime = Math.max(0, duration - attack - decay - release)
      gainNode.gain.setValueAtTime(sustain * peakLevel, now + attack + decay + sustainTime)

      // Release
      gainNode.gain.linearRampToValueAtTime(0, now + duration)
    }
  }

  /**
   * Create an LFO (Low Frequency Oscillator) for modulation
   */
  createLFO(frequency: number, depth: number): { lfo: OscillatorNode; gain: GainNode } {
    const lfo = this.audioContext.createOscillator()
    const lfoGain = this.audioContext.createGain()

    lfo.frequency.value = frequency
    lfo.type = 'sine'
    lfoGain.gain.value = depth

    lfo.connect(lfoGain)

    return { lfo, gain: lfoGain }
  }

  /**
   * Create a pulse wave using two square waves
   */
  createPulseWave(frequency: number, pulseWidth = 0.5): OscillatorNode[] {
    const osc1 = this.audioContext.createOscillator()
    const osc2 = this.audioContext.createOscillator()

    osc1.type = 'square'
    osc1.frequency.value = frequency

    osc2.type = 'square'
    osc2.frequency.value = frequency
    osc2.detune.value = pulseWidth * 100 // Detune to create pulse width

    return [osc1, osc2]
  }
}
