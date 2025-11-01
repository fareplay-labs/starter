import { Controller, Post, Get, Body, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService, LoginDto } from './auth.service';
import { JwtAuthGuard, Public } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Get a nonce message for signing
   * GET /api/auth/nonce?address=xxx
   */
  @Public()
  @Get('nonce')
  getNonce(@Query('address') address: string) {
    const message = this.authService.generateNonce(address);
    return { message };
  }

  /**
   * Login with wallet signature
   * POST /api/auth/login
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Get current user (requires JWT)
   * GET /api/auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return {
      id: req.user.id,
      address: req.user.walletAddress,
      username: req.user.username,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
      totalBets: req.user.totalBets,
      totalWins: req.user.totalWins,
      totalLosses: req.user.totalLosses,
      totalWagered: req.user.totalWagered,
      totalPayout: req.user.totalPayout,
      createdAt: req.user.createdAt,
      lastSeenAt: req.user.lastSeenAt,
    };
  }

  /**
   * Update user profile (requires JWT)
   * PATCH /api/auth/profile
   */
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() updateData: { username?: string; email?: string; avatarUrl?: string },
  ) {
    return this.authService.updateProfile(req.user.walletAddress, updateData);
  }

  /**
   * Check if current user is casino manager (requires JWT)
   * GET /api/auth/is-manager
   */
  @UseGuards(JwtAuthGuard)
  @Get('is-manager')
  isManager(@Request() req) {
    const managerAddress = process.env.SOLANA_OWNER_ADDRESS;
    const isManager = req.user.walletAddress === managerAddress;
    return { isManager };
  }

  /**
   * Refresh token (requires JWT)
   * POST /api/auth/refresh
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    // Issue a new token
    return this.authService.login({
      address: req.user.walletAddress,
      signature: '', // Not needed for refresh
      message: '', // Not needed for refresh
    });
  }
}

