# Custom Game Logic

This document outlines the standard structure and core logic for implementing new Custom Games within the `CustomUserCasinos` feature. It uses the Dice game as a primary example, but the principles apply to all games.

## Overview

The goal is to provide a consistent framework for integrating diverse games. Each game manages its own UI, state, and configuration, while plugging into a shared structure for routing, rendering, and state management foundations.

## Core File Structure & Roles (Example: `Dice/`)

A typical game directory (e.g., `src/components/CustomUserCasinos/CustomGames/Dice/`) contains the following key files:

1.  **`index.ts`**: (Optional but recommended) Exports the main components and hooks needed by the rest of the application (e.g., `DiceGame`, `DiceForm`, `useDiceGameStore`). This simplifies imports in routers and registries.
2.  **`[GameName]Game.tsx` (e.g., `DiceGame.tsx`)**: The main React component responsible for rendering the core visual representation and interactive elements of the game itself (e.g., the dice rolling animation, results display). It subscribes to the game's store (`use[GameName]Store`) to get data and display the appropriate UI based on the current `gameState`.
3.  **`[GameName]Form.tsx` (e.g., `DiceForm.tsx`)**: A React component containing the form elements for user input, typically including betting controls (amount, number of entries) and potentially game-specific parameter adjustments (like the target number in Dice). It interacts with the game's store \to read current parameters/state and dispatch actions (like initiating a bet/roll).
4.  **`[GameName]Store.ts` (e.g., `DiceGameStore.ts`)**: Defines the game-specific Zustand state store. It uses the `createGameStore` factory (`shared/gameStoreFactory.ts`) to combine the `baseGameStore` slice (providing common state like `gameState`, `parameters`, `lastResult`, and actions like `initializeParameters`) with a game-specific slice containing unique state properties (e.g., `DiceRuntimeState.isRolling`) and actions (e.g., `DiceActions.rollDice`). It exports the `use[GameName]Store` hook for components to interact with.
5.  **`types.ts`**: Defines TypeScript interfaces specific to the game:
    *   `[GameName]Parameters` (extending `BaseGameParameters`): Defines the configurable parameters for this game (e.g., `DiceParameters.targetNumber`, `DiceParameters.diceColor`).
    *   `[GameName]Result` (extending `BaseGameResult`): Defines the structure of the data returned after a game round (e.g., `DiceResult.rolledNumber`).
    *   Game-specific runtime state interfaces (e.g., `DiceRuntimeState`) and action interfaces (e.g., `DiceActions`) used in the store definition.
    *   Provides default parameter values (e.g., `DEFAULT_DICE_PARAMETERS`).
6.  **`[GameName]Config.ts` (e.g., `DiceConfig.ts`)**: Implements the `GameConfig` abstract class (`config/GameConfig.ts`). It provides the concrete implementation for `getDefaultParameters()` and `validateParameters()` based on the game's specific needs. Used by the `ConfigManager` to handle loading/saving configurations.
7.  **`[GameName]Metadata.ts` (e.g., `DiceMetadata.ts`)**: Defines the `GameEditorMetadata` object for the game. This structure tells the generic `GameParameterEditor` component (`shared/GameParameterEditor/`) how to render the editor UI for this game's parameters (e.g., input types, labels, constraints, grouping). Referenced by the `GameRegistry`.
8.  **(Optional) `[GameName]Scene.tsx`, `animations.ts`, `styles.ts`, etc.**: Additional components or modules specific to the game's implementation (e.g., complex visual components, animation logic).

## State Management (`FareGameState`)

The core game flow is driven by the `gameState` property within the `baseGameStore` slice, which adopts the `FareGameState` type (`shared/types.ts`). If more granularity is needed, additional state might need to be added to the specific game's store. This state determines what the user sees and can do:

