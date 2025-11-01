import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 8080);
  const casinoName = configService.get('CASINO_NAME', 'Casino');

  // Enable CORS
  app.enableCors({
    origin: true, // Configure this properly in production
    credentials: true,
  });

  // Set global prefix for all REST routes
  app.setGlobalPrefix('api');

  // Start the application
  await app.listen(port, '0.0.0.0');

  logger.log(`🎰 ${casinoName} API Server running on http://0.0.0.0:${port}`);
  logger.log(`📡 WebSocket server running on ws://0.0.0.0:${port}/casino`);
  logger.log(`🏥 Health check: http://0.0.0.0:${port}/api/health`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
