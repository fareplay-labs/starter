// @ts-nocheck
/**
 * Utility functions for random selection from user-configured options
 */

/**
 * Randomly selects an item from an array
 * Falls back to default value if array is empty or undefined
 */
export function selectRandom<T>(options: T[] | undefined, defaultValue: T): T {
  if (!options || options.length === 0) {
    return defaultValue
  }
  return options[Math.floor(Math.random() * options.length)]
}

/**
 * Randomly selects a direction mode from user's selected options
 */
export function selectRandomDirection(
  options: string[] | undefined
): 'forward' | 'backward' | 'random' | 'alternating' {
  const validOptions = ['forward', 'backward', 'random', 'alternating'] as const
  const selected = selectRandom(options, 'forward')

  // Type guard to ensure valid direction
  if (validOptions.includes(selected as any)) {
    return selected as (typeof validOptions)[number]
  }
  return 'forward'
}

/**
 * Randomly selects a reel stop order from user's selected options
 */
export function selectRandomReelOrder(
  options: string[] | undefined
): 'sequential' | 'reverse' | 'random' | 'center-out' | 'edges-in' | 'alternating' {
  const validOptions = [
    'sequential',
    'reverse',
    'random',
    'center-out',
    'edges-in',
    'alternating',
  ] as const
  const selected = selectRandom(options, 'sequential')

  // Type guard to ensure valid order
  if (validOptions.includes(selected as any)) {
    return selected as (typeof validOptions)[number]
  }
  return 'sequential'
}

/**
 * Randomly selects an animation strategy from user's selected options
 */
export function selectRandomStrategy(options: string[] | undefined): string {
  // For strategies, we allow auto or any valid strategy name
  return selectRandom(options, 'auto')
}

