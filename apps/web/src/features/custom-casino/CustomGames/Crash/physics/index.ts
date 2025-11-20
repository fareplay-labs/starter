// @ts-nocheck
/**
 * Physics system exports
 * Clean interface for crash game physics simulation
 */

export {
  PhysicsSimulation,
  generateLaunchDirection,
  calculateLaunchVelocity,
  isOffScreen,
  updatePhysicsState,
  initializePhysics,
  type PhysicsConfig,
  type PhysicsVector,
  type PhysicsState,
  type PhysicsCallbacks,
} from './PhysicsSystem'
