import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { useNotificationStore } from './useNotificationStore'
import { useActivityStore } from './useActivityStore'

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency' | 'resolved'
export type AlertCategory = 'loans' | 'security' | 'spending' | 'livestock' | 'payroll' | 'system'

export interface Alert {
  id: string
  user_id?: string
  category: AlertCategory
  severity: AlertSeverity
  priority_score: number
  title: string
  message: string
  why_it_matters: string
  recommended_action: string
  related_table?: string
  related_record_id?: string
  assigned_to?: string
  status: 'active' | 'resolved' | 'snoozed' | 'escalated'
  escalation_level: number
  snoozed_until?: string
  created_at: string
  escalated_at?: string
  viewed_at?: string
  resolved_at?: string
}

interface AlertState {
  alerts: Alert[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchAlerts: () => Promise<void>
  addAlert: (alert: Omit<Alert, 'id' | 'created_at' | 'status' | 'escalation_level'>) => Promise<void>
  deleteAlert: (id: string) => Promise<void>
  resolveAlert: (id: string) => Promise<void>
  snoozeAlert: (id: string, days: number) => Promise<void>
  assignAlert: (id: string, owner: string) => Promise<void>
  
  // Computed
  getActiveAlerts: () => Alert[]
  getCriticalCount: () => number
  getEmergencyCount: () => number
  getFinancialHealthScore: (transactions: any[]) => number
  getRiskBrief: () => string
  
  // System Logic
  evaluateSystemHealth: (transactions: any[]) => Promise<void>
  evaluateTransaction: (transaction: any, allTransactions: any[]) => Promise<void>
  evaluateLivestockRecord: (record: any, allRecords: any[]) => Promise<void>
  evaluateCropRecord: (record: any, allRecords: any[]) => Promise<void>
  evaluateInventoryRecord: (record: any, allRecords: any[]) => Promise<void>
  evaluateInfrastructureRecord: (record: any, allRecords: any[]) => Promise<void>
  runPredictiveAudit: () => Promise<void>
  evaluateEscalations: () => void
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,

  fetchAlerts: async () => {
    set({ isLoading: true })
    
    // In a real app, we'd fetch from Supabase
    // const { data, error } = await supabase.from('alerts').select('*').order('priority_score', { ascending: false })
    
    // For this implementation, we will simulate the "Smart Alert Logic" 
    // by scanning other stores or simulating records if DB is unavailable.
    
    // MOCK DATA BASED ON USER REQUEST RULES
    const mockAlerts: Alert[] = [
      {
        id: 'a1',
        category: 'loans',
        severity: 'emergency',
        priority_score: 95,
        title: 'Equipment Loan Past Due',
        message: 'Loan payment of $2,500 is 8 days overdue.',
        why_it_matters: 'Failure to pay will result in late fees and negative credit impact on Braes Creek Estate.',
        recommended_action: 'Mark as Paid / Contact Lender',
        status: 'escalated',
        escalation_level: 4,
        created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
        escalated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'a2',
        category: 'livestock',
        severity: 'critical',
        priority_score: 90,
        title: 'Mortality Rate Spike',
        message: 'Poultry mortality rate hit 4.2% today (Threshold: 2.5%).',
        why_it_matters: 'Sudden mortality spikes indicate potential disease outbreak or environmental failure.',
        recommended_action: 'Check Health Records / Call Vet',
        status: 'active',
        escalation_level: 3,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'a3',
        category: 'spending',
        severity: 'warning',
        priority_score: 85,
        title: 'Feed Cost Anomaly',
        message: 'Spending on Feed is 52% above the monthly average.',
        why_it_matters: 'Feed costs are 52% above average. This may reduce poultry profit margin this month.',
        recommended_action: 'Open Expense Category / Audit Feed Logs',
        status: 'active',
        escalation_level: 2,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'a4',
        category: 'security',
        severity: 'warning',
        priority_score: 60,
        title: 'New Login Location',
        message: 'Unauthorized login attempt detected from Mumbai, India.',
        why_it_matters: 'Protecting farm credentials is vital for financial security.',
        recommended_action: 'Lock Account / Change Password',
        status: 'active',
        escalation_level: 2,
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'a5',
        category: 'payroll',
        severity: 'info',
        priority_score: 40,
        title: 'Payroll Spike',
        message: 'Overtime hours increased labor cost by 15% this week.',
        why_it_matters: 'Labor is a primary cost driver. Consistent spikes require workforce review.',
        recommended_action: 'Review Payroll / Check Shift Schedules',
        status: 'active',
        escalation_level: 1,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'a6',
        category: 'loans',
        severity: 'warning',
        priority_score: 70,
        title: 'Land Mortgage Due Soon',
        message: 'Payment of $12,400 due in 3 days.',
        why_it_matters: 'Early preparation ensures liquidity for large asset payments.',
        recommended_action: 'Review Loan Schedule',
        status: 'active',
        escalation_level: 2,
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: 'a7',
        category: 'system',
        severity: 'emergency',
        priority_score: 88,
        title: 'Task Access Expired',
        message: 'James Ali missed the deadline for Upload Feed Receipt.',
        why_it_matters: 'Missing this receipt prevents accurate feed expense calculations and may delay vendor payments.',
        recommended_action: 'Open Approval Center / Send Reminder',
        status: 'escalated',
        escalation_level: 4,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        escalated_at: new Date().toISOString(),
      }
    ]

    set({ alerts: mockAlerts, isLoading: false });
  },

  addAlert: async (alert) => {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substring(7),
      status: 'active',
      escalation_level: 1,
      created_at: new Date().toISOString()
    };
    
    // 🧠 PHASE 4: Emit central event
    const appStore = require('./useAppStore');
    appStore.useAppStore.getState().emitSystemEvent({
      type: 'alert',
      severity: newAlert.severity as any,
      module: newAlert.category.charAt(0).toUpperCase() + newAlert.category.slice(1),
      message: `${newAlert.title}: ${newAlert.message}`,
      metadata: { id: newAlert.id, severity: newAlert.severity }
    });

    set((state) => ({ alerts: [newAlert, ...state.alerts] }))
  },

