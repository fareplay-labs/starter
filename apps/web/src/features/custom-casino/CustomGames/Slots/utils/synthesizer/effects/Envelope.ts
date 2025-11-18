// @ts-nocheck
/**
 * Envelope generator for amplitude and filter modulation
 */

import type { EnvelopeParams } from '../types'

export class Envelope {
  constructor(private audioContext: AudioContext) {}

  /**
   * Apply standard ADSR envelope to a parameter
   */
  applyADSR(param: AudioParam, envelope: EnvelopeParams, startTime?: number, baseValue = 0): void {
    const now = startTime || this.audioContext.currentTime
    const { attack, decay, sustain, release, peakLevel = 1 } = envelope

    param.cancelScheduledValues(now)
    param.setValueAtTime(baseValue, now)
    param.linearRampToValueAtTime(baseValue + peakLevel, now + attack)
    param.linearRampToValueAtTime(baseValue + sustain * peakLevel, now + attack + decay)
  }

  /**
   * Apply exponential ADSR for more natural sound
   */
  applyExponentialADSR(
    param: AudioParam,
    envelope: EnvelopeParams,
    startTime?: number,
    baseValue = 0.01
  ): void {
    const now = startTime || this.audioContext.currentTime
    const { attack, decay, sustain, release, peakLevel = 1 } = envelope

    param.cancelScheduledValues(now)
    param.setValueAtTime(Math.max(0.01, baseValue), now)
    param.exponentialRampToValueAtTime(baseValue + peakLevel, now + attack)
    param.exponentialRampToValueAtTime(
      Math.max(0.01, baseValue + sustain * peakLevel),
      now + attack + decay
    )
  }

  /**
   * Create a pluck envelope (fast attack, slow decay)
   */
  createPluckEnvelope(param: AudioParam, intensity = 1, duration = 1, startTime?: number): void {
    const now = startTime || this.audioContext.currentTime

    param.cancelScheduledValues(now)
    param.setValueAtTime(0, now)
    param.linearRampToValueAtTime(intensity, now + 0.002) // Very fast attack
    param.exponentialRampToValueAtTime(0.01, now + duration)
  }

  /**
   * Create a percussion envelope
   */
  createPercussionEnvelope(
    param: AudioParam,
    intensity = 1,
    punchTime = 0.01,
    decayTime = 0.2,
    startTime?: number
  ): void {
    const now = startTime || this.audioContext.currentTime

    param.cancelScheduledValues(now)
    param.setValueAtTime(0, now)
    param.linearRampToValueAtTime(intensity * 1.5, now + punchTime * 0.3) // Quick punch
    param.linearRampToValueAtTime(intensity, now + punchTime)
    param.exponentialRampToValueAtTime(0.01, now + punchTime + decayTime)
  }

  /**
   * Create a swell envelope (slow attack, slow release)
   */
  createSwellEnvelope(
    param: AudioParam,
    intensity = 1,
    attackTime = 0.5,
    holdTime = 0.5,
    releaseTime = 0.5,
    startTime?: number
  ): void {
    const now = startTime || this.audioContext.currentTime

    param.cancelScheduledValues(now)
    param.setValueAtTime(0, now)
    param.linearRampToValueAtTime(intensity, now + attackTime)
    param.setValueAtTime(intensity, now + attackTime + holdTime)
    param.linearRampToValueAtTime(0, now + attackTime + holdTime + releaseTime)
  }

  /**
   * Create a tremolo effect
   */
  createTremolo(gainNode: GainNode, rate = 5, depth = 0.5, duration?: number): OscillatorNode {
    const lfo = this.audioContext.createOscillator()
    const lfoGain = this.audioContext.createGain()

    lfo.frequency.value = rate
    lfo.type = 'sine'

    // Set up modulation depth
    lfoGain.gain.value = depth * 0.5

    // Connect LFO to gain
    lfo.connect(lfoGain)
    lfoGain.connect(gainNode.gain)

    // Start LFO
    const now = this.audioContext.currentTime
    lfo.start(now)

    if (duration) {
      lfo.stop(now + duration)
    }

    return lfo
  }

  /**
   * Create an auto-fade effect
   */
  createAutoFade(
    param: AudioParam,
    startValue: number,
    endValue: number,
    duration: number,
    curve: 'linear' | 'exponential' = 'linear',
    startTime?: number
  ): void {
    const now = startTime || this.audioContext.currentTime

    param.cancelScheduledValues(now)
    param.setValueAtTime(startValue, now)

    if (curve === 'exponential' && endValue > 0) {
      param.exponentialRampToValueAtTime(endValue, now + duration)
    } else {
      param.linearRampToValueAtTime(endValue, now + duration)
    }
  }
}
