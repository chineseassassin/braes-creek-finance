import { create } from 'zustand'
import { CropType } from '@/lib/types'

interface CropState {
  crops: CropType[]
  isLoading: boolean
  
  fetchCrops: () => Promise<void>
  addCrop: (crop: Omit<CropType, 'id'>) => Promise<CropType>
  updateCrop: (id: string, updates: Partial<CropType>) => Promise<void>
  deleteCrop: (id: string) => Promise<void>
}

export const useCropStore = create<CropState>((set, get) => ({
  crops: [
    { id: 'c1', name: 'Cassava', variety: 'Local White', planting_date: '2024-05-10', area_acres: 3, created_at: new Date().toISOString() },
    { id: 'c2', name: 'Tomato', variety: 'Heat Master', planting_date: '2024-10-15', area_acres: 0.75, created_at: new Date().toISOString() },
  ],
  isLoading: false,

  fetchCrops: async () => {
    set({ isLoading: true })
    set({ isLoading: false })
  },

  addCrop: async (crop) => {
    const newCrop = { ...crop, id: `crop-${Date.now()}` } as CropType
    set((state) => ({ crops: [newCrop, ...state.crops] }))
    return newCrop
  },

  updateCrop: async (id, updates) => {
    set((state) => ({
      crops: state.crops.map(c => c.id === id ? { ...c, ...updates } : c)
    }))
  },

  deleteCrop: async (id) => {
    set((state) => ({
      crops: state.crops.filter(c => c.id !== id)
    }))
  }
}))
