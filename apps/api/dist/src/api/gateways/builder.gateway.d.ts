import { Server, Socket } from 'socket.io';
export declare class BuilderGateway {
    server: Server;
    emitToJob(jobId: string, event: string, payload: any): void;
    emitToManager(managerAddress: string, event: string, payload: any): void;
    handleJoinJob(data: {
        jobId: string;
    }, client: Socket): void;
    handleJoinManager(data: {
        managerAddress: string;
    }, client: Socket): void;
}
