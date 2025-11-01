import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class ContentController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSections(): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: string;
        layout: string;
        title: string;
        gameIds: string[];
        order: number;
    }[]>;
    getCustomGames(body: {
        ids: string[];
    }): Promise<({
        customConfig: {
            parameters: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        id: string;
        gameType: string;
        order: number;
    })[]>;
    getSectionsWithGames(): Promise<{
        id: string;
        title: string;
        layout: string;
        order: number;
        games: {
            id: any;
            name: any;
            description: any;
            gameType: any;
            thumbnail: string;
            customConfig: any;
        }[];
    }[]>;
}