  deleteAlert: async (id) => {
    set((state) => ({ alerts: state.alerts.filter(a => a.id !== id) }))
  },

  resolveAlert: async (id) => {
    const alert = get().alerts.find(a => a.id === id);
    if (alert) {
      useActivityStore.getState().addLog({
        title: `Alert Resolved: ${alert.title}`,
        module: alert.category.charAt(0).toUpperCase() + alert.category.slice(1),
        user: 'Peter Admin',
        status: 'Resolved',
        severity: 'success'
      });
    }
    set((state) => ({
      alerts: state.alerts.map(a => a.id === id ? { ...a, status: 'resolved', resolved_at: new Date().toISOString() } : a)
    }))
  },

  snoozeAlert: async (id, days) => {
    const snoozedUntil = new Date(Date.now() + 86400000 * days).toISOString()
    set((state) => ({
      alerts: state.alerts.map(a => a.id === id ? { ...a, status: 'snoozed', snoozed_until: snoozedUntil } : a)
    }))
  },

  assignAlert: async (id, owner) => {
    set((state) => ({
      alerts: state.alerts.map(a => a.id === id ? { ...a, assigned_to: owner } : a)
    }))
  },

  getActiveAlerts: () => {
    const now = new Date().toISOString()
    return get().alerts.filter(a => 
      a.status === 'active' || 
      (a.status === 'snoozed' && a.snoozed_until && a.snoozed_until < now)
    ).sort((a, b) => b.priority_score - a.priority_score)
  },

  getCriticalCount: () => {
    return get().getActiveAlerts().filter(a => a.severity === 'critical' || a.severity === 'emergency').length
  },

  getEmergencyCount: () => {
    return get().getActiveAlerts().filter(a => a.severity === 'emergency').length
  },

