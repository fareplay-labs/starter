**PLACEHOLDER - TO BE REPLACED**

**DESCRIPTION** Documents the main UI components used across the feature, including those in UserPage/, Discover/, FancyBorders/, and shared/. Explains their props, usage, and styling. 

## UserPage Components

-   [`UserPage.tsx`](../UserPage/UserPage.tsx)
    -   **Purpose**: The main component orchestrating the display of a specific user's custom casino page.
    -   **Functionality**:
        -   Fetches casino data (`CasinoEntity`) including page configuration (`PageConfig`) based on the `username` route parameter using `useBackendService`.
        -   Handles loading states and creates a default casino/triggers onboarding for new users (`userId === 'me'`).
        -   Manages overall page layout, including the hero section and game sections.
        -   Supports an `edit` mode (via `?mode=edit` search param) allowing customization of the casino's appearance and content.
        -   Uses `useEditStore` (Zustand) to manage state changes during edit mode.
        -   Renders `UserHeroSection`, `GameSections`, `EditToolbar` (conditional), and `EditModals`.
        -   Applies dynamic styling based on `PageConfig` (e.g., fonts, colors via styled-components).
        -   Handles saving updated configuration back to the backend.
    -   **Sub-components**: `UserHeroSection`, `GameSections`, `EditToolbar`, `EditModals`, `CreateCasinoModal` (for onboarding).
    -   **Props**: None (receives data via route params and hooks).

-   [`CreateCasinoModal.tsx`](../shared/modals/CreateCasinoModal/CreateCasinoModal.tsx)
    -   **Purpose**: Guides the user through the initial setup of their casino, primarily handling the AI-driven generation flow.
    -   **Functionality**:
        -   Presents a multi-step process: Selection (AI vs. Manual), AI Configuration (title, style ideas), Processing (loading/logs), Result (summary, apply).
        -   Uses the `useCasinoAIGenerator` hook to interact with the AI service for generating casino configuration.
        -   Calls the `onApplyConfig` prop function when the user accepts the AI-generated configuration.
    -   **Props**:
        -   `isOpen: boolean`: Controls modal visibility.
        -   `onClose: () => void`: Callback invoked when the modal is closed.
        -   `onApplyConfig: (config: any) => Promise<boolean>`: Callback to apply the generated config and save it (usually triggers backend save in `UserPage`).
        -   `username: string`: The username for the casino being created.
    -   **Sub-components**: `ModalBase`, `TextInput`, `TextArea`, `ModalActions`.

## Discover Components

-   [`CasinoCard.tsx`](../Discover/CasinoCard/CasinoCard.tsx)
    -   **Purpose**: Renders a preview card for a casino, typically used on the Discover page.
    -   **Functionality**:
        -   Displays banner, profile image/icon, title, description, and key stats (plays, wagered, jackpot).
        -   Provides a favorite button (`HeartIcon`) linked to `useFavoritesStore`.
        -   Navigates to the full casino page (`/custom/:username`) on click.
        -   Can display optional "featured" and jackpot banners.
    -   **Props**:
        -   `casino: CasinoPreview`: Casino data object retrieved from the backend.
        -   `isFeatured?: boolean`: Show featured badge.
        -   `featuredReason?: string`: Text for featured badge.
        -   `featuredUntil?: string`: Extra text for featured badge (not really in use).
        -   `onFavoriteToggle?: (casinoId: string, isFavorite: boolean) => void`: Callback on favorite toggle.
    -   **Sub-components**: `HeartIcon`, various styled-components.

-   [`CasinoScrollSection.tsx`](../Discover/CasinoScrollSection/CasinoScrollSection.tsx)
    -   **Purpose**: Displays a named section containing a horizontally scrollable list of `CasinoCard`s.
    -   **Functionality**:
        -   Renders a title and maps the `casinos` array to `CasinoCard` components.
        -   Provides left/right buttons for smooth horizontal scrolling.
        -   Disables scroll buttons when at the beginning or end of the list.
        -   Recalculates scroll state on window resize.
    -   **Props**:
        -   `title: string`: Section title.
        -   `casinos: CasinoPreview[]`: Array of casino data for the cards.
        -   `scrollAmount?: number`: (Optional) Scroll distance per click (default: 0.8).
    -   **Sub-components**: `CasinoCard`, styled-components.

## CustomGames Components

### Shared Game Components

