// @ts-nocheck
// Type definitions for reel animations

export type SpinDirection = 'forward' | 'backward'

export interface AnimationState {
  velocity: number // pixels per second (not per frame!)
  pixelOffset: number
  hasStarted: boolean
  elapsedFrames: number
  startTime: number
  lastFrameTime: number // Track last frame timestamp for delta calculation
  shouldStop?: boolean // Signal that stopping sequence should begin
  stopTarget?: number // Target pixel offset when stopping
  stopPhase?: string // Track which phase of stopping we're in
  burstDuration?: number // Random duration for burst phase
  burstSpeed?: number // Random max speed for burst
  fakeOutCount?: number // Track number of fake-outs done
  maxFakeOuts?: number // Random max number of fake-outs
  lastFakeOutTime?: number // Track when last fake-out occurred
  direction?: SpinDirection // Track spin direction
}

export interface AnimationProfile {
  name: string
  description: string

  // Initialize animation state when starting
  init: (currentPosition: number, symbolHeight: number, direction?: SpinDirection) => AnimationState

  // Update animation during free spin (returns new pixel offset)
  updateSpin: (
    state: AnimationState,
    symbolCount: number,
    symbolHeight: number,
    deltaTime: number,
    direction?: SpinDirection
  ) => number

  // Update animation during stopping phase (returns new pixel offset)
  updateStop: (
    state: AnimationState,
    currentPixelOffset: number,
    targetPixelOffset: number,
    symbolCount: number,
    symbolHeight: number,
    deltaTime: number,
    direction?: SpinDirection
  ) => { offset: number; velocity: number; isComplete: boolean }
}

// Utility function for normalizing position within wrap boundary
export function normalizePosition(offset: number, wrapBoundary: number): number {
  let normalized = ((offset % wrapBoundary) + wrapBoundary) % wrapBoundary
  if (normalized > 0) {
    normalized -= wrapBoundary
  }
  return normalized
}
