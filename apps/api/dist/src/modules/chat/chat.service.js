"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = ChatService_1 = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ChatService_1.name);
        this.MAX_MESSAGE_LENGTH = 500;
        this.CACHE_TTL = 30000;
        this.messageCache = null;
    }
    async sendMessage(userAddress, message) {
        if (!message || message.trim().length === 0) {
            throw new common_1.BadRequestException('Message cannot be empty');
        }
        if (message.length > this.MAX_MESSAGE_LENGTH) {
            throw new common_1.BadRequestException(`Message too long (max ${this.MAX_MESSAGE_LENGTH} characters)`);
        }
        let user = await this.prisma.user.findUnique({
            where: { walletAddress: userAddress },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    walletAddress: userAddress,
                },
            });
            this.logger.log(`Created user ${userAddress}`);
        }
        const chatMessage = await this.prisma.chatMessage.create({
            data: {
                userId: userAddress,
                message: message.trim(),
            },
            include: {
                user: {
                    select: {
                        walletAddress: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        this.logger.log(`Message sent by ${userAddress}`);
        this.messageCache = null;
        return this.formatMessage(chatMessage);
    }
    async getMessages(limit = 50, before) {
        if (!before && limit === 50) {
            const now = Date.now();
            if (this.messageCache && (now - this.messageCache.timestamp) < this.CACHE_TTL) {
                this.logger.debug('Returning cached messages');
                return this.messageCache.messages;
            }
        }
        const messages = await this.prisma.chatMessage.findMany({
            where: {
                deleted: false,
                ...(before && {
                    createdAt: {
                        lt: new Date(before),
                    },
                }),
            },
            include: {
                user: {
                    select: {
                        walletAddress: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });
        const formattedMessages = messages.map((m) => this.formatMessage(m)).reverse();
        if (!before && limit === 50) {
            this.messageCache = {
                messages: formattedMessages,
                timestamp: Date.now(),
            };
            this.logger.debug('Cached messages');
        }
        return formattedMessages;
    }
    async deleteMessage(messageId, userAddress) {
        const message = await this.prisma.chatMessage.findUnique({
            where: { id: messageId },
            include: { user: true },
        });
        if (!message) {
            throw new common_1.BadRequestException('Message not found');
        }
        if (message.user.walletAddress !== userAddress) {
            throw new common_1.BadRequestException('Cannot delete another user\'s message');
        }
        await this.prisma.chatMessage.update({
            where: { id: messageId },
            data: {
                deleted: true,
                deletedAt: new Date(),
            },
        });
        this.messageCache = null;
        this.logger.log(`Message ${messageId} deleted by ${userAddress}`);
    }
    formatMessage(message) {
        return {
            id: message.id,
            message: message.message,
            createdAt: message.createdAt.toISOString(),
            deleted: message.deleted,
            user: {
                address: message.user.walletAddress,
                username: message.user.username,
                avatarUrl: message.user.avatarUrl,
            },
        };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map