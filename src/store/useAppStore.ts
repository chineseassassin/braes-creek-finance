import { create } from 'zustand'
import { useAlertStore } from './useAlertStore'
import { useActivityStore } from './useActivityStore'
import { useWorkflowStore } from './useWorkflowStore'
import { SystemEvent } from '@/lib/types'

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
  role: 'admin' | 'data-entry' | 'viewer';
}

interface AppState {
  isInitialized: boolean;
  systemStatus: 'nominal' | 'degraded' | 'critical';
  currentUser: UserIdentity;
  
  // Foundation Actions (Phase 1)
  initializeEngine: () => void;
  syncCrossModuleData: () => void;
  
  // Phase 3 Actions
  switchRole: (role: 'admin' | 'data-entry' | 'viewer') => void;
  
  // Placeholder Wiring for future phases
  requestApproval: (entityType: string, entityId: string, metadata?: any) => void;
  emitSystemEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void;
  evaluateOperationalContext: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  systemStatus: 'nominal',
  currentUser: {
    id: 'user-admin-1',
    name: 'Peter Admin',
    role: 'admin'
  },

  switchRole: (role) => {
    const identities = {
      'admin': { id: 'user-admin-1', name: 'Peter Admin', role: 'admin' as const },
      'data-entry': { id: 'user-de-1', name: 'Mary Operator', role: 'data-entry' as const },
      'viewer': { id: 'user-view-1', name: 'James Observer', role: 'viewer' as const }
    };
    set({ currentUser: identities[role] });
  },

  initializeEngine: () => {
    console.log("[Foundation] Initializing Braes Creek Coordination Engine...");
    // Future: Connect to Supabase Realtime / WebSocket
    set({ isInitialized: true });
  },

  syncCrossModuleData: () => {
    // Placeholder: Logic to ensure Alerts, Activity, and Workflows are in sync
    const alerts = useAlertStore.getState().alerts;
    console.log(`[Foundation] Syncing ${alerts.length} operational signals...`);
  },

  requestApproval: (entityType, entityId, metadata) => {
    // Placeholder Wiring: Future Phase 2 will connect this to UI notifications
    console.log(`[Foundation] Approval Requested: ${entityType} -> ${entityId}`);
    
    useWorkflowStore.getState().addApprovalRequest({
      entity_type: entityType as any,
      entity_id: entityId,
      requester_id: 'system-agent',
      priority: 'medium',
      status: 'pending'
    });
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
    if (event.type === 'DATA_APPROVED') {
       const transactionId = event.entity_id;
       const { transactions } = (require('./useDashboardStore')).useDashboardStore.getState();
       const transaction = transactions.find((t: any) => t.id === transactionId);
       
       if (transaction) {
          // Trigger Alert Engine check
          useAlertStore.getState().evaluateTransaction(transaction, transactions);
       }

       // 🧠 PHASE 5: Trigger AI Engine recalculation
       useWorkflowStore.getState().generateRecommendations();
    }

    if (event.type === 'ALERT_CREATED') {
       // Future: Trigger high-priority mobile notifications or sound alerts
       
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
  }
}))
