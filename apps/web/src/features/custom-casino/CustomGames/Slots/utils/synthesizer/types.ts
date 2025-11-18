// @ts-nocheck
/**
 * Shared types for the sound synthesizer system
 */

export interface SynthConfig {
  // Click sounds configuration
  clickEnabled?: boolean
  clickStyle?: 'classic' | 'modern' | 'minimal'
  clickPitch?: number // -1 to 1
  clickVolume?: number // 0 to 1

  // Whirr sound configuration
  whirrEnabled?: boolean
  whirrPitch?: number // -1 to 1
  whirrVolume?: number // 0 to 1
}

export interface EnvelopeParams {
  attack: number
  decay: number
  sustain: number
  release: number
  peakLevel?: number
}

export interface OscillatorParams {
  frequency: number
  type: OscillatorType
  detune?: number
  duration?: number
}

export interface FilterParams {
  type: BiquadFilterType
  frequency: number
  Q?: number
  gain?: number
}

export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle'

export interface AmbientSound {
  oscillator: OscillatorNode
  gain: GainNode
  filter?: BiquadFilterNode
}