-   [`CustomGameRouter.tsx`](../CustomGames/shared/CustomGamePage/CustomGameRouter.tsx)
    -   **Purpose**: Dynamically loads and routes to a specific game instance based on URL parameters (`username`, `gameType`, `instanceId`).
    -   **Functionality**:
        -   Extracts route parameters and `editor` search parameter.
        -   Fetches parent casino data (`CasinoEntity`) via `useBackendService`.
        -   Dynamically imports game-specific components (`GameComponent`, `FormComponent`, `useGameStore`) using `loadGameComponents` utility (tries direct imports then dynamic `import()`).
        -   Loads game instance configuration (`initialParameters`) via `useBackendService` (`loadGameConfig`).
        -   Handles loading/error states.
        -   Renders `CustomGamePage` with loaded components, config, and casino context.
    -   **Props**: None.
    -   **Sub-components**: `CustomGamePage`.

-   [`CustomGamePage.tsx`](../CustomGames/shared/CustomGamePage/CustomGamePage.tsx)
    -   **Purpose**: Provides the standard three-panel layout (Editor, Game, Form) for displaying a custom game instance.
    -   **Functionality**:
        -   Renders a `GameBanner` with casino/game info.
        -   Arranges `EditPanel` (left), `GameComponent` (middle), and `FormComponent` (right) panels.
        -   Instantiates the specific game's Zustand store (passed via `useGameStore` prop).
        -   Initializes the store with `initialParameters` (passed as prop).
        -   Wraps content in `GameStoreProvider` to provide the store context to children.
        -   Manages visibility of the `EditPanel`.
    -   **Props**:
        -   `gameName: string`: Game display name.
        -   `GameComponent: React.ComponentType`: The main game component.
        -   `FormComponent?: React.ComponentType`: The game's input form component.
        -   `useGameStore: () => any`: Zustand store hook constructor for the game.
        -   `casinoName?: string`: Parent casino name.
        -   `bannerImage?: string`: Casino banner image URL.
        -   `themeColor?: string`: Primary theme color.
        -   `editorMode?: boolean`: Initial visibility of the editor panel.
        -   `initialParameters?: Partial<BaseGameParameters>`: Loaded configuration for the instance.
        -   `gameType?: string`: Game type identifier.
    -   **Sub-components**: `GameBanner`, `EditPanel`, `GameStoreProvider`, dynamic `GameComponent`/`FormComponent`.

-   [`GameParameterEditor.tsx`](../CustomGames/shared/GameParameterEditor/GameParameterEditor.tsx)
    -   **Purpose**: Dynamically generates a UI form for editing the parameters of a specific game instance, based on registered metadata.
    -   **Functionality**:
        -   Retrieves `GameEditorMetadata` from `GameRegistry` based on `gameType`.
        -   Renders sections and input controls (via `ParameterSection`) according to the metadata.
        -   Calls the `onChange` prop with updated parameters when values change.
        -   Includes a "Reset to Defaults" button.
        -   Shows an error message if no editor metadata is registered for the `gameType`.
    -   **Props**:
        -   `parameters: Partial<T extends BaseGameParameters>`: Current parameter values.
        -   `gameType: AppGameName`: Game type identifier.
        -   `onChange: (updatedParams: Partial<T>) => void`: Callback on parameter change.
    -   **Sub-components**: `ParameterSection`, styled-components.

-   [`SimulationControl.tsx`](../CustomGames/shared/formComponents/SimulationControl.tsx)
    -   **Purpose**: A development/testing component providing buttons to manually trigger win/loss simulation logic.
    -   **Functionality**: Displays "SIMULATE WIN" and "SIMULATE LOSS" buttons. Calls respective props (`onSimulateWin`, `onSimulateLoss`) on click. Can be disabled.
    -   **Props**:
        -   `onSimulateWin: () => void`: Callback for win simulation.
        -   `onSimulateLoss: () => void`: Callback for loss simulation.
        -   `disabled?: boolean`: Disables buttons if true.
    -   **Sub-components**: Styled-components.

-   [`FormGroup.tsx`](../CustomGames/shared/formComponents/FormGroup.tsx)
    -   **Purpose**: Provides a standard layout wrapper for a form control (or group of controls) with a label.
    -   **Functionality**: Renders a label above the child components, providing consistent spacing.
    -   **Props**:
        -   `label: string`: The label text.
        -   `children: React.ReactNode`: The input element(s).
    -   **Sub-components**: Styled-components.

-   [`NumberInput.tsx`](../CustomGames/shared/formComponents/NumberInput.tsx)
    -   **Purpose**: A styled input component specifically for numerical input.
    -   **Functionality**: Renders a styled `<input type="number">`. Supports min/max/step attributes. Optionally shows an increment button.
    -   **Props**:
        -   `value: number`: Current value.
        -   `onChange: (value: number) => void`: Callback on value change.
        -   `min?`, `max?`, `step?`, `placeholder?`: Standard input attributes.
        -   `disabled?: boolean`: Disable the input.
    -   **Sub-components**: Styled-components.

