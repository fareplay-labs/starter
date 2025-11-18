// @ts-nocheck
/**
 * Animation timing constants for CryptoLaunch game
 *
 * These constants provide consistent timing behavior across all CryptoLaunch
 * animations and help maintain visual coherence in the game experience.
 */

/**
 * Core animation timing constants
 */
export const CRYPTO_LAUNCH_ANIMATION_TIMINGS = {
  /** Default animation duration for full price chart (365 days) in milliseconds */
  DEFAULT_FULL_ANIMATION: 10000,

  /** Minimum allowed animation duration */
  MIN_ANIMATION_DURATION: 1000,

  /** Maximum allowed animation duration */
  MAX_ANIMATION_DURATION: 60000,

  /** Default winnings counter animation duration */
  WINNINGS_ANIMATION_DURATION: 2000,

  /** Speed multiplier bounds */
  MIN_SPEED_MULTIPLIER: 0.1,
  MAX_SPEED_MULTIPLIER: 5.0,

  /** Chart scale smoothing rate (0-1, higher = faster scaling) */
  SCALE_SMOOTHING_RATE: 0.1,

  /** Days to look ahead for dynamic scaling */
  CHART_LOOKAHEAD_DAYS: 15,

  /** Callback defer timeout to prevent setState during render */
  CALLBACK_DEFER_TIMEOUT: 0,
} as const

/**
 * Particle animation constants
 */
export const CRYPTO_LAUNCH_PARTICLE_TIMINGS = {
  /** Base particle emission rate (particles per frame) */
  BASE_EMISSION_RATE: 3,

  /** Particle velocity range */
  PARTICLE_SPEED_MIN: 2,
  PARTICLE_SPEED_MAX: 8,

  /** Particle lifetime in milliseconds */
  PARTICLE_LIFETIME: 1000,

  /** Particle fade duration */
  PARTICLE_FADE_DURATION: 200,
} as const

/**
 * Chart animation constants
 */
export const CRYPTO_LAUNCH_CHART_TIMINGS = {
  /** Minimum scale update threshold to prevent excessive re-renders */
  SCALE_UPDATE_THRESHOLD: 0.01,

  /** Chart padding in pixels */
  CHART_PADDING: 16,

  /** Default margin for price scaling (percentage of range) */
  PRICE_MARGIN_PERCENT: 0.1,

  /** Minimum price range to prevent division by zero */
  MIN_PRICE_RANGE: 1e-6,
} as const

/**
 * Convenience type for all timing constants
 */
export type CryptoLaunchTimings = typeof CRYPTO_LAUNCH_ANIMATION_TIMINGS &
  typeof CRYPTO_LAUNCH_PARTICLE_TIMINGS &
  typeof CRYPTO_LAUNCH_CHART_TIMINGS

/**
 * Combined export of all timing constants
 */
export const CRYPTO_LAUNCH_TIMINGS = {
  ...CRYPTO_LAUNCH_ANIMATION_TIMINGS,
  ...CRYPTO_LAUNCH_PARTICLE_TIMINGS,
  ...CRYPTO_LAUNCH_CHART_TIMINGS,
} as const
