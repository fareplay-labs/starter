// @ts-nocheck
import { type ReactNode } from 'react'

/**
 * Available animation types for FancyBorder
 */
export type BorderAnimationType = 'pulse' | 'flow' | 'spin' | 'none'

/**
 * Entry animation type - only corners-to-center is supported
 */
export type EntryAnimationType = 'corners-to-center' | 'none'

/**
 * Base animation configuration properties shared by all animation types
 */
interface BaseAnimationConfig {
  /** Animation duration in seconds */
  duration?: number
  /** Animation intensity factor */
  intensity?: number
}

/**
 * Configuration for pulse animation
 */
export interface PulseAnimationConfig extends BaseAnimationConfig {
  /** Minimum opacity value for animation (0-1) */
  minOpacity?: number
  /** Maximum opacity value for animation (0-1) */
  maxOpacity?: number
  /** Whether to use maximum opacity for default state when not hovered (default: false) */
  defaultMaxOpacity?: boolean
}

/**
 * Configuration for gradient flow animation
 */
export interface FlowAnimationConfig extends BaseAnimationConfig {
  /** Direction of the gradient flow (0-360 degrees) */
  flowDirection?: number
  /** Speed multiplier for the animation (default: 1) */
  speed?: number
  /** Fixed color stops for the gradient */
  colorStops?: string[]
}

/**
 * Configuration for radial spin animation
 */
export interface SpinAnimationConfig extends BaseAnimationConfig {
  /** Speed multiplier for the animation (default: 1) */
  speed?: number
  /** Direction of rotation (1: clockwise, -1: counter-clockwise) */
  direction?: number
  /** Fixed color stops for the gradient */
  colorStops?: string[]
}

/**
 * Union type for all animation configurations
 */
export type AnimationConfig = PulseAnimationConfig | FlowAnimationConfig | SpinAnimationConfig

/**
 * Configuration for entry animations
 */
export interface EntryAnimationConfig {
  /** Type of entry animation */
  type?: EntryAnimationType
  /** Duration of the entry animation in seconds */
  duration?: number
  /** Delay before starting the entry animation in seconds */
  delay?: number
  /** Function to call when the entry animation completes */
  onComplete?: () => void
  /** Custom trigger for the animation - when this value changes, the animation will play */
  trigger?: any
  /** Timing function for the animation: ease, ease-in, ease-out, ease-in-out, linear, cubic-bezier(), etc. */
  easing?: string
  /** Size of initial corner reveal in pixels (for corners-to-center animation) */
  cornerSize?: number
}

/**
 * Props for the FancyBorder component
 */
export interface FancyBorderProps {
  /** Content to wrap with the border */
  children: ReactNode
  /** Border color (any valid CSS color) */
  color?: string
  /** Border width (e.g., '1px', '2px', etc.) */
  width?: string
  /** Border style (e.g., 'solid', 'dashed', 'dotted', etc.) */
  borderStyle?: string
  /** Border radius (e.g., '4px', '8px', '50%', etc.) */
  radius?: string
  /** Optional className for additional styling */
  className?: string
  /** Enable gradient border */
  isGradient?: boolean
  /** Array of colors for the gradient border */
  gradientColors?: string[]
  /** Direction of the gradient (e.g., 'to right', '45deg', etc.) */
  gradientDirection?: string
  /** Enable border animation */
  animated?: boolean
  /** Type of animation to apply */
  animationType?: BorderAnimationType
  /** Animation configuration object for the selected animation type */
  animationConfig?: AnimationConfig
  /** Whether to animate only on hover (default: false - animates continuously) */
  animateOnHoverOnly?: boolean
  /** Enable entry animation */
  entryAnimation?: boolean
  /** Entry animation configuration */
  entryAnimationConfig?: EntryAnimationConfig
  /** Any additional props to pass to the wrapper div */
  [key: string]: any
}
