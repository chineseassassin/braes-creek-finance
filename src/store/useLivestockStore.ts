import { create } from 'zustand'
import { LivestockUnit } from '@/lib/types'
import { SAMPLE_LIVESTOCK } from '@/lib/sample-data'
import { useAppStore } from './useAppStore'
import { useWorkflowStore } from './useWorkflowStore'

interface LivestockState {
  units: LivestockUnit[]
  isLoading: boolean
  
  fetchUnits: () => Promise<void>
  addUnit: (unit: Omit<LivestockUnit, 'id' | 'workflow_status' | 'created_by' | 'created_at'>) => Promise<LivestockUnit | null>
  updateUnit: (id: string, updates: Partial<LivestockUnit>) => Promise<void>
  updateStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>
  approveUnit: (id: string) => Promise<void>
  deleteUnit: (id: string) => Promise<void>
}

export const useLivestockStore = create<LivestockState>((set, get) => ({
  units: SAMPLE_LIVESTOCK.map(u => ({ ...u, workflow_status: 'approved' })) as any,
  isLoading: false,

  fetchUnits: async () => {
    set({ isLoading: true })
    // In a real app, fetch from Supabase here
    set({ isLoading: false })
  },

  addUnit: async (unit) => {
    const { currentUser } = useAppStore.getState()
    
    const isAdmin = currentUser.role === 'admin'
    const status = isAdmin ? 'approved' : 'pending'
    
    const newUnit: LivestockUnit = { 
      ...unit, 
      id: `ls-${Date.now()}`,
      workflow_status: status,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    } as LivestockUnit

    set((state) => ({ units: [newUnit, ...state.units] }))

    // AUDIT
    useAppStore.getState().logEmployeeSubmission(
      'Livestock',
      'add',
      'livestock',
      newUnit.id,
      { type: unit.animal_type, quantity: unit.quantity, batch: unit.batch_name }
    );

    return newUnit
  },

  updateUnit: async (id, updates) => {
    const old = get().units.find(u => u.id === id);
    set((state) => ({
      units: state.units.map(u => u.id === id ? { ...u, ...updates } : u)
    }))

    if (old) {
       useAppStore.getState().logEmployeeSubmission(
         'Livestock',
         'update',
         'livestock',
         id,
         { updates }
       );
    }
  },

  updateStatus: async (id, status) => {
    set((state) => ({
      units: state.units.map(u => u.id === id ? { ...u, workflow_status: status } : u)
    }))
  },

  approveUnit: async (id) => {
    const unit = get().units.find(u => u.id === id);
    if (unit) {
      set((state) => ({
        units: state.units.map(u => u.id === id ? { ...u, workflow_status: 'approved' } : u)
      }));
      
      useAppStore.getState().logEmployeeSubmission(
        'Livestock',
        'update',
        'livestock',
        id,
        { action: 'approval', quantity: unit.quantity }
      );
    }
  },

  deleteUnit: async (id) => {
    set((state) => ({
      units: state.units.filter(u => u.id !== id)
    }))
  }
}))
