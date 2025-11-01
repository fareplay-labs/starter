import { useCallback, useMemo, useRef, useState } from 'react';
import { DiceScene } from './DiceScene';
import { useTheme } from '@/contexts/ThemeContext';

type DiceGameProps = {
  config: any;
};

export default function DiceGame({ config }: DiceGameProps) {
  const { theme } = useTheme();
  const cssVar = (name: string, fallback?: string) => {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    } catch {
      return fallback;
    }
  };

  const targetNumber: number = Number(config?.targetNumber ?? 50);
  const winColor: string = String(config?.winColor ?? theme.primary ?? cssVar('--primary', '#22c55e') ?? '#22c55e');
  const loseColor: string = String(config?.loseColor ?? cssVar('--destructive', '#ef4444') ?? '#ef4444');
  const diceColor: string = String(config?.diceColor ?? theme.accent ?? theme.secondary ?? cssVar('--accent', '#5f5fff') ?? '#5f5fff');
  const background: string | undefined = config?.background;
  const animationMs: number = Number(config?.animationSpeed ?? 1200);

  const [rolling, setRolling] = useState(false);
  const [roll, setRoll] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<'win' | 'lose' | null>(null);
  const timerRef = useRef<any>(null);

  const resultColor = useMemo(() => {
    if (!outcome) return undefined;
    return outcome === 'win' ? winColor : loseColor;
  }, [outcome, winColor, loseColor]);

  const doRoll = useCallback(() => {
    if (rolling) return;
    setOutcome(null);
    setRoll(null);
    setRolling(true);
    if (timerRef.current) {
      try { clearTimeout(timerRef.current); } catch {}
    }
    timerRef.current = setTimeout(() => {
      const r = Math.floor(Math.random() * 100) + 1;
      setRoll(r);
      setOutcome(r > targetNumber ? 'win' : 'lose');
      setRolling(false);
    }, animationMs);
  }, [rolling, animationMs, targetNumber]);

  return (
    <div className="w-full" style={background ? { background } : undefined}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">Target &gt; {targetNumber}</div>
        <button
          onClick={doRoll}
          className="px-3 py-1.5 rounded border bg-background hover:bg-muted text-sm"
          disabled={rolling}
        >
          {rolling ? 'Rolling…' : 'Roll'}
        </button>
      </div>

      <DiceScene
        size={Number(config?.diceSize ?? 120)}
        color={diceColor}
        winColor={winColor}
        loseColor={loseColor}
        animationDuration={animationMs / 1000}
        targetNumber={targetNumber}
        rolledNumber={roll}
        isRolling={rolling}
        onRollComplete={() => {}}
      />

      {roll !== null && (
        <div className="mt-4 text-center">
          <div className="text-sm text-muted-foreground">You rolled</div>
          <div className="text-3xl font-semibold" style={{ color: resultColor }}>{roll}</div>
          <div className="mt-1 text-sm" style={{ color: resultColor }}>
            {outcome === 'win' ? 'Win' : 'Lose'}
          </div>
        </div>
      )}
    </div>
  );
}