-   [`ThemedSlider.tsx`](../CustomGames/shared/formComponents/ThemedSlider.tsx)
    -   **Purpose**: A customizable slider (`<input type="range">`) component allowing visual theming through props.
    -   **Functionality**: Renders a styled range input. Allows setting colors (track, fill, thumb normal/hover/active), sizes (track, thumb), and track gradient via props. Calculates fill percentage.
    -   **Props**:
        -   `min`, `max`, `value`, `step?`: Standard range attributes.
        -   `onChange: (value: number) => void`: Callback on value change.
        -   `disabled?: boolean`: Disables the slider.
        -   `trackColor?`, `trackGradient?`, `thumbColor?`, `thumbHoverColor?`, `thumbActiveColor?`, `fillColor?`, `height?`, `trackHeight?`, `thumbSize?`, `thumbBorderColor?`: Optional theme properties.
    -   **Sub-components**: Styled-components.

### Dice Game Components

-   [`DiceGame.tsx`](../CustomGames/Dice/DiceGame.tsx)
    -   **Purpose**: Renders the main visual component for the Dice game.
    -   **Functionality**:
        -   Connects to `useDiceGameStore` to get state and parameters.
        -   Initializes game context in store if needed.
        -   Renders the `DiceScene` component, passing parameters (size, color, animation, target) and state (isRolling) as props.
        -   Handles loading and error states from the store.
        -   Provides a callback to `DiceScene` to reset the store state after animation.
    -   **Props**: `editorMode?: boolean` (passed down).
    -   **Sub-components**: `DiceScene`, `Loading`, `Error`, `GameContainer`.

-   [`DiceForm.tsx`](../CustomGames/Dice/DiceForm.tsx)
    -   **Purpose**: Provides the UI controls for the Dice game (setting bet, target number, rolling).
    -   **Functionality**:
        -   Connects to the game store via `useGameStore` context for parameters and actions.
        -   Manages local state for bet amount, target number, and errors.
        -   Synchronizes target number with the store parameters.
        -   Uses shared components (`TargetRollSlider`, `LabelledNumberSliderInput`, `GameStats`, etc.) to render controls.
        -   Calls `rollDice` action on bet submission.
        -   Displays `SimulationControl` instead of `SubmitButton` if `editMode` is true.
        -   Performs input validation.
    -   **Props**:
        -   `onRoll?: (result: DiceResult) => void`: Optional callback after roll attempt.
        -   `editMode?: boolean`: Show simulation controls if true.
    -   **Sub-components**: `TargetRollSlider`, `LabelledNumberSliderInput`, `StandardFormLayout`, `SimulationControl`, `FormErrorDisplay`, `GameStats`, `SubmitButton`.

### RPS (Rock Paper Scissors) Game Components

-   [`RPSGame.tsx`](../CustomGames/RPS/RPSGame.tsx)
    -   **Purpose**: Renders the main visual component for the Rock Paper Scissors game.
    -   **Functionality**:
        -   Connects to `useRPSGameStore` for state and visual parameters.
        -   Initializes game context in store if needed.
        -   Uses `useParameterSync` hook to synchronize `parameters` prop with the store state (and optionally notify parent via `onConfigChange` in editor mode).
        -   Renders `RPSScene`, passing visual parameters and game state (choices, playing status).
        -   Provides `handleGameComplete` callback to `RPSScene` to reset store state and call `onGameResult` prop.
        -   Handles loading/error states.
    -   **Props**:
        -   `parameters: RPSGameParameters`: Game instance configuration.
        -   `editorMode?: boolean`: Controls parameter sync behavior.
        -   `onConfigChange?: (params: Partial<RPSGameParameters>) => void`: Optional callback when parameters change via prop.
        -   `onGameResult?: (result: RPSGameResult) => void`: Optional callback when game round ends.
    -   **Sub-components**: `RPSScene`, `Loading`, `Error`, `GameContainer`, `useParameterSync`.

-   [`RPSForm.tsx`](../CustomGames/RPS/components/RPSForm.tsx)
    -   **Purpose**: Provides the UI controls for the RPS game (selecting move, setting bet, playing).
    -   **Functionality**:
        -   Connects to `useRPSGameStore` for state and actions.
        -   Manages local state for bet amount, number of entries, errors.
        -   Displays buttons to select Rock, Paper, or Scissors (calls `setPlayerChoice`).
        -   Uses shared components (`NumberInput`, `ThemedSlider`, `GameStats`) for bet controls and info display.
        -   Calls `playGame` action via `SubmitButton`.
        -   Displays simulation buttons if `editMode` is true.
        -   Performs input validation.
    -   **Props**:
        -   `onPlay?: () => void`: Optional callback instead of calling `playGame`.
        -   `accentColor?: string`: Color for sliders/button.
        -   `editMode?: boolean`: Show simulation controls if true.
    -   **Sub-components**: `FormGroup`, `NumberInput`, `ThemedSlider`, `GameStats`, `SubmitButton`, styled-components.

