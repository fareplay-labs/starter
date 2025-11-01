export declare const EVENT_DISCRIMINATORS: Record<string, number[]>;
export declare function bytesEqual(a: number[] | Uint8Array, b: number[] | Uint8Array): boolean;
export declare function identifyEventType(discriminator: number[] | Uint8Array): string | null;
