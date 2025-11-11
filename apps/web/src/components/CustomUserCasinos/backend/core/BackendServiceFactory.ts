// @ts-nocheck
/**
 * Backend Service Factory
 * Returns the real backend service
 */

import { RealBackendService } from './RealBackendService'

export type BackendServiceType = typeof RealBackendService

/**
 * Factory function to get the backend service
 * Now always returns the real backend service
 */
export function getBackendService(): BackendServiceType {
  return RealBackendService
}

/**
 * Check if we're using the real backend (always true now)
 */
export function isUsingRealBackend(): boolean {
  return true
}

/**
 * Check if we're using the mock backend (always false now)
 */
export function isUsingMockBackend(): boolean {
  return false
}

/**
 * Get backend type name for logging/debugging
 */
export function getBackendTypeName(): string {
  return 'Real Backend (API)'
}