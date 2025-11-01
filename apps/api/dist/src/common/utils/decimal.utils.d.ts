import { Decimal } from '@prisma/client/runtime/library';
export declare function toDecimalString(value: any): string;
export declare function decimalToBigInt(value: Decimal | string | number): bigint;
export declare function calculateOrderIndex(slot: bigint | number, instructionIndex: number, innerInstructionIndex: number): string;
export declare function lamportsToSol(lamports: bigint | string | number): number;
export declare function solToLamports(sol: number): bigint;
export declare function calculateDeltaAmount(resultK: bigint | string | Decimal, multiplier: bigint | string | Decimal): bigint;
export declare function formatAmount(amount: bigint | string | Decimal | number, decimals?: number): string;
