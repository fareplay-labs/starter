import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CasinoStatus } from '@prisma/client';
export declare class CasinoSettingsController {
    private readonly prisma;
    private readonly configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    getSettings(): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        poolAddress: string | null;
        id: string;
        shortDescription: string | null;
        longDescription: string | null;
        logoUrl: string | null;
        bannerUrl: string | null;
        primaryColor: string | null;
        theme: import("@prisma/client/runtime/library").JsonValue | null;
        status: import(".prisma/client").$Enums.CasinoStatus;
        websiteUrl: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        registeredCasinoId: string | null;
        registeredPublicKey: string | null;
        registeredAt: Date | null;
    }>;
    getRegistrationStatus(): Promise<{
        registered: boolean;
        reason: string;
        casinoId?: undefined;
        publicKey?: undefined;
        registeredAt?: undefined;
        status?: undefined;
    } | {
        registered: boolean;
        casinoId: string;
        publicKey: string;
        registeredAt: Date;
        status: import(".prisma/client").$Enums.CasinoStatus;
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
    }): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        poolAddress: string | null;
        id: string;
        shortDescription: string | null;
        longDescription: string | null;
        logoUrl: string | null;
        bannerUrl: string | null;
        primaryColor: string | null;
        theme: import("@prisma/client/runtime/library").JsonValue | null;
        status: import(".prisma/client").$Enums.CasinoStatus;
        websiteUrl: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        registeredCasinoId: string | null;
        registeredPublicKey: string | null;
        registeredAt: Date | null;
    }>;
}
