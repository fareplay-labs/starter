import { BuilderService } from './builder.service';
export declare class BuilderController {
    private readonly builderService;
    constructor(builderService: BuilderService);
    createDesignJob(body: {
        casinoName: string;
        prompt: string;
        options?: any;
    }): Promise<any>;
    createElementJob(body: {
        gameType: string;
        prompt: string;
        parameterId?: string;
        options?: any;
    }): Promise<any>;
    listJobs(type?: 'design' | 'element', limit?: string, offset?: string): Promise<{
        rows: any;
        total: any;
        limit: number;
        offset: number;
    }>;
    getJob(id: string): Promise<any>;
    applyDesign(jobId: string): Promise<{
        applied: boolean;
        settings: any;
    }>;
}
