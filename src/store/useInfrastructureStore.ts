import { create } from 'zustand'
import { useAppStore } from './useAppStore'
import { useWorkflowStore } from './useWorkflowStore'

export interface Asset {
  id: string;
  name: string;
  category: 'Equipment' | 'Building' | 'Vehicle' | 'Irrigation' | 'Power';
  health_score: number;
  status: 'Nominal' | 'Warning' | 'Critical';
  last_service: string;
}

export interface MaintenanceRecord {
  id: string;
  asset_name: string;
  maintenance_type: 'Repair' | 'Service' | 'Inspection' | 'Replacement';
  vendor_id?: string;
  vendor_name?: string;
  date: string;
  cost?: number;
  status: 'Completed' | 'Scheduled';
  next_due_date?: string;
  notes?: string;
  created_by: string;
  approval_status: 'pending' | 'approved';
}

interface InfrastructureState {
  assets: Asset[];
  maintenanceLogs: MaintenanceRecord[];
  isLoading: boolean;

  // Actions
  addMaintenanceLog: (log: Omit<MaintenanceRecord, 'id' | 'approval_status' | 'created_by'>) => Promise<void>;
  updateLogStatus: (id: string, status: 'pending' | 'approved') => void;
}

export const useInfrastructureStore = create<InfrastructureState>((set, get) => ({
  assets: [
    { id: 'ast-1', name: 'John Deere 8R', category: 'Vehicle', health_score: 92, status: 'Nominal', last_service: '2024-03-15' },
    { id: 'ast-2', name: 'Combine S2', category: 'Vehicle', health_score: 45, status: 'Critical', last_service: '2023-11-20' },
    { id: 'ast-3', name: 'Irrigation Pump #2', category: 'Irrigation', health_score: 78, status: 'Warning', last_service: '2024-01-10' },
    { id: 'ast-4', name: 'Main Broiler House', category: 'Building', health_score: 98, status: 'Nominal', last_service: '2024-02-01' },
    { id: 'ast-5', name: 'Generator 500kVA', category: 'Power', health_score: 88, status: 'Nominal', last_service: '2024-04-12' },
  ],
  maintenanceLogs: [
    { 
      id: 'log-1', 
      asset_name: 'John Deere 8R', 
      maintenance_type: 'Service', 
      vendor_name: 'John Deere Service', 
      date: '2024-03-15', 
      cost: 1200, 
      status: 'Completed', 
      approval_status: 'approved',
      created_by: 'user-admin-1'
    },
    { 
      id: 'log-2', 
      asset_name: 'Combine S2', 
      maintenance_type: 'Repair', 
      vendor_name: 'Alex Smith', 
      date: '2024-04-25', 
      cost: 4500, 
      status: 'Scheduled', 
      approval_status: 'pending',
      created_by: 'user-de-1'
    }
  ],
  isLoading: false,

  addMaintenanceLog: async (log) => {
    const { currentUser, emitSystemEvent } = useAppStore.getState();
    const isAdmin = currentUser.role === 'admin';
    const approvalStatus = isAdmin ? 'approved' : 'pending';

    const newLog: MaintenanceRecord = {
      ...log,
      id: `log-${Math.random().toString(36).substring(7)}`,
      approval_status: approvalStatus,
      created_by: currentUser.id
    };

    set((state) => ({ maintenanceLogs: [newLog, ...state.maintenanceLogs] }));

    if (isAdmin) {
      // Immediate reaction for Admin
      emitSystemEvent({
        type: 'DATA_APPROVED',
        severity: 'info',
        module: 'Infrastructure',
        message: `Maintenance recorded for ${log.asset_name} (${log.maintenance_type})`,
        metadata: { id: newLog.id, entity_type: 'infrastructure' }
      });
    } else {
      // Approval workflow for Data Entry
      useWorkflowStore.getState().addApprovalRequest({
        entity_type: 'maintenance',
        entity_id: newLog.id,
        requester_id: currentUser.id,
        priority: log.cost && log.cost > 2000 ? 'high' : 'medium',
        status: 'pending'
      });

      emitSystemEvent({
        type: 'creation',
        severity: 'info',
        module: 'Infrastructure',
        message: `Maintenance log submitted for ${log.asset_name}: Awaiting Approval`,
        metadata: { id: newLog.id, entity_type: 'infrastructure' }
      });
    }
  },

  updateLogStatus: (id, status) => {
    set((state) => ({
      maintenanceLogs: state.maintenanceLogs.map(l => l.id === id ? { ...l, approval_status: status } : l)
    }));
  }
}))
