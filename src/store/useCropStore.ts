import { create } from 'zustand'
import { CropType } from '@/lib/types'
import { useAppStore } from './useAppStore'
import { useWorkflowStore } from './useWorkflowStore'

interface CropState {
  crops: CropType[]
  isLoading: boolean
  
  fetchCrops: () => Promise<void>
  addCrop: (crop: Omit<CropType, 'id'>) => Promise<CropType | null>
  updateCrop: (id: string, updates: Partial<CropType>) => Promise<void>
  updateStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>
  deleteCrop: (id: string) => Promise<void>
  approveCrop: (id: string) => Promise<void>
}

export const useCropStore = create<CropState>((set, get) => ({
  crops: [
    { 
      id: 'c1', name: 'Cassava', variety: 'Local White', planting_date: '2024-05-10', 
      expected_harvest: '2025-01-10', area_acres: 3, input_costs: 2500, labor_cost: 1200, 
      status: 'growing', workflow_status: 'approved', created_at: new Date().toISOString() 
    },
    { 
      id: 'c2', name: 'Tomato', variety: 'Heat Master', planting_date: '2024-10-15', 
      expected_harvest: '2025-01-15', area_acres: 0.75, input_costs: 1800, labor_cost: 900, 
      status: 'growing', workflow_status: 'approved', created_at: new Date().toISOString() 
    },
  ],
  isLoading: false,

  fetchCrops: async () => {
    set({ isLoading: true })
    set({ isLoading: false })
  },

  addCrop: async (crop) => {
    const { currentUser, emitSystemEvent } = useAppStore.getState()
    const { addApprovalRequest } = useWorkflowStore.getState()
    
    const isAdmin = currentUser.role === 'admin'
    const status = isAdmin ? 'approved' : 'pending'

    const newCrop: CropType = { 
      ...crop, 
      id: `crop-${Date.now()}`,
      workflow_status: status,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    } as CropType

    set((state) => ({ crops: [newCrop, ...state.crops] }))
    
    // ── AUDIT & APPROVAL REACTIONS ──────────────────────────────
    useAppStore.getState().logEmployeeSubmission(
      'Crops',
      'add',
      'crop',
      newCrop.id,
      { name: crop.name, variety: crop.variety, area: crop.area_acres }
    );
    // ────────────────────────────────────────────────────────────────

    return newCrop
  },

  approveCrop: async (id) => {
    set((state) => ({
      crops: state.crops.map(c => c.id === id ? { ...c, workflow_status: 'approved' } : c)
    }))
    
    const crop = get().crops.find(c => c.id === id)
    if (crop) {
       useAppStore.getState().emitSystemEvent({
          type: 'approval',
          severity: 'success',
          module: 'Crops',
          message: `Crop planting approved: ${crop.name}`,
          metadata: { id, acres: crop.area_acres }
       })
    }
  },

  updateCrop: async (id, updates) => {
    const old = get().crops.find(c => c.id === id);
    set((state) => ({
      crops: state.crops.map(c => c.id === id ? { ...c, ...updates } : c)
    }))

    if (old) {
       useAppStore.getState().logEmployeeSubmission(
         'Crops',
         'update',
         'crop',
         id,
         { updates }
       );
    }
  },

  updateStatus: async (id, status) => {
    set((state) => ({
      crops: state.crops.map(c => c.id === id ? { ...c, workflow_status: status } : c)
    }))
  },

  deleteCrop: async (id) => {
    set((state) => ({
      crops: state.crops.filter(c => c.id !== id)
    }))
  }
}))
