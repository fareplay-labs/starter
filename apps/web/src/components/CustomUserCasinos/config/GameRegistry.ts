import { type IConfig } from '@/components/CustomUserCasinos/config/IConfig'
import { type GameEditorMetadata } from '@/components/CustomUserCasinos/CustomGames/shared/GameParameterEditor/types'
import { type StoreApi, type UseBoundStore } from 'zustand'
import {
  type BaseGameParameters,
  type BaseGameResult,
  type BaseSlice,
  type BaseGameEntry,
} from '@/components/CustomUserCasinos/CustomGames/shared/types'
// @ts-nocheck
import { AppGameName } from '@/chains/types'

// Import Game Specifics
import { DiceSchemaConfig } from '@/components/CustomUserCasinos/CustomGames/Dice/schema'
import { DICE_EDITOR_METADATA } from '@/components/CustomUserCasinos/CustomGames/Dice/DiceMetadata'
import { useDiceGameStore } from '@/components/CustomUserCasinos/CustomGames/Dice/DiceGameStore'
import { DICE_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Dice/types'

import { RPSConfig } from '@/components/CustomUserCasinos/CustomGames/RPS/RPSConfig'
import { RPS_EDITOR_METADATA } from '@/components/CustomUserCasinos/CustomGames/RPS/RPSMetadata'
import { useRPSGameStore } from '@/components/CustomUserCasinos/CustomGames/RPS/RPSGameStore'
import { RPS_CONFIG } from '@/components/CustomUserCasinos/CustomGames/RPS/types'

import { BombsSchemaConfig } from '@/components/CustomUserCasinos/CustomGames/Bombs/config/schema'
import { BOMBS_EDITOR_METADATA } from '@/components/CustomUserCasinos/CustomGames/Bombs/config/BombsMetadata'
import { useBombsGameStore } from '@/components/CustomUserCasinos/CustomGames/Bombs/store/BombsGameStore'
import { BOMBS_GAME_INFO } from '../CustomGames/Bombs/types'

import { CrashSchemaConfig } from '@/components/CustomUserCasinos/CustomGames/Crash/schema'
import { CRASH_EDITOR_METADATA } from '@/components/CustomUserCasinos/CustomGames/Crash/CrashMetadata'
import { useCrashGameStore } from '@/components/CustomUserCasinos/CustomGames/Crash/CrashGameStore'
import { CRASH_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Crash/types'

import { RouletteSchemaConfig } from '@/components/CustomUserCasinos/CustomGames/Roulette/schema'
import { ROULETTE_EDITOR_METADATA } from '@/components/CustomUserCasinos/CustomGames/Roulette/RouletteMetadata'
import { useRouletteGameStore } from '@/components/CustomUserCasinos/CustomGames/Roulette/RouletteGameStore'
import { ROULETTE_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Roulette/types'

import { PlinkoSchemaConfig } from '@/components/CustomUserCasinos/CustomGames/Plinko/config/schema'
import { PLINKO_EDITOR_METADATA } from '@/components/CustomUserCasinos/CustomGames/Plinko/config/PlinkoMetadata'
import { usePlinkoGameStore } from '@/components/CustomUserCasinos/CustomGames/Plinko/store/PlinkoGameStore'
import { PLINKO_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Plinko/types'

import { SlotsSchemaConfig } from '@/components/CustomUserCasinos/CustomGames/Slots/config/SlotsSchemaConfig'
import { SLOTS_EDITOR_METADATA } from '@/components/CustomUserCasinos/CustomGames/Slots/config/SlotsMetadata'
import { useSlotsGameStore } from '@/components/CustomUserCasinos/CustomGames/Slots/store/SlotsGameStore'
import { SLOTS_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/Slots/types'

import { CoinFlipSchemaConfig } from '@/components/CustomUserCasinos/CustomGames/CoinFlip/schema'
import { COINFLIP_EDITOR_METADATA } from '@/components/CustomUserCasinos/CustomGames/CoinFlip/CoinFlipMetadata'
import { useCoinFlipGameStore } from '@/components/CustomUserCasinos/CustomGames/CoinFlip/CoinFlipGameStore'
import { COINFLIP_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/CoinFlip/types'

import { CryptoLaunchSchemaConfig } from '@/components/CustomUserCasinos/CustomGames/CryptoLaunch/config/CryptoLaunchSchemaConfig'
import { CRYPTO_LAUNCH_EDITOR_METADATA } from '@/components/CustomUserCasinos/CustomGames/CryptoLaunch/config/CryptoLaunchMetadata'
import { useCryptoLaunchGameStore } from '@/components/CustomUserCasinos/CustomGames/CryptoLaunch/store/CryptoLaunchGameStore'
import { CRYPTO_LAUNCH_GAME_INFO } from '@/components/CustomUserCasinos/CustomGames/CryptoLaunch/types'

import { CardsSchemaConfig } from '@/components/CustomUserCasinos/CustomGames/Cards/schema'
import { CARDS_EDITOR_METADATA } from '@/components/CustomUserCasinos/CustomGames/Cards/CardsMetadata'
import { useCardsGameStore } from '@/components/CustomUserCasinos/CustomGames/Cards'
import { CARDS_GAME_INFO } from '../CustomGames/Cards/types'

// Interface defining the structure for registering a game
export interface GameRegistration {
  type: string // Unique game type identifier (e.g., 'dice', 'rps')
  name: string // Display name (e.g., 'Dice')
  icon: string // Icon for the game (e.g., '🎲')
  description: string // Short description
  configClass: new () => IConfig // Constructor for the game's config class
  metadata: GameEditorMetadata // Editor metadata previously in parameterMetadata.ts
  // Updated storeHook type to be more precise
  storeHook: UseBoundStore<StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>>
  // Other components - these might be lazy-loaded elsewhere
  gameComponent?: React.ComponentType<any>
  formComponent?: React.ComponentType<any>
  editorComponent?: React.ComponentType<any>
}

class GameRegistry {
  private static instance: GameRegistry
  private registry: Map<string, GameRegistration> = new Map()

  private constructor() {
    // Auto-register known games on initialization
    this.registerDiceGame()
    this.registerRPSGame()
    this.registerBombsGame()
    this.registerCrashGame()
    this.registerRouletteGame()
    this.registerPlinkoGame()
    this.registerSlotsGame()
    this.registerCoinFlipGame()
    this.registerCryptoLaunchGame()
    this.registerCardsGame()
  }

  public static getInstance(): GameRegistry {
    if (!GameRegistry.instance) {
      GameRegistry.instance = new GameRegistry()
    }
    return GameRegistry.instance
  }

  // --- Registration Methods ---
  private registerDiceGame(): void {
    this.registerGame({
      type: AppGameName.Dice,
      name: DICE_GAME_INFO.name,
      icon: DICE_GAME_INFO.icon,
      description: DICE_GAME_INFO.description,
      configClass: DiceSchemaConfig,
      metadata: DICE_EDITOR_METADATA,
      storeHook: useDiceGameStore as UseBoundStore<
        StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>
      >, // Cast store hook
    })
  }

  private registerRPSGame(): void {
    this.registerGame({
      type: AppGameName.RPS,
      name: RPS_CONFIG.name,
      icon: RPS_CONFIG.icon,
      description: RPS_CONFIG.description,
      configClass: RPSConfig,
      metadata: RPS_EDITOR_METADATA,
      storeHook: useRPSGameStore as unknown as UseBoundStore<
        StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>
      >, // Cast store hook
    })
  }

  private registerBombsGame(): void {
    this.registerGame({
      type: AppGameName.Bombs,
      name: BOMBS_GAME_INFO.name,
      icon: BOMBS_GAME_INFO.icon,
      description: BOMBS_GAME_INFO.description,
      configClass: BombsSchemaConfig,
      metadata: BOMBS_EDITOR_METADATA,
      storeHook: useBombsGameStore as UseBoundStore<
        StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>
      >,
    })
  }

  private registerCrashGame(): void {
    this.registerGame({
      type: AppGameName.Crash,
      name: CRASH_GAME_INFO.name,
      icon: CRASH_GAME_INFO.icon,
      description: CRASH_GAME_INFO.description,
      configClass: CrashSchemaConfig,
      metadata: CRASH_EDITOR_METADATA,
      storeHook: useCrashGameStore as UseBoundStore<
        StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>
      >,
    })
  }

  private registerRouletteGame(): void {
    this.registerGame({
      type: AppGameName.Roulette,
      name: ROULETTE_GAME_INFO.name,
      icon: ROULETTE_GAME_INFO.icon,
      description: ROULETTE_GAME_INFO.description,
      configClass: RouletteSchemaConfig,
      metadata: ROULETTE_EDITOR_METADATA,
      storeHook: useRouletteGameStore as UseBoundStore<
        StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>
      >,
    })
  }

  private registerPlinkoGame(): void {
    this.registerGame({
      type: AppGameName.Plinko,
      name: PLINKO_GAME_INFO.name,
      icon: PLINKO_GAME_INFO.icon,
      description: PLINKO_GAME_INFO.description,
      configClass: PlinkoSchemaConfig,
      metadata: PLINKO_EDITOR_METADATA,
      storeHook: usePlinkoGameStore as UseBoundStore<
        StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>
      >,
    })
  }

  private registerSlotsGame(): void {
    this.registerGame({
      type: AppGameName.Slots_1,
      name: SLOTS_GAME_INFO.name,
      icon: SLOTS_GAME_INFO.icon,
      description: SLOTS_GAME_INFO.description,
      configClass: SlotsSchemaConfig,
      metadata: SLOTS_EDITOR_METADATA,
      storeHook: useSlotsGameStore as unknown as UseBoundStore<
        StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>
      >,
    })
  }

  private registerCoinFlipGame(): void {
    this.registerGame({
      type: AppGameName.CoinFlip,
      name: COINFLIP_GAME_INFO.name,
      icon: COINFLIP_GAME_INFO.icon,
      description: COINFLIP_GAME_INFO.description,
      configClass: CoinFlipSchemaConfig,
      metadata: COINFLIP_EDITOR_METADATA,
      storeHook: useCoinFlipGameStore as UseBoundStore<
        StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>
      >,
    })
  }

  private registerCryptoLaunchGame(): void {
    this.registerGame({
      type: AppGameName.CryptoLaunch_1,
      name: CRYPTO_LAUNCH_GAME_INFO.name,
      icon: CRYPTO_LAUNCH_GAME_INFO.icon,
      description: CRYPTO_LAUNCH_GAME_INFO.description,
      configClass: CryptoLaunchSchemaConfig,
      metadata: CRYPTO_LAUNCH_EDITOR_METADATA,
      storeHook: useCryptoLaunchGameStore as UseBoundStore<
        StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>
      >,
    })
  }

  private registerCardsGame(): void {
    this.registerGame({
      type: AppGameName.Cards_1,
      name: CARDS_GAME_INFO.name,
      icon: CARDS_GAME_INFO.icon,
      description: CARDS_GAME_INFO.description,
      configClass: CardsSchemaConfig,
      metadata: CARDS_EDITOR_METADATA,
      storeHook: useCardsGameStore as UseBoundStore<
        StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>
      >,
    })
  }

  // --- Public API ---
  public registerGame(registration: GameRegistration): void {
    if (this.registry.has(registration.type)) {
      console.warn(
        `GameRegistry: Game type "${registration.type}" is already registered. Overwriting.`
      )
    }
    this.registry.set(registration.type, registration)
  }

  public getGameRegistration(gameType: string): GameRegistration | undefined {
    return this.registry.get(gameType)
  }

  public getAllRegistrations(): GameRegistration[] {
    return Array.from(this.registry.values())
  }

  public getGameMetadata(gameType: string): GameEditorMetadata | undefined {
    // Guard against undefined/null gameType
    if (!gameType) {
      console.warn('[GameRegistry] getGameMetadata called with undefined gameType')
      return undefined
    }

    // 1) direct match first
    const direct = this.registry.get(gameType)?.metadata
    if (direct) return direct

    // 2) normalize input (case-insensitive, remove dashes)
    const normalized = gameType.toLowerCase().replace(/-/g, '')
    for (const [key, reg] of this.registry) {
      // Skip if key is undefined/null
      if (!key) continue
      
      if (key.toLowerCase().replace(/-/g, '') === normalized) {
        return reg.metadata
      }
    }

    return undefined
  }

  public getStoreHook(
    gameType: string
  ):
    | UseBoundStore<StoreApi<BaseSlice<BaseGameParameters, BaseGameResult, BaseGameEntry>>>
    | undefined {
    // 1) direct match first
    const direct = this.registry.get(gameType)?.storeHook
    if (direct) return direct

    // 2) normalized fallback
    const normalized = gameType.toLowerCase().replace(/-/g, '')
    for (const [key, reg] of this.registry) {
      if (key.toLowerCase().replace(/-/g, '') === normalized) {
        return reg.storeHook
      }
    }

    return undefined
  }
}

// Export a singleton instance
export const gameRegistry = GameRegistry.getInstance()
