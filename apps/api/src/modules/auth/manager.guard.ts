import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard to check if the authenticated user is the casino manager
 * Use this on admin-only endpoints
 */
@Injectable()
export class ManagerGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const managerAddress = this.configService.get<string>('SOLANA_OWNER_ADDRESS');
    
    if (user.walletAddress !== managerAddress) {
      throw new ForbiddenException('Manager access required');
    }

    return true;
  }
}

