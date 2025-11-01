import { z } from 'zod';
export declare const DiceParamsSchema: z.ZodObject<{
    gameIcon: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    background: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string>;
    diceColor: z.ZodDefault<z.ZodString>;
    diceImage: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    textColor: z.ZodDefault<z.ZodString>;
    diceSize: z.ZodDefault<z.ZodNumber>;
    animationSpeed: z.ZodDefault<z.ZodNumber>;
    winColor: z.ZodDefault<z.ZodString>;
    loseColor: z.ZodDefault<z.ZodString>;
    animationPreset: z.ZodDefault<z.ZodEnum<["simple", "thump", "spin"]>>;
    diceModel: z.ZodDefault<z.ZodEnum<["wireframe", "solid", "neon", "custom"]>>;
}, "strip", z.ZodTypeAny, {
    gameIcon?: string;
    background?: string;
    diceColor?: string;
    diceImage?: string;
    textColor?: string;
    diceSize?: number;
    animationSpeed?: number;
    winColor?: string;
    loseColor?: string;
    animationPreset?: "simple" | "thump" | "spin";
    diceModel?: "custom" | "wireframe" | "solid" | "neon";
}, {
    gameIcon?: string;
    background?: string;
    diceColor?: string;
    diceImage?: string;
    textColor?: string;
    diceSize?: number;
    animationSpeed?: number;
    winColor?: string;
    loseColor?: string;
    animationPreset?: "simple" | "thump" | "spin";
    diceModel?: "custom" | "wireframe" | "solid" | "neon";
}>;
export type DiceParams = z.infer<typeof DiceParamsSchema>;
export declare const BombsParamsSchema: z.ZodObject<{
    gameIcon: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    background: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string>;
    tileColor: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string>;
    selectedTileColor: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string>;
    bombColor: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string>;
    safeColor: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string>;
    tileShape: z.ZodDefault<z.ZodEnum<["square", "round"]>>;
    tileSize: z.ZodDefault<z.ZodNumber>;
    tileSpacing: z.ZodDefault<z.ZodNumber>;
    borderColor: z.ZodDefault<z.ZodString>;
    selectedBorderColor: z.ZodDefault<z.ZodString>;
    winColor: z.ZodDefault<z.ZodString>;
    lossColor: z.ZodDefault<z.ZodString>;
    particleEffects: z.ZodDefault<z.ZodEnum<["none", "less", "more"]>>;
}, "strip", z.ZodTypeAny, {
    gameIcon?: string;
    background?: string;
    winColor?: string;
    tileColor?: string;
    selectedTileColor?: string;
    bombColor?: string;
    safeColor?: string;
    tileShape?: "square" | "round";
    tileSize?: number;
    tileSpacing?: number;
    borderColor?: string;
    selectedBorderColor?: string;
    lossColor?: string;
    particleEffects?: "none" | "less" | "more";
}, {
    gameIcon?: string;
    background?: string;
    winColor?: string;
    tileColor?: string;
    selectedTileColor?: string;
    bombColor?: string;
    safeColor?: string;
    tileShape?: "square" | "round";
    tileSize?: number;
    tileSpacing?: number;
    borderColor?: string;
    selectedBorderColor?: string;
    lossColor?: string;
    particleEffects?: "none" | "less" | "more";
}>;
export type BombsParams = z.infer<typeof BombsParamsSchema>;
export declare const CrashParamsSchema: z.ZodObject<{
    gameIcon: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    background: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string>;
    lineColor: z.ZodDefault<z.ZodString>;
    gridColor: z.ZodDefault<z.ZodString>;
    gridTextColor: z.ZodDefault<z.ZodString>;
    textColor: z.ZodDefault<z.ZodString>;
    crashColor: z.ZodDefault<z.ZodString>;
    winColor: z.ZodDefault<z.ZodString>;
    axesColor: z.ZodDefault<z.ZodString>;
    gameSpeed: z.ZodDefault<z.ZodNumber>;
    showGridlines: z.ZodDefault<z.ZodBoolean>;
    showGridLabels: z.ZodDefault<z.ZodBoolean>;
    showAxes: z.ZodDefault<z.ZodBoolean>;
    showTargetLine: z.ZodDefault<z.ZodBoolean>;
    lineThickness: z.ZodDefault<z.ZodNumber>;
    graphSize: z.ZodDefault<z.ZodNumber>;
    rocketAppearance: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string>;
    rocketSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    gameIcon?: string;
    background?: string;
    textColor?: string;
    winColor?: string;
    lineColor?: string;
    gridColor?: string;
    gridTextColor?: string;
    crashColor?: string;
    axesColor?: string;
    gameSpeed?: number;
    showGridlines?: boolean;
    showGridLabels?: boolean;
    showAxes?: boolean;
    showTargetLine?: boolean;
    lineThickness?: number;
    graphSize?: number;
    rocketAppearance?: string;
    rocketSize?: number;
}, {
    gameIcon?: string;
    background?: string;
    textColor?: string;
    winColor?: string;
    lineColor?: string;
    gridColor?: string;
    gridTextColor?: string;
    crashColor?: string;
    axesColor?: string;
    gameSpeed?: number;
    showGridlines?: boolean;
    showGridLabels?: boolean;
    showAxes?: boolean;
    showTargetLine?: boolean;
    lineThickness?: number;
    graphSize?: number;
    rocketAppearance?: string;
    rocketSize?: number;
}>;
export type CrashParams = z.infer<typeof CrashParamsSchema>;
export declare const RPSParamsSchema: z.ZodObject<{
    gameIcon: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    background: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string>;
    handSize: z.ZodDefault<z.ZodNumber>;
    handSpacing: z.ZodDefault<z.ZodNumber>;
    primaryColor: z.ZodDefault<z.ZodString>;
    secondaryColor: z.ZodDefault<z.ZodString>;
    winColor: z.ZodDefault<z.ZodString>;
    loseColor: z.ZodDefault<z.ZodString>;
    useCustomIcons: z.ZodDefault<z.ZodBoolean>;
    customRockImage: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    customPaperImage: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    customScissorsImage: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    animationSpeed: z.ZodDefault<z.ZodNumber>;
    animationPreset: z.ZodDefault<z.ZodEnum<["standard", "clash"]>>;
    showResultText: z.ZodDefault<z.ZodBoolean>;
    showVsText: z.ZodDefault<z.ZodBoolean>;
    glowEffect: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    primaryColor?: string;
    gameIcon?: string;
    background?: string;
    animationSpeed?: number;
    winColor?: string;
    loseColor?: string;
    animationPreset?: "standard" | "clash";
    handSize?: number;
    handSpacing?: number;
    secondaryColor?: string;
    useCustomIcons?: boolean;
    customRockImage?: string;
    customPaperImage?: string;
    customScissorsImage?: string;
    showResultText?: boolean;
    showVsText?: boolean;
    glowEffect?: boolean;
}, {
    primaryColor?: string;
    gameIcon?: string;
    background?: string;
    animationSpeed?: number;
    winColor?: string;
    loseColor?: string;
    animationPreset?: "standard" | "clash";
    handSize?: number;
    handSpacing?: number;
    secondaryColor?: string;
    useCustomIcons?: boolean;
    customRockImage?: string;
    customPaperImage?: string;
    customScissorsImage?: string;
    showResultText?: boolean;
    showVsText?: boolean;
    glowEffect?: boolean;
}>;
export type RPSParams = z.infer<typeof RPSParamsSchema>;
export declare const CoinFlipParamsSchema: z.ZodObject<{
    gameIcon: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    background: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string>;
    coinColor: z.ZodDefault<z.ZodString>;
    headsCustomImage: z.ZodEffects<z.ZodString, string, string>;
    tailsCustomImage: z.ZodEffects<z.ZodString, string, string>;
    textColor: z.ZodDefault<z.ZodString>;
    coinSize: z.ZodDefault<z.ZodNumber>;
    animationSpeed: z.ZodDefault<z.ZodNumber>;
    flipCount: z.ZodDefault<z.ZodNumber>;
    particleCount: z.ZodDefault<z.ZodNumber>;
    animationPreset: z.ZodDefault<z.ZodEnum<["flip", "spin", "twist"]>>;
    winColor: z.ZodDefault<z.ZodString>;
    lossColor: z.ZodDefault<z.ZodString>;
    particleEffects: z.ZodDefault<z.ZodEnum<["none", "less", "more"]>>;
    glowEffect: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    gameIcon?: string;
    background?: string;
    textColor?: string;
    animationSpeed?: number;
    winColor?: string;
    animationPreset?: "spin" | "flip" | "twist";
    lossColor?: string;
    particleEffects?: "none" | "less" | "more";
    glowEffect?: boolean;
    coinColor?: string;
    headsCustomImage?: string;
    tailsCustomImage?: string;
    coinSize?: number;
    flipCount?: number;
    particleCount?: number;
}, {
    gameIcon?: string;
    background?: string;
    textColor?: string;
    animationSpeed?: number;
    winColor?: string;
    animationPreset?: "spin" | "flip" | "twist";
    lossColor?: string;
    particleEffects?: "none" | "less" | "more";
    glowEffect?: boolean;
    coinColor?: string;
    headsCustomImage?: string;
    tailsCustomImage?: string;
    coinSize?: number;
    flipCount?: number;
    particleCount?: number;
}>;
export type CoinFlipParams = z.infer<typeof CoinFlipParamsSchema>;
export declare const CryptoLaunchParamsSchema: z.ZodObject<{
    gameIcon: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    chartColor: z.ZodDefault<z.ZodString>;
    background: z.ZodDefault<z.ZodString>;
    highlightOpacity: z.ZodDefault<z.ZodNumber>;
    showXAxis: z.ZodDefault<z.ZodBoolean>;
    showDayLabels: z.ZodDefault<z.ZodBoolean>;
    showGrid: z.ZodDefault<z.ZodBoolean>;
    gridColor: z.ZodDefault<z.ZodString>;
    textColor: z.ZodDefault<z.ZodString>;
    particleIntensity: z.ZodDefault<z.ZodNumber>;
    animationDuration: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    gameIcon?: string;
    background?: string;
    textColor?: string;
    gridColor?: string;
    chartColor?: string;
    highlightOpacity?: number;
    showXAxis?: boolean;
    showDayLabels?: boolean;
    showGrid?: boolean;
    particleIntensity?: number;
    animationDuration?: number;
}, {
    gameIcon?: string;
    background?: string;
    textColor?: string;
    gridColor?: string;
    chartColor?: string;
    highlightOpacity?: number;
    showXAxis?: boolean;
    showDayLabels?: boolean;
    showGrid?: boolean;
    particleIntensity?: number;
    animationDuration?: number;
}>;
export type CryptoLaunchParams = z.infer<typeof CryptoLaunchParamsSchema>;
export declare const PlinkoParamsSchema: z.ZodObject<{
    gameIcon: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    background: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string>;
    ballColor: z.ZodDefault<z.ZodString>;
    pegColor: z.ZodDefault<z.ZodString>;
    bucketColor: z.ZodDefault<z.ZodString>;
    bucketOutlineColor: z.ZodDefault<z.ZodString>;
    multiplierColor: z.ZodDefault<z.ZodString>;
    ballTrail: z.ZodDefault<z.ZodBoolean>;
    ballDropDelay: z.ZodDefault<z.ZodNumber>;
    showBucketAnimations: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    gameIcon?: string;
    background?: string;
    ballColor?: string;
    pegColor?: string;
    bucketColor?: string;
    bucketOutlineColor?: string;
    multiplierColor?: string;
    ballTrail?: boolean;
    ballDropDelay?: number;
    showBucketAnimations?: boolean;
}, {
    gameIcon?: string;
    background?: string;
    ballColor?: string;
    pegColor?: string;
    bucketColor?: string;
    bucketOutlineColor?: string;
    multiplierColor?: string;
    ballTrail?: boolean;
    ballDropDelay?: number;
    showBucketAnimations?: boolean;
}>;
export type PlinkoParams = z.infer<typeof PlinkoParamsSchema>;
export declare const RouletteParamsSchema: z.ZodObject<{
    gameIcon: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    layoutType: z.ZodDefault<z.ZodEnum<["spin", "scroll", "tiles"]>>;
    textColor: z.ZodDefault<z.ZodString>;
    rouletteColor1: z.ZodDefault<z.ZodString>;
    rouletteColor2: z.ZodDefault<z.ZodString>;
    neutralColor: z.ZodDefault<z.ZodString>;
    spinDuration: z.ZodDefault<z.ZodNumber>;
    resetDuration: z.ZodDefault<z.ZodNumber>;
    wheelRadius: z.ZodOptional<z.ZodNumber>;
    wheelAccentColor: z.ZodOptional<z.ZodString>;
    wheelBackground: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    scrollSpeed: z.ZodOptional<z.ZodNumber>;
    decelerationRate: z.ZodOptional<z.ZodNumber>;
    neighborOpacity: z.ZodOptional<z.ZodNumber>;
    visibleNeighbors: z.ZodOptional<z.ZodNumber>;
    numberSize: z.ZodOptional<z.ZodNumber>;
    tileSize: z.ZodOptional<z.ZodNumber>;
    tileSpacing: z.ZodOptional<z.ZodNumber>;
    tileBorderRadius: z.ZodOptional<z.ZodNumber>;
    tileBorderHighlightColor: z.ZodOptional<z.ZodString>;
    animationPattern: z.ZodOptional<z.ZodEnum<["sequential", "random", "waterfall"]>>;
    chipColors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    showBettingHistory: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    gameIcon?: string;
    textColor?: string;
    tileSize?: number;
    tileSpacing?: number;
    layoutType?: "spin" | "scroll" | "tiles";
    rouletteColor1?: string;
    rouletteColor2?: string;
    neutralColor?: string;
    spinDuration?: number;
    resetDuration?: number;
    wheelRadius?: number;
    wheelAccentColor?: string;
    wheelBackground?: string;
    scrollSpeed?: number;
    decelerationRate?: number;
    neighborOpacity?: number;
    visibleNeighbors?: number;
    numberSize?: number;
    tileBorderRadius?: number;
    tileBorderHighlightColor?: string;
    animationPattern?: "sequential" | "random" | "waterfall";
    chipColors?: string[];
    showBettingHistory?: boolean;
}, {
    gameIcon?: string;
    textColor?: string;
    tileSize?: number;
    tileSpacing?: number;
    layoutType?: "spin" | "scroll" | "tiles";
    rouletteColor1?: string;
    rouletteColor2?: string;
    neutralColor?: string;
    spinDuration?: number;
    resetDuration?: number;
    wheelRadius?: number;
    wheelAccentColor?: string;
    wheelBackground?: string;
    scrollSpeed?: number;
    decelerationRate?: number;
    neighborOpacity?: number;
    visibleNeighbors?: number;
    numberSize?: number;
    tileBorderRadius?: number;
    tileBorderHighlightColor?: string;
    animationPattern?: "sequential" | "random" | "waterfall";
    chipColors?: string[];
    showBettingHistory?: boolean;
}>;
export type RouletteParams = z.infer<typeof RouletteParamsSchema>;
export declare const CardsParamsSchema: z.ZodObject<{
    gameIcon: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    background: z.ZodEffects<z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url?: string;
    }, {
        url?: string;
    }>, {
        url?: string;
    }, {
        url?: string;
    }>;
    commonColor: z.ZodOptional<z.ZodString>;
    rareColor: z.ZodOptional<z.ZodString>;
    epicColor: z.ZodOptional<z.ZodString>;
    legendaryColor: z.ZodOptional<z.ZodString>;
    cardsCatalog: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        iconUrl: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        id?: number;
        iconUrl?: string;
    }, {
        name?: string;
        id?: number;
        iconUrl?: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    gameIcon?: string;
    background?: {
        url?: string;
    };
    commonColor?: string;
    rareColor?: string;
    epicColor?: string;
    legendaryColor?: string;
    cardsCatalog?: {
        name?: string;
        id?: number;
        iconUrl?: string;
    }[];
}, {
    gameIcon?: string;
    background?: {
        url?: string;
    };
    commonColor?: string;
    rareColor?: string;
    epicColor?: string;
    legendaryColor?: string;
    cardsCatalog?: {
        name?: string;
        id?: number;
        iconUrl?: string;
    }[];
}>;
export type CardsParams = z.infer<typeof CardsParamsSchema>;
export declare const SlotsParamsSchema: z.ZodObject<{
    gameIcon: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    background: z.ZodEffects<z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url?: string;
    }, {
        url?: string;
    }>, {
        url?: string;
    }, {
        url?: string;
    }>;
    reelBackground: z.ZodEffects<z.ZodString, string, string>;
    reelContainer: z.ZodEffects<z.ZodString, string, string>;
    borderColor: z.ZodEffects<z.ZodString, string, string>;
    paylineIndicator: z.ZodEffects<z.ZodString, string, string>;
    winColor: z.ZodEffects<z.ZodString, string, string>;
    slotsSymbols: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    gameIcon?: string;
    background?: {
        url?: string;
    };
    winColor?: string;
    borderColor?: string;
    reelBackground?: string;
    reelContainer?: string;
    paylineIndicator?: string;
    slotsSymbols?: string[];
}, {
    gameIcon?: string;
    background?: {
        url?: string;
    };
    winColor?: string;
    borderColor?: string;
    reelBackground?: string;
    reelContainer?: string;
    paylineIndicator?: string;
    slotsSymbols?: string[];
}>;
export type SlotsParams = z.infer<typeof SlotsParamsSchema>;
export declare const diceParamsJsonSchema: import("zod-to-json-schema").JsonSchema7Type & {
    $schema?: string | undefined;
    definitions?: {
        [key: string]: import("zod-to-json-schema").JsonSchema7Type;
    };
};
export declare const bombsParamsJsonSchema: import("zod-to-json-schema").JsonSchema7Type & {
    $schema?: string | undefined;
    definitions?: {
        [key: string]: import("zod-to-json-schema").JsonSchema7Type;
    };
};
export declare const crashParamsJsonSchema: import("zod-to-json-schema").JsonSchema7Type & {
    $schema?: string | undefined;
    definitions?: {
        [key: string]: import("zod-to-json-schema").JsonSchema7Type;
    };
};
export declare const rpsParamsJsonSchema: import("zod-to-json-schema").JsonSchema7Type & {
    $schema?: string | undefined;
    definitions?: {
        [key: string]: import("zod-to-json-schema").JsonSchema7Type;
    };
};
export declare const coinflipParamsJsonSchema: import("zod-to-json-schema").JsonSchema7Type & {
    $schema?: string | undefined;
    definitions?: {
        [key: string]: import("zod-to-json-schema").JsonSchema7Type;
    };
};
export declare const cryptolaunchParamsJsonSchema: import("zod-to-json-schema").JsonSchema7Type & {
    $schema?: string | undefined;
    definitions?: {
        [key: string]: import("zod-to-json-schema").JsonSchema7Type;
    };
};
export declare const plinkoParamsJsonSchema: import("zod-to-json-schema").JsonSchema7Type & {
    $schema?: string | undefined;
    definitions?: {
        [key: string]: import("zod-to-json-schema").JsonSchema7Type;
    };
};
export declare const rouletteParamsJsonSchema: import("zod-to-json-schema").JsonSchema7Type & {
    $schema?: string | undefined;
    definitions?: {
        [key: string]: import("zod-to-json-schema").JsonSchema7Type;
    };
};
export declare const cardsParamsJsonSchema: import("zod-to-json-schema").JsonSchema7Type & {
    $schema?: string | undefined;
    definitions?: {
        [key: string]: import("zod-to-json-schema").JsonSchema7Type;
    };
};
export declare const slotsParamsJsonSchema: import("zod-to-json-schema").JsonSchema7Type & {
    $schema?: string | undefined;
    definitions?: {
        [key: string]: import("zod-to-json-schema").JsonSchema7Type;
    };
};
export interface GameMetadata {
    id: string;
    displayName: string;
    description: string;
    category: 'dice' | 'grid' | 'wheel' | 'crash' | 'cards' | 'slots' | 'rps' | 'coinflip' | 'crypto';
    tileSize: 'small' | 'medium' | 'large';
    supportedFeatures: string[];
    schema: z.ZodSchema;
}
export declare class SchemaRegistry {
    private static instance;
    private games;
    private constructor();
    static getInstance(): SchemaRegistry;
    private registerGames;
    private register;
    getSchema(gameId: string): z.ZodSchema | null;
    getJsonSchema(gameId: string): any;
    validateParams(gameId: string, params: any): {
        success: boolean;
        error?: string;
        data?: any;
    };
    listGames(): GameMetadata[];
    getGameMetadata(gameId: string): GameMetadata | null;
    extractAIInstructions(gameId: string): Record<string, string>;
    getSupportedGames(): string[];
    isGameSupported(gameId: string): boolean;
    extractCustomInstructions(gameId: string): string;
    getSupportedTypesMetadata(gameId: string): Record<string, any>;
    getFieldInfo(gameId: string): Array<{
        name: string;
        type: string;
        description: string;
        default?: any;
        optional: boolean;
        supportsImage: boolean;
        supportsGradient: boolean;
        supportsSolidColor: boolean;
        supportsPattern: boolean;
        customInstruction?: string;
    }>;
}
export declare const schemaRegistry: SchemaRegistry;
