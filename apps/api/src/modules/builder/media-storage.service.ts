import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

interface UploadResult {
  imageUrl: string;
  s3Key?: string;
}

@Injectable()
export class MediaStorageService {
  private readonly logger = new Logger(MediaStorageService.name);
  private s3: S3Client | null = null;
  private bucket: string | null = null;
  private cdnBaseUrl: string | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const bucket = this.config.get<string>('S3_BUCKET');
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    const region = this.config.get<string>('S3_REGION') || 'us-east-1';
    const accessKeyId = this.config.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('S3_SECRET_ACCESS_KEY');
    this.cdnBaseUrl = this.config.get<string>('S3_CDN_BASE_URL') || null; // optional CDN

    if (bucket && endpoint && accessKeyId && secretAccessKey) {
      this.bucket = bucket;
      this.s3 = new S3Client({
        region,
        endpoint,
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.logger.log('Media storage initialized with S3-compatible endpoint');
    } else {
      this.logger.warn('Media storage disabled: missing S3 configuration');
    }
  }

  get enabled(): boolean {
    return !!this.s3 && !!this.bucket;
  }

  private buildPublicUrl(key: string): string {
    if (this.cdnBaseUrl) {
      return `${this.cdnBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    // Fallback to path-style endpoint if CDN not configured
    const endpoint = this.config.get<string>('S3_ENDPOINT')!.replace(/\/$/, '');
    return `${endpoint}/${this.bucket}/${key}`;
  }

  async uploadFromUrl(sourceUrl: string, keyPrefix = 'generated'): Promise<UploadResult> {
    if (!this.enabled) {
      // Without S3, return the original URL
      return { imageUrl: sourceUrl };
    }

    const downloadWithRetry = async (attempts = 3): Promise<{ buffer: Buffer; contentType: string }> => {
      let lastErr: any = null;
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await fetch(sourceUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const contentType = res.headers.get('content-type') || 'image/png';
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          if (!buffer || buffer.length === 0) throw new Error('Empty image body');
          return { buffer, contentType };
        } catch (e) {
          lastErr = e;
          await new Promise(r => setTimeout(r, 250 * (i + 1)));
        }
      }
      throw new Error(`Failed to download image after retries: ${String(lastErr?.message || lastErr)}`);
    };

    const { buffer, contentType } = await downloadWithRetry();
    const key = `${keyPrefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}`;

    const uploadWithRetry = async (attempts = 3) => {
      let lastErr: any = null;
      for (let i = 0; i < attempts; i++) {
        try {
          await this.s3!.send(new PutObjectCommand({
            Bucket: this.bucket!,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ACL: 'public-read',
          }));
          return;
        } catch (e) {
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

  async recordGeneratedImage(params: {
    jobId?: string;
    elementJobId?: string;
    userAddress: string;
    prompt: string;
    imageUrl: string;
    s3Key?: string;
    metadata?: any;
  }) {
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
}


