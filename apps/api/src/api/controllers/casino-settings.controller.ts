import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FareDiscoveryClient, createSignedPayload } from '@fareplay/sdk';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { ManagerGuard } from '@/modules/auth/manager.guard';
import { Public } from '@/modules/auth/jwt-auth.guard';
import { CasinoStatus } from '@prisma/client';

@Controller('casino-settings')
export class CasinoSettingsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get casino settings
   * GET /api/casino-settings
   */
  @Public()
  @Get()
  async getSettings() {
    let settings = await this.prisma.casinoSettings.findUnique({
      where: { id: 'singleton' },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.prisma.casinoSettings.create({
        data: {
          id: 'singleton',
        },
      });
    }

    return settings;
  }

  /**
   * Get discovery registration status (manager-only)
   * GET /api/casino-settings/registration-status
   */
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Get('registration-status')
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
      registered: Boolean(
        settings.registeredCasinoId && settings.registeredPublicKey,
      ),
      casinoId: settings.registeredCasinoId || null,
      publicKey: settings.registeredPublicKey || null,
      registeredAt: settings.registeredAt || null,
      status: settings.status,
    };
  }

  /**
   * Update casino settings (requires manager access)
   * PATCH /api/casino-settings
   */
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Patch()
  async updateSettings(
    @Body()
    updateData: {
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
    },
  ) {
    // Ensure settings exist
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

    // Update settings
    const updated = await this.prisma.casinoSettings.update({
      where: { id: 'singleton' },
      data: updateData,
    });

    // Attempt to sync updated metadata to Discovery Service if registered
    try {
      if (updated.registeredCasinoId) {
        const baseUrl = 'https://api.discover.fareplay.io';
        const client = new FareDiscoveryClient({ baseUrl });
        const privateKey = this.configService.get<string>(
          'HEARTBEAT_PRIVATE_KEY',
        );
        if (privateKey) {
          // Compose metadata
          const games = await this.prisma.game.findMany({
            select: { name: true },
          });
          const gameNames = Array.isArray(games)
            ? games.map((g: any) => g.name)
            : [];

          const metadata: any = {
            games: gameNames,
            supportedTokens: ['SOL'],
          };
          const desc = updated.longDescription ?? updated.shortDescription;
          if (desc) metadata.description = desc;
          if (updated.logoUrl) metadata.logo = updated.logoUrl;
          if (updated.bannerUrl) metadata.banner = updated.bannerUrl;
          if (updated.socialLinks)
            metadata.socialLinks = updated.socialLinks as any;

          // Optional status mapping (omit if undesired)
          const statusMap: Record<
            string,
            'online' | 'offline' | 'maintenance' | 'suspended'
          > = {
            ACTIVE: 'online',
            INACTIVE: 'offline',
            MAINTENANCE: 'maintenance',
            SUSPENDED: 'suspended',
          };

          const request: any = {
            casinoId: updated.registeredCasinoId,
            name: updated.name ?? undefined,
            url: updated.websiteUrl ?? undefined,
            status: statusMap[updated.status] ?? undefined,
            metadata,
          };

          const signed = createSignedPayload(request, privateKey);
          await client.updateCasino(signed);
        }
      }
    } catch (err) {
      // Non-fatal: do not block settings update if registry sync fails
      // eslint-disable-next-line no-console
      console.warn('Discovery sync failed:', err);
    }

    return updated;
  }
}
