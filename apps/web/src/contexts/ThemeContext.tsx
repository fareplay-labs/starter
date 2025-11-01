import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';

type PersistedTheme = {
  colors: string[];
  font: string;
  paragraph: string;
  assets?: { logoUrl?: string | null; bannerUrl?: string | null };
};

type Theme = {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  border?: string;
  muted?: string;
  mutedForeground?: string;
  ring?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
};

type ThemeContextValue = {
  theme: Theme;
  hydrated: boolean;
  applyTheme: (t: Partial<Theme>) => void;
  hydrateFromSettings: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function setCssVars(t: Theme) {
  const root = document.documentElement;
  const map: Record<string, string | undefined | null> = {
    '--primary': t.primary,
    '--secondary': t.secondary,
    '--accent': t.accent,
    '--background': t.background,
    '--foreground': t.foreground,
    '--border': t.border,
    '--muted': t.muted,
    '--muted-foreground': t.mutedForeground,
    '--ring': t.ring,
  };
  Object.entries(map).forEach(([k, v]) => { if (typeof v === 'string') root.style.setProperty(k, v as string); });
}

export function ThemeProvider({ children }: { children: any }) {
  const [theme, setTheme] = useState<Theme>({});
  const [hydrated, setHydrated] = useState(false);

  const applyTheme = useCallback((t: Partial<Theme>) => {
    setTheme((prev) => {
      const next = { ...prev, ...t } as Theme;
      try { setCssVars(next); } catch {}
      return next;
    });
  }, []);

  const hydrateFromSettings = useCallback(async () => {
    try {
      const settings: any = await api.getCasinoSettings();
      const pt: PersistedTheme | undefined = settings?.theme;
      if (pt && Array.isArray(pt.colors) && typeof pt.font === 'string') {
        const mapped: Theme = {
          primary: pt.colors[0],
          secondary: pt.colors[1],
          accent: pt.colors[2],
          logoUrl: pt.assets?.logoUrl ?? settings?.logoUrl ?? null,
          bannerUrl: pt.assets?.bannerUrl ?? settings?.bannerUrl ?? null,
        };
        applyTheme(mapped);
      } else {
        const mapped: Theme = {
          primary: settings?.primaryColor,
          logoUrl: settings?.logoUrl || null,
          bannerUrl: settings?.bannerUrl || null,
        };
        applyTheme(mapped);
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, [applyTheme]);

  useEffect(() => { hydrateFromSettings(); }, [hydrateFromSettings]);

  const value = useMemo(() => ({ theme, hydrated, applyTheme, hydrateFromSettings }), [theme, hydrated, applyTheme, hydrateFromSettings]);

  return (
    <ThemeContext.Provider value={value}>
      {!hydrated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background backdrop-blur-sm">
          <style>{`
            @keyframes shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          `}</style>
          <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <div className="flex items-center">
                <span>Loading theme</span>
                <div className="flex gap-1 ml-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
            <div className="relative w-48 h-1.5 rounded bg-muted/50 overflow-hidden">
              <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-primary/60 rounded" style={{ animation: 'shine 1.2s linear infinite' }} />
            </div>
          </div>
        </div>
      )}
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}


