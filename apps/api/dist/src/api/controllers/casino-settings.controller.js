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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasinoSettingsController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@fareplay/sdk");
const prisma_service_1 = require("../../modules/prisma/prisma.service");
const jwt_auth_guard_1 = require("../../modules/auth/jwt-auth.guard");
const manager_guard_1 = require("../../modules/auth/manager.guard");
const jwt_auth_guard_2 = require("../../modules/auth/jwt-auth.guard");
let CasinoSettingsController = class CasinoSettingsController {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async getSettings() {
        let settings = await this.prisma.casinoSettings.findUnique({
            where: { id: 'singleton' },
        });
        if (!settings) {
            settings = await this.prisma.casinoSettings.create({
                data: {
                    id: 'singleton',
                },
            });
        }
        return settings;
    }
    async getRegistrationStatus() {
        const settings = await this.prisma.casinoSettings.findUnique({
            where: { id: 'singleton' },
        });
        if (!settings) {
            return {
                registered: false,
                reason: 'no_settings',
            };
        }
        return {
            registered: Boolean(settings.registeredCasinoId && settings.registeredPublicKey),
            casinoId: settings.registeredCasinoId || null,
            publicKey: settings.registeredPublicKey || null,
            registeredAt: settings.registeredAt || null,
            status: settings.status,
        };
    }
    async updateSettings(updateData) {
        let settings = await this.prisma.casinoSettings.findUnique({
            where: { id: 'singleton' },
        });
        if (!settings) {
            settings = await this.prisma.casinoSettings.create({
                data: {
                    id: 'singleton',
                },
            });
        }
        const updated = await this.prisma.casinoSettings.update({
            where: { id: 'singleton' },
            data: updateData,
        });
        try {
            if (updated.registeredCasinoId) {
                const baseUrl = 'https://api.discover.fareplay.io';
                const client = new sdk_1.FareDiscoveryClient({ baseUrl });
                const privateKey = this.configService.get('HEARTBEAT_PRIVATE_KEY');
                if (privateKey) {
                    const games = await this.prisma.game.findMany({ select: { name: true } });
                    const gameNames = Array.isArray(games) ? games.map((g) => g.name) : [];
                    const metadata = {
                        games: gameNames,
                        supportedTokens: ['SOL'],
                    };
                    const desc = updated.longDescription ?? updated.shortDescription;
                    if (desc)
                        metadata.description = desc;
                    if (updated.logoUrl)
                        metadata.logo = updated.logoUrl;
                    if (updated.bannerUrl)
                        metadata.banner = updated.bannerUrl;
                    if (updated.socialLinks)
                        metadata.socialLinks = updated.socialLinks;
                    const statusMap = {
                        ACTIVE: 'online',
                        INACTIVE: 'offline',
                        MAINTENANCE: 'maintenance',
                        SUSPENDED: 'suspended',
                    };
                    const request = {
                        casinoId: updated.registeredCasinoId,
                        name: updated.name ?? undefined,
                        url: updated.websiteUrl ?? undefined,
                        status: statusMap[updated.status] ?? undefined,
                        metadata,
                    };
                    const signed = (0, sdk_1.createSignedPayload)(request, privateKey);
                    await client.updateCasino(signed);
                }
            }
        }
        catch (err) {
            console.warn('Discovery sync failed:', err);
        }
        return updated;
    }
};
exports.CasinoSettingsController = CasinoSettingsController;
__decorate([
    (0, jwt_auth_guard_2.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CasinoSettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, manager_guard_1.ManagerGuard),
    (0, common_1.Get)('registration-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CasinoSettingsController.prototype, "getRegistrationStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, manager_guard_1.ManagerGuard),
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CasinoSettingsController.prototype, "updateSettings", null);
exports.CasinoSettingsController = CasinoSettingsController = __decorate([
    (0, common_1.Controller)('casino-settings'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], CasinoSettingsController);
//# sourceMappingURL=casino-settings.controller.js.map