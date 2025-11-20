// @ts-nocheck
import {
  type AnimationKeyframe,
  type BallAnimation,
  type SimulationConfig,
  type SimulationResult,
  type PhysicsState,
} from './types'
import {
  GRAVITY,
  BOUNCE_DAMPING,
  FRICTION,
  MIN_VELOCITY,
  FRAME_TIME,
  calculateLayout,
  generatePegs,
} from './constants'

/**
 * High-quality physics simulator for generating deterministic Plinko animations
 * Now uses unified constants to match live physics exactly
 */
export class PhysicsSimulator {
  private config: SimulationConfig
  private pegs: Array<{ x: number; y: number; radius: number }> = []
  private layout: ReturnType<typeof calculateLayout>

  constructor(config: SimulationConfig) {
    this.config = config
    this.layout = calculateLayout(this.config.rowCount)
    this.generatePegs()
  }

  private generatePegs() {
    this.pegs = generatePegs(this.config.rowCount, this.layout)
  }

  /**
   * Simulate a ball drop targeting a specific bucket
   */
  public simulateBallDrop(targetBucket: number, seed?: number): SimulationResult {
    // Use seed for reproducible "randomness"
    const random = seed ? this.seededRandom(seed) : Math.random

    let bounceCount = 0
    let wallHit = false // Track wall hits separately
    const keyframes: AnimationKeyframe[] = []

    // Start at center but bias initial horizontal velocity toward the target bucket
    // to improve success rates for extreme buckets.
    const state: PhysicsState & {
      lastCollidedPeg?: string
      collisionCooldown: number
    } = {
      x: this.layout.canvasWidth / 2,
      y: 30,
      // Bias initial horizontal velocity toward the target bucket to help extremes
      vx: (targetBucket / (this.layout.bucketCount - 1) - 0.5) * 0.4 + (random() - 0.5) * 0.05,
      vy: 0,
      time: 0,
      collisionCooldown: 0,
    }

    // Add initial keyframe
    keyframes.push({
      time: 0,
      x: state.x,
      y: state.y,
      vx: state.vx,
      vy: state.vy,
    })

    // Use config-based frame time for proper scaling
    const simulationFrameTime = 1000 / this.config.frameRate
    let lastKeyframeTime = 0
    const keyframeInterval = simulationFrameTime

    // Simulation loop
    while (state.time < this.config.maxDuration) {
      // Apply physics - fixed time scaling
      state.vy += GRAVITY * simulationFrameTime
      state.x += (state.vx * simulationFrameTime) / FRAME_TIME
      state.y += (state.vy * simulationFrameTime) / FRAME_TIME

      // Apply friction - proper time-based scaling
      const decay = Math.pow(FRICTION, simulationFrameTime / FRAME_TIME)
      state.vx *= decay
      state.vy *= decay

      // Update collision cooldown
      if (state.collisionCooldown > 0) {
        state.collisionCooldown--
      }

      // Apply minimum velocity to prevent stalling
      const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy)
      if (speed > 0 && speed < MIN_VELOCITY) {
        const scale = MIN_VELOCITY / speed
        state.vx *= scale
        state.vy *= scale
      }

      // Check peg collisions - only one collision per frame to prevent sticking
      if (state.collisionCooldown === 0) {
        for (const peg of this.pegs) {
          const pegId = `${Math.round(peg.x)}-${Math.round(peg.y)}`

          // Skip if this is the same peg we just hit
          if (state.lastCollidedPeg === pegId) continue

          if (this.checkCollision(state, peg)) {
            this.handleCollision(state, peg, random)
            state.lastCollidedPeg = pegId
            state.collisionCooldown = 3 // Prevent multiple hits for 3 frames
            bounceCount++
            break // Only one collision per frame
          }
        }
      }

      // Reset last collided peg if cooldown is over
      if (state.collisionCooldown === 0) {
        state.lastCollidedPeg = undefined
      }

      // Keep within bounds - track wall bounces separately
      if (state.x < this.layout.boardMargin + this.layout.ballRadius) {
        state.x = this.layout.boardMargin + this.layout.ballRadius
        state.vx = Math.abs(state.vx) * 0.5
        wallHit = true
      }
      if (state.x > this.layout.canvasWidth - this.layout.boardMargin - this.layout.ballRadius) {
        state.x = this.layout.canvasWidth - this.layout.boardMargin - this.layout.ballRadius
        state.vx = -Math.abs(state.vx) * 0.5
        wallHit = true
      }

      // Add keyframe at regular intervals
      if (state.time - lastKeyframeTime >= keyframeInterval) {
        keyframes.push({
          time: state.time,
          x: state.x,
          y: state.y,
          vx: state.vx,
          vy: state.vy,
        })
        lastKeyframeTime = state.time
      }

      // Check if ball has reached bucket
      if (state.y >= this.layout.bucketY - this.layout.ballRadius - 10) {
        const bucketIndex = Math.floor(
          (state.x - this.layout.boardMargin) / this.layout.bucketWidth
        )
        const finalBucket = Math.max(0, Math.min(this.layout.bucketCount - 1, bucketIndex))

        // Add final keyframe with ball settled in bucket
        keyframes.push({
          time: state.time,
          x: state.x,
          y: this.layout.bucketY - this.layout.ballRadius,
          vx: 0,
          vy: 0,
        })

        // Check if we hit the target bucket (with some tolerance)
        const bucketTolerance = 0
        if (Math.abs(finalBucket - targetBucket) <= bucketTolerance) {
          // Success! Create animation
          const animation: BallAnimation = {
            id: `anim_${this.config.rowCount}_${targetBucket}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            targetBucket,
            duration: state.time,
            keyframes,
            quality: 'pending',
            metadata: {
              created: Date.now(),
              rowCount: this.config.rowCount,
              description: `Auto-generated animation for bucket ${targetBucket}`,
            },
          }

          return {
            success: true,
            animation,
            stats: {
              bounces: bounceCount,
              duration: state.time,
              finalBucket,
              keyframeCount: keyframes.length,
              wallHit, // Separate wall hit tracking
            },
          }
        } else {
          return {
            success: false,
            reason: `Ball landed in bucket ${finalBucket}, not target ${targetBucket}`,
            stats: {
              bounces: bounceCount,
              duration: state.time,
              finalBucket,
              keyframeCount: keyframes.length,
              wallHit,
            },
          }
        }
      }

      state.time += simulationFrameTime
    }

    return {
      success: false,
      reason: 'Simulation timeout',
      stats: {
        bounces: bounceCount,
        duration: state.time,
        finalBucket: -1,
        keyframeCount: keyframes.length,
        wallHit,
      },
    }
  }

  private checkCollision(
    state: PhysicsState,
    peg: { x: number; y: number; radius: number }
  ): boolean {
    const dx = state.x - peg.x
    const dy = state.y - peg.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    // Use <= for more precise collision detection
    return distance <= this.layout.ballRadius + peg.radius
  }

  private handleCollision(
    state: PhysicsState,
    peg: { x: number; y: number; radius: number },
    random: () => number
  ): void {
    const dx = state.x - peg.x
    const dy = state.y - peg.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDistance = this.layout.ballRadius + peg.radius

    if (distance <= minDistance) {
      // Prevent division by zero
      if (distance < 0.001) {
        // Push ball away in a random direction if exactly on top
        const angle = random() * Math.PI * 2
        state.x = peg.x + Math.cos(angle) * (minDistance + 1)
        state.y = peg.y + Math.sin(angle) * (minDistance + 1)
        return
      }

      // Normalize collision vector
      const nx = dx / distance
      const ny = dy / distance

      // Separate ball from peg with extra buffer to prevent sticking
      const overlap = minDistance - distance + 2 // Extra buffer
      state.x += nx * overlap
      state.y += ny * overlap

      // Calculate reflection vector using proper physics
      const dotProduct = state.vx * nx + state.vy * ny

      // Only reflect if moving towards the peg
      if (dotProduct < 0) {
        state.vx = (state.vx - 2 * dotProduct * nx) * BOUNCE_DAMPING
        state.vy = (state.vy - 2 * dotProduct * ny) * BOUNCE_DAMPING

        // Add controlled randomness - less aggressive
        state.vx += (random() - 0.5) * 0.05
        state.vy += (random() - 0.5) * 0.025

        // Ensure ball doesn't get stuck by giving minimum velocity away from peg
        const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy)
        if (speed < MIN_VELOCITY) {
          // Push ball away from peg with minimum velocity
          state.vx = nx * MIN_VELOCITY + (random() - 0.5) * MIN_VELOCITY * 0.5
          state.vy = ny * MIN_VELOCITY + (random() - 0.5) * MIN_VELOCITY * 0.5
        }
      }
    }
  }

  private seededRandom(seed: number): () => number {
    let x = Math.sin(seed) * 10000
    return () => {
      x = Math.sin(x) * 10000
      return x - Math.floor(x)
    }
  }
}
