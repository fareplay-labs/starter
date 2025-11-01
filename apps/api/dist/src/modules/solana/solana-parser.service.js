"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SolanaParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaParserService = void 0;
const common_1 = require("@nestjs/common");
const web3_js_1 = require("@solana/web3.js");
const js_sha3_1 = require("js-sha3");
const event_discriminators_1 = require("../../common/constants/event-discriminators");
let SolanaParserService = SolanaParserService_1 = class SolanaParserService {
    constructor() {
        this.logger = new common_1.Logger(SolanaParserService_1.name);
    }
    parseTransactionLogs(logs, signature, slot, blockTime, instructionIndex) {
        const events = [];
        const blockTimeDate = blockTime ? new Date(blockTime * 1000) : new Date();
        try {
            for (const log of logs) {
                if (log.startsWith('Program data:')) {
                    const base64Data = log.replace('Program data:', '').trim();
                    const eventData = Buffer.from(base64Data, 'base64');
                    const discriminator = Array.from(eventData.slice(0, 8));
                    const eventType = (0, event_discriminators_1.identifyEventType)(discriminator);
                    if (!eventType) {
                        continue;
                    }
                    const eventPayload = eventData.slice(8);
                    try {
                        const parsedEvent = this.parseEvent(eventType, eventPayload, signature, BigInt(slot), blockTimeDate, instructionIndex);
                        if (parsedEvent) {
                            events.push(...parsedEvent);
                        }
                    }
                    catch (error) {
                        this.logger.warn(`Failed to parse ${eventType} event: ${error.message}`);
                    }
                }
            }
        }
        catch (error) {
            this.logger.error(`Error parsing transaction logs: ${error.message}`);
        }
        return events;
    }
    parseEvent(eventType, payload, signature, slot, blockTime, instructionIndex) {
        const baseEvent = {
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
    parsePoolRegistered(payload, baseEvent) {
        let offset = 0;
        const poolAddress = new web3_js_1.PublicKey(payload.slice(offset, offset + 32)).toBase58();
        offset += 32;
        const managerAddress = new web3_js_1.PublicKey(payload.slice(offset, offset + 32)).toBase58();
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
    parseTrialRegisteredWithSynthetic(payload, baseEvent) {
        let offset = 0;
        const trialId = new web3_js_1.PublicKey(payload.slice(offset, offset + 32)).toBase58();
        offset += 32;
        const who = new web3_js_1.PublicKey(payload.slice(offset, offset + 32)).toBase58();
        offset += 32;
        const poolAddress = new web3_js_1.PublicKey(payload.slice(offset, offset + 32)).toBase58();
        offset += 32;
        const multiplier = this.readU64(payload, offset);
        offset += 8;
        const vrfCostInFare = this.readU64(payload, offset);
        offset += 8;
        const extraDataHash = Buffer.from(payload.slice(offset, offset + 32)).toString('hex');
        offset += 32;
        const qLength = payload.readUInt32LE(offset);
        offset += 4;
        const q = [];
        for (let i = 0; i < qLength; i++) {
            q.push(this.readU128(payload, offset));
            offset += 16;
        }
        const kLength = payload.readUInt32LE(offset);
        offset += 4;
        const k = [];
        for (let i = 0; i < kLength; i++) {
            k.push(this.readU128(payload, offset));
            offset += 16;
        }
        const feeLossMultiplier = this.readU64(payload, offset);
        offset += 8;
        const feeMintMultiplier = this.readU64(payload, offset);
        offset += 8;
        const effectiveEv = this.readU64(payload, offset);
        const qkWithConfigHash = this.calculateQkWithConfigHash(q, k, extraDataHash);
        const qkEvent = {
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
        const trialEvent = {
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
    parseTrialResolved(payload, baseEvent) {
        let offset = 0;
        const trialId = new web3_js_1.PublicKey(payload.slice(offset, offset + 32)).toBase58();
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
    parseFeeCharged(payload, baseEvent) {
        let offset = 0;
        const feeTypeNum = payload.readUInt8(offset);
        offset += 1;
        const feeTypeMap = ['FeePlay', 'FeeLoss', 'FeeMint'];
        const feeType = feeTypeMap[feeTypeNum];
        const poolAddress = new web3_js_1.PublicKey(payload.slice(offset, offset + 32)).toBase58();
        offset += 32;
        const trialId = new web3_js_1.PublicKey(payload.slice(offset, offset + 32)).toBase58();
        offset += 32;
        const feeAmount = this.readU64(payload, offset);
        return {
            eventType: 'FeeCharged',
            event: {
                ...baseEvent,
                innerInstructionIndex: 2,
                feeType,
                poolAddress,
                trialId,
                feeAmount,
            },
        };
    }
    calculateQkWithConfigHash(q, k, extraDataHash) {
        const buffer = [];
        for (const qValue of q) {
            const qBuf = Buffer.alloc(16);
            this.writeU128(qBuf, qValue, 0);
            buffer.push(qBuf);
        }
        for (const kValue of k) {
            const kBuf = Buffer.alloc(16);
            this.writeU128(kBuf, kValue, 0);
            buffer.push(kBuf);
        }
        buffer.push(Buffer.from(extraDataHash, 'hex'));
        const combined = Buffer.concat(buffer);
        const hash = (0, js_sha3_1.keccak256)(combined);
        return hash;
    }
    readU64(buffer, offset) {
        const low = buffer.readUInt32LE(offset);
        const high = buffer.readUInt32LE(offset + 4);
        return (BigInt(high) << BigInt(32)) | BigInt(low);
    }
    readU128(buffer, offset) {
        const low = this.readU64(buffer, offset);
        const high = this.readU64(buffer, offset + 8);
        return (high << BigInt(64)) | low;
    }
    writeU128(buffer, value, offset) {
        const low = value & BigInt('0xFFFFFFFFFFFFFFFF');
        const high = value >> BigInt(64);
        buffer.writeUInt32LE(Number(low & BigInt(0xFFFFFFFF)), offset);
        buffer.writeUInt32LE(Number((low >> BigInt(32)) & BigInt(0xFFFFFFFF)), offset + 4);
        buffer.writeUInt32LE(Number(high & BigInt(0xFFFFFFFF)), offset + 8);
        buffer.writeUInt32LE(Number((high >> BigInt(32)) & BigInt(0xFFFFFFFF)), offset + 12);
    }
};
exports.SolanaParserService = SolanaParserService;
exports.SolanaParserService = SolanaParserService = SolanaParserService_1 = __decorate([
    (0, common_1.Injectable)()
], SolanaParserService);
//# sourceMappingURL=solana-parser.service.js.map