import { create } from 'zustand'
import { ApprovalRequest, AIRecommendation, SystemEvent, WorkflowStatus } from '@/lib/types'

interface WorkflowState {
  approvals: ApprovalRequest[];
  recommendations: AIRecommendation[];
  events: SystemEvent[];
  
  // Actions
  addApprovalRequest: (request: Omit<ApprovalRequest, 'id' | 'created_at' | 'updated_at'>) => void;
  updateApprovalStatus: (id: string, status: WorkflowStatus, comment?: string) => void;
  
  addRecommendation: (rec: Omit<AIRecommendation, 'id' | 'created_at'>) => void;
  updateRecommendationStatus: (id: string, status: AIRecommendation['status']) => void;
  generateRecommendations: () => void;
  
  logEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void;
  clearOldEvents: (beforeDate: Date) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  approvals: [
    {
      id: 'app-1',
      entity_type: 'expense',
      entity_id: 'EXP-492',
      requester_id: 'user-mary',
      status: 'pending',
      priority: 'high',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    }
  ],
  recommendations: [],
  events: [],

  addApprovalRequest: (request) => set((state) => {
    const newRequest: ApprovalRequest = {
      ...request,
      id: `app-${Math.random().toString(36).substring(7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { approvals: [newRequest, ...state.approvals] };
  }),

  updateApprovalStatus: (id, status, comment) => set((state) => ({
    approvals: state.approvals.map((app) => 
      app.id === id ? { ...app, status, comment, updated_at: new Date().toISOString() } : app
    )
  })),

  addRecommendation: (rec) => set((state) => {
    const newRec: AIRecommendation = {
      ...rec,
      id: `rec-${Math.random().toString(36).substring(7)}`,
      created_at: new Date().toISOString(),
    };

    // Emit event for new recommendation
    const { useAppStore } = (require('./useAppStore'));
    useAppStore.getState().emitSystemEvent({
      type: 'recommendation',
      severity: 'info',
      module: rec.module,
      message: `AI Intelligence: New recommendation generated - ${rec.title}`,
      metadata: { id: newRec.id }
    });

    return { recommendations: [newRec, ...state.recommendations] };
  }),

  updateRecommendationStatus: (id, status) => set((state) => ({
    recommendations: state.recommendations.map((rec) => 
      rec.id === id ? { ...rec, status } : rec
    )
  })),

  generateRecommendations: () => {
    const { useAlertStore } = (require('./useAlertStore'));
    const { useDashboardStore } = (require('./useDashboardStore'));
    
    const activeAlerts = useAlertStore.getState().getActiveAlerts();
    const transactions = useDashboardStore.getState().transactions;
    const currentRecs = get().recommendations;
    
    const newRecs: AIRecommendation[] = [];

    // 1. RULE: Expense Spike Analysis
    const spendingAlerts = activeAlerts.filter(a => a.category === 'spending' && a.severity !== 'info');
    spendingAlerts.forEach(alert => {
       const existing = currentRecs.find(r => r.title.includes(alert.title));
       if (existing) return;

       newRecs.push({
          id: `rec-sp-${alert.id}`,
          module: 'Expenses',
          title: `Optimization Opportunity: ${alert.title.split(':').pop()}`,
          what_happening: alert.message,
          why_it_matters: "Uncontrolled spending spikes erode profit margins and disrupt cash flow forecasts. This deviation suggests a potential vendor overcharge or operational inefficiency.",
          next_steps: "Review the original invoice for this transaction. Compare current pricing with historical vendor rates. If verified, adjust the Q3 budget allocation.",
          estimated_impact: "Estimated savings of 10-15% through vendor renegotiation.",
          urgency: alert.severity === 'critical' ? 'critical' : 'high',
          confidence: 88,
          impact_score: alert.priority_score,
          status: 'new',
          created_at: new Date().toISOString()
       });
    });

    // 2. RULE: Payroll Audit Signal
    const payrollAlerts = activeAlerts.filter(a => a.category === 'payroll' && (a.severity === 'critical' || a.severity === 'warning'));
    payrollAlerts.forEach(alert => {
       const existing = currentRecs.find(r => r.title.includes('Labor Audit'));
       if (existing) return;

       newRecs.push({
          id: `rec-py-${alert.id}`,
          module: 'Payroll',
          title: 'Strategic Labor Audit Required',
          what_happening: "Detected a sudden increase in labor costs exceeding historical benchmarks.",
          why_it_matters: "Labor is your largest variable cost. Persistent spikes without corresponding revenue increases indicate sub-optimal shift scheduling or excessive overtime.",
          next_steps: "Audit shift logs for the last 14 days. Implement a mandatory pre-approval for non-emergency overtime. Review worker productivity metrics.",
          estimated_impact: "Potential reduction of $2,500/mo in overtime expenses.",
          urgency: 'high',
          confidence: 92,
          impact_score: 85,
          status: 'new',
          created_at: new Date().toISOString()
       });
    });

    // 3. RULE: Livestock Mortality Crisis
    const mortalityAlerts = activeAlerts.filter(a => a.category === 'livestock' && a.title.includes('Mortality'));
    mortalityAlerts.forEach(alert => {
       const existing = currentRecs.find(r => r.title.includes('Biosecurity'));
       if (existing) return;

       newRecs.push({
          id: `rec-ls-m-${alert.id}`,
          module: 'Livestock Intelligence',
          title: 'Immediate Biosecurity Protocol',
          what_happening: alert.message,
          why_it_matters: "Uncontrolled mortality leads to catastrophic asset loss and potential cross-infection across the farm estate. Early intervention is critical to preserve the core herd/flock.",
          next_steps: "Activate Level 2 Quarantine. Conduct comprehensive water and feed analysis. Review recent vaccination logs for gaps. Schedule emergency site visit with Senior Vet.",
          estimated_impact: "Prevents estimated $15,000 in potential additional livestock loss.",
          urgency: alert.severity === 'critical' ? 'critical' : 'high',
          confidence: 96,
          impact_score: 98,
          status: 'new',
          created_at: new Date().toISOString()
       });
    });

    // 4. RULE: Low Production Output
    if (activeAlerts.some(a => a.category === 'livestock' && a.message.includes('output'))) {
       const existing = currentRecs.find(r => r.title.includes('Output Optimization'));
       if (!existing) {
          newRecs.push({
             id: `rec-ls-p-${Math.random()}`,
             module: 'Livestock Intelligence',
             title: 'Production Output Optimization',
             what_happening: "Production yields (eggs/meat) have dropped 12% below the 30-day moving average.",
             why_it_matters: "Reduced yields impact fulfillment of supply contracts and lower overall revenue efficiency per unit.",
             next_steps: "Review nutrient density of current feed batch. Check climate control logs for optimal temperature variance. Audit worker shift attendance during collection periods.",
             estimated_impact: "Restore revenue baseline by $1,200 per week.",
             urgency: 'medium',
             confidence: 85,
             impact_score: 75,
             status: 'new',
             created_at: new Date().toISOString()
          });
       }
    }

    // Sort by Urgency and Impact Score
    const urgencyMap = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    const allRecs = [...newRecs, ...currentRecs.filter(r => r.status === 'new')]
       .sort((a, b) => {
          const uA = urgencyMap[a.urgency] || 0;
          const uB = urgencyMap[b.urgency] || 0;
          if (uA !== uB) return uB - uA;
          return b.impact_score - a.impact_score;
       })
       .slice(0, 5); // Limit to top 5

    // Only update if we have new ones
    if (newRecs.length > 0) {
       set({ recommendations: allRecs });
       
       // Log to events for each new recommendation
       const { useAppStore } = (require('./useAppStore'));
       newRecs.forEach(r => {
          useAppStore.getState().emitSystemEvent({
             type: 'recommendation',
             severity: 'info',
             module: 'AI Engine',
             message: `Intelligence Hub: Actionable decision generated for ${r.module}`,
             metadata: { id: r.id }
          });
       });
    }
  },

  logEvent: (event) => set((state) => {
    const newEvent: SystemEvent = {
      ...event,
      id: `ev-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
    };
    return { events: [newEvent, ...state.events] };
  }),

  clearOldEvents: (beforeDate) => set((state) => ({
    events: state.events.filter((ev) => new Date(ev.timestamp) > beforeDate)
  })),
}))
