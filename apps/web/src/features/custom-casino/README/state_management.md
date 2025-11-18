# Game State Management

This document outlines the state management strategy used for individual Custom Games within the `CustomUserCasinos` feature, primarily focusing on the runtime state of a game instance (parameters, current play state, results).

## Overview

Each Custom Game utilizes its own dedicated state store, built using [Zustand](https://github.com/pmndrs/zustand). A factory pattern combined with a base store slice ensures consistency and reduces boilerplate across different games.

## Core Components

1.  **`baseGameStore.ts` (`createBaseSlice`)**:
    *   Located in `CustomGames/shared/`.
    *   Defines a Zustand `StateCreator` function (`createBaseSlice`) that provides the common state and actions required by *all* games.
    *   **State Includes**:
        *   `gameState`: Current phase of the game (`IDLE`, `RESOLVING`, `PLAYING`, `SHOWING_RESULT`, `RESETTING`).
        *   `isLoading`, `error`: Generic loading and error handling flags.
        *   `isSaving`, `isDirty`, `configLoading`: Flags related to saving/loading game configurations.
        *   `parentCasino`, `instanceId`: Context about where the game instance is running.
        *   `parameters`: The configuration/settings for the specific game instance (type generic `T extends BaseGameParameters`).
        *   `lastResult`: The outcome of the last game played (type generic `R extends BaseGameResult`).
    *   **Actions Include**:
        *   `reset`: Resets the game state to IDLE.
        *   `initializeParameters`, `updateParameters`: Manage game settings.
        *   `saveCurrentConfig`, `loadConfigForInstance`: Handles persistence of game parameters (implementation provided by specific game stores).
        *   `setContext`: Sets the casino and instance context.

2.  **`gameStoreFactory.ts` (`createGameStore`)**:
    *   Located in `CustomGames/shared/`.
    *   Exports a factory function `createGameStore`.
    *   This function takes:
        *   `defaultParams`: The default parameters for the specific game.
        *   `extra`: A game-specific Zustand `StateCreator` containing unique state properties and actions for that particular game.
    *   It uses Zustand's `create` function to instantiate a new store.
    *   Crucially, it merges the `createBaseSlice` with the provided game-specific `extra` slice, resulting in a single store containing both common and game-specific state/actions.

## Implementation (Example: Dice Game)

The Dice game (`CustomGames/Dice/`) serves as a reference implementation:

1.  **`Dice/types.ts`**:
    *   Defines `DiceParameters` (extending `BaseGameParameters`) with dice-specific settings like `targetNumber`, `diceColor`, etc.
    *   Defines `DiceResult` (extending `BaseGameResult`) with dice outcome details like `rolledNumber`, `multiplier`.
    *   Provides `DEFAULT_DICE_PARAMETERS`.

2.  **`Dice/DiceGameStore.ts`**:
    *   Imports `createGameStore` from the shared factory.
    *   Defines `DiceRuntimeState` (e.g., `isRolling`, `rolledNumber`) and `DiceActions` (e.g., `rollDice`).
    *   Calls `createGameStore` with:
        *   The specific types: `DiceParameters`, `DiceResult`, `DiceRuntimeState`, `DiceActions`.
        *   `DEFAULT_DICE_PARAMETERS`.
        *   A game-specific slice containing the implementation for `DiceRuntimeState` and `DiceActions` (like the actual `rollDice` logic).
    *   Exports `useDiceGameStore`, the Zustand hook used by UI components to interact with the Dice game's state.

## Usage in Components

UI Components (e.g., `DiceGame.tsx`, `DiceForm.tsx`) interact with the game state as follows:

1.  **Import the hook**: `import { useDiceGameStore } from './DiceGameStore';`
2.  **Access state**: `const parameters = useDiceGameStore(state => state.parameters);`
3.  **Call actions**: `const rollDice = useDiceGameStore(state => state.rollDice);`
4.  Components automatically re-render when the relevant parts of the store state change.

This structure allows each game to manage its own state independently while sharing common functionalities and adhering to a consistent pattern. 