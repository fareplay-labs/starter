import { Module } from '@nestjs/common';
import { SolanaParserService } from './solana-parser.service';

@Module({
  providers: [SolanaParserService],
  exports: [SolanaParserService],
})
export class SolanaModule {}

