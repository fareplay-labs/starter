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
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../modules/prisma/prisma.service");
const jwt_auth_guard_1 = require("../../modules/auth/jwt-auth.guard");
let ContentController = class ContentController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSections() {
        return this.prisma.section.findMany({ orderBy: { order: 'asc' } });
    }
    async getCustomGames(body) {
        const ids = Array.isArray(body?.ids) ? body.ids : [];
        if (ids.length === 0)
            return [];
        return this.prisma.customGame.findMany({
            where: { id: { in: ids } },
            include: { customConfig: { select: { parameters: true } } },
        });
    }
    async getSectionsWithGames() {
        const sections = await this.prisma.section.findMany({ orderBy: { order: 'asc' } });
        if (sections.length === 0)
            return [];
        const allIds = Array.from(new Set(sections.flatMap(s => s.gameIds)));
        const games = await this.prisma.customGame.findMany({
            where: { id: { in: allIds } },
            include: { customConfig: { select: { parameters: true } } },
        });
        const byId = new Map(games.map(g => [g.id, g]));
        const toThumb = (params) => {
            if (!params)
                return null;
            const icon = typeof params?.gameIcon === 'string' ? params.gameIcon : null;
            const bgStr = typeof params?.background === 'string' ? params.background : null;
            const bgObj = params?.background && typeof params.background === 'object' && typeof params.background.url === 'string' ? params.background.url : null;
            return icon || bgStr || bgObj;
        };
        return sections.map(sec => ({
            id: sec.id,
            title: sec.title,
            layout: sec.layout,
            order: sec.order,
            games: (sec.gameIds || []).map(id => byId.get(id)).filter(Boolean).map((g) => ({
                id: g.id,
                name: g.name,
                description: g.description,
                gameType: g.gameType,
                thumbnail: toThumb(g?.customConfig?.parameters),
                customConfig: g.customConfig,
            })),
        }));
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, jwt_auth_guard_1.Public)(),
    (0, common_1.Get)('sections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getSections", null);
__decorate([
    (0, jwt_auth_guard_1.Public)(),
    (0, common_1.Post)('custom-games'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getCustomGames", null);
__decorate([
    (0, jwt_auth_guard_1.Public)(),
    (0, common_1.Get)('sections-with-games'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getSectionsWithGames", null);
exports.ContentController = ContentController = __decorate([
    (0, common_1.Controller)('content'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentController);
//# sourceMappingURL=content.controller.js.map