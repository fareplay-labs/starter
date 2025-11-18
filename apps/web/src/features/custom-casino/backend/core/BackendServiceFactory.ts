// @ts-nocheck
/**
 * Backend Service Factory
 * Returns the real backend service
 */

import { BackendService } from './BackendService'

export type BackendServiceType = typeof BackendService

/**
 * Factory function to get the backend service
 * Now always returns the real backend service
 */
export function getBackendService(): BackendServiceType {
  return BackendService
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
