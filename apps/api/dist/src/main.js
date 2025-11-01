"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 8080);
    const casinoName = configService.get('CASINO_NAME', 'Casino');
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.setGlobalPrefix('api');
    await app.listen(port, '0.0.0.0');
    logger.log(`🎰 ${casinoName} API Server running on http://0.0.0.0:${port}`);
    logger.log(`📡 WebSocket server running on ws://0.0.0.0:${port}/casino`);
    logger.log(`🏥 Health check: http://0.0.0.0:${port}/api/health`);
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map