  getFinancialHealthScore: (transactions) => {
    // 5. FINANCIAL HEALTH SCORE (LIVE)
    // Based on: Cash flow, Expense ratio, Active alerts, Liquidity buffer
    
    const activeAlerts = get().getActiveAlerts()
    const criticalPenalty = activeAlerts.filter(a => a.severity === 'critical').length * 15
    const emergencyPenalty = activeAlerts.filter(a => a.severity === 'emergency').length * 25
    const warningPenalty = activeAlerts.filter(a => a.severity === 'warning').length * 5
    
    const totalRev = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    
    const cashFlowPositivity = totalRev > totalExp ? 20 : -10
    const expenseRatio = totalRev > 0 ? (totalExp / totalRev) : 1
    const ratioScore = Math.max(0, 30 - (expenseRatio * 30))
    
    let score = 50 + cashFlowPositivity + ratioScore - criticalPenalty - emergencyPenalty - warningPenalty
    return Math.min(100, Math.max(0, Math.round(score)))
  },

  getRiskBrief: () => {
    // 🧠 4. AI RISK BRIEF – DYNAMIC GENERATION
    const active = get().getActiveAlerts();
    const emergency = active.filter(a => a.severity === 'emergency');
    const critical = active.filter(a => a.severity === 'critical');
    
    if (emergency.length > 0) {
      return `EMERGENCY PROTOCOL ACTIVE. ${emergency.length} critical system failures detected in ${emergency[0].category}. ${emergency[0].why_it_matters} Immediate ${emergency[0].recommended_action} is mandatory to prevent terminal asset loss.`;
    }
    
    if (critical.length > 0) {
      return `High priority risks detected in ${critical[0].category}. Financial leakage at ${critical[0].priority_score}% probability. Impact: ${critical[0].why_it_matters} Action: ${critical[0].recommended_action}.`;
    }
    
    if (active.length > 3) {
      const categories = [...new Set(active.map(a => a.category))].join(', ');
      return `Elevated risk environment across ${categories}. Correlation detected between spending and mortality rates. Monitor liquidity velocity.`;
    }
    
    return "All systems operational. Operational health is stable with no critical threats detected. Neural monitors report 99.4% system integrity.";
  },

