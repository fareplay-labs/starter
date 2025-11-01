import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './modules/prisma/prisma.module';
import { QueueModule } from './modules/queue/queue.module';
import { SolanaModule } from './modules/solana/solana.module';
import { BlockchainEventModule } from './modules/blockchain-event/blockchain-event.module';
import { EventInterpretationModule } from './modules/event-interpretation/event-interpretation.module';
import { GameModule } from './modules/game/game.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { HeartbeatModule } from './modules/heartbeat/heartbeat.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';

// API Controllers
import { PlayerController } from './api/controllers/player.controller';
import { StatsController } from './api/controllers/stats.controller';
import { HealthController } from './api/controllers/health.controller';
import { CasinoSettingsController } from './api/controllers/casino-settings.controller';

// WebSocket Gateway
import { GameGateway } from './api/gateways/game.gateway';
import { BuilderModule } from './modules/builder/builder.module';
import { BuilderGateway } from './api/gateways/builder.gateway';
import { ContentController } from './api/controllers/content.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    
    // Core modules
    PrismaModule,
    QueueModule,
    SolanaModule,
    AuthModule,
    ChatModule,
    HeartbeatModule,
    
    // Event processing modules
    BlockchainEventModule,
    EventInterpretationModule,
    GameModule,
    BuilderModule,
  ],
  controllers: [
    PlayerController,
    StatsController,
    HealthController,
    CasinoSettingsController,
    ContentController,
  ],
  providers: [
    GameGateway,
    BuilderGateway,
    // Apply JWT guard globally (can override with @Public decorator)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
