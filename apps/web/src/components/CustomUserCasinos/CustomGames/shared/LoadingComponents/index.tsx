// @ts-nocheck
import { styled, keyframes } from 'styled-components'
import { COLORS } from '@/design/colors'
import { getImageUrl } from '@/components/CustomUserCasinos/shared/utils/cropDataUtils'

// Base container for all game content with background support
export const GameContainer = styled.div<{ backgroundColor?: any }>`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  padding: 20px;
  border-radius: 8px;
  overflow: hidden;
  background: ${props => getImageUrl(props.backgroundColor) || 'transparent'};
`

// Add a pulsing animation for loading
const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
`

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const LoadingContainer = styled(GameContainer)`
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
  animation: ${pulse} 2s infinite ease-in-out;
  flex-direction: column;
  gap: 20px;
`

const LoadingText = styled.div`
  font-size: 18px;
  color: #555;
  font-weight: 500;
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 5px solid rgba(95, 95, 255, 0.2);
  border-top: 5px solid #5f5fff;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`

const ErrorContainer = styled(GameContainer)`
  background-color: rgba(255, 0, 0, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 0, 0, 0.2);
  color: ${COLORS.error};
  padding: 20px;
  text-align: center;
`

// Combined loading component for ease of use
interface LoadingProps {
  message?: string
  className?: string
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', className }) => (
  <LoadingContainer className={className}>
    <Spinner />
    <LoadingText>{message}</LoadingText>
  </LoadingContainer>
)

// Error component
interface ErrorProps {
  error: string | undefined
  className?: string
}

export const Error: React.FC<ErrorProps> = ({ error, className }) => (
  <ErrorContainer className={className}>
    <div>Error:</div>
    <div>{error || 'An unknown error occurred'}</div>
  </ErrorContainer>
)
