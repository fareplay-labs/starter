import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly prisma;
    server: Server;
    private readonly logger;
    private readonly subscriptions;
    constructor(prisma: PrismaService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribeLiveTrials(data: {
        casinoId?: string;
    }, client: Socket): {
        success: boolean;
        room: string;
    };
    handleUnsubscribeLiveTrials(data: {
        casinoId?: string;
    }, client: Socket): {
        success: boolean;
        room: string;
    };
    handleSubscribePlayerTrials(data: {
        address: string;
    }, client: Socket): {
        success: boolean;
        room: string;
    };
    emitTrialRegistered(trial: any): void;
    emitTrialResolved(trial: any): void;
    emitStatsUpdate(casinoId: string, stats: any): void;
}
