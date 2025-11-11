// @ts-nocheck
// utils/formatters.ts

/**
 * Formats a number to a more readable format with K/M/B suffixes
 * @param num - The number to format
 * @returns A formatted string representation of the number
 */
export const formatNumber = (num: number): string => {
    if (!num && num !== 0) return '0';

    if (num >= 1000000000) {
        return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
};

/**
 * Formats a currency value with currency symbol and K/M/B suffixes
 * @param value - The currency value to format
 * @param currency - The currency symbol (default: $)
 * @returns A formatted string representation of the currency value
 */
export const formatCurrency = (value: number, currency: string = '$'): string => {
    return `${currency}${formatNumber(value)}`;
};