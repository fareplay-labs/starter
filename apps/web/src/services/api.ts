import type {
  PlayerStats,
  TrialPagination,
  GlobalStats,
  CasinoStats,
  PoolStats,
  HealthCheckResponse,
  CasinoPlayerStats,
  LoginRequest,
  LoginResponse,
  NonceResponse,
} from '@fare-casino/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Auth endpoints
  async getNonce(address: string): Promise<NonceResponse> {
    return this.fetch<NonceResponse>(`/auth/nonce?address=${address}`);
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await this.fetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    
    // Store token
    localStorage.setItem('authToken', response.accessToken);
    
    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
  }

  async getMe() {
    return this.fetch('/auth/me');
  }

  async updateProfile(data: { username?: string; email?: string }) {
    return this.fetch('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async isManager(): Promise<{ isManager: boolean }> {
    return this.fetch('/auth/is-manager');
  }

  // Casino settings endpoints
  async getCasinoSettings() {
    return this.fetch('/casino-settings');
  }

  async updateCasinoSettings(data: {
    name?: string;
    shortDescription?: string;
    longDescription?: string;
    poolAddress?: string;
    logoUrl?: string;
    bannerUrl?: string;
    primaryColor?: string;
    theme?: any;
    status?: string;
    websiteUrl?: string;
    socialLinks?: any;
  }) {
    return this.fetch('/casino-settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Registration status (manager-only)
  async getRegistrationStatus(): Promise<{
    registered: boolean;
    casinoId: string | null;
    publicKey: string | null;
    registeredAt: string | null;
    status: string;
  }> {
    return this.fetch('/casino-settings/registration-status');
  }

  // Player endpoints
  async getPlayer(address: string): Promise<PlayerStats> {
    return this.fetch<PlayerStats>(`/player/${address}`);
  }

  async getPlayerTrials(
    address: string,
    options?: { limit?: number; offset?: number; casinoId?: string }
  ): Promise<TrialPagination> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.casinoId) params.append('casinoId', options.casinoId);
    
    return this.fetch<TrialPagination>(`/player/${address}/trials?${params}`);
  }

  async getPlayerCasinoStats(address: string, casinoId: string): Promise<CasinoPlayerStats> {
    return this.fetch<CasinoPlayerStats>(`/player/${address}/casino/${casinoId}`);
  }

  // Stats endpoints
  async getGlobalStats(): Promise<GlobalStats> {
    return this.fetch<GlobalStats>('/stats');
  }

  async getCasinoStats(casinoId: string): Promise<CasinoStats> {
    return this.fetch<CasinoStats>(`/stats/casino/${casinoId}`);
  }

  async getPoolStats(poolAddress: string): Promise<PoolStats> {
    return this.fetch<PoolStats>(`/stats/pool/${poolAddress}`);
  }

  // Health endpoint
  async getHealth(): Promise<HealthCheckResponse> {
    return this.fetch<HealthCheckResponse>('/health');
  }

  // --- AI Builder ---
  async createDesignJob(payload: { casinoName: string; prompt: string; options?: any }) {
    return this.fetch('/builder/design', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createElementJob(payload: { gameType: string; prompt: string; parameterId?: string; options?: any }) {
    return this.fetch('/builder/element', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getBuilderJobs(params?: { type?: 'design' | 'element'; limit?: number; offset?: number }) {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.fetch(`/builder/jobs${suffix}`);
  }

  async getBuilderJob(id: string) {
    return this.fetch(`/builder/job/${id}`);
  }

  async applyDesign(jobId: string) {
    return this.fetch(`/builder/apply-design/${jobId}`, { method: 'POST' });
  }

  // --- Homepage content ---
  async getSections(): Promise<Array<{ id: string; title: string; layout: string; order: number; gameIds: string[] }>> {
    return this.fetch('/content/sections');
  }

  async getCustomGamesByIds(ids: string[]): Promise<Array<{ id: string; name: string; gameType: string; customConfig?: { parameters: any } }>> {
    return this.fetch('/content/custom-games', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async getSectionsWithGames(): Promise<Array<{ id: string; title: string; layout: string; order: number; games: any[] }>> {
    return this.fetch('/content/sections-with-games');
  }
}

export const api = new ApiService();

