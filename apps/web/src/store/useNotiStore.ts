import { create } from 'zustand'
import { toast } from 'sonner'

type NotificationType = 'success' | 'error' | 'info'

interface Notification {
  type: NotificationType
  msg: string
}

interface NotiStore {
  addAppNoti: (notification: Notification) => void
}

const typeToToast: Record<NotificationType, (message: string) => void> = {
  success: toast.success,
  error: toast.error,
  info: toast,
}

const useNotiStore = create<NotiStore>(() => ({
  addAppNoti: ({ type, msg }) => {
    const handler = typeToToast[type] ?? toast
    handler(msg)
  },
}))

export const addAppNoti = (notification: Notification) => {
  useNotiStore.getState().addAppNoti(notification)
}

export default useNotiStore
