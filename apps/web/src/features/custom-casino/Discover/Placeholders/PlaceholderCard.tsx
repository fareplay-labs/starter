// @ts-nocheck
import { CasinoCard } from '../CasinoCard/CasinoCard'
import bannerPlaceholder from '@/assets/png/banner-placeholder.png'
import { SCard } from '../CasinoCard/CasinoCard.styles'

export const PlaceholderCard = () => {
  return (
    <SCard>
      <CasinoCard
        casino={{
          id: 'placeholder',
          username: 'Loading...',
          createdAt: '1970-01-01T00:00:00.000Z',
          updatedAt: '1970-01-01T00:00:00.000Z',
          stats: {
            totalPlays: 40,
            totalWagered: 30,
            uniquePlayers: 20,
            jackpot: 10,
          },
          config: {
            title: 'CASINO COMING SOON!',
            shortDescription: 'Customized player games for you to share with friends!',
            bannerImage: {
              url: bannerPlaceholder,
            },
            profileImage: {
              url: bannerPlaceholder,
            },
          },
        }}
      />
    </SCard>
  )
}
