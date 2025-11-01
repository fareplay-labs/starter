export interface ThemeStepResult {
  themeParagraph: string;
  shortDescription: string;
  longDescription: string;
}

export interface ColorsStepResult {
  selectedColors: string[];
  selectedFont: string;
}

export interface ImagePromptsStepResult {
  bannerImagePrompt: string;
  profileImagePrompt: string;
}

export interface GamePlanItem {
  gameId: string;
  subTheme: string;
  iconPrompt: string;
}

export type SectionLayout = 'grid' | 'list' | 'carousel';

export interface GamePlanSection {
  sectionName: string;
  layout: SectionLayout;
  games: GamePlanItem[];
}

export interface GamePlanResult {
  gameSections: GamePlanSection[];
}

export interface DesignedGame {
  type: string; // gameId
  name: string;
  config: any; // validated later against registry per game
  imagePrompts: Record<string, string>;
}

export interface FinalDesignResult {
  id: string;
  ownerAddress?: string | null;
  title: string;
  shortDescription: string;
  longDescription: string;
  themeParagraph: string;
  font: string;
  colors: string[];
  bannerImage?: string | null;
  profileImage?: string | null;
  sections: Array<{ title: string; gameIds: string[]; layout: SectionLayout }>;
  games: DesignedGame[];
}

// Persisted theme shape on CasinoSettings.theme
export interface PersistedTheme {
  colors: string[];
  font: string;
  paragraph: string;
  assets?: {
    logoUrl?: string | null;
    bannerUrl?: string | null;
  };
}


