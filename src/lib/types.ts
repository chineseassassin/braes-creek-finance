// Database Types for Farm Finance App

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'viewer'
  avatar_url?: string
  created_at: string
}

export interface BusinessSegment {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  created_at: string
}

export interface ExpenseCategory {
  id: string
  name: string
  segment_id: string
  description?: string
  color: string
  created_at: string
  segment?: BusinessSegment
}

export interface Vendor {
  id: string
  name: string
  contact_name?: string
  phone?: string
  email?: string
  address?: string
  segment_id?: string
  notes?: string
  created_at: string
  segment?: BusinessSegment
}

export interface Expense {
  id: string
  date: string
  description: string
  amount: number
  category_id: string
  segment_id: string
  vendor_id?: string
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'other'
  reference_number?: string
  is_recurring: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  notes?: string
  receipt_url?: string
  created_by: string
  created_at: string
  updated_at: string
  category?: ExpenseCategory
  segment?: BusinessSegment
  vendor?: Vendor
}

export interface Loan {
  id: string
  lender_name: string
  loan_date: string
  principal_amount: number
  interest_rate: number
  repayment_terms: string
  due_date: string
  total_repaid: number
  remaining_balance: number
  loan_purpose: string
  segment_id?: string
  status: 'active' | 'paid_off' | 'overdue' | 'partial'
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
  segment?: BusinessSegment
}

export interface LoanPayment {
  id: string
  loan_id: string
  payment_date: string
  amount: number
  principal_portion: number
  interest_portion: number
  notes?: string
  created_by: string
  created_at: string
  loan?: Loan
}

export interface LaborEntry {
  id: string
  worker_name: string
  task: string
  date: string
  start_time: string
  end_time: string
  hours_worked: number
  hourly_rate: number
  total_cost: number
  segment_id: string
  notes?: string
  created_by: string
  created_at: string
  segment?: BusinessSegment
}

export interface PayrollRecord {
  id: string
  employee_name: string
  employee_id?: string
  pay_period_start: string
  pay_period_end: string
  base_salary: number
  overtime_hours: number
  overtime_rate: number
  deductions: number
  net_pay: number
  segment_id: string
  payment_date?: string
  status: 'pending' | 'paid'
  notes?: string
  created_by: string
  created_at: string
  segment?: BusinessSegment
}

export interface LivestockUnit {
  id: string
  animal_type: 'broiler' | 'layer' | 'goat' | 'pig' | 'cattle' | 'other'
  breed?: string
  quantity: number
  acquisition_date: string
  acquisition_cost: number
  current_value?: number
  status: 'active' | 'sold' | 'deceased'
  notes?: string
  created_at: string
}

export interface CropType {
  id: string
  name: string
  variety?: string
  season?: string
  planting_date?: string
  expected_harvest?: string
  area_acres?: number
  notes?: string
  created_at: string
}

export interface FeedPurchase {
  id: string
  date: string
  feed_type: string
  quantity_kg: number
  unit_cost: number
  total_cost: number
  supplier: string
  segment_id: string
  notes?: string
  created_at: string
  segment?: BusinessSegment
}

export interface MaintenanceRecord {
  id: string
  date: string
  equipment_name: string
  maintenance_type: 'routine' | 'repair' | 'replacement'
  description: string
  cost: number
  vendor_id?: string
  next_service_date?: string
  notes?: string
  created_at: string
}

export interface Budget {
  id: string
  name: string
  period_start: string
  period_end: string
  segment_id?: string
  category_id?: string
  budgeted_amount: number
  actual_amount: number
  notes?: string
  created_at: string
  segment?: BusinessSegment
  category?: ExpenseCategory
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  created_at: string
  user?: User
}


export interface KPIData {
  totalExpenses: number
  totalPayroll: number
  totalLoanBalance: number
  totalRepaymentsThisMonth: number
  totalLaborCost: number
  expensesBySegment: { segment: string; amount: number; color: string }[]
  monthlyTrend: { month: string; expenses: number; revenue: number }[]
  budgetVsActual: { category: string; budgeted: number; actual: number }[]
  loanStatus: { status: string; count: number; amount: number }[]
}

// ── Phase 1 Foundation Types ───────────────────────────────────────────

export type WorkflowStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'resolved';
export type EntityType = 'expense' | 'loan' | 'labor' | 'livestock' | 'crop' | 'maintenance' | 'task';

export interface ApprovalRequest {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  requester_id: string;
  approver_id?: string;
  status: WorkflowStatus;
  comment?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface AIRecommendation {
  id: string;
  module: string;
  title: string;
  what_happening: string;
  why_it_matters: string;
  next_steps: string;
  estimated_impact: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  impact_score: number; // 0-100
  action_link?: string;
  status: 'new' | 'dismissed' | 'applied';
  created_at: string;
}

export interface SystemEvent {
  id: string;
  type: 'creation' | 'update' | 'deletion' | 'approval' | 'rejection' | 'alert' | 'recommendation';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  module: string;
  message: string;
  user_id?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}
