# Routing and Navigation

This document describes how navigation works within the `CustomUserCasinos` feature, including route definitions, parameter usage, and the flow between different views.

## Overview

Routing is managed by two key components:

1.  **`CustomCasinoRouter.tsx`**: Handles the top-level routes for the entire custom casino feature.
2.  **`CustomGameRouter.tsx`**: Handles routing to specific game instances within a casino, including dynamically loading the correct game components.

Routing is based on URL parameters, primarily `username`, `gameType`, and `instanceId`.

## Top-Level Routing (`CustomCasinoRouter.tsx`)

Located at `src/components/CustomUserCasinos/shared/CustomCasinoRouter.tsx`.

This component sets up the main routes using `react-router-dom`:

*   `/casinos/:username`
    *   Matches the main page for a specific user's casino.
    *   Renders the `UserPage` component (`src/components/CustomUserCasinos/UserPage/UserPage.tsx`).
    *   The `:username` parameter identifies which casino's data to display.

*   `/casinos/:username/games/:gameType/:instanceId`
    *   Matches a specific instance of a custom game within a user's casino.
    *   Renders the `CustomGamesRouter` component.
    *   Parameters:
        *   `:username`: Identifies the owner of the casino.
        *   `:gameType`: Specifies the type of game (e.g., `dice`, `rps`).
        *   `:instanceId`: A unique identifier for this specific instance of the game (allowing multiple instances of the same game type with different configurations).

## Game Instance Routing (`CustomGameRouter.tsx`)

Located at `src/components/CustomUserCasinos/CustomGames/shared/CustomGamePage/CustomGameRouter.tsx`.

This component is responsible for displaying a specific game instance based on the URL parameters passed from `CustomCasinoRouter`.

**Key Logic:**

1.  **Parameter Extraction**: It extracts `username`, `gameType`, and `instanceId` from the URL using `useParams`.
2.  **Editor Mode Check**: It checks the `?editor=true` query parameter using `useSearchParams` to determine if the game should be displayed in editor mode.
3.  **Casino Data Fetching**: It fetches the `CasinoEntity` data corresponding to the `:username` using `useBackendService`. If the casino isn't found, it redirects to `/discover`.
4.  **Game Component Loading**: Based on the `:gameType` parameter, it dynamically loads the necessary game components (the main game component, the form component, and the Zustand store hook) using the `loadGameComponents` async function. This function:
    *   Normalizes the `gameType` (e.g., `rock-paper-scissors` becomes `RPS`).
    *   Uses direct imports for known games like `Dice` and `RPS` for reliability.
    *   Falls back to trying various dynamic `import()` paths for other game types.
5.  **Configuration Loading**: Once the casino data is available, it fetches the specific game configuration (`initialParameters`) for the given `userId`, `gameType`, and `instanceId` using `useBackendService`. If no specific configuration is found, it defaults to an empty object, relying on the game store's defaults.
6.  **Rendering `CustomGamePage`**: If the casino data, game components, and initial configuration are successfully loaded, it renders the `CustomGamePage` component, passing all necessary props:
    *   `GameComponent`, `FormComponent`, `useGameStore` (dynamically loaded).
    *   `editorMode`.
    *   Casino details (`casinoName`, `bannerImage`, `themeColor`).
    *   `initialParameters` (loaded from backend or default).
    *   `gameType`.
7.  **Loading/Error States**: It handles loading states while fetching data/components and displays error messages if any step fails (e.g., casino not found, components fail to load), providing a button to return to the Discover page.

This setup allows the application to route to and display arbitrary custom games within different user casinos simply by navigating to the correct URL structure. 