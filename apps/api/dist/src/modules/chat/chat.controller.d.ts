import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMessages(limit?: string, before?: string): Promise<{
        messages: any[];
        hasMore: boolean;
    }>;
}
