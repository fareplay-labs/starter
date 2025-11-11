import { Suspense, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameRegistry, getRegisteredGame, supportedGameTypes } from '@/games/registry';
import type { CustomCasinoGame } from '@/components/CustomUserCasinos/shared/types';

type PlayRouteState = {
  game?: CustomCasinoGame;
};

export function Game() {
  const { id, gameType } = useParams<{ id?: string; gameType?: string }>();
  const location = useLocation();
  const state = (location.state as PlayRouteState | null) || null;
  const registryEntry = useMemo(() => getRegisteredGame(gameType), [gameType]);
  const ids = useMemo(() => (id ? [id] : []), [id]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['customGame', id],
    queryFn: () => api.getCustomGamesByIds(ids),
    enabled: Boolean(id),
  });

  const game = Array.isArray(data) && data.length > 0 ? data[0] : null;

  if (gameType) {
    if (!registryEntry) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          We don&apos;t have a renderer for <span className="font-semibold">{gameType}</span> yet.
          <div className="mt-2 text-sm">
            Supported games:{' '}
            {supportedGameTypes
              .map((type) => GameRegistry[type].title)
              .join(', ')}
          </div>
        </div>
      );
    }

    const GameComponent = registryEntry.component;
    const config = state?.game?.config ?? {};
    const title = state?.game?.name ?? registryEntry.title;

    return (
      <div className="container mx-auto py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Type: {registryEntry.key}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading game UI...</div>}>
              <GameComponent config={config} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    );
  }

  const params = game?.customConfig?.parameters || {};
  const GameComponent = game?.gameType ? GameRegistry[game.gameType as keyof typeof GameRegistry]?.component : undefined;

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
