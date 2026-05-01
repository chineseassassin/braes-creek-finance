import { create } from 'zustand'
import { LivestockUnit } from '@/lib/types'
import { SAMPLE_LIVESTOCK } from '@/lib/sample-data'

interface LivestockState {
  units: LivestockUnit[]
  isLoading: boolean
  
  fetchUnits: () => Promise<void>
  addUnit: (unit: Omit<LivestockUnit, 'id'>) => Promise<LivestockUnit>
  updateUnit: (id: string, updates: Partial<LivestockUnit>) => Promise<void>
  deleteUnit: (id: string) => Promise<void>
}

export const useLivestockStore = create<LivestockState>((set, get) => ({
  units: SAMPLE_LIVESTOCK as any, // Start with sample data but treat as live
  isLoading: false,

  fetchUnits: async () => {
    // In a real app, this would fetch from Supabase
    set({ isLoading: true })
    // Simulate fetch
    set({ isLoading: false })
  },

  addUnit: async (unit) => {
    const newUnit = { ...unit, id: `ls-${Date.now()}` } as LivestockUnit
    set((state) => ({ units: [newUnit, ...state.units] }))
    return newUnit
  },

  updateUnit: async (id, updates) => {
    set((state) => ({
      units: state.units.map(u => u.id === id ? { ...u, ...updates } : u)
    }))
  },

  deleteUnit: async (id) => {
    set((state) => ({
      units: state.units.filter(u => u.id !== id)
    }))
  }
}))
