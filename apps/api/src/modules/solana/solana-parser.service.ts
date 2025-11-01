import { Injectable, Logger } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { deserialize } from 'borsh';
import { keccak256 } from 'js-sha3';
import { EVENT_DISCRIMINATORS, identifyEventType } from '@/common/constants/event-discriminators';
import {
  BaseEvent,
  PoolRegisteredEvent,
  QkWithConfigRegisteredEvent,
  TrialRegisteredEvent,
  TrialResolvedEvent,
  FeeChargedEvent,
  TypedEvent,
} from './interfaces/events.interface';

@Injectable()
export class SolanaParserService {
  private readonly logger = new Logger(SolanaParserService.name);

  /**
   * Parse transaction logs to extract Fare Protocol events
   */
  parseTransactionLogs(
    logs: string[],
    signature: string,
    slot: number,
    blockTime: number | null,
    instructionIndex: number,
  ): TypedEvent[] {
    const events: TypedEvent[] = [];
    const blockTimeDate = blockTime ? new Date(blockTime * 1000) : new Date();

    try {
      for (const log of logs) {
        // Look for "Program data:" lines which contain base64 encoded event data
        if (log.startsWith('Program data:')) {
          const base64Data = log.replace('Program data:', '').trim();
          const eventData = Buffer.from(base64Data, 'base64');

          // First 8 bytes are the discriminator
          const discriminator = Array.from(eventData.slice(0, 8));
          const eventType = identifyEventType(discriminator);

          if (!eventType) {
            continue; // Unknown event, skip
          }

          const eventPayload = eventData.slice(8);

          try {
            const parsedEvent = this.parseEvent(
              eventType,
              eventPayload,
              signature,
              BigInt(slot),
              blockTimeDate,
              instructionIndex,
            );

            if (parsedEvent) {
              events.push(...parsedEvent);
            }
          } catch (error) {
            this.logger.warn(`Failed to parse ${eventType} event: ${error.message}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error parsing transaction logs: ${error.message}`);
    }

    return events;
  }

  /**
   * Parse specific event based on type
   */
  private parseEvent(
    eventType: string,
    payload: Buffer,
    signature: string,
    slot: bigint,
    blockTime: Date,
    instructionIndex: number,
  ): TypedEvent[] | null {
    const baseEvent: BaseEvent = {
      slot,
      signature,
      blockTime,
      instructionIndex,
      innerInstructionIndex: 0,
    };

    switch (eventType) {
      case 'PoolRegistered':
        return [this.parsePoolRegistered(payload, baseEvent)];
      
      case 'TrialRegistered':
        // For TrialRegistered, we create synthetic QkWithConfigRegistered event
        return this.parseTrialRegisteredWithSynthetic(payload, baseEvent);
      
      case 'TrialResolved':
        return [this.parseTrialResolved(payload, baseEvent)];
      
      case 'FeeCharged':
        return [this.parseFeeCharged(payload, baseEvent)];
      
      default:
        this.logger.warn(`Unhandled event type: ${eventType}`);
        return null;
    }
  }

  /**
   * Parse PoolRegistered event
   */
  private parsePoolRegistered(payload: Buffer, baseEvent: BaseEvent): TypedEvent<PoolRegisteredEvent> {
    // Parse the event data
    // Format: poolAddress(32) + managerAddress(32) + feePlayMultiplier(8) + 
    // feeLossMultiplier(8) + feeMintMultiplier(8) + feeHostPercent(8) + 
    // feePoolPercent(8) + minLimitForTicket(8) + probability(8)
    
    let offset = 0;
    
    const poolAddress = new PublicKey(payload.slice(offset, offset + 32)).toBase58();
    offset += 32;
    
    const managerAddress = new PublicKey(payload.slice(offset, offset + 32)).toBase58();
    offset += 32;
    
    const feePlayMultiplier = this.readU64(payload, offset);
    offset += 8;
    
    const feeLossMultiplier = this.readU64(payload, offset);
    offset += 8;
    
    const feeMintMultiplier = this.readU64(payload, offset);
    offset += 8;
    
    const feeHostPercent = this.readU64(payload, offset);
    offset += 8;
    
    const feePoolPercent = this.readU64(payload, offset);
    offset += 8;
    
    const minLimitForTicket = this.readU64(payload, offset);
    offset += 8;
    
    const probability = this.readU64(payload, offset);

    return {
      eventType: 'PoolRegistered',
      event: {
        ...baseEvent,
        poolAddress,
        managerAddress,
        feePlayMultiplier,
        feeLossMultiplier,
        feeMintMultiplier,
        feeHostPercent,
        feePoolPercent,
        minLimitForTicket,
        probability,
      },
    };
  }

  /**
   * Parse TrialRegistered event and create synthetic QkWithConfigRegistered event
   */
  private parseTrialRegisteredWithSynthetic(
    payload: Buffer,
    baseEvent: BaseEvent,
  ): TypedEvent[] {
    let offset = 0;

    // Parse trial ID (32 bytes)
    const trialId = new PublicKey(payload.slice(offset, offset + 32)).toBase58();
    offset += 32;

    // Parse who (32 bytes)
    const who = new PublicKey(payload.slice(offset, offset + 32)).toBase58();
    offset += 32;

    // Parse pool address (32 bytes)
    const poolAddress = new PublicKey(payload.slice(offset, offset + 32)).toBase58();
    offset += 32;

    // Parse multiplier (8 bytes, u64)
    const multiplier = this.readU64(payload, offset);
    offset += 8;

    // Parse vrfCostInFare (8 bytes, u64)
    const vrfCostInFare = this.readU64(payload, offset);
    offset += 8;

    // Parse extraDataHash (32 bytes)
    const extraDataHash = Buffer.from(payload.slice(offset, offset + 32)).toString('hex');
    offset += 32;

    // Parse Q array (u32 length + array of u128)
    const qLength = payload.readUInt32LE(offset);
    offset += 4;
    const q: bigint[] = [];
    for (let i = 0; i < qLength; i++) {
      q.push(this.readU128(payload, offset));
      offset += 16;
    }

    // Parse K array (u32 length + array of u128)
    const kLength = payload.readUInt32LE(offset);
    offset += 4;
    const k: bigint[] = [];
    for (let i = 0; i < kLength; i++) {
      k.push(this.readU128(payload, offset));
      offset += 16;
    }

    // Parse feeLossMultiplier (8 bytes, u64)
    const feeLossMultiplier = this.readU64(payload, offset);
    offset += 8;

    // Parse feeMintMultiplier (8 bytes, u64)
    const feeMintMultiplier = this.readU64(payload, offset);
    offset += 8;

    // Parse effectiveEv (8 bytes, u64)
    const effectiveEv = this.readU64(payload, offset);

    // Calculate qkWithConfigHash
    const qkWithConfigHash = this.calculateQkWithConfigHash(q, k, extraDataHash);

    // Create synthetic QkWithConfigRegistered event (innerInstructionIndex: 0)
    const qkEvent: TypedEvent<QkWithConfigRegisteredEvent> = {
      eventType: 'QkWithConfigRegistered',
      event: {
        ...baseEvent,
        innerInstructionIndex: 0,
        qkWithConfigHash,
        q,
        k,
        feeLossMultiplier,
        feeMintMultiplier,
        effectiveEv,
      },
    };

    // Create TrialRegistered event (innerInstructionIndex: 1)
    const trialEvent: TypedEvent<TrialRegisteredEvent> = {
      eventType: 'TrialRegistered',
      event: {
        ...baseEvent,
        innerInstructionIndex: 1,
        trialId,
        who,
        poolAddress,
        multiplier,
        qkWithConfigHash,
        vrfCostInFare,
        extraDataHash,
      },
    };

    return [qkEvent, trialEvent];
  }

  /**
   * Parse TrialResolved event
   */
  private parseTrialResolved(payload: Buffer, baseEvent: BaseEvent): TypedEvent<TrialResolvedEvent> {
    let offset = 0;

    const trialId = new PublicKey(payload.slice(offset, offset + 32)).toBase58();
    offset += 32;

    const resultIndex = payload.readUInt32LE(offset);
    offset += 4;

    const randomness = this.readU128(payload, offset);

    return {
      eventType: 'TrialResolved',
      event: {
        ...baseEvent,
        trialId,
        resultIndex,
        randomness,
      },
    };
  }

  /**
   * Parse FeeCharged event
   */
  private parseFeeCharged(payload: Buffer, baseEvent: BaseEvent): TypedEvent<FeeChargedEvent> {
    let offset = 0;

    // Fee type (1 byte enum: 0 = FeePlay, 1 = FeeLoss, 2 = FeeMint)
    const feeTypeNum = payload.readUInt8(offset);
    offset += 1;

    const feeTypeMap = ['FeePlay', 'FeeLoss', 'FeeMint'];
    const feeType = feeTypeMap[feeTypeNum] as 'FeePlay' | 'FeeLoss' | 'FeeMint';

    const poolAddress = new PublicKey(payload.slice(offset, offset + 32)).toBase58();
    offset += 32;

    const trialId = new PublicKey(payload.slice(offset, offset + 32)).toBase58();
    offset += 32;

    const feeAmount = this.readU64(payload, offset);

    return {
      eventType: 'FeeCharged',
      event: {
        ...baseEvent,
        innerInstructionIndex: 2, // Fee events are typically last
        feeType,
        poolAddress,
        trialId,
        feeAmount,
      },
    };
  }

  /**
   * Calculate QK with config hash
   * keccak256(q || k || extraDataHash)
   */
  private calculateQkWithConfigHash(q: bigint[], k: bigint[], extraDataHash: string): string {
    const buffer: Buffer[] = [];

    // Serialize Q array
    for (const qValue of q) {
      const qBuf = Buffer.alloc(16);
      this.writeU128(qBuf, qValue, 0);
      buffer.push(qBuf);
    }

    // Serialize K array
    for (const kValue of k) {
      const kBuf = Buffer.alloc(16);
      this.writeU128(kBuf, kValue, 0);
      buffer.push(kBuf);
    }

    // Add extraDataHash
    buffer.push(Buffer.from(extraDataHash, 'hex'));

    const combined = Buffer.concat(buffer);
    const hash = keccak256(combined);

    return hash;
  }

  /**
   * Read u64 (little-endian)
   */
  private readU64(buffer: Buffer, offset: number): bigint {
    const low = buffer.readUInt32LE(offset);
    const high = buffer.readUInt32LE(offset + 4);
    return (BigInt(high) << BigInt(32)) | BigInt(low);
  }

  /**
   * Read u128 (little-endian)
   */
  private readU128(buffer: Buffer, offset: number): bigint {
    const low = this.readU64(buffer, offset);
    const high = this.readU64(buffer, offset + 8);
    return (high << BigInt(64)) | low;
  }

  /**
   * Write u128 (little-endian)
   */
  private writeU128(buffer: Buffer, value: bigint, offset: number): void {
    const low = value & BigInt('0xFFFFFFFFFFFFFFFF');
    const high = value >> BigInt(64);

    buffer.writeUInt32LE(Number(low & BigInt(0xFFFFFFFF)), offset);
    buffer.writeUInt32LE(Number((low >> BigInt(32)) & BigInt(0xFFFFFFFF)), offset + 4);
    buffer.writeUInt32LE(Number(high & BigInt(0xFFFFFFFF)), offset + 8);
    buffer.writeUInt32LE(Number((high >> BigInt(32)) & BigInt(0xFFFFFFFF)), offset + 12);
  }
}

