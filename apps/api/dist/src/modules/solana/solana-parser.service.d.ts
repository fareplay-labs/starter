import { TypedEvent } from './interfaces/events.interface';
export declare class SolanaParserService {
    private readonly logger;
    parseTransactionLogs(logs: string[], signature: string, slot: number, blockTime: number | null, instructionIndex: number): TypedEvent[];
    private parseEvent;
    private parsePoolRegistered;
    private parseTrialRegisteredWithSynthetic;
    private parseTrialResolved;
    private parseFeeCharged;
    private calculateQkWithConfigHash;
    private readU64;
    private readU128;
    private writeU128;
}
