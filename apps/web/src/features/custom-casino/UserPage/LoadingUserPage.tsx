import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageWrapper } from '@/pages/style'

// Page container component
interface PageContainerProps {
  fontFamily: string
  children: React.ReactNode
}

const PageContainer: React.FC<PageContainerProps> = ({ fontFamily, children }) => (
  <div
    className={cn(
      'h-[calc(100%-32px)] overflow-y-scroll w-full',
      'max-[992px]:min-h-[calc(100%-32px)] max-[992px]:mx-auto'
    )}
    style={{ fontFamily }}
  >
    {children}
  </div>
)

// Content wrapper
const Content: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full min-w-0 max-w-[100vw] mx-auto max-[992px]:max-w-full">
    {children}
  </div>
)

export const LoadingUserPage = () => {
  return (
    <PageWrapper>
      <PageContainer fontFamily='Arial, Helvetica, sans-serif'>
        <Content>
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-casino-accent" />
            <p className="text-muted-foreground">Loading user casino data...</p>
          </div>
        </Content>
      </PageContainer>
    </PageWrapper>
  )
}
