import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class ChatService {
    private readonly prisma;
    private readonly logger;
    private readonly MAX_MESSAGE_LENGTH;
    private readonly CACHE_TTL;
    private messageCache;
    constructor(prisma: PrismaService);
    sendMessage(userAddress: string, message: string): Promise<any>;
    getMessages(limit?: number, before?: string): Promise<any[]>;
    deleteMessage(messageId: string, userAddress: string): Promise<void>;
    private formatMessage;
}
