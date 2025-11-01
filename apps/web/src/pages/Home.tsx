import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { StatsCard } from '@/components/StatsCard';
import { useGameWebSocket } from '@/contexts/WebSocketContext';
import { useEffect, useState } from 'react';
import type { Trial } from '@fare-casino/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const [recentTrials, setRecentTrials] = useState<Trial[]>([]);
  const navigate = useNavigate();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['globalStats'],
    queryFn: () => api.getGlobalStats(),
  });

  const { data: sections } = useQuery({
    queryKey: ['sectionsWithGames'],
    queryFn: () => api.getSectionsWithGames(),
  });

  const { trialRegistered, trialResolved, connected } = useGameWebSocket();

  useEffect(() => {
    if (trialRegistered) {
      setRecentTrials((prev) => [trialRegistered, ...prev].slice(0, 10));
    }
  }, [trialRegistered]);

  useEffect(() => {
    if (trialResolved) {
      setRecentTrials((prev) =>
        prev.map((t) => (t.trialId === trialResolved.trialId ? trialResolved : t))
      );
    }
  }, [trialResolved]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin-slow text-6xl mb-4">🎰</div>
          <p className="text-muted-foreground">Loading casino...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to <span className="text-primary">Fare Casino</span>
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Provably fair gaming on Solana
        </p>
        <Badge variant={connected ? 'default' : 'secondary'} className="gap-2">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`} />
          {connected ? 'Live' : 'Connecting...'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Wagered" value={stats ? `${(Number(stats.totalWagered) / 1e6).toFixed(2)} USDC` : '...'} icon="💰" />
        <StatsCard title="Total Payout" value={stats ? `${(Number(stats.totalPayout) / 1e6).toFixed(2)} USDC` : '...'} icon="🎁" />
        <StatsCard title="Total Players" value={stats?.totalPlayers || 0} icon="👥" />
        <StatsCard title="House Edge" value={stats ? `${stats.houseEdge.toFixed(2)}%` : '...'} icon="🏠" />
      </div>

      {Array.isArray(sections) && sections.length > 0 && (
        <div className="space-y-6">
          {sections.map((section: any) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🎮</span> {section.title}
                </CardTitle>
                <CardDescription>Layout: {section.layout}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={section.layout === 'carousel' ? 'grid grid-flow-col auto-cols-[220px] gap-3 overflow-x-auto' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>
                  {(!section.games || section.games.length === 0) ? (
                    <p className="text-muted-foreground text-sm">No games in this section.</p>
                  ) : (
                    section.games.map((g: any) => (
                      <Card key={g.id} onClick={() => navigate(`/game/${g.id}`)} className="hover:border-primary transition-all cursor-pointer">
                        <CardContent className="pt-4">
                          {g.thumbnail ? (
                            <img src={g.thumbnail} alt={g.name} className="h-24 w-full object-cover rounded mb-3" />
                          ) : (
                            <div className="text-4xl mb-3">{gameEmoji(g.gameType)}</div>
                          )}
                          <h3 className="text-xl font-bold mb-1">{g.name}</h3>
                          <p className="text-muted-foreground text-sm">{g.description || g.gameType}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span> Recent Activity
          </CardTitle>
          <CardDescription>Latest game results from the casino</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTrials.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No recent activity. Connect your wallet to start playing!
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {recentTrials.map((trial) => (
                <Card key={trial.trialId}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">
                        {trial.trialId.slice(0, 8)}...{trial.trialId.slice(-6)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(trial.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {(Number(trial.multiplier) / 1e6).toFixed(2)} USDC
                      </p>
                      <Badge variant={trial.resolved ? (trial.deltaAmount && Number(trial.deltaAmount) > 0 ? 'default' : 'destructive') : 'secondary'} className="mt-1">
                        {trial.resolved ? (trial.deltaAmount && Number(trial.deltaAmount) > 0 ? `+${(Number(trial.deltaAmount) / 1e6).toFixed(2)} USDC` : `${(Number(trial.deltaAmount || 0) / 1e6).toFixed(2)} USDC`) : 'Pending...'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function gameEmoji(gameType: string): string {
  switch (gameType) {
    case 'dice': return '🎲';
    case 'coinflip': return '🪙';
    case 'slots': return '🎰';
    case 'bombs': return '💣';
    case 'roulette': return '🎡';
    case 'crash': return '🚀';
    case 'plinko': return '🟣';
    case 'cards': return '🃏';
    case 'cryptolaunch': return '📈';
    case 'rps': return '✊';
    default: return '🎮';
  }
}
