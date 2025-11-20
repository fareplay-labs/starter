// @ts-nocheck
import { type BallAnimation } from './types'

/**
 * Plays back pre-generated animations with smooth interpolation
 */
export class AnimationPlayer {
  private animation: BallAnimation | null = null
  private startTime = 0
  private isPlaying = false
  private currentTime = 0
  private onUpdate?: (position: { x: number; y: number }) => void
  private onComplete?: () => void
  private animationFrameId?: number

  /**
   * Start playing an animation
   */
  public play(
    animation: BallAnimation,
    onUpdate?: (position: { x: number; y: number }) => void,
    onComplete?: () => void
  ): void {
    this.animation = animation
    this.onUpdate = onUpdate
    this.onComplete = onComplete
    this.startTime = performance.now()
    this.currentTime = 0
    this.isPlaying = true

    this.tick()
  }

  /**
   * Stop the current animation
   */
  public stop(): void {
    this.isPlaying = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = undefined
    }
  }

  /**
   * Check if animation is currently playing
   */
  public getIsPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * Get current animation progress (0-1)
   */
  public getProgress(): number {
    if (!this.animation || !this.isPlaying) return 0
    return Math.min(1, this.currentTime / this.animation.duration)
  }

  /**
   * Get current ball position
   */
  public getCurrentPosition(): { x: number; y: number } | null {
    if (!this.animation || !this.isPlaying) return null
    return this.interpolatePosition(this.currentTime)
  }

  private tick = (): void => {
    if (!this.isPlaying || !this.animation) return

    const now = performance.now()
    this.currentTime = now - this.startTime

    // Check if animation is complete
    if (this.currentTime >= this.animation.duration) {
      this.currentTime = this.animation.duration
      const finalPosition = this.interpolatePosition(this.currentTime)

      if (finalPosition && this.onUpdate) {
        this.onUpdate(finalPosition)
      }

      this.isPlaying = false
      if (this.onComplete) {
        this.onComplete()
      }
      return
    }

    // Update position
    const position = this.interpolatePosition(this.currentTime)
    if (position && this.onUpdate) {
      this.onUpdate(position)
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.tick)
  }

  private interpolatePosition(time: number): { x: number; y: number } | null {
    if (!this.animation || this.animation.keyframes.length === 0) return null

    const keyframes = this.animation.keyframes

    // Handle edge cases
    if (time <= keyframes[0].time) {
      return { x: keyframes[0].x, y: keyframes[0].y }
    }
    if (time >= keyframes[keyframes.length - 1].time) {
      const last = keyframes[keyframes.length - 1]
      return { x: last.x, y: last.y }
    }

    // Find the two keyframes to interpolate between
    for (let i = 0; i < keyframes.length - 1; i++) {
      const current = keyframes[i]
      const next = keyframes[i + 1]

      if (time >= current.time && time <= next.time) {
        // Linear interpolation between keyframes
        const t = (time - current.time) / (next.time - current.time)
        const x = this.lerp(current.x, next.x, t)
        const y = this.lerp(current.y, next.y, t)

        return { x, y }
      }
    }

    // Fallback (shouldn't happen)
    return { x: keyframes[0].x, y: keyframes[0].y }
  }

  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t
  }

  /**
   * Get animation metadata for debugging
   */
  public getDebugInfo(): any {
    if (!this.animation) return null

    return {
      id: this.animation.id,
      targetBucket: this.animation.targetBucket,
      duration: this.animation.duration,
      keyframes: this.animation.keyframes.length,
      currentTime: this.currentTime,
      progress: this.getProgress(),
      isPlaying: this.isPlaying,
      quality: this.animation.quality,
    }
  }
}
