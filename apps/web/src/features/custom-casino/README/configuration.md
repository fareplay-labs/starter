# Configuration System

This document outlines the configuration system used within the `CustomUserCasinos` feature, covering both the overall page/casino configuration and the specific configurations for individual game instances.

## Overview

The configuration system allows users to customize the appearance and behavior of their casino page and the individual games hosted on it. It uses a structured approach with dedicated classes for different configuration types and a manager to handle loading, saving, and instantiation. Configuration data is typically loaded from and saved to the backend.

## Core Concepts & Components (`src/components/CustomUserCasinos/config/`)

1.  **`IConfig.ts`**:
    *   Defines the basic `IConfig` interface that all configuration classes must implement.
    *   Specifies methods: `load(data: any)`, `save(): any`, `validate(): boolean`, `apply(): void`.

2.  **`PageConfig.ts`**:
    *   Defines the `PageConfig` class (implements `IConfig`) responsible for the overall casino page configuration.
    *   Manages properties like:
        *   `title`, descriptions (`shortDescription`, `longDescription`)
        *   Visuals (`bannerImage`, `profileImage`, `colors`, `font`)
        *   Social links (`socialLinks`)
        *   Content structure (`featuredGames`, `sections`, `welcomeMessage`)
        *   Display options (`gridDensity`, `sortOrder`)
        *   List of enabled game *instances* (`enabledGames` - typically stores instance IDs and types).
    *   `load()` populates the instance with data (usually fetched from the backend).
    *   `save()` serializes the current configuration state into a plain object for storage.
    *   `validate()` performs basic checks (e.g., ensures title exists).
    *   `apply()` is a placeholder for potential side effects (currently empty).

3.  **`GameConfig.ts`**:
    *   Defines an abstract `GameConfig<T extends BaseGameParameters>` class (implements `IConfig`).
    *   Serves as the base for specific game configurations (e.g., `DiceConfig`, `RPSConfig`).
    *   Manages common game metadata (`name`, `icon`, `description`, `layout`, `colors`, `window` size).
    *   Holds game-specific `parameters` (type `T`), managed via `getParameters()`, `updateParameters()`.
    *   Requires subclasses to implement:
        *   `getDefaultParameters(): T`: Provides default values for the specific game.
        *   `validateParameters(params: Partial<T>): boolean`: Validates game-specific parameters.
        *   `applyGameSpecific(): void`: Placeholder for game-specific application logic.
    *   Can optionally link to a `parentPage` (`PageConfig`) for inheriting defaults (though this inheritance isn't fully implemented).
    *   `load()` populates the instance, including game-specific parameters.
    *   `save()` serializes the config, including parameters.

4.  **`GameRegistry.ts`**:
    *   Implements a singleton `GameRegistry` (`gameRegistry`).
    *   Provides a central place to register available game types.
    *   Each `GameRegistration` includes:
        *   Basic info (`type`, `name`, `icon`, `description`).
        *   The constructor for the specific `GameConfig` class (`configClass`).
        *   `metadata`: Configuration needed for the game editor UI (`GameEditorMetadata`).
        *   `storeHook`: The Zustand store hook for the game's runtime state (`useDiceGameStore`, etc.).
    *   Used to look up game details, metadata, and config classes based on a `gameType` string.
    *   Games like Dice and RPS are currently hardcoded for registration within the registry.

5.  **`ConfigManager.ts`**:
    *   Implements a singleton `ConfigManager`.
    *   Acts as a central point for creating, loading, retrieving, and saving configuration instances (`IConfig`).
    *   Uses a `registry` mapping keys (like `"page"`, `"dice"`, `"rps"`, or instance-specific keys like `"dice_userId_instanceId"`) to loader functions.
    *   `registerConfig()`: Adds a new config type and its loader function.
    *   `registerGameConfig()`: Helper to register game types, setting up loaders for both the base game type (e.g., `"dice"`) and the instance pattern (e.g., `"dice_*_*"`) using the corresponding `GameConfig` subclass.
    *   `loadConfig(key, data, parent?)`: Finds the appropriate loader using `findLoader` (which supports pattern matching for instance keys), instantiates the config using the loader, loads the provided `data`, validates it, stores it internally (`this.configs`), and returns the instance. It includes basic caching to avoid reloading identical data.
    *   `getConfig(key)`: Retrieves a previously loaded config instance by its key.
    *   `saveConfig(key)`: Retrieves a config instance and calls its `save()` method.
    *   `createGameInstance(casinoId, gameType, instanceId, initialData?)`: Convenience method to load/create a specific game instance config using the standard key pattern (`${gameType}_${casinoId}_${instanceId}`).

## Integration with Backend & Store

*   **Loading**:
    *   When navigating to a casino page (`UserPage`) or a game instance (`CustomGameRouter`), data is fetched from the backend (via `useBackendService` hooks like `loadCasinoConfig` or `loadGameConfig`).
    *   This raw data (e.g., `IPageConfigData` or `IGameConfigData`) is passed to `ConfigManager.loadConfig()` or `ConfigManager.createGameInstance()` along with the appropriate key (e.g., `"page"`, `"dice_userId_instanceId"`).
    *   The `ConfigManager` uses the registered loader to create the `PageConfig` or specific `GameConfig` instance, populating it with the backend data via the `load()` method.
*   **Applying Configuration (Game Parameters)**:
    *   In `CustomGameRouter`, after the specific `GameConfig` is loaded via the backend, its parameters (`initialParameters`) are extracted.
    *   These `initialParameters` are passed as a prop to `CustomGamePage`.
    *   `CustomGamePage` likely uses an effect to call the game's Zustand store's `initializeParameters` action (obtained via the `useGameStore` prop, looked up using `GameRegistry`), feeding the loaded configuration parameters into the game's runtime state.
*   **Saving**:
    *   When changes are made (e.g., in an editor UI), the relevant `ConfigManager.getConfig()` is retrieved.
    *   Its properties or parameters are updated (e.g., using `updateParameters` on a `GameConfig`).
    *   `ConfigManager.saveConfig(key)` is called to get the serializable data object.
    *   This data object is sent to the backend via `useBackendService` hooks (e.g., `saveCasinoConfig`, `saveGameConfig`).

This system decouples the raw configuration data structure from its runtime representation and validation logic, managed by the `PageConfig` and `GameConfig` classes, while the `ConfigManager` and `GameRegistry` orchestrate the instantiation and lookup processes. 