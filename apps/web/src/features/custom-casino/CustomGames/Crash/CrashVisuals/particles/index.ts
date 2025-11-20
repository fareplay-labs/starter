// @ts-nocheck
// Main particle system component
export { CrashParticleSystem } from './CrashParticleSystem'

// Individual particle components
export { CrashExplosion } from './CrashExplosion'

// Types
export type {
  ParticleData,
  PhysicsConfig,
  CrashExplosionProps,
  ParticleSystemProps,
} from './types'

// Utilities
export {
  generateCrashExplosion,
  updateParticle,
  getDirectionVector,
  random,
  PARTICLE_SHAPES,
  generateVariedColor,
  hexToHsl,
  hslToHex,
} from './utils'
