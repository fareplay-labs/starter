import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { usePoolManager } from '@/hooks/usePoolManager';
import { RefreshCw, Check } from 'lucide-react';
import { BuilderPanel } from '@/components/settings/BuilderPanel';
import { useBuilder } from '@/hooks/useBuilder';
import { toast } from '@/components/ui/use-toast';

export function Settings() {
  const { publicKey } = useWallet();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCasino, setIsSavingCasino] = useState(false);

  // User profile form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // Casino settings form
  const [casinoName, setCasinoName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [poolAddress, setPoolAddress] = useState('');
  const [casinoStatus, setCasinoStatus] = useState('INACTIVE');

  // Pool creation form
  const [poolForm, setPoolForm] = useState({
    feePlayMul: '0.01',
    feeLossMul: '0.01',
    feeMintMul: '0.01',
    feeHostPct: '0.50',
    feePoolPct: '0.20',
    probability: '0.01',
    minLimitForTicket: '1.0',
  });
  const [showPoolForm, setShowPoolForm] = useState(false);

  // Check if user is casino manager (secure backend check)
  const { data: managerCheck } = useQuery({
    queryKey: ['isManager'],
    queryFn: () => api.isManager(),
    enabled: isAuthenticated,
  });
  const isManager = managerCheck?.isManager ?? false;

  // --- AI Builder state ---
  const [designPrompt, setDesignPrompt] = useState('Design a fun underwater deep sea casino theme with bioluminescent neon blues and teals, coral textures, and playful sea creature motifs. Provide cohesive colors, typography, and branding.');
  const [creatingDesign, setCreatingDesign] = useState(false);
  const {
    jobs,
    selectedJob,
    showModal: showDesignModal,
    progress: designProgress,
    step: designStep,
    logs: designLogs,
    elapsedMs,
    stepOrder,
    previewColors,
    previewFont,
    previewBanner,
    previewLogo,
    previewSections,
    previewGames,
    refreshJobs,
    setShowModal: setShowDesignModal,
    setLogs: setDesignLogs,
    createDesign,
    viewJob,
    formatElapsed,
  } = useBuilder(isManager);

  // Pool manager hook
  const { pools, isCreating, isFetching, error: poolError, createPool, fetchPools, clearError } = usePoolManager();

  // Fetch casino settings
  const { data: casinoSettings } = useQuery({
    queryKey: ['casinoSettings'],
    queryFn: () => api.getCasinoSettings(),
    enabled: isManager,
  });

  // Registration status (manager-only)
  const { data: registrationStatus, refetch: refetchReg } = useQuery({
    queryKey: ['registrationStatus'],
    queryFn: () => api.getRegistrationStatus(),
    enabled: isManager,
  });

  // Update form when user loads
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Update form when casino settings load
  useEffect(() => {
    if (casinoSettings) {
      setCasinoName((casinoSettings as any).name || '');
      setShortDesc((casinoSettings as any).shortDescription || '');
      setLongDesc((casinoSettings as any).longDescription || '');
      setPoolAddress((casinoSettings as any).poolAddress || '');
      setCasinoStatus((casinoSettings as any).status || 'INACTIVE');
    }
  }, [casinoSettings]);

  // (Builder socket and hydration are handled inside useBuilder)

  const handleCreateDesign = async () => {
    setCreatingDesign(true);
    try {
      await createDesign(casinoName || 'My Casino', designPrompt);
      toast.success('Design job created');
    } catch (e: any) {
      toast.error('Failed to create design job', { description: e.message });
    } finally {
      setCreatingDesign(false);
    }
  };

  // Don't auto-fetch pools to avoid RPC rate limits
  // Users can click "Refresh" button manually

  // Handler functions
  const handleSaveProfile = async () => {
    if (!publicKey) return;

    setIsSaving(true);
    try {
      await api.updateProfile({
        username: username.trim() || undefined,
        email: email.trim() || undefined,
      });
      toast.success('Profile updated');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCasinoSettings = async () => {
    setIsSavingCasino(true);
    try {
      await api.updateCasinoSettings({
        name: casinoName.trim() || undefined,
        shortDescription: shortDesc.trim() || undefined,
        longDescription: longDesc.trim() || undefined,
        poolAddress: poolAddress.trim() || undefined,
        status: casinoStatus,
      });
      queryClient.invalidateQueries({ queryKey: ['casinoSettings'] });
      toast.success('Casino settings updated');
    } catch (error: any) {
      console.error('Failed to update casino settings:', error);
      toast.error('Failed to update casino settings', { description: error.message });
    } finally {
      setIsSavingCasino(false);
    }
  };

  const handleCreatePool = async () => {
    try {
      const result = await createPool(poolForm);
      toast.success('Pool created', { description: `Address: ${result.poolAddress}` });
      setShowPoolForm(false);
      // Reset form
      setPoolForm({
        feePlayMul: '0.01',
        feeLossMul: '0.01',
        feeMintMul: '0.01',
        feeHostPct: '0.50',
        feePoolPct: '0.20',
        probability: '0.01',
        minLimitForTicket: '1.0',
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleAssociatePool = async (selectedPoolAddress: string) => {
    setPoolAddress(selectedPoolAddress);
    // Auto-save to backend
    try {
      await api.updateCasinoSettings({ poolAddress: selectedPoolAddress });
      queryClient.invalidateQueries({ queryKey: ['casinoSettings'] });
      toast.success('Pool associated', { description: selectedPoolAddress });
    } catch (error: any) {
      toast.error('Failed to associate pool', { description: error.message });
    }
  };

  // Early return if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Please connect your wallet and sign in to access settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">⚙️ Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">👤 Profile</TabsTrigger>
            {isManager && <TabsTrigger value="admin">🛡️ Admin</TabsTrigger>}
            {isManager && <TabsTrigger value="builder">🧪 AI Builder</TabsTrigger>}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Address (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <Input
                    id="wallet"
                    value={user?.address || publicKey?.toBase58()}
                    disabled
                    className="font-mono text-sm"
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be displayed in chat and leaderboards
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    For notifications and account recovery
                  </p>
                </div>

                <Separator />

                {/* Player Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">Total Bets</div>
                        <div className="text-2xl font-bold">{user?.totalBets || 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">Total Wins</div>
                        <div className="text-2xl font-bold text-green-500">{user?.totalWins || 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">Total Losses</div>
                        <div className="text-2xl font-bold text-red-500">{user?.totalLosses || 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                        <div className="text-2xl font-bold">
                          {user?.totalBets > 0
                            ? ((user.totalWins / user.totalBets) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          {isManager && (
            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🛡️ Casino Settings</CardTitle>
                  <CardDescription>Manage your casino configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Manager Badge */}
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <p className="font-medium text-yellow-500">Casino Manager Access</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          You have admin privileges - {publicKey?.toBase58()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Discovery Registration Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Discovery Registration</Label>
                        <div className="text-xs text-muted-foreground mt-1">
                          {registrationStatus?.registered ? (
                            <span className="text-green-500">Registered</span>
                          ) : (
                            <span className="text-yellow-500">Not Registered</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 max-w-prose">
                          Your casino registers with the FARE Discovery Service - a public registry and
                          metadata hub used by portals and players to find casinos. Registration publishes
                          your casino's name, URL, supported games, and other metadata so clients can verify and
                          surface your casino in listings.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => refetchReg()}>
                        Refresh
                      </Button>
                    </div>

                    {registrationStatus?.registered && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-muted/30 border border-border rounded p-3">
                          <div className="text-muted-foreground mb-1">Casino ID</div>
                          <div className="font-mono break-all">{registrationStatus.casinoId}</div>
                        </div>
                        <div className="bg-muted/30 border border-border rounded p-3">
                          <div className="text-muted-foreground mb-1">Public Key</div>
                          <div className="font-mono break-all">{registrationStatus.publicKey}</div>
                        </div>
                        <div className="bg-muted/30 border border-border rounded p-3">
                          <div className="text-muted-foreground mb-1">Registered At</div>
                          <div>{registrationStatus.registeredAt ? new Date(registrationStatus.registeredAt).toLocaleString() : '—'}</div>
                        </div>
                        <div className="bg-muted/30 border border-border rounded p-3">
                          <div className="text-muted-foreground mb-1">Status</div>
                          <div>{registrationStatus.status}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Casino Name */}
                  <div className="space-y-2">
                    <Label htmlFor="casinoName">Casino Name</Label>
                    <Input
                      id="casinoName"
                      value={casinoName}
                      onChange={(e) => setCasinoName(e.target.value)}
                      placeholder="My Awesome Casino"
                    />
                    <p className="text-xs text-muted-foreground">
                      This is displayed across the site
                    </p>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-2">
                    <Label htmlFor="shortDesc">Short Description</Label>
                    <Input
                      id="shortDesc"
                      value={shortDesc}
                      onChange={(e) => setShortDesc(e.target.value)}
                      placeholder="A brief description of your casino"
                    />
                  </div>

                  {/* Long Description */}
                  <div className="space-y-2">
                    <Label htmlFor="longDesc">Long Description</Label>
                    <textarea
                      id="longDesc"
                      value={longDesc}
                      onChange={(e) => setLongDesc(e.target.value)}
                      placeholder="Detailed description of your casino..."
                      rows={4}
                      className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <Separator />

                  {/* Pool Management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Solana Pool</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {poolAddress ? '✅ Pool configured' : '⚠️ No pool - required to process games'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchPools()}
                        disabled={isFetching}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                        Refresh Pools
                      </Button>
                    </div>

                    {/* RPC Notice */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                      <p className="text-blue-400 font-medium mb-1">ℹ️ Configure RPC Endpoint</p>
                      <p className="text-xs text-muted-foreground">
                        Set <code className="bg-background px-1 rounded">VITE_SOLANA_RPC_URL</code> in your .env to use a better RPC (e.g., Helius, QuickNode).
                        Public RPCs have rate limits.
                      </p>
                    </div>

                    {/* Pool Error */}
                    {poolError && (
                      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                        {poolError}
                      </div>
                    )}

                    {/* Current Pool */}
                    {poolAddress && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Current Pool:</p>
                        <p className="font-mono text-sm text-green-500">{poolAddress}</p>
                      </div>
                    )}

                    {/* Create New Pool Button */}
                    {!showPoolForm && (
                      <Button
                        onClick={() => setShowPoolForm(true)}
                        variant="default"
                        className="w-full"
                      >
                        + Create New Pool
                      </Button>
                    )}

                    {/* Pool Creation Form */}
                    {showPoolForm && (
                      <Card className="border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-base">Create New Pool</CardTitle>
                          <CardDescription>Configure your pool parameters</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {poolError && (
                            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                              {poolError}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="feePlayMul">Fee Play Mul</Label>
                              <Input
                                id="feePlayMul"
                                type="number"
                                step="0.01"
                                value={poolForm.feePlayMul}
                                onChange={(e) => setPoolForm({ ...poolForm, feePlayMul: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="feeLossMul">Fee Loss Mul</Label>
                              <Input
                                id="feeLossMul"
                                type="number"
                                step="0.01"
                                value={poolForm.feeLossMul}
                                onChange={(e) => setPoolForm({ ...poolForm, feeLossMul: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="feeMintMul">Fee Mint Mul</Label>
                              <Input
                                id="feeMintMul"
                                type="number"
                                step="0.01"
                                value={poolForm.feeMintMul}
                                onChange={(e) => setPoolForm({ ...poolForm, feeMintMul: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="feeHostPct">Fee Host %</Label>
                              <Input
                                id="feeHostPct"
                                type="number"
                                step="0.01"
                                max="1"
                                value={poolForm.feeHostPct}
                                onChange={(e) => setPoolForm({ ...poolForm, feeHostPct: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="feePoolPct">Fee Pool %</Label>
                              <Input
                                id="feePoolPct"
                                type="number"
                                step="0.01"
                                max="1"
                                value={poolForm.feePoolPct}
                                onChange={(e) => setPoolForm({ ...poolForm, feePoolPct: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="probability">Probability</Label>
                              <Input
                                id="probability"
                                type="number"
                                step="0.01"
                                max="1"
                                value={poolForm.probability}
                                onChange={(e) => setPoolForm({ ...poolForm, probability: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2 col-span-2">
                              <Label htmlFor="minLimit">Min Limit (FARE)</Label>
                              <Input
                                id="minLimit"
                                type="number"
                                step="0.1"
                                value={poolForm.minLimitForTicket}
                                onChange={(e) => setPoolForm({ ...poolForm, minLimitForTicket: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleCreatePool} disabled={isCreating} className="flex-1">
                              {isCreating ? 'Creating Pool...' : 'Create Pool'}
                            </Button>
                            <Button onClick={() => { setShowPoolForm(false); clearError(); }} variant="outline">
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Registered Pools List */}
                    {pools.length > 0 && (
                      <div className="space-y-2">
                        <Label>Available Pools ({pools.length})</Label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {pools.map((pool) => {
                            const isActive = pool.account === poolAddress;
                            const isYours = pool.config.manager === publicKey?.toBase58();
                            
                            return (
                              <Card key={pool.account} className={isActive ? 'border-primary' : ''}>
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-mono text-xs truncate">{pool.account}</p>
                                        {isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                                        {isYours && <Badge variant="secondary" className="text-xs">Yours</Badge>}
                                      </div>
                                      <div className="text-xs text-muted-foreground space-y-0.5">
                                        <p>Probability: {(pool.config.probability * 100).toFixed(2)}%</p>
                                        <p>Host Fee: {(pool.config.feeHostPct * 100).toFixed(1)}% | Pool Fee: {(pool.config.feePoolPct * 100).toFixed(1)}%</p>
                                      </div>
                                    </div>
                                    {!isActive && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleAssociatePool(pool.account)}
                                        className="shrink-0"
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        Use
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Casino Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Casino Status</Label>
                    <select
                      id="status"
                      value={casinoStatus}
                      onChange={(e) => setCasinoStatus(e.target.value)}
                      className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="ACTIVE">🟢 Active</option>
                      <option value="INACTIVE">⚪ Inactive</option>
                      <option value="MAINTENANCE">🔧 Maintenance</option>
                      <option value="SUSPENDED">🔴 Suspended</option>
                    </select>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveCasinoSettings} disabled={isSavingCasino}>
                      {isSavingCasino ? 'Saving...' : 'Save Casino Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* AI Builder Tab */}
          {isManager && (
            <TabsContent value="builder" className="space-y-6">
              <BuilderPanel
                isManager={isManager}
                designPrompt={designPrompt}
                setDesignPrompt={setDesignPrompt}
                creatingDesign={creatingDesign}
                onCreateDesign={handleCreateDesign}
                refreshJobs={refreshJobs}
                jobs={jobs}
                selectedJob={selectedJob}
                viewJob={viewJob}
                showDesignModal={showDesignModal}
                setShowDesignModal={setShowDesignModal}
                designProgress={designProgress}
                designStep={designStep}
                designLogs={designLogs}
                elapsedLabel={formatElapsed(elapsedMs)}
                stepOrder={stepOrder}
                previewColors={previewColors}
                previewFont={previewFont}
                previewBanner={previewBanner}
                previewLogo={previewLogo}
                previewSections={previewSections}
                previewGames={previewGames}
                onApplyTheme={async (jobId: string) => { await api.applyDesign(jobId); toast.success('Design applied to casino settings'); }}
                onClearLog={() => setDesignLogs([])}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
