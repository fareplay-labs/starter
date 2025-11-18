// @ts-nocheck
// Export all animation types and profiles
export * from './types'
export * from './strategies'
export * from './timing'
export * from './ReelOrchestrator'
export * from './animationProbabilities'

// Import all animation profiles
import { type AnimationProfile } from './types'
import { turboAnimation } from './profiles/turbo'
import { basicAnimation } from './profiles/basic'
import { teaseAnimation } from './profiles/tease'
import { steadyAnimation } from './profiles/steady'

// Registry of all available animations
export const reelAnimations: Record<string, AnimationProfile> = {
  turbo: turboAnimation,
  basic: basicAnimation,
  tease: teaseAnimation,
  steady: steadyAnimation,
}

// Default animation if none specified
export const defaultAnimation = 'basic'

// Re-export individual animations for direct import if needed
export { turboAnimation, basicAnimation, teaseAnimation, steadyAnimation }

// Export test utilities in development
if (process.env.NODE_ENV === 'development') {
  import('./testProbabilities')
    .then(module => {
      if (typeof window !== 'undefined') {
        ;(window as any).testAnimationProbabilities = module.runProbabilityTest
        // Don't log on every load
      }
    })
    .catch(() => {
      // Silent fail - test utilities are optional
    })
}
