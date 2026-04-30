import { create } from 'zustand'

export interface AppNotification {
  id: string
  title: string
  message: string
  category: string
  priority: 'critical' | 'warning' | 'info' | 'task'
  dueDate?: string
  amount?: number
  status: 'pending' | 'completed' | 'overdue'
  read: boolean
  createdAt: string
}

interface NotificationState {
  notifications: AppNotification[]
  isPanelOpen: boolean
  
  // Actions
  togglePanel: () => void
  setPanelOpen: (isOpen: boolean) => void
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'status'>) => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  markAsRead: (id: string) => void
  markAsCompleted: (id: string) => void
  
  // Computed
  getUnreadCount: () => number
}

const defaultMockNotifications: AppNotification[] = [
  {
    id: '1',
    title: 'Loan payment due today',
    message: 'Equipment loan payment of $2,500 is due today.',
    category: 'Loan Payment',
    priority: 'critical',
    amount: 2500,
    status: 'pending',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Review equipment maintenance cost',
    message: 'Maintenance costs exceeded projections by 12%.',
    category: 'Equipment',
    priority: 'warning',
    status: 'pending',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    title: 'Order poultry feed this week',
    message: 'Inventory levels are dropping below the 14-day supply.',
    category: 'Task',
    priority: 'task',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'pending',
    read: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: '4',
    title: 'System integrity check completed',
    message: 'All daily ledger transactions have been verified.',
    category: 'General',
    priority: 'info',
    status: 'completed',
    read: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: defaultMockNotifications,
  isPanelOpen: false,

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  setPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
  
  addNotification: (notification) => {
    const newNotif: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      read: false,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    set((state) => ({ notifications: [newNotif, ...state.notifications] }))
  },
  
  deleteNotification: (id) => {
    set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) }))
  },
  
  clearAll: () => set({ notifications: [] }),
  
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }))
  },

  markAsCompleted: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, status: 'completed' as const } : n)
    }))
  },
  
  getUnreadCount: () => {
    return get().notifications.filter(n => !n.read).length
  }
}))
