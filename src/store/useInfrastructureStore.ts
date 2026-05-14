import { create } from 'zustand'
import { InfrastructureAsset, MaintenanceRecord } from '@/lib/types'
import { useAppStore } from './useAppStore'
import { useWorkflowStore } from './useWorkflowStore'

interface InfrastructureState {
  assets: InfrastructureAsset[]
  maintenanceLogs: MaintenanceRecord[]
  isLoading: boolean
  
  fetchInfrastructure: () => Promise<void>
  
  // Asset Actions
  addAsset: (asset: Omit<InfrastructureAsset, 'id' | 'workflow_status' | 'created_by' | 'created_at'>) => Promise<InfrastructureAsset | null>
  updateAssetStatus: (id: string, status: InfrastructureAsset['status']) => Promise<void>
  updateStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>
  approveAsset: (id: string) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  
  // Maintenance Actions
  addMaintenanceLog: (log: Omit<MaintenanceRecord, 'id' | 'workflow_status' | 'created_by' | 'created_at'>) => Promise<MaintenanceRecord | null>
  updateMaintenanceStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>
  approveMaintenance: (id: string) => Promise<void>
  markMaintenanceCompleted: (id: string) => Promise<void>
}

export const useInfrastructureStore = create<InfrastructureState>((set, get) => ({
  assets: [
    { 
      id: 'ast-1', name: 'John Deere Tractor 5075E', type: 'Tractor', location: 'Barn A', 
      status: 'operational', replacement_value: 45000, last_inspection: '2023-05-15', health_index: 95,
      workflow_status: 'approved', created_by: 'system', created_at: new Date().toISOString() 
    },
    { 
      id: 'ast-2', name: 'Backup Generator 50kW', type: 'Generator', location: 'Utility Shed', 
      status: 'maintenance', replacement_value: 12000, last_inspection: '2022-11-20', health_index: 65,
      workflow_status: 'approved', created_by: 'system', created_at: new Date().toISOString() 
    }
  ],
  maintenanceLogs: [],
  isLoading: false,

  fetchInfrastructure: async () => {
    set({ isLoading: true })
    set({ isLoading: false })
  },

  addAsset: async (asset) => {
    const { currentUser, emitSystemEvent } = useAppStore.getState()
    const { addApprovalRequest } = useWorkflowStore.getState()
    
    const isAdmin = currentUser.role === 'admin'
    const status = isAdmin ? 'approved' : 'pending'

    const newAsset: InfrastructureAsset = { 
      ...asset, 
      id: `ast-${Date.now()}`,
      workflow_status: status,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    } as InfrastructureAsset

    set((state) => ({ assets: [newAsset, ...state.assets] }))

    // ── AUDIT & APPROVAL REACTIONS ──────────────────────────────
    useAppStore.getState().logEmployeeSubmission(
      'Infrastructure',
      'add',
      'infrastructure',
      newAsset.id,
      { name: asset.name, type: asset.type }
    );
    // ────────────────────────────────────────────────────────────────

    return newAsset
  },

  updateAssetStatus: async (id, status) => {
     const { emitSystemEvent } = useAppStore.getState()
     set((state) => ({
        assets: state.assets.map(a => a.id === id ? { ...a, status } : a)
     }))
     
     const asset = get().assets.find(a => a.id === id)
     emitSystemEvent({
        type: 'update',
        severity: status === 'critical' ? 'critical' : (status === 'maintenance' ? 'warning' : 'info'),
        module: 'Infrastructure',
        message: `Asset status changed: ${asset?.name} is now ${status.replace('_', ' ')}`,
        metadata: { id, status }
     })
  },

  approveAsset: async (id) => {
    set((state) => ({
      assets: state.assets.map(a => a.id === id ? { ...a, workflow_status: 'approved' } : a)
    }))
    
    const asset = get().assets.find(a => a.id === id)
    if (asset) {
       useAppStore.getState().emitSystemEvent({
          type: 'approval',
          severity: 'info',
          module: 'Infrastructure',
          message: `Asset approved: ${asset.name}`,
          metadata: { id }
       })
    }
  },

  updateStatus: async (id, status) => {
    set((state) => ({
      assets: state.assets.map(a => a.id === id ? { ...a, workflow_status: status } : a)
    }))
  },

  deleteAsset: async (id) => {
    set((state) => ({
      assets: state.assets.filter(a => a.id !== id)
    }))
  },

  addMaintenanceLog: async (log) => {
    const { currentUser } = useAppStore.getState()
    
    const isAdmin = currentUser.role === 'admin'
    const status = isAdmin ? 'approved' : 'pending'

    const newLog: MaintenanceRecord = { 
      ...log, 
      id: `maint-${Date.now()}`,
      workflow_status: status,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    } as MaintenanceRecord

    set((state) => ({ maintenanceLogs: [newLog, ...state.maintenanceLogs] }))

    // ── AUDIT & APPROVAL REACTIONS ──────────────────────────────
    useAppStore.getState().logEmployeeSubmission(
      'Maintenance',
      'add',
      'maintenance',
      newLog.id,
      { asset_id: log.asset_id, cost: log.cost, type: log.maintenance_type }
    );
    // ────────────────────────────────────────────────────────────────

    return newLog
  },

  approveMaintenance: async (id) => {
     set((state) => ({
       maintenanceLogs: state.maintenanceLogs.map(l => l.id === id ? { ...l, workflow_status: 'approved' } : l)
     }))
     
     const log = get().maintenanceLogs.find(l => l.id === id)
     if (log) {
        useAppStore.getState().emitSystemEvent({
           type: 'approval',
           severity: 'info',
           module: 'Infrastructure',
           message: `Maintenance log approved for asset ID: ${log.asset_id}`,
           metadata: { id, cost: log.cost }
        })
     }
  },

  updateMaintenanceStatus: async (id, status) => {
     set((state) => ({
       maintenanceLogs: state.maintenanceLogs.map(l => l.id === id ? { ...l, workflow_status: status } : l)
     }))
  },

  markMaintenanceCompleted: async (id) => {
     set((state) => ({
        maintenanceLogs: state.maintenanceLogs.map(l => l.id === id ? { ...l, status: 'completed' } : l)
     }))
     
     const log = get().maintenanceLogs.find(l => l.id === id)
     if (log) {
        useAppStore.getState().emitSystemEvent({
           type: 'update',
           severity: 'info',
           module: 'Infrastructure',
           message: `Maintenance task completed for asset ID: ${log.asset_id}`,
           metadata: { id }
        })
     }
  }
}))
