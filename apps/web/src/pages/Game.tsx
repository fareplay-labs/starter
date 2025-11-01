import { useParams } from 'react-router-dom';
import { Suspense, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameRegistry } from '@/games/registry';

export function Game() {
  const { id } = useParams<{ id: string }>();

  const ids = useMemo(() => (id ? [id] : []), [id]);
  const { data, isLoading, error } = useQuery({
    queryKey: ['customGame', id],
    queryFn: () => api.getCustomGamesByIds(ids),
    enabled: Boolean(id),
  });

  const game = Array.isArray(data) && data.length > 0 ? data[0] : null;
  const params = game?.customConfig?.parameters || {};
  const GameComponent = game?.gameType ? GameRegistry[game.gameType] : undefined;

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading game...</div>;
  }
  if (error || !game) {
    return <div className="py-12 text-center text-destructive">Game not found.</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{game.name}</CardTitle>
          <CardDescription>Type: {game.gameType}</CardDescription>
        </CardHeader>
        <CardContent>
          {GameComponent ? (
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading game UI...</div>}>
              <GameComponent config={params} />
            </Suspense>
          ) : (
            <div className="text-sm text-muted-foreground">No renderer registered for this game type.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
