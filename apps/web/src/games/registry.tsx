import { lazy } from 'react';

// Lazy-loaded game components (stubs to be replaced with real imports)
// Example mapping keys should match backend Game.name values
export const GameRegistry: Record<string, any> = {
  dice: lazy(() => import('./dice/DiceGame')),
  roulette: lazy(() => import('./stubs/RouletteGame')),
  plinko: lazy(() => import('./stubs/PlinkoGame')),
  coinflip: lazy(() => import('./stubs/CoinFlipGame')),
  crash: lazy(() => import('./stubs/CrashGame')),
  slots: lazy(() => import('./stubs/SlotsGame')),
};


