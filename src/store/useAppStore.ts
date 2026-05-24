import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAlertStore } from './useAlertStore'
import { useActivityStore } from './useActivityStore'
import { useWorkflowStore } from './useWorkflowStore'
import { ApprovalRequest, AIRecommendation, SystemEvent, WorkflowStatus, EntityType } from '@/lib/types'
import { toast } from 'react-hot-toast'

/**
 * ── BRAES CREEK COMMAND CENTER ──────────────────────────────────────────
 * PHASE 1 COORDINATION ENGINE
 * 
 * This store acts as the central wiring hub for cross-module communication.
 * It prepares the foundation for:
 * - Automated Approvals
 * - AI-Driven Decision Support
 * - Cross-Module System Events
 * ────────────────────────────────────────────────────────────────────────
 */

interface UserIdentity {
  id: string;
  name: string;
  role: 'admin' | 'data-entry' | 'viewer' | 'restricted';
}

interface AppState {
  isInitialized: boolean;
  systemStatus: 'nominal' | 'degraded' | 'critical';
  currentUser: UserIdentity;
  theme: 'dark' | 'light';
  
  // Foundation Actions (Phase 1)
  initializeEngine: () => void;
  syncCrossModuleData: () => void;
  
  // Phase 3 Actions
  switchRole: (role: 'admin' | 'data-entry' | 'viewer' | 'restricted') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Placeholder Wiring for future phases
  requestApproval: (entityType: string, entityId: string, metadata?: any) => void;
  emitSystemEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void;
  logEmployeeSubmission: (module: string, action: string, entityType: EntityType, entityId: string, metadata?: any) => void;
  processApproval: (requestId: string, status: 'approved' | 'rejected', comment?: string) => void;
  evaluateOperationalContext: () => void;
  pendingInvites: any[];
  addPendingInvite: (invite: any) => void;
  revokeInvite: (id: string) => void;
  acceptInvite: (id: string) => void;
  setCurrentUser: (user: UserIdentity) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      systemStatus: 'nominal',
      currentUser: {
        id: 'user-admin-1',
        name: 'Peter Admin',
        role: 'admin'
      },
      theme: 'dark',

      switchRole: (role) => {
        const identities = {
          'admin': { id: 'user-admin-1', name: 'Peter Admin', role: 'admin' as const },
          'data-entry': { id: 'user-de-1', name: 'Mary Operator', role: 'data-entry' as const },
          'viewer': { id: 'user-view-1', name: 'James Observer', role: 'viewer' as const },
          'restricted': { id: 'user-res-1', name: 'Staff Member', role: 'restricted' as const }
        };
        set({ currentUser: identities[role] });
      },

      pendingInvites: [],
      addPendingInvite: (invite) => set((s) => ({ pendingInvites: [invite, ...s.pendingInvites] })),
      revokeInvite: (id) => set((s) => ({ 
        pendingInvites: s.pendingInvites.map(i => i.id === id ? { ...i, status: 'Revoked' } : i) 
      })),
      acceptInvite: (id) => set((s) => ({
        pendingInvites: s.pendingInvites.map(i => i.id === id ? { ...i, status: 'Accepted' } : i)
      })),
      setCurrentUser: (user) => set({ currentUser: user }),

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('braes-creek-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  },

  initializeEngine: () => {
    console.log("[Foundation] Initializing Braes Creek Coordination Engine...");
    
    // Restore theme from localStorage or state
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('braes-creek-theme') as 'dark' | 'light';
      const currentTheme = savedTheme || get().theme;
      document.documentElement.setAttribute('data-theme', currentTheme);
      if (savedTheme) set({ theme: savedTheme });
    }

    // Future: Connect to Supabase Realtime / WebSocket
    set({ isInitialized: true });
  },

  syncCrossModuleData: () => {
    // Placeholder: Logic to ensure Alerts, Activity, and Workflows are in sync
    const alerts = useAlertStore.getState().alerts;
    console.log(`[Foundation] Syncing ${alerts.length} operational signals...`);
  },

  logEmployeeSubmission: (module, action, entityType, entityId, metadata) => {
    const { currentUser } = get();
    const isUpdate = action === 'update';
    const isAdmin = currentUser.role === 'admin';
    
    // 1. Create Pending Approval Request (if not admin)
    const { useWorkflowStore } = (require('./useWorkflowStore'));
    const { useNotificationStore } = (require('./useNotificationStore'));
    const { useActivityStore } = (require('./useActivityStore'));

    if (!isAdmin) {
      useWorkflowStore.getState().addApprovalRequest({
        entity_type: entityType,
        entity_id: entityId,
        requester_id: currentUser.id,
        priority: metadata?.priority || 'medium',
        status: 'pending'
      });

      // 2. Create Owner Notification
      useNotificationStore.getState().addNotification({
        title: isUpdate ? `Pending Update: ${module}` : `New Submission: ${module}`,
        message: `${currentUser.name} ${isUpdate ? 'updated a pending' : 'submitted a new'} ${module} record. Action required.`,
        category: module,
        priority: metadata?.priority === 'high' ? 'critical' : 'info'
      });

      // 3. Add Activity Feed event
      useActivityStore.getState().addLog({
        title: `${currentUser.name} submitted ${module} ${isUpdate ? 'update' : 'entry'} — Pending approval`,
        module: module,
        user: currentUser.name,
        status: 'Pending',
        severity: 'info'
      });

      // 5. Show employee confirmation toast
      toast.success('Submitted for owner approval.');
    } else {
       // Admin action - log as approved/direct
       useActivityStore.getState().addLog({
         title: `${currentUser.name} ${isUpdate ? 'updated' : 'added'} ${module} record`,
         module: module,
         user: currentUser.name,
         status: 'Approved',
         severity: 'success'
       });
    }

    // 4. Add Audit History event (Permanent for every action)
    useWorkflowStore.getState().logEvent({
      type: isUpdate ? 'update' : 'creation',
      severity: isAdmin ? 'info' : 'warning',
      module: module,
      message: `${currentUser.name} performed ${action} on ${entityType} (${entityId})`,
      user_id: currentUser.id,
      metadata: { ...metadata, status: isAdmin ? 'Approved' : 'Pending', device: 'Studio OS Hub' }
    });
  },

