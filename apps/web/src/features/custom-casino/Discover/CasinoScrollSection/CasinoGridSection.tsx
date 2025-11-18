// @ts-nocheck
import { type CasinoPreview } from '../../shared/types'
import { CasinoCard } from '../CasinoCard/CasinoCard'
import { SCasinoGridWrapper } from '../DiscoverPage.styles'
import { SScrollWrapper } from './CasinoScrollSection.styles'

interface CasinoGridSectionProps {
  casinos: CasinoPreview[]
}

const CasinoGridSection: React.FC<CasinoGridSectionProps> = ({ casinos }) => {
  return (
    <SScrollWrapper>
      <SCasinoGridWrapper>
        {casinos.map(casino => (
          <CasinoCard key={casino.id} casino={casino} />
        ))}
      </SCasinoGridWrapper>
    </SScrollWrapper>
  )
}

export default CasinoGridSection
