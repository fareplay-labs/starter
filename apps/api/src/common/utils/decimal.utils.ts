import { Decimal } from '@prisma/client/runtime/library';

/**
 * Convert any value to a Decimal string for Prisma
 * Handles BigInt, string, number, and Decimal types
 */
export function toDecimalString(value: any): string {
  if (value === null || value === undefined) {
    return '0';
  }
  
  if (typeof value === 'bigint') {
    return value.toString();
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (value instanceof Decimal) {
    return value.toString();
  }
  
  return '0';
}

/**
 * Convert Decimal/string/number to BigInt
 */
export function decimalToBigInt(value: Decimal | string | number): bigint {
  if (value === null || value === undefined) {
    return BigInt(0);
  }
  
  return BigInt(value.toString());
}

/**
 * Calculate order index for event ordering
 * orderIndex = slot * 1e12 + instructionIndex * 1e6 + innerInstructionIndex
 */
export function calculateOrderIndex(
  slot: bigint | number,
  instructionIndex: number,
  innerInstructionIndex: number,
): string {
  const slotBigInt = typeof slot === 'bigint' ? slot : BigInt(slot);
  const orderIndex =
    slotBigInt * BigInt(1_000_000_000_000) +
    BigInt(instructionIndex) * BigInt(1_000_000) +
    BigInt(innerInstructionIndex);
  
  return orderIndex.toString();
}

/**
 * Convert lamports (Solana's base unit) to SOL
 */
export function lamportsToSol(lamports: bigint | string | number): number {
  const lamportsBigInt = BigInt(lamports.toString());
  return Number(lamportsBigInt) / 1_000_000_000;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): bigint {
  return BigInt(Math.floor(sol * 1_000_000_000));
}

/**
 * Calculate delta amount for trial resolution
 * deltaAmount = (resultK - 1e18) * multiplier / 1e18
 */
export function calculateDeltaAmount(
  resultK: bigint | string | Decimal,
  multiplier: bigint | string | Decimal,
): bigint {
  const resultKBigInt = BigInt(resultK.toString());
  const multiplierBigInt = BigInt(multiplier.toString());
  const unitBigInt = BigInt(10) ** BigInt(18);
  
  const deltaAmountBigInt =
    ((resultKBigInt - unitBigInt) * multiplierBigInt) / unitBigInt;
  
  return deltaAmountBigInt;
}

/**
 * Format Decimal/BigInt for display
 */
export function formatAmount(
  amount: bigint | string | Decimal | number,
  decimals: number = 6,
): string {
  const amountBigInt = BigInt(amount.toString());
  const divisor = BigInt(10) ** BigInt(decimals);
  const wholePart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;
  
  const fractionalStr = fractionalPart
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '');
  
  if (fractionalStr === '') {
    return wholePart.toString();
  }
  
  return `${wholePart}.${fractionalStr}`;
}

