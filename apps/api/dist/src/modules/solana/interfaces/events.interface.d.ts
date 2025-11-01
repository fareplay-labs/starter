export interface BaseEvent {
    slot: bigint;
    instructionIndex: number;
    innerInstructionIndex: number;
    signature: string;
    blockTime: Date;
}
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
export interface QkWithConfigRegisteredEvent extends BaseEvent {
    qkWithConfigHash: string;
    q: bigint[];
    k: bigint[];
    feeLossMultiplier: bigint;
    feeMintMultiplier: bigint;
    effectiveEv: bigint;
}
export interface TrialRegisteredEvent extends BaseEvent {
    trialId: string;
    who: string;
    poolAddress: string;
    multiplier: bigint;
    qkWithConfigHash: string;
    vrfCostInFare: bigint;
    extraDataHash: string;
}
export interface TrialResolvedEvent extends BaseEvent {
    trialId: string;
    resultIndex: number;
    randomness: bigint;
}
export interface FeeChargedEvent extends BaseEvent {
    feeType: 'FeePlay' | 'FeeLoss' | 'FeeMint';
    poolAddress: string;
    trialId: string;
    feeAmount: bigint;
}
export interface PoolManagerUpdatedEvent extends BaseEvent {
    poolAddress: string;
    newPoolManagerAddress: string;
}
export interface PoolAccumulatedAmountUpdatedEvent extends BaseEvent {
    poolAddress: string;
    trialId: string;
    newAccumulatedAmount: bigint;
}
export interface PoolAccumulatedAmountReleasedEvent extends BaseEvent {
    poolAddress: string;
    trialId: string;
    receiver: string;
    releasedAmount: bigint;
}
export type FareProtocolEvent = PoolRegisteredEvent | QkWithConfigRegisteredEvent | TrialRegisteredEvent | TrialResolvedEvent | FeeChargedEvent | PoolManagerUpdatedEvent | PoolAccumulatedAmountUpdatedEvent | PoolAccumulatedAmountReleasedEvent;
export interface TypedEvent<T extends FareProtocolEvent = FareProtocolEvent> {
    eventType: string;
    event: T;
}
