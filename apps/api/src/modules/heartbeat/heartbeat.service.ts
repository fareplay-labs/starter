import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { FareCasinoClient, FareDiscoveryClient, createSignedPayload, getKeypairFromPrivateKey } from '@fareplay/sdk';

@Injectable()
export class HeartbeatService implements OnModuleInit {
  private readonly logger = new Logger(HeartbeatService.name);
  private client: FareCasinoClient | null = null;
  private discoveryClient: FareDiscoveryClient | null = null;
  private casinoId: string | null = null;
  private enabled = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const baseUrl = 'https://api.discover.fareplay.io';
    const privateKey = this.configService.get<string>('HEARTBEAT_PRIVATE_KEY');

    if (!privateKey) {
      this.logger.warn('Heartbeat service disabled: Missing HEARTBEAT_PRIVATE_KEY');
      return;
    }

    try {
      // Initialize discovery client
      this.discoveryClient = new FareDiscoveryClient({ baseUrl });

      // Check if we're already registered
      let settings = await this.prisma.casinoSettings.findUnique({
        where: { id: 'singleton' },
      });

      if (!settings) {
        // Create default settings if none exist
        settings = await this.prisma.casinoSettings.create({
          data: { id: 'singleton' },
        });
      }

      // Register if not already registered
      if (!settings.registeredCasinoId || !settings.registeredPublicKey) {
        this.logger.log('Casino not registered with discovery service. Registering now...');
        await this.registerCasino(settings);
        
        // Reload settings after registration
        settings = await this.prisma.casinoSettings.findUnique({
          where: { id: 'singleton' },
        });
      } else {
        this.logger.log(`Casino already registered: ${settings.registeredCasinoId}`);
      }

      // Store casino ID for heartbeats
      this.casinoId = settings!.registeredCasinoId!;

      // Initialize heartbeat client
      this.client = new FareCasinoClient({
        baseUrl,
        casinoId: this.casinoId,
        privateKey,
      });

      this.enabled = true;
      this.logger.log('Heartbeat service initialized - Will ping discovery service every 15 minutes');

      // Send initial heartbeat on startup
      await this.sendHeartbeat();
    } catch (error) {
      this.logger.error('Failed to initialize Heartbeat service:', error);
      this.logger.warn('Heartbeat service will be disabled');
      this.enabled = false;
    }
  }

  /**
   * Send heartbeat every 15 minutes
   */
  @Cron('0 */15 * * * *') // Every 15 minutes
  async handleHeartbeat() {
    if (!this.enabled) return;
    await this.sendHeartbeat();
  }

  /**
   * Send heartbeat to discovery service
   */
  private async sendHeartbeat() {
    if (!this.client) {
      this.logger.warn('Client not initialized, skipping heartbeat');
      return;
    }

    try {
      // Get casino settings
      let settings = await this.prisma.casinoSettings.findUnique({
        where: { id: 'singleton' },
      });

      if (!settings) {
        settings = await this.prisma.casinoSettings.create({
          data: { id: 'singleton' },
        });
      }

      // Get global stats
      let stats = await this.prisma.globalStats.findUnique({
        where: { id: 'singleton' },
      });

      if (!stats) {
        stats = await this.prisma.globalStats.create({
          data: { id: 'singleton' },
        });
      }

      // Map casino status to SDK status type
      const statusMap: Record<string, 'online' | 'offline' | 'maintenance'> = {
        ACTIVE: 'online',
        INACTIVE: 'offline',
        MAINTENANCE: 'maintenance',
        SUSPENDED: 'offline',
      };

      const status = statusMap[settings.status] || 'offline';

      // Build metrics (omit responseTime if not measured)
      const metrics: any = {
        activePlayers: stats.totalPlayers,
        totalBets24h: stats.totalPlays,
        uptime: Math.floor(process.uptime()),
      };

      // Send heartbeat with metrics using SDK
      const response = await this.client.sendHeartbeatWithMetrics(status, metrics);

      this.logger.log(
        `✅ Heartbeat sent - Status: ${status}, Players: ${stats.totalPlayers}, Response: ${JSON.stringify(response)}`
      );
    } catch (error) {
      this.logger.error('❌ Failed to send heartbeat:', error);
    }
  }

  /**
   * Manual heartbeat trigger (can be called from API)
   */
  async triggerHeartbeat(): Promise<void> {
    this.logger.log('Manual heartbeat triggered');
    await this.sendHeartbeat();
  }

  /**
   * Register casino with discovery service
   */
  private async registerCasino(settings: any): Promise<void> {
    try {
      const privateKey = this.configService.get<string>('HEARTBEAT_PRIVATE_KEY')!;
      const { publicKey } = getKeypairFromPrivateKey(privateKey);

      // Fetch game names to include in metadata
      const games = await this.prisma.game.findMany({ select: { name: true } });
      const gameNames = Array.isArray(games) ? games.map((g: any) => g.name) : [];

      // Build metadata, omitting nulls (only include defined values)
      const metadata: any = {
        games: gameNames,
        supportedTokens: ['SOL'],
      };
      const desc = settings.longDescription ?? settings.shortDescription;
      if (desc) metadata.description = desc;
      if (settings.logoUrl) metadata.logo = settings.logoUrl;
      if (settings.bannerUrl) metadata.banner = settings.bannerUrl;
      if (settings.socialLinks) metadata.socialLinks = settings.socialLinks;

      // Build registration payload
      const registrationData = {
        name: settings.name || 'Unnamed Casino',
        url:
          settings.websiteUrl ||
          this.configService.get<string>('FRONTEND_URL') ||
          'https://example.com',
        publicKey,
        metadata,
      };

      this.logger.log(`Registering casino with discovery service: ${registrationData.name}`);

      // Sign and register
      const signedPayload = createSignedPayload(registrationData, privateKey);
      const registered = await this.discoveryClient!.registerCasino(signedPayload);

      // Save registration info to settings
      await this.prisma.casinoSettings.update({
        where: { id: 'singleton' },
        data: {
          registeredCasinoId: registered.id,
          registeredPublicKey: registered.publicKey,
          registeredAt: new Date(),
        },
      });

      this.logger.log(`✅ Casino registered successfully! ID: ${registered.id}`);
    } catch (error) {
      this.logger.error('Failed to register casino with discovery service:', error);
      throw error;
    }
  }
}

