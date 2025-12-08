import React from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Props for the modal base
interface ModalBaseProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
  backdropClickDisabledRef?: React.RefObject<boolean>
}

/**
 * Base modal component using shadcn Dialog
 */
export const ModalBase: React.FC<ModalBaseProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '500px',
  backdropClickDisabledRef,
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open && !backdropClickDisabledRef?.current) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'bg-surface-raised border-border rounded-xl p-0',
          'max-h-[85vh] overflow-y-auto overflow-x-hidden scrollbar-thin',
          'flex flex-col gap-4',
          'max-[992px]:max-w-[95%] max-[992px]:max-h-[90vh]'
        )}
        style={{ maxWidth }}
        onPointerDownOutside={(e) => {
          if (backdropClickDisabledRef?.current) {
            e.preventDefault()
          }
        }}
      >
        {title && (
          <DialogHeader className="relative w-full mb-4 px-6 pt-6 max-[992px]:px-4">
            <DialogTitle className="text-white text-2xl font-semibold text-center w-full leading-tight">
              {title}
            </DialogTitle>
          </DialogHeader>
        )}
        <div className="px-6 pb-6 w-full box-border max-[992px]:px-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
