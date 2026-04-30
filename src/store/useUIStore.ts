import { create } from 'zustand'

interface UIStore {
  sidebarCollapsed: boolean
  theme: 'dark' | 'light'
  toggleSidebar: () => void
  toggleTheme: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
}))
