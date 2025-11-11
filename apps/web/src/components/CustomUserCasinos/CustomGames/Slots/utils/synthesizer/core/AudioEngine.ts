// @ts-nocheck
/**
 * Core audio engine for Web Audio API management
 */

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private isInitialized = false

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  init(): void {
    if (this.isInitialized) return

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = 0.5 // Master volume
      this.isInitialized = true
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  /**
   * Ensure audio context is resumed (for browsers that suspend it)
   */
  async ensureResumed(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  /**
   * Get the audio context
   */
  getContext(): AudioContext | null {
    return this.audioContext
  }

  /**
   * Get the master gain node
   */
  getMasterGain(): GainNode | null {
    return this.masterGain
  }

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  /**
   * Get current time from audio context
   */
  getCurrentTime(): number {
    return this.audioContext?.currentTime || 0
  }

  /**
   * Check if engine is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.audioContext !== null
  }

  /**
   * Clean up and destroy
   */
  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
      this.masterGain = null
      this.isInitialized = false
    }
  }
}
