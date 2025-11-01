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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GameGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../modules/prisma/prisma.service");
let GameGateway = GameGateway_1 = class GameGateway {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GameGateway_1.name);
        this.subscriptions = new Map();
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.subscriptions.forEach((clients, room) => {
            clients.delete(client.id);
            if (clients.size === 0) {
                this.subscriptions.delete(room);
            }
        });
    }
    handleSubscribeLiveTrials(data, client) {
        const room = data.casinoId ? `casino:${data.casinoId}` : 'global';
        client.join(room);
        if (!this.subscriptions.has(room)) {
            this.subscriptions.set(room, new Set());
        }
        this.subscriptions.get(room).add(client.id);
        this.logger.log(`Client ${client.id} subscribed to ${room}`);
        return { success: true, room };
    }
    handleUnsubscribeLiveTrials(data, client) {
        const room = data.casinoId ? `casino:${data.casinoId}` : 'global';
        client.leave(room);
        const roomClients = this.subscriptions.get(room);
        if (roomClients) {
            roomClients.delete(client.id);
            if (roomClients.size === 0) {
                this.subscriptions.delete(room);
            }
        }
        this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
        return { success: true, room };
    }
    handleSubscribePlayerTrials(data, client) {
        const room = `player:${data.address}`;
        client.join(room);
        if (!this.subscriptions.has(room)) {
            this.subscriptions.set(room, new Set());
        }
        this.subscriptions.get(room).add(client.id);
        this.logger.log(`Client ${client.id} subscribed to ${room}`);
        return { success: true, room };
    }
    emitTrialRegistered(trial) {
        this.server.to('global').emit('trialRegistered', trial);
        if (trial.casinoId) {
            this.server.to(`casino:${trial.casinoId}`).emit('trialRegistered', trial);
        }
        if (trial.who) {
            this.server.to(`player:${trial.who}`).emit('trialRegistered', trial);
        }
        this.logger.debug(`Emitted trialRegistered for ${trial.id}`);
    }
    emitTrialResolved(trial) {
        this.server.to('global').emit('trialResolved', trial);
        if (trial.casinoId) {
            this.server.to(`casino:${trial.casinoId}`).emit('trialResolved', trial);
        }
        if (trial.who) {
            this.server.to(`player:${trial.who}`).emit('trialResolved', trial);
        }
        this.logger.debug(`Emitted trialResolved for ${trial.id}`);
    }
    emitStatsUpdate(casinoId, stats) {
        this.server.to(`casino:${casinoId}`).emit('statsUpdate', stats);
        this.server.to('global').emit('statsUpdate', { casinoId, ...stats });
        this.logger.debug(`Emitted statsUpdate for casino ${casinoId}`);
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribeLiveTrials'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleSubscribeLiveTrials", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribeLiveTrials'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleUnsubscribeLiveTrials", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribePlayerTrials'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleSubscribePlayerTrials", null);
exports.GameGateway = GameGateway = GameGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/casino',
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map