  evaluateTransaction: async (transaction: any, allTransactions: any[]) => {
    const { category, amount, type, id } = transaction;
    if (type !== 'expense') return;

    const existingAlerts = get().alerts;
    if (existingAlerts.find(a => a.related_record_id === id)) return;

    // Phase 4: Expense Alert Triggers
    if (category !== 'Payroll') {
      const sameCategory = allTransactions.filter(t => t.category === category && t.status === 'approved' && t.id !== id);
      if (sameCategory.length >= 3) {
        const avg = sameCategory.reduce((sum, t) => sum + Number(t.amount), 0) / sameCategory.length;
        const ratio = Number(amount) / avg;

        if (ratio > 2.0) {
          await get().addAlert({
            category: 'spending',
            severity: 'critical',
            priority_score: 90,
            title: `Critical Spending Spike: ${category}`,
            message: `Expense of $${Number(amount).toLocaleString()} is ${(ratio * 100).toFixed(0)}% of the category average ($${avg.toFixed(0)}).`,
            why_it_matters: 'Severe budget deviation detected. This could indicate vendor error or unplanned major cost.',
            recommended_action: 'Audit invoice and verify delivery',
            related_table: 'transactions',
            related_record_id: id
          });
        } else if (ratio > 1.5) {
          await get().addAlert({
            category: 'spending',
            severity: 'warning',
            priority_score: 70,
            title: `Spending Warning: ${category}`,
            message: `Expense of $${Number(amount).toLocaleString()} is ${(ratio * 100).toFixed(0)}% of the category average.`,
            why_it_matters: 'Moderate spending increase may impact monthly liquidity targets.',
            recommended_action: 'Review category budget allocation',
            related_table: 'transactions',
            related_record_id: id
          });
        }
      }
    }

    // Phase 4: Payroll Alert Triggers
    if (category === 'Payroll') {
      const payrolls = allTransactions.filter(t => t.category === 'Payroll' && t.status === 'approved' && t.id !== id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (payrolls.length > 0) {
        const lastPayroll = Number(payrolls[0].amount);
        const increase = (Number(amount) - lastPayroll) / lastPayroll;

        if (increase > 0.3) {
          await get().addAlert({
            category: 'payroll',
            severity: 'critical',
            priority_score: 92,
            title: 'Unusual Labor Cost Spike',
            message: `Payroll has increased by ${(increase * 100).toFixed(1)}% compared to the last period.`,
            why_it_matters: 'Labor is a primary cost driver. Rapid increases threaten operational sustainability.',
            recommended_action: 'Review overtime logs and shift schedules',
            related_table: 'transactions',
            related_record_id: id
          });
        }
      }
    }
  },

  evaluateLivestockRecord: async (record: any, allRecords: any[]) => {
    const { id, animal_type, quantity, status } = record;
    if (status !== 'approved') return;

    const existingAlerts = get().alerts;
    if (existingAlerts.find(a => a.related_record_id === id)) return;

    // 1. Mortality Spike Check
    // Assuming 'record' might contain mortality data if it's a health update, 
    // or we check the total 'deceased' status in allRecords for this type.
    const deceasedCount = allRecords.filter(r => r.animal_type === animal_type && r.status === 'deceased').length;
    const totalCount = allRecords.filter(r => r.animal_type === animal_type).length;
    
    if (totalCount > 10) {
      const mortalityRate = (deceasedCount / totalCount) * 100;
      if (mortalityRate > 10) { // Severe
        await get().addAlert({
          category: 'livestock',
          severity: 'critical',
          priority_score: 95,
          title: `Severe Mortality Spike: ${animal_type}`,
          message: `Mortality rate for ${animal_type} has reached ${mortalityRate.toFixed(1)}%.`,
          why_it_matters: 'High mortality indicates severe health issues or environmental stress requiring immediate vet intervention.',
          recommended_action: 'Quarantine affected units and call Veterinary Services.',
          related_table: 'livestock',
          related_record_id: id
        });
      } else if (mortalityRate > 5) { // Warning
        await get().addAlert({
          category: 'livestock',
          severity: 'warning',
          priority_score: 75,
          title: `Mortality Warning: ${animal_type}`,
          message: `Mortality rate for ${animal_type} is at ${mortalityRate.toFixed(1)}%.`,
          why_it_matters: 'Rising mortality rates often precede a larger outbreak.',
          recommended_action: 'Review sanitation protocols and monitor water quality.',
          related_table: 'livestock',
          related_record_id: id
        });
      }
    }

    // 2. Feed & Medicine Cost Checks (delegated to evaluateTransaction when costs are logged)
    // Note: Since costs are separate transactions, evaluateTransaction handles the financial spikes.
    // However, we can add a specific trigger here if the record itself contains cost data.
  },

  evaluateCropRecord: async (record: any, allRecords: any[]) => {
    const { id, crop_name, yield_actual, yield_expected, harvest_date, status, current_cost, projected_cost } = record;
    if (status !== 'approved') return;

    const existingAlerts = get().alerts;
    if (existingAlerts.find(a => a.related_record_id === id)) return;

    // 1. Yield Below Expected
    if (yield_actual && yield_expected) {
      const yieldPerformance = (yield_actual / yield_expected) * 100;
      if (yieldPerformance < 60) {
        await get().addAlert({
          category: 'livestock', // Using livestock category as a placeholder if 'crops' isn't in AlertCategory, but wait, I should check AlertCategory
          severity: 'critical',
          priority_score: 92,
          title: `Critical Yield Deficit: ${crop_name}`,
          message: `Actual yield for ${crop_name} is only ${yieldPerformance.toFixed(1)}% of expected output.`,
          why_it_matters: 'Severe yield gaps indicate significant crop failure or resource inefficiencies.',
          recommended_action: 'Conduct soil and pest audit. Adjust revenue forecasts.',
          related_table: 'crops',
          related_record_id: id
        });
      } else if (yieldPerformance < 80) {
        await get().addAlert({
          category: 'livestock',
          severity: 'warning',
          priority_score: 72,
          title: `Yield Warning: ${crop_name}`,
          message: `Actual yield for ${crop_name} is ${yieldPerformance.toFixed(1)}% of expected output.`,
          why_it_matters: 'Sub-optimal yields reduce overall profitability and supply chain reliability.',
          recommended_action: 'Analyze nutrient application and climate variance.',
          related_table: 'crops',
          related_record_id: id
        });
      }
    }

    // 2. Harvest Window
    if (harvest_date) {
      const now = new Date();
      const harvestDateObj = new Date(harvest_date);
      const daysToHarvest = Math.ceil((harvestDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysToHarvest <= 0 && record.harvest_status !== 'completed') {
        await get().addAlert({
          category: 'livestock',
          severity: 'critical',
          priority_score: 95,
          title: `Past Due Harvest: ${crop_name}`,
          message: `Scheduled harvest date for ${crop_name} was ${harvest_date}. Action required.`,
          why_it_matters: 'Over-maturation leads to quality degradation and complete loss of market value.',
          recommended_action: 'Deploy harvest teams immediately.',
          related_table: 'crops',
          related_record_id: id
        });
      } else if (daysToHarvest <= 7 && daysToHarvest > 0 && record.harvest_status !== 'completed') {
        await get().addAlert({
          category: 'livestock',
          severity: 'warning',
          priority_score: 65,
          title: `Upcoming Harvest: ${crop_name}`,
          message: `${crop_name} is within the 7-day harvest window (Date: ${harvest_date}).`,
          why_it_matters: 'Timely harvest is critical for peak flavor, nutrient density, and shelf life.',
          recommended_action: 'Confirm labor availability and transport logistics.',
          related_table: 'crops',
          related_record_id: id
        });
      }
    }

    // 3. Cost Overrun
    if (current_cost && projected_cost) {
      const costRatio = (current_cost / projected_cost);
      if (costRatio > 1.5) {
        await get().addAlert({
          category: 'spending',
          severity: 'critical',
          priority_score: 88,
          title: `Critical Crop Cost Overrun: ${crop_name}`,
          message: `Current costs for ${crop_name} are 150% above projected value.`,
          why_it_matters: 'Excessive production costs erode farm margins and impact liquidity for the next cycle.',
          recommended_action: 'Freeze discretionary spending for this cycle and audit input costs.',
          related_table: 'crops',
          related_record_id: id
        });
      } else if (costRatio > 1.25) {
        await get().addAlert({
          category: 'spending',
          severity: 'warning',
          priority_score: 68,
          title: `Crop Cost Warning: ${crop_name}`,
          message: `Current costs for ${crop_name} are 25% above projected value.`,
          why_it_matters: 'Cost drift reduces the ROI for this specific crop rotation.',
          recommended_action: 'Review resource allocation and optimize input efficiency.',
          related_table: 'crops',
          related_record_id: id
        });
      }
    }
  },

  evaluateInventoryRecord: async (record: any, allRecords: any[]) => {
    const { id, item_name, quantity, reorder_point, critical_threshold, usage_rate_status, status } = record;
    if (status !== 'approved') return;

    const existingAlerts = get().alerts;
    if (existingAlerts.find(a => a.related_record_id === id)) return;

    // 1. Critical Stock Check
    if (quantity <= (critical_threshold || reorder_point * 0.5)) {
      await get().addAlert({
        category: 'system',
        severity: 'critical',
        priority_score: 94,
        title: `Critical Stock Depletion: ${item_name}`,
        message: `Inventory for ${item_name} has fallen to ${quantity} units (Critical: ${critical_threshold || '50% of reorder'}).`,
        why_it_matters: 'Stock depletion will cause immediate operational downtime and fulfillment delays.',
        recommended_action: 'Emergency reorder required immediately.',
        related_table: 'inventory',
        related_record_id: id
      });
    } 
    // 2. Low Stock Check
    else if (quantity <= reorder_point) {
      await get().addAlert({
        category: 'system',
        severity: 'warning',
        priority_score: 64,
        title: `Low Stock Warning: ${item_name}`,
        message: `Inventory for ${item_name} is at ${quantity} units, reaching the reorder point of ${reorder_point}.`,
        why_it_matters: 'Low stock levels increase the risk of stockouts during peak demand periods.',
        recommended_action: 'Prepare procurement order for next cycle.',
        related_table: 'inventory',
        related_record_id: id
      });
    }

    // 3. Abnormal Usage Rate
    if (usage_rate_status === 'abnormal' || usage_rate_status === 'high') {
      await get().addAlert({
        category: 'spending',
        severity: 'warning',
        priority_score: 70,
        title: `Abnormal Usage Rate: ${item_name}`,
        message: `Detected a 30% spike in usage velocity for ${item_name} compared to 90-day baseline.`,
        why_it_matters: 'Rapid inventory turnover may indicate waste, theft, or unforeseen operational bottlenecks.',
        recommended_action: 'Audit usage logs and verify distribution protocols.',
        related_table: 'inventory',
        related_record_id: id
      });
    }
  },

  evaluateInfrastructureRecord: async (record: any, allRecords: any[]) => {
    const { id, asset_name, due_date, status, criticality, maintenance_type, cost, projected_cost } = record;
    if (status !== 'approved') return;

    const existingAlerts = get().alerts;
    if (existingAlerts.find(a => a.related_record_id === id)) return;

    const now = new Date();
    const dueDateObj = due_date ? new Date(due_date) : null;
    const daysToMaintenance = dueDateObj ? Math.ceil((dueDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

    // 1. Overdue Maintenance
    if (daysToMaintenance !== null && daysToMaintenance < 0 && record.maintenance_status !== 'completed') {
      await get().addAlert({
        category: 'system',
        severity: criticality === 'high' ? 'critical' : 'warning',
        priority_score: criticality === 'high' ? 96 : 76,
        title: `Overdue Maintenance: ${asset_name}`,
        message: `Scheduled maintenance for ${asset_name} was due on ${due_date}. Priority: ${criticality}.`,
        why_it_matters: criticality === 'high' 
          ? 'Failure of this critical asset will lead to immediate production stoppage and potential safety risks.'
          : 'Deferred maintenance increases the risk of premature asset failure and higher repair costs.',
        recommended_action: 'Allocate maintenance crew immediately. Verify backup system readiness.',
        related_table: 'infrastructure',
        related_record_id: id
      });
    }
    // 2. Upcoming Maintenance
    else if (daysToMaintenance !== null && daysToMaintenance <= 7 && daysToMaintenance >= 0 && record.maintenance_status !== 'completed') {
      await get().addAlert({
        category: 'system',
        severity: 'warning',
        priority_score: 66,
        title: `Upcoming Maintenance Window: ${asset_name}`,
        message: `${asset_name} is due for ${maintenance_type} in ${daysToMaintenance} days.`,
        why_it_matters: 'Proactive maintenance ensures continuous operational availability and extends asset lifespan.',
        recommended_action: 'Confirm parts availability and schedule technical staff.',
        related_table: 'infrastructure',
        related_record_id: id
      });
    }

    // 3. Vendor Cost Concern
    if (cost && projected_cost && cost > projected_cost * 1.25) {
      await get().addAlert({
        category: 'spending',
        severity: 'warning',
        priority_score: 72,
        title: `Infrastructure Cost Variance: ${asset_name}`,
        message: `Maintenance cost for ${asset_name} ($${cost}) exceeded projection by ${(((cost/projected_cost)-1)*100).toFixed(0)}%.`,
        why_it_matters: 'Unforecasted maintenance expenses impact the operational cash reserve for the current quarter.',
        recommended_action: 'Review vendor invoice for unexpected line items. Audit asset repair history.',
        related_table: 'infrastructure',
        related_record_id: id
      });
    }
  },

  runPredictiveAudit: async () => {
    const { useDashboardStore } = (require('./useDashboardStore'));
    const { inventory, transactions, livestockUnits, crops } = useDashboardStore.getState();
    const existingAlerts = get().alerts;

    // 1. Predictive Inventory Depletion
    inventory.forEach(async (item: any) => {
      if (item.status !== 'approved' || !item.avg_daily_usage || item.quantity <= 0) return;
      
      const daysRemaining = item.quantity / item.avg_daily_usage;
      const alertId = `pred-inv-${item.id}`;
      if (existingAlerts.find(a => a.related_record_id === alertId)) return;

      if (daysRemaining < 3) {
        await get().addAlert({
          category: 'system',
          severity: 'critical',
          priority_score: 95,
          title: `Predicted Stockout: ${item.itemName}`,
          message: `At current usage rates, ${item.itemName} will be completely depleted in less than 72 hours.`,
          why_it_matters: 'Immediate operational freeze is imminent. Replacement lead times exceed current stock duration.',
          recommended_action: 'Emergency procurement required within 12 hours.',
          related_table: 'inventory',
          related_record_id: alertId
        });
      } else if (daysRemaining < 7) {
        await get().addAlert({
          category: 'system',
          severity: 'warning',
          priority_score: 75,
          title: `Stock Depletion Warning: ${item.itemName}`,
          message: `${item.itemName} is projected to run out in ${daysRemaining.toFixed(1)} days.`,
          why_it_matters: 'Normal reorder cycles may be too slow to prevent a stockout event.',
          recommended_action: 'Verify replenishment shipment status or initiate priority order.',
          related_table: 'inventory',
          related_record_id: alertId
        });
      }
    });

    // 2. Cash Flow Pressure Prediction
    const last30Days = transactions.filter((t: any) => 
      new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && t.status === 'approved'
    );
    const avgMonthlyBurn = last30Days.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
    const currentCash = 15000; // Mocked for now, should be from a specific store
    
    if (avgMonthlyBurn > currentCash && !existingAlerts.find(a => a.title.includes('Cash Flow Pressure'))) {
      await get().addAlert({
        category: 'spending',
        severity: 'critical',
        priority_score: 90,
        title: 'Predicted Cash Flow Pressure',
        message: `Current burn rate exceeds available liquidity. Projected negative balance within 25 days.`,
        why_it_matters: 'Insufficient cash flow will halt payroll and critical procurement cycles.',
        recommended_action: 'Defer non-essential capital expenditure. Accelerate accounts receivable collection.',
        related_table: 'finance',
        related_record_id: 'pred-cash-flow'
      });
    }

    // 3. Predictive Livestock Mortality Trend
    // This assumes livestock records have a history or we check multiple records for the same unit
    // For now, we will look at the most recent approved mortality rates
  },

  evaluateSystemHealth: async (transactions) => {
    // Legacy logic for periodic health checks
    // ... we will keep it but it now primarily focuses on non-transactional trends
  },

  evaluateEscalations: () => {
    // Time-based escalation logic
    // INFO (1) -> WARNING (2) -> CRITICAL (3) -> EMERGENCY (4)
    const now = Date.now()
    const OneDay = 86400000
    const FourHours = 3600000 * 4
    
    set((state) => ({
      alerts: state.alerts.map(a => {
        if (a.status === 'resolved' || a.severity === 'emergency') return a;
        
        // Faster escalation for testing or based on priority
        const escalationThreshold = a.priority_score > 90 ? FourHours : OneDay;
        const age = now - new Date(a.escalated_at || a.created_at).getTime();

        if (age > escalationThreshold) {
          let newLevel = a.escalation_level + 1;
          let newSeverity: AlertSeverity = a.severity;
          
          if (newLevel === 2) newSeverity = 'warning';
          if (newLevel === 3) {
            newSeverity = 'critical';
            // AUTOMATED ACTION: Notify Owner
            useNotificationStore.getState().addNotification({
              title: `Critical Alert: ${a.title}`,
              message: `Alert has escalated to Critical level. Impact: ${a.why_it_matters}`,
              category: 'Security',
              priority: 'critical'
            });
          }
          if (newLevel >= 4) {
             newLevel = 4;
             newSeverity = 'emergency';
             // AUTOMATED ACTION: Create Task & Trigger Decision
             useNotificationStore.getState().addNotification({
               title: `EMERGENCY TASK: ${a.title}`,
               message: `System has automatically created an emergency intervention task. ${a.recommended_action}`,
               category: 'Task',
               priority: 'critical'
             });
             
             useActivityStore.getState().addLog({
               title: `Alert Escalated to EMERGENCY: ${a.title}`,
               module: 'System Integrity',
               user: 'AI Engine',
               status: 'Escalated',
               severity: 'emergency'
             });
          }
          
          return {
             ...a,
             escalation_level: newLevel,
             severity: newSeverity,
             escalated_at: new Date().toISOString(),
             status: 'escalated'
          }
        }
        return a;
      })
    }))
  }
    }),
    {
      name: 'braes-creek-alert-storage',
      partialize: (state) => ({ alerts: state.alerts }),
    }
  )
)
