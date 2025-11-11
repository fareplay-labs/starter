// @ts-nocheck
import LeaderboardGrid from '@/components/LeaderboardGrid'
import { FARE_COLORS } from '@/design'
import { PageWrapper } from '@/pages/style'
import {
  SAnalyticSelectionWrapper,
  SAnalyticsPageHeader,
  SAnalyticsPageWrapper,
  SAnylyticsGridWrapper,
  STile,
} from './style'
import { type CasinoPreview } from '@/components/CustomUserCasinos/shared/types'
import { useEffect, useState } from 'react'
import { useBackendService } from '@/components/CustomUserCasinos/backend/hooks'
import { cleanUsername } from '@/components/CustomUserCasinos/utils/cleanUsername'
import { getImageUrl } from '@/components/CustomUserCasinos/shared/utils/cropDataUtils'
import { Button, ButtonEnum } from '@/components/CustomUserCasinos/shared/Button'

interface TileProps {
  color?: string
  title?: string
  data?: string
}

const STiles = ({ color = '', title, data }: TileProps) => {
  return (
    <STile $color={color}>
      {title}
      <span>{data}</span>
    </STile>
  )
}

const Data = [
  { color: FARE_COLORS.peach, title: 'PLAY DATA', data: 'MOCK DATA' },
  { color: FARE_COLORS.salmon, title: 'WIN DATA', data: 'MOCK DATA' },
  { color: FARE_COLORS.pink, title: 'LOSS DATA', data: 'MOCK DATA' },
  { color: FARE_COLORS.blue, title: 'POPULAR GAMES', data: 'MOCK DATA' },
  { color: FARE_COLORS.peach, title: 'PROFITS', data: 'MOCK DATA' },
  { color: FARE_COLORS.salmon, title: 'BIGGEST WIN', data: 'MOCK DATA' },
  { color: FARE_COLORS.pink, title: 'BIGGEST LOSS', data: 'MOCK DATA' },
  { color: FARE_COLORS.blue, title: 'PLAYER COUNT', data: 'MOCK DATA' },
]

export const AnalyticsPage = () => {
  const [casinos, setCasinos] = useState<CasinoPreview[]>([])
  const [selectedCasino, setSelectedCasino] = useState('')
  const [selectedCasinoImage, setSelectedCasinoImage] = useState<string | undefined>('')
  const { getCasinoPreviews } = useBackendService()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCasinos = async () => {
      try {
        const casinoPreviews = await getCasinoPreviews()
        setCasinos(casinoPreviews)
      } catch (error) {
        console.error('Failed to fetch casinos:', error)
      }
    }

    fetchCasinos()
  }, [getCasinoPreviews])

  const handleCasinoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cleanedName = cleanUsername(event.target.value)
    if (cleanedName === selectedCasino) return
    setSelectedCasino(cleanedName || '')

    const selectedCasinoData = casinos.find(casino => casino.username === event.target.value)

    const bannerImage = selectedCasinoData?.config?.bannerImage
    const bannerImageUrl = typeof bannerImage === 'string' ? bannerImage : bannerImage?.url

    setSelectedCasinoImage(bannerImageUrl)
  }

  const imageUrl = selectedCasinoImage ? getImageUrl(selectedCasinoImage) : '/default-banner.jpg'

  return (
    <PageWrapper>
      <SAnalyticsPageWrapper>
        <Button
          onClick={() => navigate('/discover')}
          buttonType={ButtonEnum.BASE}
          disabled={false}
          style={{ alignSelf: 'flex-start', marginTop: '4px' }}
        >
          Back to discover page
        </Button>
        <SAnalyticsPageHeader
          $bgImage={imageUrl}
          role='img'
          aria-label={`${selectedCasino} banner`}
        >
          <h1>{selectedCasino ? `${selectedCasino} Analytics` : 'Analytics'}</h1>
        </SAnalyticsPageHeader>
        <SAnalyticSelectionWrapper>
          <label htmlFor='casino-select'>Change Casino: </label>
          <select
            name='casino-select'
            id='casino-select'
            value={selectedCasino}
            onChange={handleCasinoChange}
          >
            <option value=''>Select a Casino</option>
            {casinos.map(casino => (
              <option key={casino.id} value={casino.username}>
                {casino.username}
              </option>
            ))}
          </select>

          <label htmlFor='time-select'>Change Time Period: </label>
          <select name='time-select' id='time-select'>
            <option value='day'>Last 24 hours</option>
            <option value='week'>Last 7 days</option>
            <option value='month'>Last 30 days</option>
            <option value='all'>All time</option>
          </select>
        </SAnalyticSelectionWrapper>
        <SAnylyticsGridWrapper>
          {Data.map((item, index) => (
            <STiles key={index} color={item.color} title={item.title} data={item.data} />
          ))}
        </SAnylyticsGridWrapper>
        <LeaderboardGrid />
      </SAnalyticsPageWrapper>
    </PageWrapper>
  )
}
