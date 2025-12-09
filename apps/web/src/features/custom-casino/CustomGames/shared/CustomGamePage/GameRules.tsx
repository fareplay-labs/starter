import { cn } from '@/lib/utils'

interface GameRulesProps {
  title?: string
  objective?: string
  rules?: string[]
  winningConditions?: string[]
  losingConditions?: string[]
  gameFeatures?: string[]
  tips?: string[]
  fairness?: string[]
  className?: string
}

// Section header - bold, slightly larger
const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="text-muted-foreground text-xs font-semibold mb-1.5 uppercase tracking-wide">
    {children}
  </div>
)

// Section wrapper with optional divider
const Section = ({
  children,
  showDivider = true
}: {
  children: React.ReactNode
  showDivider?: boolean
}) => (
  <div className={cn(
    'py-3',
    showDivider && 'border-b border-white/10'
  )}>
    {children}
  </div>
)

export const GameRules = ({
  title,
  objective,
  rules,
  winningConditions,
  losingConditions,
  gameFeatures,
  tips,
  fairness,
  className,
}: GameRulesProps) => {
  // Collect all sections to determine which is last (no divider on last)
  const sections: Array<{ key: string; content: string | string[] }> = []
  if (objective) sections.push({ key: 'objective', content: objective })
  if (rules?.length) sections.push({ key: 'rules', content: rules })
  if (winningConditions?.length) sections.push({ key: 'winning', content: winningConditions })
  if (losingConditions?.length) sections.push({ key: 'losing', content: losingConditions })
  if (gameFeatures?.length) sections.push({ key: 'features', content: gameFeatures })
  if (tips?.length) sections.push({ key: 'tips', content: tips })
  if (fairness?.length) sections.push({ key: 'fairness', content: fairness })

  const lastSectionKey = sections[sections.length - 1]?.key

  return (
    <div className={cn('flex flex-col w-full relative z-[1]', className)}>
      {/* Title */}
      <div className="pb-3 border-b border-white/10">
        <h1 className="text-lg font-bold text-foreground uppercase tracking-wide m-0">
          {title}
        </h1>
      </div>

      {/* Objective */}
      {objective && (
        <Section showDivider={lastSectionKey !== 'objective'}>
          <SectionHeader>Objective</SectionHeader>
          <p className="mt-0 mb-0 text-sm text-foreground/90">{objective}</p>
        </Section>
      )}

      {/* Rules */}
      {rules && rules.length > 0 && (
        <Section showDivider={lastSectionKey !== 'rules'}>
          <SectionHeader>Rules</SectionHeader>
          <ol className="mt-0 mb-0 pl-5 text-sm text-foreground/90 list-decimal space-y-1">
            {rules.map(rule => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </Section>
      )}

      {/* Winning Conditions */}
      {winningConditions && winningConditions.length > 0 && (
        <Section showDivider={lastSectionKey !== 'winning'}>
          <SectionHeader>Winning Conditions</SectionHeader>
          <ul className="mt-0 mb-0 pl-5 text-sm text-foreground/90 [list-style-type:square] space-y-1">
            {winningConditions.map(condition => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Losing Conditions */}
      {losingConditions && losingConditions.length > 0 && (
        <Section showDivider={lastSectionKey !== 'losing'}>
          <SectionHeader>Losing Conditions</SectionHeader>
          <ul className="mt-0 mb-0 pl-5 text-sm text-foreground/90 [list-style-type:square] space-y-1">
            {losingConditions.map(condition => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Game Features */}
      {gameFeatures && gameFeatures.length > 0 && (
        <Section showDivider={lastSectionKey !== 'features'}>
          <SectionHeader>Game Features</SectionHeader>
          <ul className="mt-0 mb-0 pl-5 text-sm text-foreground/90 [list-style-type:square] space-y-1">
            {gameFeatures.map(feature => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Tips */}
      {tips && tips.length > 0 && (
        <Section showDivider={lastSectionKey !== 'tips'}>
          <SectionHeader>Tips</SectionHeader>
          <ul className="mt-0 mb-0 pl-5 text-sm text-foreground/90 [list-style-type:square] space-y-1">
            {tips.map(tip => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Fairness */}
      {fairness && fairness.length > 0 && (
        <Section showDivider={lastSectionKey !== 'fairness'}>
          <SectionHeader>Fairness</SectionHeader>
          <ul className="mt-0 mb-0 pl-5 text-sm text-foreground/90 [list-style-type:square] space-y-1">
            {fairness.map(fair => (
              <li key={fair}>{fair}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
