/**
 * Base event interface with common fields
 */
export interface BaseEvent {
  slot: bigint;
  instructionIndex: number;
  innerInstructionIndex: number;
  signature: string;
  blockTime: Date;
}

/**
 * Pool Registered Event
 */
export interface PoolRegisteredEvent extends BaseEvent {
  poolAddress: string;
  managerAddress: string;
  feePlayMultiplier: bigint;
  feeLossMultiplier: bigint;
  feeMintMultiplier: bigint;
  feeHostPercent: bigint;
  feePoolPercent: bigint;
  minLimitForTicket: bigint;
  probability: bigint;
}

/**
 * QK With Config Registered Event (Synthetic)
 */
export interface QkWithConfigRegisteredEvent extends BaseEvent {
  qkWithConfigHash: string;
  q: bigint[];
  k: bigint[];
  feeLossMultiplier: bigint;
  feeMintMultiplier: bigint;
  effectiveEv: bigint;
}

/**
 * Trial Registered Event
 */
export interface TrialRegisteredEvent extends BaseEvent {
  trialId: string;
  who: string;
  poolAddress: string;
  multiplier: bigint;
  qkWithConfigHash: string;
  vrfCostInFare: bigint;
  extraDataHash: string;
}

/**
 * Trial Resolved Event
 */
export interface TrialResolvedEvent extends BaseEvent {
  trialId: string;
  resultIndex: number;
  randomness: bigint;
}

/**
 * Fee Charged Event
 */
export interface FeeChargedEvent extends BaseEvent {
  feeType: 'FeePlay' | 'FeeLoss' | 'FeeMint';
  poolAddress: string;
  trialId: string;
  feeAmount: bigint;
}

/**
 * Pool Manager Updated Event
 */
export interface PoolManagerUpdatedEvent extends BaseEvent {
  poolAddress: string;
  newPoolManagerAddress: string;
}

/**
 * Pool Accumulated Amount Updated Event
 */
export interface PoolAccumulatedAmountUpdatedEvent extends BaseEvent {
  poolAddress: string;
  trialId: string;
  newAccumulatedAmount: bigint;
}

/**
 * Pool Accumulated Amount Released Event
 */
export interface PoolAccumulatedAmountReleasedEvent extends BaseEvent {
  poolAddress: string;
  trialId: string;
  receiver: string;
  releasedAmount: bigint;
}

/**
 * Union type of all events
 */
export type FareProtocolEvent =
  | PoolRegisteredEvent
  | QkWithConfigRegisteredEvent
  | TrialRegisteredEvent
  | TrialResolvedEvent
  | FeeChargedEvent
  | PoolManagerUpdatedEvent
  | PoolAccumulatedAmountUpdatedEvent
  | PoolAccumulatedAmountReleasedEvent;

/**
 * Event with type discriminator
 */
export interface TypedEvent<T extends FareProtocolEvent = FareProtocolEvent> {
  eventType: string;
  event: T;
}

