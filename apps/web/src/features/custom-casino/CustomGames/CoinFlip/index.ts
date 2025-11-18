// @ts-nocheck
// Import components
import CoinFlipGame from './CoinFlipGame'
import CoinFlipForm from './CoinFlipForm'
import { CoinFlipRules } from './CoinFlipRules'
import { useCoinFlipGameStore } from './CoinFlipGameStore'
import { type CoinFlipParameters, type CoinFlipResult, type CoinSide } from './types'

// Import types for re-export
import { DEFAULT_COINFLIP_PARAMETERS, COINFLIP_CONSTRAINTS, COINFLIP_GAME_INFO } from './types'

// Import animation system
import { COIN_ANIMATIONS } from './animations'
import type { CoinAnimation } from './animations'

// Import coin model components
import { CoinModel } from './components/CoinModel'
import { ThreeCoin } from './components/ThreeCoin'
import { WinParticles } from './components/WinParticles'

// Re-export everything
export {
  // Components
  CoinFlipGame,
  CoinFlipForm,
  CoinFlipRules,

  // Store
  useCoinFlipGameStore,

  // Animation system
  COIN_ANIMATIONS,
  CoinAnimation,

  // Coin model components
  ThreeCoin,
  CoinModel,
  WinParticles,

  // Types
  CoinFlipParameters as CoinFlipGameParameters,
  CoinFlipResult as CoinFlipGameResult,
  CoinSide,
  DEFAULT_COINFLIP_PARAMETERS,
  COINFLIP_CONSTRAINTS,
  COINFLIP_GAME_INFO as COINFLIP_CONFIG,
}

// Export game logic
export * as CoinFlipGameLogic from './logic/CoinFlipGameLogic'

// Default export for simpler imports
export default CoinFlipGame
