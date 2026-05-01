import { create } from 'zustand'
import { LivestockUnit } from '@/lib/types'
import { SAMPLE_LIVESTOCK } from '@/lib/sample-data'
import { useAppStore } from './useAppStore'
import { useWorkflowStore } from './useWorkflowStore'

interface LivestockState {
  units: LivestockUnit[]
  isLoading: boolean
  
  fetchUnits: () => Promise<void>
  addUnit: (unit: Omit<LivestockUnit, 'id'>) => Promise<LivestockUnit | null>
  updateUnit: (id: string, updates: Partial<LivestockUnit>) => Promise<void>
  deleteUnit: (id: string) => Promise<void>
  approveUnit: (id: string) => Promise<void>
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
    const { currentUser, emitSystemEvent } = useAppStore.getState()
    const { addApprovalRequest } = useWorkflowStore.getState()
    
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

    if (isAdmin) {
      emitSystemEvent({
        type: 'creation',
        severity: 'success',
        module: 'Livestock',
        message: `New ${unit.animal_type} batch recorded: ${unit.batch_name || 'Unnamed'}`,
        metadata: { id: newUnit.id, type: unit.animal_type, quantity: unit.quantity }
      })
      
      // Trigger AI/Risk Assessment if Admin
      emitSystemEvent({
        type: 'recommendation',
        severity: 'info',
        module: 'Intelligence',
        message: `Analyzing health and market risk for new ${unit.animal_type} livestock entry.`
      })
    } else {
      addApprovalRequest({
        entity_type: 'livestock',
        entity_id: newUnit.id,
        requester_id: currentUser.id,
        priority: 'medium',
        status: 'pending'
      })
      
      emitSystemEvent({
        type: 'creation',
        severity: 'info',
        module: 'Livestock',
        message: `Livestock entry submitted for approval by ${currentUser.full_name}`,
        metadata: { id: newUnit.id }
      })
    }

    return newUnit
  },

  updateUnit: async (id, updates) => {
    set((state) => ({
      units: state.units.map(u => u.id === id ? { ...u, ...updates } : u)
    }))
  },

  approveUnit: async (id) => {
     set((state) => ({
       units: state.units.map(u => u.id === id ? { ...u, workflow_status: 'approved' } : u)
     }))
     
     const unit = get().units.find(u => u.id === id)
     if (unit) {
        useAppStore.getState().emitSystemEvent({
           type: 'approval',
           severity: 'success',
           module: 'Livestock',
           message: `Livestock entry approved: ${unit.batch_name || unit.animal_type}`,
           metadata: { id, quantity: unit.quantity }
        })
     }
  },

  deleteUnit: async (id) => {
    set((state) => ({
      units: state.units.filter(u => u.id !== id)
    }))
  }
}))
