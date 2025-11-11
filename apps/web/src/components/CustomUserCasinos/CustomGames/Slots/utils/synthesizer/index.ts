// @ts-nocheck
/**
 * Modular Sound Synthesizer System
 *
 * This architecture provides reusable audio generation modules
 * for the Slots game's synthesized sound effects.
 */

// Export core module needed by SoundSynthesizer
export { AudioEngine } from './core/AudioEngine'

// Export generators used by SoundSynthesizer
export { ClickGenerator } from './generators/ClickGenerator'
export { ReelGenerator } from './generators/ReelGenerator'

// Export configuration and musical notes (kept for future use)
export * from './config/NoteFrequencies'

// Export only the public type used externally
export type { SynthConfig } from './types'
