// @ts-nocheck
import { styled } from 'styled-components'
import { PageWrapper } from '@/pages/style'
import { SContent, SPageContainer } from './styles'

const SLoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 16px;
`

const SLoaderSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #ff5e4f;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`
export const LoadingUserPage = () => {
  return (
    <PageWrapper>
      <SPageContainer $fontFamily='Arial, Helvetica, sans-serif'>
        <SContent>
          <SLoaderContainer>
            <SLoaderSpinner />
            <div>Loading user casino data...</div>
          </SLoaderContainer>
        </SContent>
      </SPageContainer>
    </PageWrapper>
  )
}
