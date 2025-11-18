// @ts-nocheck
import React from 'react'
import { SStatContainer, SStatCell, SStatLabel, SStatValue } from './styled'

interface GameStat {
  label: string
  value: string | number
}

interface GameStatsProps {
  stats: GameStat[]
}

/**
 * A grid for displaying game statistics (win chance, multiplier, etc.)
 */
export const GameStats: React.FC<GameStatsProps> = ({ stats }) => {
  return (
    <SStatContainer>
      {stats.map((stat, index) => (
        <SStatCell key={index}>
          <SStatLabel>{stat.label}</SStatLabel>
          <SStatValue>{stat.value}</SStatValue>
        </SStatCell>
      ))}
    </SStatContainer>
  )
}

export default GameStats
