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
var HeartbeatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const sdk_1 = require("@fareplay/sdk");
let HeartbeatService = HeartbeatService_1 = class HeartbeatService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(HeartbeatService_1.name);
        this.client = null;
        this.discoveryClient = null;
        this.casinoId = null;
        this.enabled = false;
    }
    async onModuleInit() {
        const baseUrl = 'https://api.discover.fareplay.io';
        const privateKey = this.configService.get('HEARTBEAT_PRIVATE_KEY');
        if (!privateKey) {
            this.logger.warn('Heartbeat service disabled: Missing HEARTBEAT_PRIVATE_KEY');
            return;
        }
        try {
            this.discoveryClient = new sdk_1.FareDiscoveryClient({ baseUrl });
            let settings = await this.prisma.casinoSettings.findUnique({
                where: { id: 'singleton' },
            });
            if (!settings) {
                settings = await this.prisma.casinoSettings.create({
                    data: { id: 'singleton' },
                });
            }
            if (!settings.registeredCasinoId || !settings.registeredPublicKey) {
                this.logger.log('Casino not registered with discovery service. Registering now...');
                await this.registerCasino(settings);
                settings = await this.prisma.casinoSettings.findUnique({
                    where: { id: 'singleton' },
                });
            }
            else {
                this.logger.log(`Casino already registered: ${settings.registeredCasinoId}`);
            }
            this.casinoId = settings.registeredCasinoId;
            this.client = new sdk_1.FareCasinoClient({
                baseUrl,
                casinoId: this.casinoId,
                privateKey,
            });
            this.enabled = true;
            this.logger.log('Heartbeat service initialized - Will ping discovery service every 15 minutes');
            await this.sendHeartbeat();
        }
        catch (error) {
            this.logger.error('Failed to initialize Heartbeat service:', error);
            this.logger.warn('Heartbeat service will be disabled');
            this.enabled = false;
        }
    }
    async handleHeartbeat() {
        if (!this.enabled)
            return;
        await this.sendHeartbeat();
    }
    async sendHeartbeat() {
        if (!this.client) {
            this.logger.warn('Client not initialized, skipping heartbeat');
            return;
        }
        try {
            let settings = await this.prisma.casinoSettings.findUnique({
                where: { id: 'singleton' },
            });
            if (!settings) {
                settings = await this.prisma.casinoSettings.create({
                    data: { id: 'singleton' },
                });
            }
            let stats = await this.prisma.globalStats.findUnique({
                where: { id: 'singleton' },
            });
            if (!stats) {
                stats = await this.prisma.globalStats.create({
                    data: { id: 'singleton' },
                });
            }
            const statusMap = {
                ACTIVE: 'online',
                INACTIVE: 'offline',
                MAINTENANCE: 'maintenance',
                SUSPENDED: 'offline',
            };
            const status = statusMap[settings.status] || 'offline';
            const metrics = {
                activePlayers: stats.totalPlayers,
                totalBets24h: stats.totalPlays,
                uptime: Math.floor(process.uptime()),
            };
            const response = await this.client.sendHeartbeatWithMetrics(status, metrics);
            this.logger.log(`✅ Heartbeat sent - Status: ${status}, Players: ${stats.totalPlayers}, Response: ${JSON.stringify(response)}`);
        }
        catch (error) {
            this.logger.error('❌ Failed to send heartbeat:', error);
        }
    }
    async triggerHeartbeat() {
        this.logger.log('Manual heartbeat triggered');
        await this.sendHeartbeat();
    }
    async registerCasino(settings) {
        try {
            const privateKey = this.configService.get('HEARTBEAT_PRIVATE_KEY');
            const { publicKey } = (0, sdk_1.getKeypairFromPrivateKey)(privateKey);
            const games = await this.prisma.game.findMany({ select: { name: true } });
            const gameNames = Array.isArray(games) ? games.map((g) => g.name) : [];
            const metadata = {
                games: gameNames,
                supportedTokens: ['SOL'],
            };
            const desc = settings.longDescription ?? settings.shortDescription;
            if (desc)
                metadata.description = desc;
            if (settings.logoUrl)
                metadata.logo = settings.logoUrl;
            if (settings.bannerUrl)
                metadata.banner = settings.bannerUrl;
            if (settings.socialLinks)
                metadata.socialLinks = settings.socialLinks;
            const registrationData = {
                name: settings.name || 'Unnamed Casino',
                url: settings.websiteUrl ||
                    this.configService.get('FRONTEND_URL') ||
                    'https://example.com',
                publicKey,
                metadata,
            };
            this.logger.log(`Registering casino with discovery service: ${registrationData.name}`);
            const signedPayload = (0, sdk_1.createSignedPayload)(registrationData, privateKey);
            const registered = await this.discoveryClient.registerCasino(signedPayload);
            await this.prisma.casinoSettings.update({
                where: { id: 'singleton' },
                data: {
                    registeredCasinoId: registered.id,
                    registeredPublicKey: registered.publicKey,
                    registeredAt: new Date(),
                },
            });
            this.logger.log(`✅ Casino registered successfully! ID: ${registered.id}`);
        }
        catch (error) {
            this.logger.error('Failed to register casino with discovery service:', error);
            throw error;
        }
    }
};
exports.HeartbeatService = HeartbeatService;
__decorate([
    (0, schedule_1.Cron)('0 */15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HeartbeatService.prototype, "handleHeartbeat", null);
exports.HeartbeatService = HeartbeatService = HeartbeatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], HeartbeatService);
//# sourceMappingURL=heartbeat.service.js.map