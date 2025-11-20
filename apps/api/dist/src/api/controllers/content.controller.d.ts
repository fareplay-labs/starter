import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class ContentController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSections(): Promise<any>;
    getCustomGames(body: {
        ids: string[];
    }): Promise<any>;
    getSectionsWithGames(): Promise<any>;
}
