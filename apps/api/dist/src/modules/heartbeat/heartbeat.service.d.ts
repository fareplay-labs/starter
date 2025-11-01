import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class HeartbeatService implements OnModuleInit {
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    private client;
    private discoveryClient;
    private casinoId;
    private enabled;
    constructor(configService: ConfigService, prisma: PrismaService);
    onModuleInit(): Promise<void>;
    handleHeartbeat(): Promise<void>;
    private sendHeartbeat;
    triggerHeartbeat(): Promise<void>;
    private registerCasino;
}
