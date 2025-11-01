import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Check } from 'lucide-react';

interface PoolForm {
  feePlayMul: string;
  feeLossMul: string;
  feeMintMul: string;
  feeHostPct: string;
  feePoolPct: string;
  probability: string;
  minLimitForTicket: string;
}

interface Props {
  publicKey?: string | null;
  casinoName: string;
  setCasinoName: (v: string) => void;
  shortDesc: string;
  setShortDesc: (v: string) => void;
  longDesc: string;
  setLongDesc: (v: string) => void;
  casinoStatus: string;
  setCasinoStatus: (v: string) => void;
  isSavingCasino: boolean;
  onSaveCasino: () => Promise<void> | void;
  registrationStatus: any;
  onRefreshRegistration: () => void;
  pools: any[];
  isCreating: boolean;
  isFetching: boolean;
  poolError?: string | null;
  poolForm: PoolForm;
  setPoolForm: (f: PoolForm) => void;
  showPoolForm: boolean;
  setShowPoolForm: (v: boolean) => void;
  poolAddress: string;
  fetchPools: () => void;
  onCreatePool: () => Promise<void> | void;
  onCancelCreatePool: () => void;
  onAssociatePool: (address: string) => Promise<void> | void;
}

export function AdminSettings(props: Props) {
  const {
    publicKey,
    casinoName, setCasinoName,
    shortDesc, setShortDesc,
    longDesc, setLongDesc,
    casinoStatus, setCasinoStatus,
    isSavingCasino, onSaveCasino,
    registrationStatus, onRefreshRegistration,
    pools, isCreating, isFetching,
    poolError, poolForm, setPoolForm,
    showPoolForm, setShowPoolForm,
    poolAddress, fetchPools, onCreatePool, onCancelCreatePool,
    onAssociatePool,
  } = props;

  return (
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
                You have admin privileges - {publicKey}
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
                metadata hub used by portals and players to find casinos.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onRefreshRegistration}>
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
          <p className="text-xs text-muted-foreground">This is displayed across the site</p>
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
            <Button variant="outline" size="sm" onClick={fetchPools} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh Pools
            </Button>
          </div>

          {/* RPC Notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
            <p className="text-blue-400 font-medium mb-1">ℹ️ Configure RPC Endpoint</p>
            <p className="text-xs text-muted-foreground">
              Set <code className="bg-background px-1 rounded">VITE_SOLANA_RPC_URL</code> in your .env to use a better RPC.
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
            <Button onClick={() => setShowPoolForm(true)} variant="default" className="w-full">
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
                    <Input id="feePlayMul" type="number" step="0.01" value={poolForm.feePlayMul} onChange={(e) => setPoolForm({ ...poolForm, feePlayMul: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feeLossMul">Fee Loss Mul</Label>
                    <Input id="feeLossMul" type="number" step="0.01" value={poolForm.feeLossMul} onChange={(e) => setPoolForm({ ...poolForm, feeLossMul: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feeMintMul">Fee Mint Mul</Label>
                    <Input id="feeMintMul" type="number" step="0.01" value={poolForm.feeMintMul} onChange={(e) => setPoolForm({ ...poolForm, feeMintMul: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feeHostPct">Fee Host %</Label>
                    <Input id="feeHostPct" type="number" step="0.01" max="1" value={poolForm.feeHostPct} onChange={(e) => setPoolForm({ ...poolForm, feeHostPct: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feePoolPct">Fee Pool %</Label>
                    <Input id="feePoolPct" type="number" step="0.01" max="1" value={poolForm.feePoolPct} onChange={(e) => setPoolForm({ ...poolForm, feePoolPct: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probability</Label>
                    <Input id="probability" type="number" step="0.01" max="1" value={poolForm.probability} onChange={(e) => setPoolForm({ ...poolForm, probability: e.target.value })} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="minLimit">Min Limit (FARE)</Label>
                    <Input id="minLimit" type="number" step="0.1" value={poolForm.minLimitForTicket} onChange={(e) => setPoolForm({ ...poolForm, minLimitForTicket: e.target.value })} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={onCreatePool} disabled={isCreating} className="flex-1">
                    {isCreating ? 'Creating Pool...' : 'Create Pool'}
                  </Button>
                  <Button onClick={onCancelCreatePool} variant="outline">
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
                  const isYours = pool.config.manager === publicKey;
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
                            <Button size="sm" onClick={() => onAssociatePool(pool.account)} className="shrink-0">
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

        <div className="flex justify-end pt-4">
          <Button onClick={onSaveCasino} disabled={isSavingCasino}>
            {isSavingCasino ? 'Saving...' : 'Save Casino Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


