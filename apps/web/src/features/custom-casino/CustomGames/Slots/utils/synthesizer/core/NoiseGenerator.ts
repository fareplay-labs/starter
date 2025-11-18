// @ts-nocheck
/**
 * Noise generation utilities for sound synthesis
 */

export class NoiseGenerator {
  constructor(private audioContext: AudioContext) {}

  /**
   * Create white noise buffer
   */
  createWhiteNoise(duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate
    const length = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const channel = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      channel[i] = Math.random() * 2 - 1
    }

    return buffer
  }

  /**
   * Create pink noise buffer (1/f noise)
   */
  createPinkNoise(duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate
    const length = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const channel = buffer.getChannelData(0)

    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1

      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898

      channel[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }

    return buffer
  }

  /**
   * Create brown noise buffer (1/f² noise)
   */
  createBrownNoise(duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate
    const length = duration * sampleRate
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const channel = buffer.getChannelData(0)

    let lastValue = 0

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      lastValue = (lastValue + 0.02 * white) / 1.02
      channel[i] = lastValue * 3.5 // Amplify
    }

    return buffer
  }

  /**
   * Create metallic noise (filtered white noise)
   */
  createMetallicNoise(duration: number, frequency = 5000): AudioBufferSourceNode {
    const noiseBuffer = this.createWhiteNoise(duration)
    const noiseSource = this.audioContext.createBufferSource()
    noiseSource.buffer = noiseBuffer

    // Add band-pass filter for metallic sound
    const filter = this.audioContext.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = frequency
    filter.Q.value = 20

    noiseSource.connect(filter)

    return noiseSource
  }

  /**
   * Create a click/pop sound using an impulse
   */
  createImpulse(intensity = 1): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate
    const length = Math.floor(0.001 * sampleRate) // 1ms impulse
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const channel = buffer.getChannelData(0)

    // Create a sharp impulse
    channel[0] = intensity
    for (let i = 1; i < length; i++) {
      channel[i] = channel[i - 1] * 0.9 // Quick decay
    }

    return buffer
  }

  /**
   * Create a burst of noise
   */
  createNoiseBurst(
    duration: number,
    envelopeAttack = 0.001,
    envelopeDecay = 0.05
  ): AudioBufferSourceNode {
    const noiseBuffer = this.createWhiteNoise(duration)
    const noiseSource = this.audioContext.createBufferSource()
    noiseSource.buffer = noiseBuffer

    const envelope = this.audioContext.createGain()
    const now = this.audioContext.currentTime

    envelope.gain.setValueAtTime(0, now)
    envelope.gain.linearRampToValueAtTime(1, now + envelopeAttack)
    envelope.gain.exponentialRampToValueAtTime(0.01, now + envelopeAttack + envelopeDecay)

    noiseSource.connect(envelope)

    return noiseSource
  }
}
