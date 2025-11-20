// @ts-nocheck
/**
 * Physics system for crash rocket physics simulation
 * Extracted from CrashScene.tsx for better separation of concerns
 */

export interface PhysicsConfig {
  baseVelocity: number
  velocityVariation: number
  gravity: number
  maxDuration: number
  canvasWidth: number
  canvasHeight: number
  screenMargin: number
}

export interface PhysicsVector {
  x: number
  y: number
}

export interface PhysicsState {
  active: boolean
  position: PhysicsVector
  velocity: PhysicsVector
  rotation: number
  angularVelocity: number
}

export interface PhysicsCallbacks {
  onPhysicsStateChange: (state: PhysicsState | null) => void
  onPhysicsComplete: () => void
}

const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  baseVelocity: 3,
  velocityVariation: 0,
  gravity: 0.15,
  maxDuration: 5000,
  canvasWidth: 800,
  canvasHeight: 600,
  screenMargin: 100,
}

/**
 * Generate normalized launch direction for physics simulation
 */
export const generateLaunchDirection = (): PhysicsVector => {
  // Create a normalized launch direction that's not dependent on curve slope
  // Use a balanced direction: mostly horizontal with slight upward bias
  const normalizedLaunchDirection = {
    x: 0.7 + Math.random() * 0.3, // 70-100% rightward
    y: -0.3 - Math.random() * 0.2, // 30-50% upward
  }

  // Normalize the direction vector
  const directionLength = Math.sqrt(
    normalizedLaunchDirection.x * normalizedLaunchDirection.x +
      normalizedLaunchDirection.y * normalizedLaunchDirection.y
  )

  return {
    x: normalizedLaunchDirection.x / directionLength,
    y: normalizedLaunchDirection.y / directionLength,
  }
}

/**
 * Calculate launch velocity based on direction and speed
 */
export const calculateLaunchVelocity = (
  direction: PhysicsVector,
  config: Partial<PhysicsConfig> = {}
): PhysicsVector => {
  const finalConfig = { ...DEFAULT_PHYSICS_CONFIG, ...config }
  const totalSpeed = finalConfig.baseVelocity + Math.random() * finalConfig.velocityVariation

  return {
    x: direction.x * totalSpeed,
    y: direction.y * totalSpeed,
  }
}

/**
 * Check if physics object is off screen
 */
export const isOffScreen = (
  position: PhysicsVector,
  config: Partial<PhysicsConfig> = {}
): boolean => {
  const finalConfig = { ...DEFAULT_PHYSICS_CONFIG, ...config }

  return (
    position.x < -finalConfig.screenMargin ||
    position.x > finalConfig.canvasWidth + finalConfig.screenMargin ||
    position.y < -finalConfig.screenMargin ||
    position.y > finalConfig.canvasHeight + finalConfig.screenMargin
  )
}

/**
 * Update physics state for one frame
 */
export const updatePhysicsState = (
  prevState: PhysicsState,
  config: Partial<PhysicsConfig> = {}
): PhysicsState | null => {
  if (!prevState || !prevState.active) return null

  const finalConfig = { ...DEFAULT_PHYSICS_CONFIG, ...config }

  // Update velocity (gravity)
  const newVelocity = {
    x: prevState.velocity.x,
    y: prevState.velocity.y + finalConfig.gravity, // Apply gravity per frame
  }

  // Update position
  const newPosition = {
    x: prevState.position.x + newVelocity.x,
    y: prevState.position.y + newVelocity.y,
  }

  // Update rotation
  const newRotation = prevState.rotation + prevState.angularVelocity

  // Check if off screen
  if (isOffScreen(newPosition, finalConfig)) {
    return null // Remove when off screen
  }

  return {
    ...prevState,
    position: newPosition,
    velocity: newVelocity,
    rotation: newRotation,
  }
}

/**
 * Initialize physics simulation
 */
export const initializePhysics = (
  startPosition: PhysicsVector,
  startDirection: PhysicsVector,
  callbacks: PhysicsCallbacks,
  config: Partial<PhysicsConfig> = {}
): (() => void) => {
  const finalConfig = { ...DEFAULT_PHYSICS_CONFIG, ...config }

  // Generate launch parameters
  const launchDirection = generateLaunchDirection()
  const launchVelocity = calculateLaunchVelocity(launchDirection, finalConfig)

  // Create initial physics state
  let currentState: PhysicsState = {
    active: true,
    position: { ...startPosition },
    velocity: launchVelocity,
    rotation: Math.atan2(startDirection.y, startDirection.x),
    angularVelocity: (Math.random() - 0.5) * 0.5, // Random spin
  }

  callbacks.onPhysicsStateChange(currentState)

  // Start physics simulation
  const startTime = Date.now()
  let animationFrameId: number

  const physicsStep = () => {
    const elapsed = Date.now() - startTime
    if (elapsed > finalConfig.maxDuration) {
      callbacks.onPhysicsStateChange(null)
      callbacks.onPhysicsComplete()
      return
    }

    // Update the current state
    const newState = updatePhysicsState(currentState, finalConfig)
    if (newState === null) {
      callbacks.onPhysicsStateChange(null)
      callbacks.onPhysicsComplete()
      return
    }

    currentState = newState
    callbacks.onPhysicsStateChange(currentState)
    animationFrameId = requestAnimationFrame(physicsStep)
  }

  animationFrameId = requestAnimationFrame(physicsStep)

  // Return cleanup function
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    callbacks.onPhysicsStateChange(null)
  }
}

/**
 * Physics simulation manager class for easier state management
 */
export class PhysicsSimulation {
  private cleanup: (() => void) | null = null
  private initialized = false

  constructor(
    private callbacks: PhysicsCallbacks,
    private config: Partial<PhysicsConfig> = {}
  ) {}

  /**
   * Start physics simulation
   */
  start(startPosition: PhysicsVector, startDirection: PhysicsVector): void {
    if (this.initialized) return

    this.initialized = true
    this.cleanup = initializePhysics(startPosition, startDirection, this.callbacks, this.config)
  }

  /**
   * Stop physics simulation
   */
  stop(): void {
    if (this.cleanup) {
      this.cleanup()
      this.cleanup = null
    }
    this.initialized = false
  }

  /**
   * Reset physics simulation
   */
  reset(): void {
    this.stop()
    this.initialized = false
  }

  /**
   * Check if physics is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }
}
