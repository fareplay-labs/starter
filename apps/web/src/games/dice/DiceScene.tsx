import { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

export type DiceSceneProps = {
  size: number;
  color: string;
  winColor: string;
  loseColor: string;
  animationDuration: number; // seconds
  targetNumber: number;
  rolledNumber: number | null;
  isRolling: boolean;
  onRollComplete: () => void;
};

export function DiceScene(props: DiceSceneProps) {
  const {
    size,
    color,
    winColor,
    loseColor,
    animationDuration,
    targetNumber,
    rolledNumber,
    isRolling,
    onRollComplete,
  } = props;

  const diceControls = useAnimationControls();
  const resultControls = useAnimationControls();

  useEffect(() => {
    if (!isRolling) return;
    let mounted = true;
    (async () => {
      try {
        // Hide result
        await resultControls.start({ opacity: 0, scale: 0, y: 0, transition: { duration: 0.2 } });
        if (!mounted) return;
        // Spin/roll
        await diceControls.start({
          y: [-8, 8, -6, 6, -3, 3, 0],
          rotate: [0, 120, 240, 360],
          transition: { duration: Math.max(animationDuration, 0.4), ease: 'easeInOut' },
        });
        if (!mounted) return;
        // Show result if present
        if (rolledNumber !== null) {
          await resultControls.start({ opacity: 1, scale: 1, y: -(size / 2 + 40), transition: { duration: 0.3 } });
        }
        if (mounted) onRollComplete();
      } catch {
        if (mounted) onRollComplete();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isRolling, rolledNumber, animationDuration, size, onRollComplete, diceControls, resultControls]);

  const resultColor = rolledNumber === null ? color : (rolledNumber > targetNumber ? winColor : loseColor);

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <motion.div
        animate={diceControls}
        initial={{ y: 0, rotate: 0, scale: 1 }}
        className="absolute z-10 flex items-center justify-center rounded-lg border"
        style={{ width: size, height: size, borderColor: color, color }}
      >
        <div className="text-2xl font-bold select-none">🎲</div>
      </motion.div>

      {/* baseline line */}
      <motion.div
        className="absolute h-0.5 opacity-30"
        style={{ background: color, left: '20%', right: '20%', bottom: '20%' }}
        initial={{ opacity: 0, scale: 0 }}
        animate={diceControls}
      />

      {rolledNumber !== null && (
        <motion.div
          className="absolute text-4xl font-semibold"
          style={{ color: resultColor }}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={resultControls}
        >
          {rolledNumber}
        </motion.div>
      )}
    </div>
  );
}


