// @ts-nocheck
/**
 * Keyframe-based animation system for deterministic Plinko outcomes
 */

export interface AnimationKeyframe {
  time: number // Time in milliseconds from start
  x: number // Ball x position
  y: number // Ball y position
  vx?: number // Velocity x (optional, for physics debugging)
  vy?: number // Velocity y (optional, for physics debugging)
}

export interface BallAnimation {
  id: string // Unique animation ID
  targetBucket: number // Which bucket this animation targets
  duration: number // Total animation duration in ms
  keyframes: AnimationKeyframe[] // Array of position keyframes
  quality: 'approved' | 'pending' | 'rejected' // Quality control status
  metadata: {
    created: number // Timestamp when created
    rowCount: number // Row count this was generated for
    description?: string // Optional description
    tags?: string[] // Optional tags for categorization
  }
}

export interface AnimationLibrary {
  [rowCount: number]: {
    [bucketIndex: number]: BallAnimation[]
  }
}

export interface SimulationConfig {
  rowCount: number
  animationsPerBucket: number // Target number of animations per bucket
  frameRate: number // Keyframes per second
  maxDuration: number // Maximum animation duration in ms
  qualityThreshold: {
    minBounces: number // Minimum peg bounces for realism
    maxBounces: number // Maximum peg bounces to avoid chaos
    smoothnessCheck: boolean // Check for smooth movement
  }
}

export interface PhysicsState {
  x: number
  y: number
  vx: number
  vy: number
  time: number
}

export interface SimulationResult {
  success: boolean
  animation?: BallAnimation
  reason?: string // Why simulation failed (if applicable)
  stats: {
    bounces: number
    duration: number
    finalBucket: number
    keyframeCount: number
    wallHit: boolean // Track wall collisions separately
  }
}
