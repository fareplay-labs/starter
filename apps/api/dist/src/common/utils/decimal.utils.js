"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDecimalString = toDecimalString;
exports.decimalToBigInt = decimalToBigInt;
exports.calculateOrderIndex = calculateOrderIndex;
exports.lamportsToSol = lamportsToSol;
exports.solToLamports = solToLamports;
exports.calculateDeltaAmount = calculateDeltaAmount;
exports.formatAmount = formatAmount;
const library_1 = require("@prisma/client/runtime/library");
function toDecimalString(value) {
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
    if (value instanceof library_1.Decimal) {
        return value.toString();
    }
    return '0';
}
function decimalToBigInt(value) {
    if (value === null || value === undefined) {
        return BigInt(0);
    }
    return BigInt(value.toString());
}
function calculateOrderIndex(slot, instructionIndex, innerInstructionIndex) {
    const slotBigInt = typeof slot === 'bigint' ? slot : BigInt(slot);
    const orderIndex = slotBigInt * BigInt(1_000_000_000_000) +
        BigInt(instructionIndex) * BigInt(1_000_000) +
        BigInt(innerInstructionIndex);
    return orderIndex.toString();
}
function lamportsToSol(lamports) {
    const lamportsBigInt = BigInt(lamports.toString());
    return Number(lamportsBigInt) / 1_000_000_000;
}
function solToLamports(sol) {
    return BigInt(Math.floor(sol * 1_000_000_000));
}
function calculateDeltaAmount(resultK, multiplier) {
    const resultKBigInt = BigInt(resultK.toString());
    const multiplierBigInt = BigInt(multiplier.toString());
    const unitBigInt = BigInt(10) ** BigInt(18);
    const deltaAmountBigInt = ((resultKBigInt - unitBigInt) * multiplierBigInt) / unitBigInt;
    return deltaAmountBigInt;
}
function formatAmount(amount, decimals = 6) {
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
//# sourceMappingURL=decimal.utils.js.map