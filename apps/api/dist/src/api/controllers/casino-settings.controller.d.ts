import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CasinoStatus } from '@prisma/client';
export declare class CasinoSettingsController {
    private readonly prisma;
    private readonly configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    getSettings(): Promise<any>;
    getRegistrationStatus(): Promise<{
        registered: boolean;
        reason: string;
        casinoId?: undefined;
        publicKey?: undefined;
        registeredAt?: undefined;
        status?: undefined;
    } | {
        registered: boolean;
        casinoId: any;
        publicKey: any;
        registeredAt: any;
        status: any;
        reason?: undefined;
    }>;
    updateSettings(updateData: {
        name?: string;
        shortDescription?: string;
        longDescription?: string;
        poolAddress?: string;
        logoUrl?: string;
        bannerUrl?: string;
        primaryColor?: string;
        theme?: any;
        status?: CasinoStatus;
        websiteUrl?: string;
        socialLinks?: any;
    }): Promise<any>;
}
