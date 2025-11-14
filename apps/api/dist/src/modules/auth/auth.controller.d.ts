import { AuthService, LoginDto } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getNonce(address: string): {
        message: string;
    };
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: any;
    }>;
    getProfile(req: any): {
        id: any;
        address: any;
        username: any;
        email: any;
        avatarUrl: any;
        totalBets: any;
        totalWins: any;
        totalLosses: any;
        totalWagered: any;
        totalPayout: any;
        createdAt: any;
        lastSeenAt: any;
    };
    updateProfile(req: any, updateData: {
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
    isManager(req: any): {
        isManager: boolean;
    };
    refresh(req: any): Promise<{
        accessToken: string;
        user: any;
    }>;
}
