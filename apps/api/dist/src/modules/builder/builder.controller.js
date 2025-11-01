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
exports.BuilderController = void 0;
const common_1 = require("@nestjs/common");
const builder_service_1 = require("./builder.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const manager_guard_1 = require("../auth/manager.guard");
let BuilderController = class BuilderController {
    constructor(builderService) {
        this.builderService = builderService;
    }
    async createDesignJob(body) {
        return this.builderService.createDesignJob(body.casinoName, body.prompt, body.options);
    }
    async createElementJob(body) {
        return this.builderService.createElementJob(body.gameType, body.prompt, body.parameterId, body.options);
    }
    async listJobs(type, limit = '20', offset = '0') {
        return this.builderService.listJobs(type, parseInt(limit, 10), parseInt(offset, 10));
    }
    async getJob(id) {
        return this.builderService.getJob(id);
    }
    async applyDesign(jobId) {
        return this.builderService.applyDesign(jobId);
    }
};
exports.BuilderController = BuilderController;
__decorate([
    (0, common_1.Post)('design'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BuilderController.prototype, "createDesignJob", null);
__decorate([
    (0, common_1.Post)('element'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BuilderController.prototype, "createElementJob", null);
__decorate([
    (0, common_1.Get)('jobs'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BuilderController.prototype, "listJobs", null);
__decorate([
    (0, common_1.Get)('job/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BuilderController.prototype, "getJob", null);
__decorate([
    (0, common_1.Post)('apply-design/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BuilderController.prototype, "applyDesign", null);
exports.BuilderController = BuilderController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, manager_guard_1.ManagerGuard),
    (0, common_1.Controller)('builder'),
    __metadata("design:paramtypes", [builder_service_1.BuilderService])
], BuilderController);
//# sourceMappingURL=builder.controller.js.map