*   **`IDLE`**: The initial state or the state after a result has been acknowledged. The game is ready for new input (e.g., placing a bet, configuring parameters). The `[GameName]Form.tsx` is typically active.
*   **`RESOLVING`**: Triggered after the user submits a bet and the associated smart contract transaction has yet to be confirmed, before the actual game logic/animation starts. This state indicates the bet is locked in, and the backend/contract is resolving the outcome. This state could represent a waiting state, or trigger an animation to provide the feedback that the bet is being processed.
*   **`PLAYING`**: The state during active gameplay simulation or animation, occurring *after* the outcome is known (resolved in the `RESOLVING` state). UI elements might be disabled, and animations (like the dice rolling) may be shown. This state is often triggered automatically after `RESOLVING` or by an action if the game requires further user interaction after resolution.
*   **`SHOWING_RESULT`**: The state after the game logic/animation has completed and a result (`lastResult`) is available in the store. The `[GameName]Game.tsx` or corresponding `[GameName]Scene.tsx` component displays the outcome (win/loss, payout, specific results like the rolled number). A timer or a prompt to the user might cause the transition back to `IDLE`.
*   **`RESETTING`**: The state after the user has played a game and the result has been acknowledged. This does not need to be used, but it is available to trigger animations or other reset logic that might be time-based.

Components subscribe to `gameState` (and other relevant state like `isLoading`, `lastResult`) using the `use[GameName]Store` hook and conditionally render their UI accordingly.

## Rendering Integration (`CustomGamePage.tsx`)

The `CustomGameRouter` dynamically loads the required components (`GameComponent`, `FormComponent`, `useGameStore`) based on the URL's `gameType` parameter.

These components are then passed as props to `CustomGamePage.tsx` (`shared/CustomGamePage/`), which orchestrates the overall layout:

1.  **Store Initialization**: `CustomGamePage` receives the `useGameStore` hook constructor and the `initialParameters` loaded from the backend.
2.  **Store Instantiation**: It uses a `useMemo` hook to create *one instance* of the game's Zustand store using the passed `useGameStore` constructor.
3.  **Parameter Loading**: An effect (`useEffect`) calls the store's `initializeParameters` action, feeding the configuration loaded from the backend (`initialParameters`) into the game's state.
4.  **Context Provider**: It wraps the page content in a `GameStoreProvider` component, making the instantiated game store accessible via context to the child components (`GameComponent`, `FormComponent`, `EditPanel`).
5.  **Layout**: It uses a three-panel layout (`SLeftPanel`, `SMiddlePanel`, `SRightPanel`):
    *   `SLeftPanel`: Contains the `EditPanel` (for adjusting parameters, shown conditionally).
    *   `SMiddlePanel`: Renders the main `<GameComponent />` passed via props.
    *   `SRightPanel`: Renders the `<FormComponent />` passed via props (if it exists).

This structure allows the `CustomGamePage` to remain generic, simply rendering the specific `GameComponent` and `FormComponent` it receives, while ensuring they share the same instance of the correct game store, initialized with the correct parameters.

## Guide for Implementing New Games

1.  Create a new directory under `CustomGames/` (e.g., `CustomGames/CoinFlip/`).
2.  Define game-specific `types.ts` (`CoinFlipParameters`, `CoinFlipResult`, defaults).
3.  Implement the `CoinFlipConfig.ts` class extending `GameConfig`.
4.  Define the `CoinFlipMetadata.ts` for the editor UI.
5.  Create the `CoinFlipStore.ts` using `createGameStore`, defining specific state and actions.
6.  Build the `CoinFlipGame.tsx` component, subscribing to the store and rendering based on `gameState`.
7.  Build the `CoinFlipForm.tsx` component for user input.
8.  Add exports to `CoinFlip/index.ts`.
9.  Register the new game in `config/GameRegistry.ts` by adding a `registerCoinFlipGame()` method and calling it in the constructor. This involves providing the `CoinFlipConfig` class, `COINFLIP_EDITOR_METADATA`, and `useCoinFlipStore` hook.
10. Ensure the `CustomGameRouter` can dynamically import the new game components (it might require updates if the naming convention isn't standard). 