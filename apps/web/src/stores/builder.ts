import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { api } from '@/services/api';

type Log = { t: string; m: string };

type BuilderState = {
  socket: Socket | null;
  jobs: any[];
  selectedJob: any | null;
  showModal: boolean;
  progress: number;
  step: string;
  logs: Log[];
  elapsedMs: number;
  timerId: any;
  startTimeMs: number | null;
  // preview
  previewTheme: any | null;
  previewColors: string[];
  previewFont: string | null;
  previewBanner: string | null;
  previewLogo: string | null;
  previewSections: any[];
  previewGames: Record<string, { name: string; config: any }>;
  // actions
  connect: () => void;
  disconnect: () => void;
  refreshJobs: () => Promise<void>;
  setShowModal: (v: boolean) => void;
  setLogs: (logs: Log[]) => void;
  appendLog: (m: string) => void;
  setProgress: (p: number) => void;
  setStep: (s: string) => void;
  setSelectedJob: (j: any | null) => void;
  resetPreview: () => void;
  hydratePreviewFromJob: (jobData: any) => void;
  loadJobState: (jobOrId: any) => Promise<void>;
  attachJobListeners: (job: any) => void;
  startTimer: () => void;
  clearTimer: () => void;
  createDesign: (casinoName: string, prompt: string) => Promise<void>;
  viewJob: (job: any) => Promise<void>;
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  socket: null,
  jobs: [],
  selectedJob: null,
  showModal: false,
  progress: 0,
  step: 'queued',
  logs: [],
  elapsedMs: 0,
  timerId: null,
  startTimeMs: null,
  previewTheme: null,
  previewColors: [],
  previewFont: null,
  previewBanner: null,
  previewLogo: null,
  previewSections: [],
  previewGames: {},

  connect: () => {
    if (get().socket) return;
    const WS_URL = (import.meta as any).env.VITE_WS_URL || 'http://localhost:8080';
    const sock = io(`${WS_URL}/builder`, { transports: ['websocket'], reconnection: true });
    set({ socket: sock });
  },
  disconnect: () => {
    const sock = get().socket;
    if (!sock) return;
    try {
      sock.off('builder:jobStarted');
      sock.off('builder:jobProgress');
      sock.off('builder:jobSucceeded');
      sock.off('builder:jobFailed');
      sock.off('builder:preview');
      sock.disconnect();
    } catch {}
    get().clearTimer();
    set({ socket: null });
  },

  refreshJobs: async () => {
    try {
      const res: any = await api.getBuilderJobs({ type: 'design', limit: 20, offset: 0 });
      set({ jobs: res.rows || [] });
    } catch {}
  },
  setShowModal: (v) => set({ showModal: v }),
  setLogs: (logs) => set({ logs }),
  appendLog: (m) => set((s) => ({ logs: [...s.logs, { t: new Date().toLocaleTimeString(), m }] })),
  setProgress: (p) => set({ progress: p }),
  setStep: (s) => set({ step: s }),
  setSelectedJob: (j) => set({ selectedJob: j }),
  resetPreview: () => set({
    previewTheme: null,
    previewColors: [],
    previewFont: null,
    previewBanner: null,
    previewLogo: null,
    previewSections: [],
    previewGames: {},
  }),
  hydratePreviewFromJob: (jobData) => {
    const sr = jobData?.stepResults || {};
    const updates: Partial<BuilderState> = {};
    if (sr.theme) updates.previewTheme = sr.theme;
    if (sr.colors) {
      if (Array.isArray(sr.colors.selectedColors)) updates.previewColors = sr.colors.selectedColors;
      if (typeof sr.colors.selectedFont === 'string') updates.previewFont = sr.colors.selectedFont;
    }
    if (sr.gameContent && Array.isArray(sr.gameContent.gameSections)) updates.previewSections = sr.gameContent.gameSections;
    const res = jobData?.result || {};
    if (res.bannerImage) updates.previewBanner = res.bannerImage;
    if (res.profileImage) updates.previewLogo = res.profileImage;
    if (Array.isArray(res.games)) {
      const map: Record<string, { name: string; config: any }> = {};
      for (const g of res.games) {
        if (g?.type) map[g.type] = { name: g.name, config: g.config };
      }
      updates.previewGames = map;
    }
    set(updates as any);
  },
  loadJobState: async (jobOrId) => {
    try {
      const id = typeof jobOrId === 'string' ? jobOrId : jobOrId?.id;
      if (!id) return;
      const latest: any = await api.getBuilderJob(id);
      set({ selectedJob: latest, progress: latest?.progress ?? 0, step: latest?.currentStep || (latest?.status?.toLowerCase?.() || 'queued') });
      get().resetPreview();
      get().hydratePreviewFromJob(latest);
    } catch {}
  },
  attachJobListeners: (job) => {
    const sock = get().socket;
    if (!sock) return;
    sock.emit('joinJob', { jobId: job.id });
    sock.off('builder:jobStarted');
    sock.off('builder:jobProgress');
    sock.off('builder:jobSucceeded');
    sock.off('builder:jobFailed');
    sock.off('builder:preview');

    sock.on('builder:jobStarted', (msg: any) => {
      if (msg.jobId === job.id) {
        set((s) => ({ jobs: s.jobs.map(j => j.id === job.id ? { ...j, status: 'PROCESSING' } : j) }));
        set({ step: 'processing' });
        set((s) => ({ progress: Math.max(s.progress, 5) }));
        get().appendLog('Job started');
      }
    });
    sock.on('builder:jobProgress', (msg: any) => {
      if (msg.jobId === job.id) {
        set({ progress: msg.progress || 0, step: msg.step || 'working' });
        get().appendLog(`Progress ${msg.progress || 0}% - ${msg.step || ''}`.trim());
      }
    });
    sock.on('builder:jobSucceeded', (msg: any) => {
      if (msg.jobId === job.id) {
        set((s) => ({ jobs: s.jobs.map(j => j.id === job.id ? { ...j, status: 'COMPLETE', result: msg.result } : j) }));
        set((cur) => ({ selectedJob: cur.selectedJob && (cur.selectedJob as any).id === job.id ? { ...(cur.selectedJob as any), status: 'COMPLETE', result: msg.result } : cur.selectedJob }));
        set({ progress: 100, step: 'complete' });
        get().appendLog('Job completed successfully');
        get().clearTimer();
      }
    });
    sock.on('builder:jobFailed', (msg: any) => {
      if (msg.jobId === job.id) {
        set((s) => ({ jobs: s.jobs.map(j => j.id === job.id ? { ...j, status: 'ERROR', error: msg.error } : j) }));
        set({ step: 'error' });
        get().appendLog(`Job failed: ${msg.error || 'Unknown error'}`);
        get().clearTimer();
      }
    });
    sock.on('builder:preview', (msg: any) => {
      if (msg.jobId !== job.id) return;
      if (msg.theme) set({ previewTheme: msg.theme });
      if (Array.isArray(msg.colors)) set({ previewColors: msg.colors });
      if (typeof msg.font === 'string') set({ previewFont: msg.font });
      if (typeof msg.bannerImage === 'string') set({ previewBanner: msg.bannerImage });
      if (typeof msg.profileImage === 'string') set({ previewLogo: msg.profileImage });
      if (Array.isArray(msg.plannedSections)) set({ previewSections: msg.plannedSections });
      if (msg.game && msg.game.type) {
        set((s) => ({ previewGames: { ...s.previewGames, [msg.game.type]: { name: msg.game.name, config: msg.game.config } } }));
      }
    });
  },
  startTimer: () => {
    const existing = get().timerId;
    if (existing) {
      try { clearInterval(existing); } catch {}
    }
    const start = Date.now();
    set({ startTimeMs: start });
    const id = setInterval(() => {
      const st = get().startTimeMs;
      set((s) => ({ elapsedMs: st ? Date.now() - st : s.elapsedMs + 1000 }));
    }, 1000);
    set({ timerId: id });
  },
  clearTimer: () => {
    const id = get().timerId;
    if (id) {
      try { clearInterval(id); } catch {}
    }
    set({ timerId: null, startTimeMs: null });
  },
  createDesign: async (casinoName: string, prompt: string) => {
    set({ showModal: true, progress: 0, step: 'queued', logs: [] });
    const job: any = await api.createDesignJob({ casinoName, prompt });
    set((s) => ({ jobs: [job, ...s.jobs], selectedJob: job }));
    get().appendLog('Job created');
    get().resetPreview();
    get().startTimer();
    if (get().socket) get().attachJobListeners(job);
  },
  viewJob: async (job: any) => {
    set({ selectedJob: job, showModal: true, logs: [], progress: job.progress ?? (job.status === 'COMPLETE' ? 100 : 0), step: job.currentStep || job.status?.toLowerCase?.() || 'queued' });
    get().startTimer();
    if (get().socket) get().attachJobListeners(job);
    await get().loadJobState(job);
  },
}));


