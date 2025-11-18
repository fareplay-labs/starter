// @ts-nocheck
import { SLabel } from '../formComponents/styled'
import { Container, Header, OrderListItems, UnorderListItems } from '../styled'

interface GameRulesProps {
  title?: string
  objective?: string
  rules?: string[]
  winningConditions?: string[]
  losingConditions?: string[]
  gameFeatures?: string[]
  tips?: string[]
  fairness?: string[]
}

export const GameRules = ({
  title,
  objective,
  rules,
  winningConditions,
  losingConditions,
  gameFeatures,
  tips,
  fairness,
}: GameRulesProps) => {
  return (
    <Container>
      <Header>
        <SLabel>{title}</SLabel>
      </Header>
      {objective && (
        <div>
          <SLabel>Objective</SLabel>
          <p style={{ marginTop: 0 }}>{objective}</p>
        </div>
      )}
      {rules && rules.length > 0 && (
        <div>
          <SLabel>Rules</SLabel>
          <OrderListItems>
            {rules.map(rule => (
              <li key={rule}>{rule}</li>
            ))}
          </OrderListItems>
        </div>
      )}

      {winningConditions && winningConditions.length > 0 && (
        <div>
          <SLabel>Winning Conditions</SLabel>
          <UnorderListItems>
            {winningConditions.map(condition => (
              <li key={condition}>{condition}</li>
            ))}
          </UnorderListItems>
        </div>
      )}
      {losingConditions && losingConditions.length > 0 && (
        <div>
          <SLabel>Losing Conditions</SLabel>
          <UnorderListItems>
            {losingConditions.map(condition => (
              <li key={condition}>{condition}</li>
            ))}
          </UnorderListItems>
        </div>
      )}
      {gameFeatures && gameFeatures.length > 0 && (
        <div>
          <SLabel>Game Features</SLabel>
          <UnorderListItems>
            {gameFeatures.map(feature => (
              <li key={feature}>{feature}</li>
            ))}
          </UnorderListItems>
        </div>
      )}
      {tips && tips.length > 0 && (
        <div>
          <SLabel>Tips</SLabel>
          <UnorderListItems>
            {tips.map(tip => (
              <li key={tip}>{tip}</li>
            ))}
          </UnorderListItems>
        </div>
      )}

      {fairness && fairness.length > 0 && (
        <div>
          <SLabel>Fairness</SLabel>
          <UnorderListItems>
            {fairness.map(fair => (
              <li key={fair}>{fair}</li>
            ))}
          </UnorderListItems>
        </div>
      )}
    </Container>
  )
}
