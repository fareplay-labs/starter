import { Module } from '@nestjs/common';
import { HeartbeatService } from './heartbeat.service';
import { PrismaModule } from '@/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [HeartbeatService],
  exports: [HeartbeatService],
})
export class HeartbeatModule {}

