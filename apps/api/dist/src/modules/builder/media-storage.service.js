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
var MediaStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto_1 = require("crypto");
let MediaStorageService = MediaStorageService_1 = class MediaStorageService {
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.logger = new common_1.Logger(MediaStorageService_1.name);
        this.s3 = null;
        this.bucket = null;
        this.cdnBaseUrl = null;
        const bucket = this.config.get('S3_BUCKET');
        const endpoint = this.config.get('S3_ENDPOINT');
        const region = this.config.get('S3_REGION') || 'us-east-1';
        const accessKeyId = this.config.get('S3_ACCESS_KEY_ID');
        const secretAccessKey = this.config.get('S3_SECRET_ACCESS_KEY');
        this.cdnBaseUrl = this.config.get('S3_CDN_BASE_URL') || null;
        if (bucket && endpoint && accessKeyId && secretAccessKey) {
            this.bucket = bucket;
            this.s3 = new client_s3_1.S3Client({
                region,
                endpoint,
                forcePathStyle: true,
                credentials: { accessKeyId, secretAccessKey },
            });
            this.logger.log('Media storage initialized with S3-compatible endpoint');
        }
        else {
            this.logger.warn('Media storage disabled: missing S3 configuration');
        }
    }
    get enabled() {
        return !!this.s3 && !!this.bucket;
    }
    buildPublicUrl(key) {
        if (this.cdnBaseUrl) {
            return `${this.cdnBaseUrl.replace(/\/$/, '')}/${key}`;
        }
        const endpoint = this.config.get('S3_ENDPOINT').replace(/\/$/, '');
        return `${endpoint}/${this.bucket}/${key}`;
    }
    async uploadFromUrl(sourceUrl, keyPrefix = 'generated') {
        if (!this.enabled) {
            return { imageUrl: sourceUrl };
        }
        const downloadWithRetry = async (attempts = 3) => {
            let lastErr = null;
            for (let i = 0; i < attempts; i++) {
                try {
                    const res = await fetch(sourceUrl);
                    if (!res.ok)
                        throw new Error(`HTTP ${res.status}`);
                    const contentType = res.headers.get('content-type') || 'image/png';
                    const arrayBuffer = await res.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    if (!buffer || buffer.length === 0)
                        throw new Error('Empty image body');
                    return { buffer, contentType };
                }
                catch (e) {
                    lastErr = e;
                    await new Promise(r => setTimeout(r, 250 * (i + 1)));
                }
            }
            throw new Error(`Failed to download image after retries: ${String(lastErr?.message || lastErr)}`);
        };
        const { buffer, contentType } = await downloadWithRetry();
        const key = `${keyPrefix}/${new Date().toISOString().slice(0, 10)}/${(0, crypto_1.randomUUID)()}`;
        const uploadWithRetry = async (attempts = 3) => {
            let lastErr = null;
            for (let i = 0; i < attempts; i++) {
                try {
                    await this.s3.send(new client_s3_1.PutObjectCommand({
                        Bucket: this.bucket,
                        Key: key,
                        Body: buffer,
                        ContentType: contentType,
                        ACL: 'public-read',
                    }));
                    return;
                }
                catch (e) {
                    lastErr = e;
                    await new Promise(r => setTimeout(r, 300 * (i + 1)));
                }
            }
            throw new Error(`Failed to upload image after retries: ${String(lastErr?.message || lastErr)}`);
        };
        await uploadWithRetry();
        const url = this.buildPublicUrl(key);
        return { imageUrl: url, s3Key: key };
    }
    async recordGeneratedImage(params) {
        const { jobId, elementJobId, userAddress, prompt, imageUrl, s3Key, metadata } = params;
        return this.prisma.generatedImage.create({
            data: {
                jobId,
                elementJobId,
                userAddress,
                prompt,
                imageUrl,
                s3Key: s3Key || '',
                metadata: metadata || {},
            },
        });
    }
};
exports.MediaStorageService = MediaStorageService;
exports.MediaStorageService = MediaStorageService = MediaStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], MediaStorageService);
//# sourceMappingURL=media-storage.service.js.map