  processApproval: (requestId, status, comment) => {
    const { useWorkflowStore } = (require('./useWorkflowStore'));
    const { useActivityStore } = (require('./useActivityStore'));
    const { useNotificationStore } = (require('./useNotificationStore'));
    const { currentUser } = get();

    const request = useWorkflowStore.getState().approvals.find((a: any) => a.id === requestId);
    if (!request) return;

    // Update Workflow Status
    useWorkflowStore.getState().updateApprovalStatus(requestId, status as any, comment);

    // Orchestrate cross-module updates
    const moduleStoreMap: any = {
      'expense': './useDashboardStore',
      'livestock': './useLivestockStore',
      'crop': './useCropStore',
      'inventory': './useInventoryStore',
      'infrastructure': './useInfrastructureStore',
      'maintenance': './useInfrastructureStore',
      'payroll': './useDashboardStore',
      'loan': './useLoanStore',
      'labor': './useDashboardStore'
    };

    const storePath = moduleStoreMap[request.entity_type];
    if (storePath) {
      const store = (require(storePath));
      const storeKey = Object.keys(store).find(k => k.toLowerCase().includes('store'));
      if (storeKey) {
        const targetStore = store[storeKey];
        const state = targetStore.getState();
        // Standardized polymorphic update
        if (request.entity_type === 'maintenance' && state.updateMaintenanceStatus) {
           state.updateMaintenanceStatus(request.entity_id, status);
        } else if (state.updateStatus) {
           state.updateStatus(request.entity_id, status);
        } else if (state.updateTransactionStatus) {
           state.updateTransactionStatus(request.entity_id, status);
        } else if (state.approveUnit && status === 'approved') {
           state.approveUnit(request.entity_id);
        } else if (state.approveCrop && status === 'approved') {
           state.approveCrop(request.entity_id);
        } else if (state.approveItem && status === 'approved') {
           state.approveItem(request.entity_id);
        } else if (state.approveAsset && status === 'approved') {
           state.approveAsset(request.entity_id);
        }
      }
    }

    // Log Activity
    useActivityStore.getState().addLog({
      title: `Owner ${status} ${request.entity_type} submission from ${request.requester_id}`,
      module: 'System Intelligence',
      user: currentUser.name,
      status: status.toUpperCase(),
      severity: status === 'approved' ? 'success' : 'critical'
    });

    // Permanent Audit Trail
    useWorkflowStore.getState().logEvent({
      type: status === 'approved' ? 'approval' : 'rejection',
      severity: status === 'approved' ? 'info' : 'critical',
      module: 'Audit History',
      message: `Owner ${status} ${request.entity_type} record (${request.entity_id})`,
      user_id: currentUser.id,
      metadata: { requestId, comment, actioned_by: currentUser.name }
    });

    // Notify Requester (Self-closing if not real-time, but toast is enough for now)
    toast[status === 'approved' ? 'success' : 'error'](`Record ${status.toUpperCase()}`);

    // AI Re-evaluation trigger
    if (status === 'approved') {
       get().emitSystemEvent({
          type: 'approval',
          severity: 'info',
          module: 'Intelligence Hub',
          message: `Recalculating P&L and AI signals after ${request.entity_type} approval.`
       });
    }
  },

  emitSystemEvent: (event) => {
    // 🧠 PHASE 4: LIVE ACTIVITY REACTIONS
    console.log(`[Phase 4] System Event Emitted: ${event.message} (${event.type})`);
    
    // 1. Log to Workflow Audit Trail
    useWorkflowStore.getState().logEvent(event);
    
    // 2. Push to Activity Feed (Instantly updates UI)
    useActivityStore.getState().addLog({
      title: event.message,
      module: event.module,
      user: 'System',
      status: event.type,
      severity: event.severity
    });

    // 3. Reaction Engine
    if (event.type === 'approval') {
        // AI Reaction Engine: Record-specific re-evaluation
        // Disabled until SystemEvent metadata/entity mapping is standardized
        /*
        const transactionId = (event as any).entity_id;
        // ... (lookups disabled)
        */

         // 🧠 PHASE 7: Run Predictive Intelligence Engine
         useAlertStore.getState().runPredictiveAudit();

         // 🧠 PHASE 5: Trigger AI Engine recalculation
         useWorkflowStore.getState().generateRecommendations();
      }

    if (event.type === 'alert') {
       // 🧠 PHASE 5: Trigger AI Engine recalculation
       useWorkflowStore.getState().generateRecommendations();
    }
  },

  evaluateOperationalContext: () => {
    // Neural Bridge Placeholder: Future AI Recommendation Logic
    const alerts = useAlertStore.getState().getActiveAlerts();
    if (alerts.length > 5) {
       console.log("[Foundation] High-load context detected. Preparing AI optimization signals...");
    }
  },
  
  requestApproval: (entityType, entityId, metadata) => {
    const { useWorkflowStore } = (require('./useWorkflowStore'));
    const { currentUser } = get();
    
    useWorkflowStore.getState().addApprovalRequest({
      entity_type: entityType as any,
      entity_id: entityId,
      requester_id: currentUser.id,
      priority: metadata?.priority || 'medium',
      status: 'pending'
    });
  }
    }),
    {
      name: 'braes-creek-app-storage',
    }
  )
)
