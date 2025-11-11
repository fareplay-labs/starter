// @ts-nocheck
import { type DiceAnimationPreset } from './types'

interface AnimationConfig {
  y: number[]
  rotate: number[]
  scale: number[]
  times: number[]
  ease: number[] | string
  duration: number
  description: string
}

/**
 * Each animation has a distinct personality for different game feels
 */
export const DICE_ANIMATIONS: Record<DiceAnimationPreset, AnimationConfig> = {
  simple: {
    y: [0, -100, -100, -120, 0],
    rotate: [0, 180, 180, -360, 0],
    scale: [1, 0.9, 0.8, 0.9, 1],
    times: [0, 0.3, 0.5, 0.7, 1],
    ease: [0.2, 0.3, 0.2, 0.1],
    duration: 1.2,
    description: 'Classic dice roll with gentle bounce and rotation',
  },
  thump: {
    y: [0, -100, -100, 0],
    rotate: [0, 0, 0, 0],
    scale: [1, 1.1, 1.1, 1],
    times: [0, 0.4, 0.6, 1],
    ease: [0.4, 0, 0.9, 0.2],
    duration: 1.2,
    description: 'Heavy impact animation with no rotation, just vertical movement',
  },
  spin: {
    y: [0, 0, 0, 0, 0],
    rotate: [0, 90, 180, 270, 360],
    scale: [1, 1, 1, 1, 1],
    times: [0, 0.25, 0.5, 0.75, 1],
    ease: 'easeInOut',
    duration: 1.0,
    description: 'Pure rotation animation for a spinning dice effect',
  },
}

/**
 * Animation timing constants for consistent behavior
 */
export const ANIMATION_TIMINGS = {
  RESULT_HIDE_INITIAL: 0.2,
  RESULT_SHOW: 0.3,
  PARTICLE_DURATION: 800,
  RESULT_DISPLAY: 500,
} as const

/**
 * Common animation easing curves for reuse
 */
export const ANIMATION_EASINGS = {
  DICE_BOUNCE: [0.2, 0.3, 0.2, 0.1],
  RESULT_APPEAR: [0.2, 0.6, 0.3, 1],
  RESULT_DISAPPEAR: 'easeOut',
} as const