## Shared Components (General)

-   [`CustomCasinoRouter.tsx`](../shared/CustomCasinoRouter.tsx)
    -   **Purpose**: Defines the top-level routes for the custom casino feature.
    -   **Functionality**:
        -   Sets up routes using `react-router-dom`.
        -   Maps `/casinos/:username` (or similar base) to `UserPage`.
        -   Maps `/casinos/:username/games/:gameType/:instanceId` to `CustomGamesRouter`.
        -   Redirects unmatched paths within its scope to `/discover`.
    -   **Props**: None.
    -   **Sub-components**: `UserPage`, `CustomGamesRouter`, `Routes`, `Route`, `Navigate`.

-   [`ModalBase.tsx`](../shared/modals/shared/ModalBase.tsx)
    -   **Purpose**: Provides a reusable base structure for modal dialogs.
    -   **Functionality**:
        -   Renders a backdrop and a content container.
        -   Includes a title, a close button, and renders child content.
        -   Handles closing via backdrop click (can be disabled via ref) or close button.
        -   Allows setting max width.
    -   **Props**:
        -   `isOpen: boolean`: Controls visibility.
        -   `onClose: () => void`: Callback when modal should close.
        -   `title: string`: Modal title.
        -   `children: React.ReactNode`: Content to render inside.
        -   `maxWidth?: string`: Max width CSS value (default: '500px').
       -   `backdropClickDisabledRef?: React.RefObject<boolean>`: Ref to optionally disable backdrop close (Used, for example, in Image Editor to prevent closing while dragging in Crop preview).
    -   **Sub-components**: Styled-components.

-   [`FormElements.tsx`](../shared/modals/shared/FormElements.tsx)
    -   **Purpose**: Provides a set of common, styled form input components.
    -   **Components Exported**:
        -   `TextInput`: Standard text input with label, help/error text, char count.
        -   `TextArea`: Multi-line text area, similar features to `TextInput`.
        -   `Select`: Dropdown select input with label, options, help/error text.
    -   **Functionality**: Each component wraps a native HTML input/textarea/select, providing consistent styling, labels, and optional help/error/char count messages.
    -   **Props**: Vary per component (see file for details), generally include `id`, `label`, `value`, `onChange`, `disabled`, `helpText`, `error`, etc.
    -   **Sub-components**: Various styled-components.

-   [`ModalActions.tsx`](../shared/modals/shared/ModalActions.tsx)
    -   **Purpose**: Provides standardized Confirm/Cancel action buttons for modals.
    -   **Functionality**:
        -   Renders Cancel and (optional) Confirm buttons.
        -   Calls `onCancel` or `onConfirm` props on click.
        -   Allows custom button text and disabling buttons.
    -   **Props**:
        -   `onCancel: () => void`: Callback for Cancel.
        -   `onConfirm?: () => void`: Optional callback for Confirm (button hidden if omitted).
        -   `disabled?: boolean`: Disable both buttons.
        -   `confirmDisabled?: boolean`: Disable only Confirm button.
        -   `confirmText?: string`: Text for Confirm button (default: 'Save').
        -   `cancelText?: string`: Text for Cancel button (default: 'Cancel').
    -   **Sub-components**: Styled-components.

## FancyBorders Components

-   [`FancyBorder.tsx`](../FancyBorders/v2/FancyBorder.tsx)
    -   **Purpose**: A highly configurable component to wrap content with visually enhanced borders (solid, gradient, animated).
    -   **Functionality**:
        -   Renders standard borders (`color`, `width`, `radius`, `borderStyle`).
        -   Supports linear gradients (`isGradient`, `gradientColors`, `gradientDirection`).
        -   Supports continuous or hover-only animations (`animated`, `animateOnHoverOnly`).
        -   Animation types: `pulse` (opacity/glow), `flow` (moving gradient), `spin` (rotating conic gradient), each with specific `animationConfig`.
        -   Supports an entry animation (corners-to-center reveal) via `entryAnimation` and `entryAnimationConfig`.
    -   **Props**: Extensive configuration options for border style, gradients, and animations (See `FancyBorders/v2/README.md` for full details).
    -   **Sub-components**: Internal complex styled-components.
    -   **Note**: This file is very large (900+ lines) and may violate the `smaller-files` guideline. Consider refactoring.
