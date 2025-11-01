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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const web3_js_1 = require("@solana/web3.js");
const nacl = require("tweetnacl");
const bs58 = require("bs58");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(loginDto) {
        const { address, signature, message } = loginDto;
        const isValid = this.verifySignature(address, signature, message);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid signature');
        }
        let user = await this.prisma.user.findUnique({
            where: { walletAddress: address },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    walletAddress: address,
                    lastSeenAt: new Date(),
                },
            });
            this.logger.log(`Created new user: ${address}`);
        }
        else {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { lastSeenAt: new Date() },
            });
        }
        const payload = {
            address: user.walletAddress,
            sub: user.id,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: {
                id: user.id,
                address: user.walletAddress,
                username: user.username,
                avatarUrl: user.avatarUrl,
            },
        };
    }
    verifySignature(address, signatureBase58, message) {
        try {
            const publicKey = new web3_js_1.PublicKey(address);
            const signature = bs58.decode(signatureBase58);
            const messageBytes = new TextEncoder().encode(message);
            return nacl.sign.detached.verify(messageBytes, signature, publicKey.toBytes());
        }
        catch (error) {
            this.logger.error(`Signature verification failed: ${error.message}`);
            return false;
        }
    }
    async validateUser(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async updateProfile(walletAddress, updateData) {
        const user = await this.prisma.user.update({
            where: { walletAddress },
            data: updateData,
        });
        return {
            id: user.id,
            address: user.walletAddress,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            updatedAt: user.updatedAt,
        };
    }
    generateNonce(address) {
        const timestamp = Date.now();
        return `Sign this message to authenticate with Fare Casino.\n\nAddress: ${address}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map