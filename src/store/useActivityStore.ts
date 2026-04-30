import { create } from 'zustand'

export interface ActivityLog {
  id: string
  title: string
  module: string
  user: string
  status: string
  severity: 'info' | 'warning' | 'critical' | 'emergency' | 'success'
  timestamp: string
}

interface ActivityState {
  logs: ActivityLog[]
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void
}

const mockLogs: ActivityLog[] = [
  {
    id: 'l1',
    title: 'Expense Approved by Admin',
    module: 'Expenses',
    user: 'Peter Admin',
    status: 'Approved',
    severity: 'success',
    timestamp: new Date().toISOString()
  },
  {
    id: 'l2',
    title: 'Mary submitted livestock mortality update',
    module: 'Livestock Intelligence',
    user: 'Mary Joseph',
    status: 'Pending Approval',
    severity: 'warning',
    timestamp: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: 'l3',
    title: 'Data entry task expired (Upload Receipt)',
    module: 'Task System',
    user: 'James Ali',
    status: 'Missed',
    severity: 'critical',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
]

export const useActivityStore = create<ActivityState>((set) => ({
  logs: mockLogs,
  addLog: (log) => {
    const newLog: ActivityLog = {
      ...log,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    }
    set((state) => ({ logs: [newLog, ...state.logs] }))
  }
}))
