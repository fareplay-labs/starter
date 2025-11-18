// @ts-nocheck
import { PageWrapper } from '@/pages/style'
import { SContent, SDiscoverPage } from '../DiscoverPage.styles'

interface DiscoverPageWrapperProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export const DiscoverPageWrapper: React.FC<DiscoverPageWrapperProps> = ({ children, style }) => {
  return (
    <PageWrapper className='custom-casino'>
      <SDiscoverPage style={style}>
        <SContent>{children}</SContent>
      </SDiscoverPage>
    </PageWrapper>
  )
}
