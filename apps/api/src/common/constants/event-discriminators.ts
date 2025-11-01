/**
 * Event discriminators for Solana Fare Protocol events
 * These byte patterns are used to identify different events in transaction logs
 */
export const EVENT_DISCRIMINATORS: Record<string, number[]> = {
  PoolRegistered: [158, 198, 227, 29, 159, 207, 191, 7],
  TrialRegistered: [190, 9, 29, 95, 222, 227, 134, 45],
  TrialResolved: [110, 112, 75, 200, 133, 202, 132, 179],
  FeeCharged: [225, 177, 123, 247, 161, 219, 93, 214],
  QkWithConfigRegistered: [142, 91, 203, 157, 89, 165, 220, 34],
  PoolManagerUpdated: [180, 142, 86, 242, 157, 132, 76, 89],
  PoolAccumulatedAmountUpdated: [221, 158, 94, 173, 212, 105, 83, 192],
  PoolAccumulatedAmountReleased: [197, 86, 142, 207, 181, 124, 93, 158],
};

/**
 * Compare two byte arrays for equality
 */
export function bytesEqual(a: number[] | Uint8Array, b: number[] | Uint8Array): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}

/**
 * Identify event type from discriminator bytes
 */
export function identifyEventType(discriminator: number[] | Uint8Array): string | null {
  for (const [eventType, discriminatorBytes] of Object.entries(EVENT_DISCRIMINATORS)) {
    if (bytesEqual(discriminator, discriminatorBytes)) {
      return eventType;
    }
  }
  
  return null;
}

