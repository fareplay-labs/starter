import { StatsCard } from '../components/StatsCard';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function Home() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Casino Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Fare Casino</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Players"
          value={stats?.totalPlayers || 0}
          subtitle="Registered players"
        />
        <StatsCard
          title="Active Games"
          value={stats?.activeGames || 0}
          subtitle="Currently playing"
        />
        <StatsCard
          title="Total Wagered"
          value={`${(stats?.totalWagered || 0).toFixed(2)} SOL`}
          subtitle="All time volume"
        />
        <StatsCard
          title="House Edge"
          value={`${((stats?.houseEdge || 0) * 100).toFixed(2)}%`}
          subtitle="Platform advantage"
        />
      </div>
    </div>
  );
}
