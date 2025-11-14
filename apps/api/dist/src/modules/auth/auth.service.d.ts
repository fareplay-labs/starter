import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/modules/prisma/prisma.service';
export interface LoginDto {
    address: string;
    signature: string;
    message: string;
}
export interface JwtPayload {
    address: string;
    sub: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: any;
    }>;
    private verifySignature;
    validateUser(payload: JwtPayload): Promise<any>;
    updateProfile(walletAddress: string, updateData: {
        username?: string;
        email?: string;
        avatarUrl?: string;
    }): Promise<{
        id: any;
        address: any;
        username: any;
        email: any;
        avatarUrl: any;
        updatedAt: any;
    }>;
    generateNonce(address: string): string;
}
