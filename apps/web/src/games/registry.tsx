import { ComponentType, lazy, type LazyExoticComponent } from 'react';
import { AppGameName } from '@/chains/types';
import { DICE_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Dice/types';
import { ROULETTE_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Roulette/types';
import { PLINKO_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Plinko/types';
import { COINFLIP_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/CoinFlip/types';
import { CRASH_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Crash/types';
import { SLOTS_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Slots/types';
import { BOMBS_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Bombs/types';
import { RPS_CONFIG } from '@/components/CustomUserCasinos/CustomGames/RPS/types';
import { CARDS_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Cards/types';
import { CRYPTO_LAUNCH_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/CryptoLaunch/types';

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
    title: DICE_GAME_INFO.name,
    description: DICE_GAME_INFO.description,
    component: lazy(() => import('./dice/DiceGame')),
    tags: ['live', 'featured'],
  },
  [AppGameName.Roulette]: {
    key: AppGameName.Roulette,
    title: ROULETTE_GAME_INFO.name,
    description: ROULETTE_GAME_INFO.description,
    component: stubs.Roulette,
  },
  [AppGameName.Plinko]: {
    key: AppGameName.Plinko,
    title: PLINKO_GAME_INFO.name,
    description: PLINKO_GAME_INFO.description,
    component: stubs.Plinko,
  },
  [AppGameName.CoinFlip]: {
    key: AppGameName.CoinFlip,
    title: COINFLIP_GAME_INFO.name,
    description: COINFLIP_GAME_INFO.description,
    component: stubs.CoinFlip,
  },
  [AppGameName.Crash]: {
    key: AppGameName.Crash,
    title: CRASH_GAME_INFO.name,
    description: CRASH_GAME_INFO.description,
    component: stubs.Crash,
  },
  [AppGameName.Slots_1]: {
    key: AppGameName.Slots_1,
    title: SLOTS_GAME_INFO.name,
    description: SLOTS_GAME_INFO.description,
    component: stubs.Slots,
  },
  [AppGameName.Bombs]: {
    key: AppGameName.Bombs,
    title: BOMBS_GAME_INFO.name,
    description: BOMBS_GAME_INFO.description,
    component: stubs.Bombs,
  },
  [AppGameName.RPS]: {
    key: AppGameName.RPS,
    title: RPS_CONFIG.name,
    description: RPS_CONFIG.description,
    component: stubs.RPS,
  },
  [AppGameName.Cards_1]: {
    key: AppGameName.Cards_1,
    title: CARDS_GAME_INFO.name,
    description: CARDS_GAME_INFO.description,
    component: stubs.Cards,
  },
  [AppGameName.CryptoLaunch_1]: {
    key: AppGameName.CryptoLaunch_1,
    title: CRYPTO_LAUNCH_GAME_INFO.name,
    description: CRYPTO_LAUNCH_GAME_INFO.description,
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
