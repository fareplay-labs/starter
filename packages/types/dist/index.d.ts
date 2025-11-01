export interface Casino {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    longDescription?: string;
    ownerAddress: string;
    poolAddress?: string;
    profileImage?: string;
    bannerImage?: string;
    status: CasinoStatus;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}
export type CasinoStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SUSPENDED';
export interface Player {
    id: string;
    casinoId: string;
    walletAddress: string;
    username?: string;
    avatarUrl?: string;
    totalBets: number;
    totalWins: number;
    totalLosses: number;
    totalWagered: string;
    totalPayout: string;
    createdAt: string;
    updatedAt: string;
    lastSeenAt: string;
}
export interface PlayerStats {
    address: string;
    totalWagered: string;
    totalPayout: string;
    profitLoss: string;
    totalBets: number;
    totalWins: number;
    totalLosses: number;
    winRate: number;
    casinos?: CasinoPlayerStats[];
}
export interface CasinoPlayerStats {
    casinoId: string;
    casinoName: string;
    casinoSlug: string;
    totalWagered: string;
    totalPayout: string;
    totalBets: number;
    totalWins: number;
    totalLosses: number;
}
export interface Trial {
    trialId: string;
    poolAddress: string;
    who: string;
    multiplier: string;
    qkWithConfigHash: string;
    extraDataHash: string;
    createdAt: string;
    resolved: boolean;
    resolvedAt?: string;
    resultIndex?: number;
    resultK?: string;
    deltaAmount?: string;
    gameResult?: any;
}
export interface TrialPagination {
    trials: Trial[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}
export interface GameInstance {
    id: string;
    gameConfigHash: string;
    result?: {
        resultIndex: number;
        resultK: string;
        deltaAmount: string;
        multiplier: string;
    };
    createdAt: string;
    updatedAt: string;
}
export interface GlobalStats {
    totalWagered: string;
    totalPayout: string;
    totalPlays: number;
    totalPlayers: number;
    activeCasinos: number;
    houseEdge: number;
}
export interface CasinoStats {
    casinoId: string;
    casinoName: string;
    casinoSlug: string;
    status: CasinoStatus;
    owner: string;
    ownerUsername?: string;
    totalWagered: string;
    totalPayout: string;
    totalPlays: number;
    totalPlayers: number;
    houseEdge: number;
}
export interface PoolStats {
    poolAddress: string;
    managerAddress: string;
    totalTrials: number;
    resolvedTrials: number;
    pendingTrials: number;
    feePlayMultiplier: string;
    feeLossMultiplier: string;
    feeMintMultiplier: string;
    feeHostPercent: string;
    feePoolPercent: string;
}
export interface ChatMessage {
    id: string;
    message: string;
    createdAt: string;
    deleted: boolean;
    player: {
        address: string;
        username?: string;
        avatarUrl?: string;
    };
}
export interface ChatMessagesResponse {
    messages: ChatMessage[];
    hasMore: boolean;
}
export interface TrialRegisteredEvent {
    type: 'trialRegistered';
    trial: Trial;
}
export interface TrialResolvedEvent {
    type: 'trialResolved';
    trial: Trial;
}
export interface StatsUpdateEvent {
    type: 'statsUpdate';
    casinoId?: string;
    stats: Partial<CasinoStats>;
}
export interface NewChatMessageEvent {
    type: 'newMessage';
    message: ChatMessage;
}
export interface MessageDeletedEvent {
    type: 'messageDeleted';
    messageId: string;
}
export type WebSocketEvent = TrialRegisteredEvent | TrialResolvedEvent | StatsUpdateEvent | NewChatMessageEvent | MessageDeletedEvent;
export interface LoginRequest {
    address: string;
    signature: string;
    message: string;
}
export interface LoginResponse {
    accessToken: string;
    user: {
        id: string;
        address: string;
        username?: string;
        avatarUrl?: string;
    };
}
export interface NonceResponse {
    message: string;
}
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}
export interface HealthCheckResponse {
    status: 'ok' | 'error';
    timestamp: string;
    database: string;
    redis: string;
    queues: {
        blockchainEvent: string;
        eventInterpretation: string;
        game: string;
    };
}
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
