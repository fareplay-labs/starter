import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PublicKey } from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';
import { PrismaService } from '@/modules/prisma/prisma.service';

export interface LoginDto {
  address: string;
  signature: string;
  message: string;
}

export interface JwtPayload {
  address: string;
  sub: string; // user ID
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Verify wallet signature and issue JWT token
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: any }> {
    const { address, signature, message } = loginDto;

    // Verify the signature
    const isValid = this.verifySignature(address, signature, message);

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          walletAddress: address,
          lastSeenAt: new Date(),
        },
      });
      this.logger.log(`Created new user: ${address}`);
    } else {
      // Update last seen
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() },
      });
    }

    // Generate JWT token
    const payload: JwtPayload = {
      address: user.walletAddress,
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        address: user.walletAddress,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Verify Solana wallet signature
   */
  private verifySignature(
    address: string,
    signatureBase58: string,
    message: string,
  ): boolean {
    try {
      // Decode the public key
      const publicKey = new PublicKey(address);

      // Decode the signature from base58
      const signature = bs58.decode(signatureBase58);

      // Encode message to Uint8Array
      const messageBytes = new TextEncoder().encode(message);

      // Verify the signature
      return nacl.sign.detached.verify(
        messageBytes,
        signature,
        publicKey.toBytes(),
      );
    } catch (error) {
      this.logger.error(`Signature verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate JWT and return user
   */
  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    walletAddress: string,
    updateData: { username?: string; email?: string; avatarUrl?: string },
  ) {
    const user = await this.prisma.user.update({
      where: { walletAddress },
      data: updateData,
    });

    return {
      id: user.id,
      address: user.walletAddress,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Generate a nonce message for signing
   */
  generateNonce(address: string): string {
    const timestamp = Date.now();
    return `Sign this message to authenticate with Fare Casino.\n\nAddress: ${address}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
  }
}

