import { ComponentType, lazy, type LazyExoticComponent } from 'react';
import { AppGameName } from '@/chains/types';

type GameComponent = LazyExoticComponent<ComponentType<{ config: Record<string, any> }>>;

export interface RegisteredGame {
  key: AppGameName;
  title: string;
  description?: string;
  component: GameComponent;
  tags?: string[];
}

const stubs = {
  CoinFlip: lazy(() => import('./stubs/CoinFlipGame')),
  Crash: lazy(() => import('./stubs/CrashGame')),
  Roulette: lazy(() => import('./stubs/RouletteGame')),
  Plinko: lazy(() => import('./stubs/PlinkoGame')),
  Slots: lazy(() => import('./stubs/SlotsGame')),
  Bombs: lazy(() => import('./stubs/BombsGame')),
  RPS: lazy(() => import('./stubs/RPSGame')),
  Cards: lazy(() => import('./stubs/CardsGame')),
  CryptoLaunch: lazy(() => import('./stubs/CryptoLaunchGame')),
};

export const GameRegistry: Record<AppGameName, RegisteredGame> = {
  [AppGameName.Dice]: {
    key: AppGameName.Dice,
    title: 'Dice',
    description: 'Classic over/under dice betting with instant rolls.',
    component: lazy(() => import('./dice/DiceGame')),
    tags: ['live', 'featured'],
  },
  [AppGameName.Roulette]: {
    key: AppGameName.Roulette,
    title: 'Roulette',
    description: 'Spin the wheel and pick your lucky number.',
    component: stubs.Roulette,
  },
  [AppGameName.Plinko]: {
    key: AppGameName.Plinko,
    title: 'Plinko',
    description: 'Drop balls through pegs, chase multiplier pockets.',
    component: stubs.Plinko,
  },
  [AppGameName.CoinFlip]: {
    key: AppGameName.CoinFlip,
    title: 'Coin Flip',
    description: '50/50 fortunes with configurable odds.',
    component: stubs.CoinFlip,
  },
  [AppGameName.Crash]: {
    key: AppGameName.Crash,
    title: 'Crash',
    description: 'Ride the multiplier rocket and bail out in time.',
    component: stubs.Crash,
  },
  [AppGameName.Slots_1]: {
    key: AppGameName.Slots_1,
    title: 'Slots',
    description: 'High-volatility reels with configurable themes.',
    component: stubs.Slots,
  },
  [AppGameName.Bombs]: {
    key: AppGameName.Bombs,
    title: 'Bombs',
    description: 'Grid-based risk and reward mini-game.',
    component: stubs.Bombs,
  },
  [AppGameName.RPS]: {
    key: AppGameName.RPS,
    title: 'Rock Paper Scissors',
    description: 'Beat the house with timeless hand signs.',
    component: stubs.RPS,
  },
  [AppGameName.Cards_1]: {
    key: AppGameName.Cards_1,
    title: 'Cards',
    description: 'Card mini-games placeholder.',
    component: stubs.Cards,
  },
  [AppGameName.CryptoLaunch_1]: {
    key: AppGameName.CryptoLaunch_1,
    title: 'Crypto Launch',
    description: 'A rocket-style crash variant.',
    component: stubs.CryptoLaunch,
  },
};

export const supportedGameTypes = Object.keys(GameRegistry) as AppGameName[];

export const getRegisteredGame = (type?: string | null): RegisteredGame | undefined => {
  if (!type) return undefined;
  if ((type as AppGameName) in GameRegistry) {
    return GameRegistry[type as AppGameName];
  }

  const matched = supportedGameTypes.find((entry) => entry.toLowerCase() === type.toLowerCase());
  return matched ? GameRegistry[matched] : undefined;
};

