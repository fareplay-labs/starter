// @ts-nocheck
/**
 * Filter utilities for sound processing
 */

import type { FilterParams } from '../types'

export class Filters {
  constructor(private audioContext: AudioContext) {}

  /**
   * Create a configured biquad filter
   */
  createFilter(params: FilterParams): BiquadFilterNode {
    const filter = this.audioContext.createBiquadFilter()
    filter.type = params.type
    filter.frequency.value = params.frequency

    if (params.Q !== undefined) {
      filter.Q.value = params.Q
    }

    if (params.gain !== undefined) {
      filter.gain.value = params.gain
    }

    return filter
  }

  /**
   * Create a low-pass filter for smoothing
   */
  createLowPass(frequency: number, resonance = 1): BiquadFilterNode {
    return this.createFilter({
      type: 'lowpass',
      frequency,
      Q: resonance,
    })
  }

  /**
   * Create a high-pass filter for brightness
   */
  createHighPass(frequency: number, resonance = 1): BiquadFilterNode {
    return this.createFilter({
      type: 'highpass',
      frequency,
      Q: resonance,
    })
  }

  /**
   * Create a band-pass filter for focused frequencies
   */
  createBandPass(frequency: number, Q = 1): BiquadFilterNode {
    return this.createFilter({
      type: 'bandpass',
      frequency,
      Q,
    })
  }

  /**
   * Create a notch filter to remove specific frequencies
   */
  createNotch(frequency: number, Q = 10): BiquadFilterNode {
    return this.createFilter({
      type: 'notch',
      frequency,
      Q,
    })
  }

  /**
   * Create a filter sweep effect
   */
  createFilterSweep(
    filter: BiquadFilterNode,
    startFreq: number,
    endFreq: number,
    duration: number,
    startTime?: number
  ): void {
    const now = startTime || this.audioContext.currentTime

    filter.frequency.cancelScheduledValues(now)
    filter.frequency.setValueAtTime(startFreq, now)
    filter.frequency.exponentialRampToValueAtTime(endFreq, now + duration)
  }

  /**
   * Create a resonant filter with modulation
   */
  createResonantFilter(
    frequency: number,
    resonance = 10,
    modFreq = 0,
    modDepth = 0
  ): { filter: BiquadFilterNode; lfo?: OscillatorNode } {
    const filter = this.createLowPass(frequency, resonance)

    if (modFreq > 0 && modDepth > 0) {
      const lfo = this.audioContext.createOscillator()
      const lfoGain = this.audioContext.createGain()

      lfo.frequency.value = modFreq
      lfo.type = 'sine'
      lfoGain.gain.value = modDepth * frequency

      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)

      return { filter, lfo }
    }

    return { filter }
  }

  /**
   * Create a multi-stage filter chain
   */
  createFilterChain(filters: FilterParams[]): BiquadFilterNode[] {
    return filters.map(params => this.createFilter(params))
  }

  /**
   * Connect filters in series
   */
  connectInSeries(nodes: AudioNode[]): void {
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].connect(nodes[i + 1])
    }
  }
}
