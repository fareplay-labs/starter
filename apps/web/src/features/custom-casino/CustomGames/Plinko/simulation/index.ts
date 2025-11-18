// @ts-nocheck
// Export all simulation types and classes
export * from './types'
export * from './constants'
export { PhysicsSimulator } from './PhysicsSimulator'
export { AnimationLibraryManager } from './AnimationLibrary'
export { AnimationPlayer } from './AnimationPlayer'

// Import for internal use
import { AnimationLibraryManager } from './AnimationLibrary'
import { QUALITY_THRESHOLDS } from './constants'

// Convenience exports for common configurations
export const DEFAULT_SIMULATION_CONFIGS = {
  // Low quality for fast testing
  development: {
    animationsPerBucket: 3,
    frameRate: 30,
    maxDuration: 5000,
    qualityThreshold: QUALITY_THRESHOLDS.development,
  },
  // High quality for production
  production: {
    animationsPerBucket: 5,
    frameRate: 60,
    maxDuration: 5500,
    qualityThreshold: QUALITY_THRESHOLDS.production,
  },
} as const

// Global animation library instance
let globalLibraryManager: AnimationLibraryManager | null = null

/**
 * Get the global animation library manager instance
 */
export function getAnimationLibrary(): AnimationLibraryManager {
  if (!globalLibraryManager) {
    globalLibraryManager = new AnimationLibraryManager()
  }
  return globalLibraryManager
}

/**
 * Generate animations for a specific configuration
 */
export async function generateAnimationsForConfig(
  rowCount: number,
  riskLevelOrMode?: number | 'development' | 'production',
  mode?: 'development' | 'production'
): Promise<void> {
  const library = getAnimationLibrary()

  // Handle both function signatures:
  // 1. generateAnimationsForConfig(rowCount, mode)
  // 2. generateAnimationsForConfig(rowCount, riskLevel, mode)
  let finalRiskLevel: number | undefined
  let finalMode: 'development' | 'production' = 'development'

  if (typeof riskLevelOrMode === 'number') {
    // Called with riskLevel as second argument
    finalRiskLevel = riskLevelOrMode
    finalMode = mode || 'development'
  } else if (typeof riskLevelOrMode === 'string') {
    // Called with mode as second argument (legacy usage)
    finalMode = riskLevelOrMode
  } else {
    // No second argument provided, use defaults
    finalMode = 'development'
  }

  const baseConfig = DEFAULT_SIMULATION_CONFIGS[finalMode]

  const config = {
    ...baseConfig,
    rowCount,
    ...(finalRiskLevel !== undefined && { riskLevel: finalRiskLevel }),
  }

  await library.generateAnimations(config)
}

/**
 * Generate animations for a specific bucket
 */
export async function generateAnimationsForBucket(
  rowCount: number,
  bucket: number,
  mode: 'development' | 'production' = 'development'
): Promise<void> {
  const library = getAnimationLibrary()
  const baseConfig = DEFAULT_SIMULATION_CONFIGS[mode]

  const config = {
    ...baseConfig,
    rowCount,
  }
  await library.generateAnimationsForBucket(config, bucket)
}

/**
 * Get a random animation for a specific outcome
 */
export function getAnimationForOutcome(
  rowCount: number,
  targetBucket: number
): import('./types').BallAnimation | null {
  const library = getAnimationLibrary()
  return library.getAnimation(rowCount, targetBucket)
}

/**
 * Download animations as JSON for version control
 */
export function downloadAnimationsAsJSON(rowCount: number): void {
  const library = getAnimationLibrary()
  library.downloadAnimations(rowCount)
}
