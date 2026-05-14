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
    const spendingAlerts = activeAlerts.filter((a: any) => a.category === 'spending' && a.severity !== 'info');
    spendingAlerts.forEach((alert: any) => {
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
    const payrollAlerts = activeAlerts.filter((a: any) => a.category === 'payroll' && (a.severity === 'critical' || a.severity === 'warning'));
    payrollAlerts.forEach((alert: any) => {
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
    const mortalityAlerts = activeAlerts.filter((a: any) => a.category === 'livestock' && a.title.includes('Mortality'));
    mortalityAlerts.forEach((alert: any) => {
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
    if (activeAlerts.some((a: any) => a.category === 'livestock' && a.message.includes('output'))) {
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

    // 5. RULE: Crop Yield Recovery
    const yieldAlerts = activeAlerts.filter((a: any) => a.related_table === 'crops' && a.title.includes('Yield'));
    yieldAlerts.forEach((alert: any) => {
       const existing = currentRecs.find(r => r.title.includes('Yield Recovery'));
       if (existing) return;

       newRecs.push({
          id: `rec-cr-y-${alert.id}`,
          module: 'Crop Intelligence',
          title: 'Yield Recovery & Soil Audit',
          what_happening: alert.message,
          why_it_matters: "A yield deficit below 80% represents significant revenue leakage and suggests underlying soil exhaustion or pest pressure.",
          next_steps: "Execute immediate soil nutrient analysis. Audit irrigation consistency over the last 30 days. Review pesticide application efficacy. Consult with agronomist on Q4 planting mix.",
          estimated_impact: "Estimated $8,000 revenue recovery through optimized nutrient application.",
          urgency: alert.severity === 'critical' ? 'critical' : 'high',
          confidence: 90,
          impact_score: 88,
          status: 'new',
          created_at: new Date().toISOString()
       });
    });

    // 6. RULE: Labor vs Crop Efficiency
    if (activeAlerts.some((a: any) => a.category === 'payroll' && a.severity === 'critical') && 
        activeAlerts.some((a: any) => a.related_table === 'crops' && a.severity === 'warning')) {
       const existing = currentRecs.find(r => r.title.includes('Labor Efficiency'));
       if (!existing) {
          newRecs.push({
             id: `rec-cr-l-${Math.random()}`,
             module: 'Crop Intelligence',
             title: 'Labor-to-Yield Efficiency Audit',
             what_happening: "Labor costs are rising by 15% while crop yields remain flat or declining.",
             why_it_matters: "This decoupling indicates workforce inefficiency or manual process bottlenecks that erode total farm ROI.",
             next_steps: "Review daily labor allocation logs per acre. Identify high-cost/low-output zones. Consider automating irrigation or harvest sorting to reduce manual dependency.",
             estimated_impact: "Potential $3,200/mo reduction in unnecessary labor overhead.",
             urgency: 'high',
             confidence: 82,
             impact_score: 80,
             status: 'new',
             created_at: new Date().toISOString()
          });
       }
    }

    // 7. RULE: Inventory Usage Velocity
    const usageAlerts = activeAlerts.filter((a: any) => a.related_table === 'inventory' && a.title.includes('Usage Rate'));
    usageAlerts.forEach((alert: any) => {
       const existing = currentRecs.find(r => r.title.includes('Procurement Audit'));
       if (existing) return;

       newRecs.push({
          id: `rec-iv-u-${alert.id}`,
          module: 'Inventory',
          title: 'Critical Procurement Audit',
          what_happening: alert.message,
          why_it_matters: "An abnormal spike in inventory usage (30%+) suggests either significant operational inefficiency or potential inventory shrinkage (theft/loss).",
          next_steps: "Verify physical stock counts against digital logs. Review distribution authorizations for the last 7 days. Audit waste logs for high-usage items. Tighten procurement sign-off thresholds.",
          estimated_impact: "Avoided $4,500/mo in potential inventory loss.",
          urgency: 'high',
          confidence: 88,
          impact_score: 85,
          status: 'new',
          created_at: new Date().toISOString()
       });
    });

    // 8. RULE: Stock Replenishment Optimization
    const lowStockAlerts = activeAlerts.filter((a: any) => a.related_table === 'inventory' && a.severity === 'critical');
    if (lowStockAlerts.length >= 2) {
       const existing = currentRecs.find(r => r.title.includes('Replenishment'));
       if (!existing) {
          newRecs.push({
             id: `rec-iv-r-${Math.random()}`,
             module: 'Inventory',
             title: 'Multi-Item Replenishment Strategy',
             what_happening: "Multiple critical items have fallen below depletion thresholds simultaneously.",
             why_it_matters: "Operational readiness is at 15% capacity. Lack of essential inputs will cause a total production freeze within 72 hours.",
             next_steps: "Execute bulk procurement order to leverage volume discounts. Coordinate with logistics for express delivery. Shift resources to high-priority production zones only.",
             estimated_impact: "Prevented total operational freeze (Est. $12k value).",
             urgency: 'critical',
             confidence: 94,
             impact_score: 95,
             status: 'new',
             created_at: new Date().toISOString()
          });
       }
    }

    // 9. RULE: Repeated Infrastructure Repair Cost
    const repairCostAlerts = activeAlerts.filter((a: any) => a.related_table === 'infrastructure' && a.title.includes('Cost Variance'));
    repairCostAlerts.forEach((alert: any) => {
       const existing = currentRecs.find(r => r.title.includes('Asset Lifecycle Audit'));
       if (existing) return;

       newRecs.push({
          id: `rec-in-r-${alert.id}`,
          module: 'Infrastructure & Ops',
          title: 'Asset Lifecycle Audit',
          what_happening: alert.message,
          why_it_matters: "Recurring high maintenance costs for this asset are approaching the cost of total replacement (CapEx vs OpEx).",
          next_steps: "Analyze total repair spend for this asset over 12 months. Request quotes for modern energy-efficient replacements. Evaluate if current usage exceeds original asset specs.",
          estimated_impact: "Estimated 22% reduction in long-term operational maintenance overhead.",
          urgency: 'medium',
          confidence: 84,
          impact_score: 72,
          status: 'new',
          created_at: new Date().toISOString()
       });
    });

    // 10. RULE: Critical Operational Risk (Overdue Critical Assets)
    const criticalInfraAlerts = activeAlerts.filter((a: any) => a.related_table === 'infrastructure' && a.severity === 'critical');
    if (criticalInfraAlerts.length > 0) {
       const existing = currentRecs.find(r => r.title.includes('Operational Continuity'));
       if (!existing) {
          newRecs.push({
             id: `rec-in-c-${Math.random()}`,
             module: 'Infrastructure & Ops',
             title: 'Operational Continuity Protocol',
             what_happening: "Critical infrastructure (Power/Irrigation/Storage) maintenance is overdue.",
             why_it_matters: "Single point of failure detected. Failure of these assets will halt production or cause catastrophic product loss (e.g., cold chain failure).",
             next_steps: "Activate emergency maintenance budget. Redirect technical staff to high-risk zones immediately. Deploy secondary generators/pumps for redundancy.",
             estimated_impact: "Protects estimated $45,000 in perishable inventory/production yield.",
             urgency: 'critical',
             confidence: 96,
             impact_score: 98,
             status: 'new',
             created_at: new Date().toISOString()
          });
       }
    }

    // 11. RULE: Predictive Supply Chain Management
    const predStockAlerts = activeAlerts.filter((a: any) => a.related_record_id?.toString().startsWith('pred-inv-') && a.severity === 'critical');
    predStockAlerts.forEach((alert: any) => {
       const existing = currentRecs.find(r => r.title.includes('Just-in-Time Procurement'));
       if (existing) return;

       newRecs.push({
          id: `rec-pd-s-${alert.id}`,
          module: 'Predictive Intelligence',
          title: 'Just-in-Time Procurement Strategy',
          what_happening: "Current stock velocity indicates a total depletion of core inputs within the next 48-72 hours.",
          why_it_matters: "Waiting for standard reorder cycles will result in a 4-day production gap, costing approximately $2,400 in lost labor productivity and yield.",
          next_steps: "Bypass standard procurement approval for this item. Contact 'GreenField Supplies' for same-day express delivery. Update the safety stock baseline to 10 days.",
          estimated_impact: "Saves $2,400 in productivity loss and prevents supply chain breakage.",
          urgency: 'critical',
          confidence: 94,
          impact_score: 92,
          status: 'new',
          created_at: new Date().toISOString()
       });
    });

    // 12. RULE: Cash Flow Protection Strategy
    if (activeAlerts.some((a: any) => a.related_record_id === 'pred-cash-flow')) {
       const existing = currentRecs.find(r => r.title.includes('Liquidity Protection'));
       if (!existing) {
          newRecs.push({
             id: `rec-pd-c-${Math.random()}`,
             module: 'Predictive Intelligence',
             title: 'Liquidity Protection Strategy',
             what_happening: "Predictive modeling indicates a cash flow deficit by the end of the next month.",
             why_it_matters: "Maintaining a minimum 1.5x liquidity ratio is required for the upcoming harvest-related labor surge.",
             next_steps: "Review pending vendor payments for deferral eligibility. Audit accounts receivable for items older than 30 days. Consider a short-term credit line bridge.",
             estimated_impact: "Maintains operational solvency and preserves credit rating for Q4 expansion.",
             urgency: 'high',
             confidence: 91,
             impact_score: 88,
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
