// ============================================================
// TYPES
// ============================================================

export type Role = 'admin' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string; // 'Receipt', 'Contract', 'Invoice', 'Legal', 'Other'
  category: string;
  upload_date: string;
  file_size: string;
  url: string; // Simulated link
  uploaded_by: string;
  notes?: string;
}

export const DOCUMENT_CATEGORIES = ['Receipt', 'Contract', 'Invoice', 'Payroll', 'Legal', 'Maintenance', 'Other'];

export interface BusinessSegment {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  segment_id: string;
  icon: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  address: string;
  email: string;
  phone: string;
  notes: string;
}

export interface Expense {
  id: string;
  date: string;
  vendor_id: string;
  vendor_name: string;
  category_id: string;
  category_name: string;
  segment_id: string;
  segment_name: string;
  amount: number;
  description: string;
  payment_method: string;
  receipt_url?: string;
  recurring: boolean;
  recurrence_period?: string;
  created_by: string;
  created_at: string;
  notes?: string;
}

export interface Loan {
  id: string;
  lender_name: string;
  loan_date: string;
  principal: number;
  interest_rate: number;
  repayment_terms: string;
  due_date: string;
  amount_repaid: number;
  remaining_balance: number;
  purpose: string;
  segment_id?: string;
  segment_name?: string;
  status: 'active' | 'paid_off' | 'overdue' | 'partial';
  notes: string;
  created_by: string;
  created_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  payment_date: string;
  amount: number;
  notes: string;
  created_by: string;
}

export interface LaborEntry {
  id: string;
  worker_name: string;
  task: string;
  date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  hourly_rate: number;
  total_cost: number;
  department: string;
  segment_id: string;
  segment_name: string;
  crop_type?: string;
  animal_type?: string;
  notes: string;
  created_by: string;
  created_at: string;
}

export interface PayrollEntry {
  id: string;
  worker_name: string;
  role: string;
  department: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  overtime_hours: number;
  overtime_rate: number;
  deductions: number;
  net_pay: number;
  status: 'pending' | 'paid' | 'partial';
  payment_date?: string;
  notes: string;
}

export interface LivestockUnit {
  id: string;
  animal_type: string;
  breed: string;
  quantity: number;
  purchase_date: string;
  acquisition_date: string; // Internal tracking date
  acquisition_cost: number;
  current_value: number;
  mortality_qty: number;
  slaughter_date?: string;
  slaughter_qty?: number;
  slaughter_weight?: number; // Average weight or total weight
  gross_profit?: number;
  net_profit?: number;
  segment_id: string;
  location: string;
  notes: string;
}

export interface CropType {
  id: string;
  name: string;
  variety: string;
  season: string;
  planting_date: string;
  harvest_date: string;
  area_planted: number;
  expected_yield: number;
  actual_yield?: number;
  unit: string;
  cost_per_unit?: number;
  segment_id: string;
  status: 'planted' | 'growing' | 'harvested' | 'failed';
  notes: string;
}

export interface Budget {
  id: string;
  segment_id: string;
  segment_name: string;
  category_id: string;
  category_name: string;
  period: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
}

export interface MaintenanceRecord {
  id: string;
  equipment_name: string;
  maintenance_type: string;
  date: string;
  cost: number;
  vendor: string;
  next_due_date?: string;
  notes: string;
  status: 'completed' | 'scheduled' | 'overdue';
}

export interface AuditLog {
  id: string;
  user_name: string;
  action: string;
  table_name: string;
  record_id: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  desc: string;
  icon: string;
  created_at: string;
  read: boolean;
}

// ============================================================
// SAMPLE DATA
// ============================================================

export const BUSINESS_SEGMENTS: BusinessSegment[] = [
  { id: 'seg-hq', name: 'Braes Creek HQ', code: 'HQ', color: '#6366f1', icon: '🏢' },
  { id: 'seg-001', name: 'Broilers / Meat Poultry', code: 'BROILER', color: '#f59e0b', icon: '🐔' },
  { id: 'seg-002', name: 'Layers / Egg Production', code: 'LAYERS', color: '#84cc16', icon: '🥚' },
  { id: 'seg-003', name: 'Goats', code: 'GOATS', color: '#8b5cf6', icon: '🐐' },
  { id: 'seg-004', name: 'Pigs / Swine', code: 'PIGS', color: '#ec4899', icon: '🐷' },
  { id: 'seg-005', name: 'Cattle', code: 'CATTLE', color: '#92400e', icon: '🐄' },
  { id: 'seg-006', name: 'Crops', code: 'CROPS', color: '#22c55e', icon: '🌿' },
  { id: 'seg-007', name: 'General Operations', code: 'GENERAL', color: '#64748b', icon: '🏗️' },
  { id: 'seg-008', name: 'Utilities', code: 'UTILITIES', color: '#0ea5e9', icon: '⚡' },
  { id: 'seg-009', name: 'Payroll', code: 'PAYROLL', color: '#14b8a6', icon: '💰' },
  { id: 'seg-010', name: 'Transportation', code: 'TRANSPORT', color: '#f97316', icon: '🚛' },
  { id: 'seg-011', name: 'Maintenance', code: 'MAINT', color: '#475569', icon: '🔧' },
  { id: 'seg-014', name: 'Loans & Capital', code: 'LOANS', color: '#dc2626', icon: '🏦' },
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-001', name: 'Tools & Equipment', segment_id: 'seg-007', icon: '🔨' },
  { id: 'cat-002', name: 'Electricity / Light Bill', segment_id: 'seg-008', icon: '💡' },
  { id: 'cat-003', name: 'Water Bill', segment_id: 'seg-008', icon: '💧' },
  { id: 'cat-004', name: 'Property Taxes', segment_id: 'seg-007', icon: '🏠' },
  { id: 'cat-005', name: 'Payroll Expenses', segment_id: 'seg-009', icon: '💵' },
  { id: 'cat-006', name: 'Broiler Feed', segment_id: 'seg-001', icon: '🌽' },
  { id: 'cat-007', name: 'Layer Feed', segment_id: 'seg-002', icon: '🌽' },
  { id: 'cat-008', name: 'Goat Feed', segment_id: 'seg-003', icon: '🌿' },
  { id: 'cat-009', name: 'Pig Feed', segment_id: 'seg-004', icon: '🌾' },
  { id: 'cat-010', name: 'Cattle Feed', segment_id: 'seg-005', icon: '🌾' },
  { id: 'cat-011', name: 'Animal Medicines & Vitamins', segment_id: 'seg-007', icon: '💊' },
  { id: 'cat-012', name: 'Chemicals & Pesticides', segment_id: 'seg-013', icon: '🧪' },
  { id: 'cat-013', name: 'Fertilizers', segment_id: 'seg-013', icon: '🌱' },
  { id: 'cat-014', name: 'Building Materials', segment_id: 'seg-007', icon: '🧱' },
  { id: 'cat-015', name: 'Transportation / Fuel', segment_id: 'seg-010', icon: '⛽' },
  { id: 'cat-016', name: 'Marketing & Advertising', segment_id: 'seg-007', icon: '📣' },
  { id: 'cat-017', name: 'Equipment Maintenance', segment_id: 'seg-011', icon: '🔧' },
  { id: 'cat-018', name: 'Cassava Crop Costs', segment_id: 'seg-006', icon: '🌿' },
  { id: 'cat-019', name: 'Sweet Potato Costs', segment_id: 'seg-006', icon: '🍠' },
  { id: 'cat-020', name: 'Tomato Costs', segment_id: 'seg-006', icon: '🍅' },
  { id: 'cat-021', name: 'Cucumber Costs', segment_id: 'seg-006', icon: '🥒' },
  { id: 'cat-022', name: 'Bell Pepper Costs', segment_id: 'seg-006', icon: '🫑' },
  { id: 'cat-023', name: 'Sorrel Costs', segment_id: 'seg-006', icon: '🌺' },
  { id: 'cat-024', name: 'Scotch Bonnet Costs', segment_id: 'seg-006', icon: '🌶️' },
  { id: 'cat-025', name: 'Poultry Broiler Operations', segment_id: 'seg-001', icon: '🐔' },
  { id: 'cat-026', name: 'Poultry Layer Operations', segment_id: 'seg-002', icon: '🥚' },
  { id: 'cat-027', name: 'Goat Operations', segment_id: 'seg-003', icon: '🐐' },
  { id: 'cat-028', name: 'Pig Operations', segment_id: 'seg-004', icon: '🐷' },
  { id: 'cat-029', name: 'Cattle Operations', segment_id: 'seg-005', icon: '🐄' },
];

export const VENDORS: Vendor[] = [
  { id: 'v-001', name: 'AgriPro Supplies Ltd', category: 'Feed Supplier', contact: 'John Brown', email: 'john@agripro.com', phone: '876-555-0101', address: '12 Farm Road, Kingston', notes: 'Primary feed supplier' },
  { id: 'v-002', name: 'Caribbean Vet Services', category: 'Veterinary', contact: 'Dr. Maria Santos', email: 'maria@caribvet.com', phone: '876-555-0202', address: '5 Medical Drive, Portmore', notes: 'On-call vet partner' },
  { id: 'v-003', name: 'Island Agrochem', category: 'Chemicals & Fertilizers', contact: 'Paul Green', email: 'paul@islandagro.com', phone: '876-555-0303', address: '88 Commerce Blvd, Spanish Town', notes: 'Seasonal pricing available' },
  { id: 'v-004', name: 'JPS Electric', category: 'Utilities', contact: 'Customer Service', email: 'cs@jps.com', phone: '876-888-2007', address: '6 Knutsford Blvd, Kingston', notes: 'Monthly billing' },
  { id: 'v-005', name: 'NWC Water Services', category: 'Utilities', contact: 'Customer Service', email: 'cs@nwcjamaica.com', phone: '876-922-6430', address: '4 Marescaux Road, Kingston', notes: 'Quarterly billing' },
  { id: 'v-006', name: 'TopBuild Materials', category: 'Construction', contact: 'Tony Williams', email: 'tony@topbuild.com', phone: '876-555-0404', address: '20 Builder Lane, May Pen', notes: 'Volume discounts available' },
  { id: 'v-007', name: 'FastTrack Logistics', category: 'Transportation', contact: 'Derek Hall', email: 'derek@fasttrack.com', phone: '876-555-0505', address: '77 Port Royal Ave, Kingston', notes: 'Reliable cold chain transport' },
  { id: 'v-008', name: 'GreenField Seeds', category: 'Seeds & Planting', contact: 'Grace Thompson', email: 'grace@greenfield.com', phone: '876-555-0606', address: '15 Nursey Road, Clarendon', notes: 'Certified organic varieties' },
];

export const LOANS: Loan[] = [
  {
    id: 'loan-001',
    lender_name: 'Principal Investor (Owner)',
    loan_date: '2024-01-15',
    principal: 500000,
    interest_rate: 8.5,
    repayment_terms: 'Monthly over 24 months',
    due_date: '2026-01-15',
    amount_repaid: 125000,
    remaining_balance: 375000,
    purpose: 'Farm infrastructure setup and livestock acquisition',
    segment_id: 'seg-001',
    segment_name: 'Broilers / Meat Poultry',
    status: 'active',
    notes: 'First major capital injection for business launch',
    created_by: 'Admin User',
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    id: 'loan-002',
    lender_name: 'Development Bank of Jamaica',
    loan_date: '2024-03-01',
    principal: 250000,
    interest_rate: 6.0,
    repayment_terms: 'Quarterly over 3 years',
    due_date: '2027-03-01',
    amount_repaid: 50000,
    remaining_balance: 200000,
    purpose: 'Crop irrigation system and equipment',
    segment_id: 'seg-006',
    segment_name: 'Crops',
    status: 'active',
    notes: 'Agricultural development fund loan',
    created_by: 'Admin User',
    created_at: '2024-03-01T09:00:00Z',
  },
  {
    id: 'loan-003',
    lender_name: 'Private Lender – R. Clarke',
    loan_date: '2023-09-10',
    principal: 100000,
    interest_rate: 12.0,
    repayment_terms: 'Monthly over 12 months',
    due_date: '2024-09-10',
    amount_repaid: 100000,
    remaining_balance: 0,
    purpose: 'Working capital for goat herd expansion',
    segment_id: 'seg-003',
    segment_name: 'Goats',
    status: 'paid_off',
    notes: 'Fully repaid on time',
    created_by: 'Admin User',
    created_at: '2023-09-10T10:00:00Z',
  },
  {
    id: 'loan-004',
    lender_name: 'NCB Business Loan',
    loan_date: '2024-07-01',
    principal: 180000,
    interest_rate: 9.5,
    repayment_terms: 'Monthly over 18 months',
    due_date: '2026-01-01',
    amount_repaid: 20000,
    remaining_balance: 160000,
    purpose: 'Pig pen construction and pig purchases',
    segment_id: 'seg-004',
    segment_name: 'Pigs / Swine',
    status: 'overdue',
    notes: 'Payment missed last month – follow up urgently',
    created_by: 'Admin User',
    created_at: '2024-07-01T11:00:00Z',
  },
];

export const LOAN_PAYMENTS: LoanPayment[] = [
  { id: 'lp-001', loan_id: 'loan-001', payment_date: '2024-02-15', amount: 25000, notes: 'Month 1 payment', created_by: 'Admin User' },
  { id: 'lp-002', loan_id: 'loan-001', payment_date: '2024-03-15', amount: 25000, notes: 'Month 2 payment', created_by: 'Admin User' },
  { id: 'lp-003', loan_id: 'loan-001', payment_date: '2024-04-15', amount: 25000, notes: 'Month 3 payment', created_by: 'Admin User' },
  { id: 'lp-004', loan_id: 'loan-001', payment_date: '2024-05-15', amount: 25000, notes: 'Month 4 payment', created_by: 'Admin User' },
  { id: 'lp-005', loan_id: 'loan-001', payment_date: '2024-06-15', amount: 25000, notes: 'Month 5 payment', created_by: 'Admin User' },
  { id: 'lp-006', loan_id: 'loan-002', payment_date: '2024-06-01', amount: 25000, notes: 'Q1 payment', created_by: 'Manager User' },
  { id: 'lp-007', loan_id: 'loan-002', payment_date: '2024-09-01', amount: 25000, notes: 'Q2 payment', created_by: 'Manager User' },
  { id: 'lp-008', loan_id: 'loan-004', payment_date: '2024-08-01', amount: 20000, notes: 'Month 1 only payment', created_by: 'Admin User' },
];

export const EXPENSES: Expense[] = [
  // DECEMBER (Steady State)
  { id: 'exp-dec-1', date: '2025-12-05', amount: 4500, category_id: 'cat-2', category_name: 'Feed', vendor_id: 'ven-1', vendor_name: 'MasterFeeds', segment_id: 'seg-1', segment_name: 'Poultry', notes: 'Monthly Bulk', description: 'Chicken Feed', payment_method: 'Wire', status: 'paid' },
  { id: 'exp-dec-2', date: '2025-12-20', amount: 1200, category_id: 'cat-1', category_name: 'Repairs', vendor_id: 'ven-2', vendor_name: 'AgriMech', segment_id: 'seg-2', segment_name: 'Orchard', notes: 'Pump fix', description: 'Irrigation Pump', payment_method: 'Card', status: 'paid' },
  
  // JANUARY (The Spike / Anomaly)
  { id: 'exp-jan-1', date: '2026-01-05', amount: 5200, category_id: 'cat-2', category_name: 'Feed', vendor_id: 'ven-1', vendor_name: 'MasterFeeds', segment_id: 'seg-1', segment_name: 'Poultry', notes: 'Bulk order', description: 'Feed 5-ton', payment_method: 'Wire', status: 'paid' },
  { id: 'exp-jan-2', date: '2026-01-15', amount: 35000, category_id: 'cat-1', category_name: 'Equipment', vendor_id: 'ven-4', vendor_name: 'Deere Service', segment_id: 'seg-2', segment_name: 'Orchard', notes: 'CRITICAL', description: 'Tractor Engine Overhaul', payment_method: 'Wire', status: 'paid' },
  
  // FEBRUARY (Efficient Cycle)
  { id: 'exp-feb-1', date: '2026-02-05', amount: 5000, category_id: 'cat-2', category_name: 'Feed', vendor_id: 'ven-1', vendor_name: 'MasterFeeds', segment_id: 'seg-1', segment_name: 'Poultry', notes: 'Bulk order', description: 'Feed 5-ton', payment_method: 'Wire', status: 'paid' },
  { id: 'exp-feb-10', date: '2026-02-10', amount: 2500, category_id: 'cat-7', category_name: 'Vet', vendor_id: 'ven-5', vendor_name: 'VetConnect', segment_id: 'seg-1', segment_name: 'Poultry', notes: 'Annual check', description: 'Poultry Vaccinations', payment_method: 'Card', status: 'paid' },
  
  // MARCH (Current Month)
  { id: 'exp-mar-1', date: '2026-03-05', amount: 18500, category_id: 'cat-2', category_name: 'Feed', vendor_id: 'ven-1', vendor_name: 'MasterFeeds', segment_id: 'seg-1', segment_name: 'Poultry', notes: 'SPIKE ALERT', description: 'Feed - Emergency Import', payment_method: 'Wire', status: 'paid' },
];

export const SALES: any[] = [
  // DEC
  { id: 'sale-1', date: '2025-12-28', customer: 'Island Groceries', product: 'Eggs', quantity: 1500, unit_price: 12, total_amount: 18000, segment_id: 'seg-1', segment_name: 'Poultry' },
  // JAN (Loss month due to tractor)
  { id: 'sale-2', date: '2026-01-28', customer: 'Hotel Chain', product: 'Eggs', quantity: 2000, unit_price: 12, total_amount: 24000, segment_id: 'seg-1', segment_name: 'Poultry' },
  // FEB (Profitability win)
  { id: 'sale-3', date: '2026-02-28', customer: 'Export Partners', product: 'Eggs', quantity: 4500, unit_price: 12, total_amount: 54000, segment_id: 'seg-1', segment_name: 'Poultry' },
  { id: 'sale-4', date: '2026-02-20', customer: 'Local Market', product: 'Coffee Beans', quantity: 500, unit_price: 45, total_amount: 22500, segment_id: 'seg-2', segment_name: 'Orchard' },
  // MAR
  { id: 'sale-5', date: '2026-03-25', customer: 'Export Partners', product: 'Eggs', quantity: 5200, unit_price: 14, total_amount: 72800, segment_id: 'seg-1', segment_name: 'Poultry' },
];

export const LABOR_ENTRIES: LaborEntry[] = [
  { id: 'lab-007', worker_name: 'Devon Campbell', task: 'Tomato staking and tying', date: '2025-01-14', start_time: '07:00', end_time: '16:00', total_hours: 9, hourly_rate: 850, total_cost: 7650, department: 'Crops', segment_id: 'seg-006', segment_name: 'Crops', crop_type: 'Tomato', notes: '', created_by: 'Manager User', created_at: '2025-01-14T16:30:00Z' },
  { id: 'lab-008', worker_name: 'Grace Thompson', task: 'Scotch bonnet harvesting', date: '2025-01-20', start_time: '07:00', end_time: '13:00', total_hours: 6, hourly_rate: 800, total_cost: 4800, department: 'Crops', segment_id: 'seg-006', segment_name: 'Crops', crop_type: 'Scotch Bonnet', notes: '', created_by: 'Manager User', created_at: '2025-01-20T13:30:00Z' },
];

export const PAYROLL: PayrollEntry[] = [
  { id: 'pay-001', worker_name: 'Anthony Brown', role: 'Poultry Technician', department: 'Broilers', period_start: '2025-01-01', period_end: '2025-01-31', base_salary: 85000, overtime_hours: 8, overtime_rate: 1200, deductions: 5000, net_pay: 86600, status: 'paid', payment_date: '2025-02-05', notes: '' },
  { id: 'pay-002', worker_name: 'Maria Gordon', role: 'Egg Production Supervisor', department: 'Layers', period_start: '2025-01-01', period_end: '2025-01-31', base_salary: 90000, overtime_hours: 4, overtime_rate: 1200, deductions: 6000, net_pay: 88800, status: 'paid', payment_date: '2025-02-05', notes: '' },
  { id: 'pay-003', worker_name: 'Devon Campbell', role: 'Field Crop Worker', department: 'Crops', period_start: '2025-01-01', period_end: '2025-01-31', base_salary: 75000, overtime_hours: 12, overtime_rate: 1100, deductions: 4200, net_pay: 84000, status: 'paid', payment_date: '2025-02-05', notes: '' },
  { id: 'pay-004', worker_name: 'Sandra Reid', role: 'Livestock Handler', department: 'Livestock', period_start: '2025-01-01', period_end: '2025-01-31', base_salary: 80000, overtime_hours: 6, overtime_rate: 1100, deductions: 5000, net_pay: 81600, status: 'paid', payment_date: '2025-02-05', notes: '' },
  { id: 'pay-005', worker_name: 'Trevor Williams', role: 'Swine Caretaker', department: 'Pigs', period_start: '2025-01-01', period_end: '2025-01-31', base_salary: 78000, overtime_hours: 0, overtime_rate: 1100, deductions: 4800, net_pay: 73200, status: 'paid', payment_date: '2025-02-05', notes: '' },
  { id: 'pay-006', worker_name: 'Grace Thompson', role: 'Crop Harvesting Lead', department: 'Crops', period_start: '2025-01-01', period_end: '2025-01-31', base_salary: 82000, overtime_hours: 10, overtime_rate: 1100, deductions: 5200, net_pay: 87800, status: 'paid', payment_date: '2025-02-05', notes: '' },
  { id: 'pay-007', worker_name: 'Anthony Brown', role: 'Poultry Technician', department: 'Broilers', period_start: '2025-02-01', period_end: '2025-02-28', base_salary: 85000, overtime_hours: 6, overtime_rate: 1200, deductions: 5000, net_pay: 87200, status: 'paid', payment_date: '2025-03-05', notes: '' },
  { id: 'pay-008', worker_name: 'Maria Gordon', role: 'Egg Production Supervisor', department: 'Layers', period_start: '2025-02-01', period_end: '2025-02-28', base_salary: 90000, overtime_hours: 0, overtime_rate: 1200, deductions: 6000, net_pay: 84000, status: 'paid', payment_date: '2025-03-05', notes: '' },
];

export const LIVESTOCK_UNITS: LivestockUnit[] = [
  { id: 'liv-001', animal_type: 'Broiler Chicken', breed: 'Ross 308', quantity: 2500, purchase_date: '2024-11-28', acquisition_date: '2024-12-01', acquisition_cost: 375000, current_value: 875000, mortality_qty: 45, slaughter_date: '2025-01-20', slaughter_qty: 2450, slaughter_weight: 4.5, gross_profit: 500000, net_profit: 425000, segment_id: 'seg-001', location: 'House A & B', notes: 'Current batch – ready for market in 3 weeks' },
  { id: 'liv-002', animal_type: 'Layer Chicken', breed: 'Lohmann Brown', quantity: 1800, purchase_date: '2024-06-10', acquisition_date: '2024-06-15', acquisition_cost: 540000, current_value: 450000, mortality_qty: 12, segment_id: 'seg-002', location: 'Layer House 1', notes: 'Peak production – 1600 eggs/day avg' },
  { id: 'liv-003', animal_type: 'Goat', breed: 'Boer Cross', quantity: 45, purchase_date: '2023-02-20', acquisition_date: '2023-03-01', acquisition_cost: 225000, current_value: 360000, mortality_qty: 2, segment_id: 'seg-003', location: 'Goat Pen 1 & 2', notes: '6 pregnant does expected to kid next month' },
  { id: 'liv-004', animal_type: 'Pig', breed: 'Large White', quantity: 22, purchase_date: '2024-04-01', acquisition_date: '2024-04-10', acquisition_cost: 198000, current_value: 440000, mortality_qty: 1, segment_id: 'seg-004', location: 'Pig Sty Block A', notes: '5 sows, 1 boar, 16 growers' },
  { id: 'liv-005', animal_type: 'Cattle', breed: 'Jamaica Hope', quantity: 12, purchase_date: '2023-08-10', acquisition_date: '2023-08-20', acquisition_cost: 600000, current_value: 840000, mortality_qty: 0, segment_id: 'seg-005', location: 'Back Pasture', notes: '3 cows, 1 bull, 8 heifers/steers' },
];

export const CROP_TYPES: CropType[] = [
  { id: 'crop-001', name: 'Cassava', variety: 'TMS 30572', season: 'Year-round', planting_date: '2024-10-01', harvest_date: '2025-04-01', area_planted: 2.5, expected_yield: 25000, actual_yield: undefined, unit: 'lbs', segment_id: 'seg-006', status: 'growing', notes: '2.5 acres under cultivation' },
  { id: 'crop-002', name: 'Sweet Potatoes', variety: 'Beauregard', season: 'Dry Season', planting_date: '2024-11-15', harvest_date: '2025-02-15', area_planted: 1.5, expected_yield: 15000, actual_yield: 14200, unit: 'lbs', segment_id: 'seg-006', status: 'harvested', notes: 'Good yield achieved' },
  { id: 'crop-003', name: 'Tomato', variety: 'Roma VF', season: 'Winter', planting_date: '2025-01-01', harvest_date: '2025-03-30', area_planted: 1.0, expected_yield: 8000, actual_yield: undefined, unit: 'lbs', segment_id: 'seg-006', status: 'growing', notes: 'Staking and irrigation active' },
  { id: 'crop-004', name: 'Cucumber', variety: 'Marketmore', season: 'Spring', planting_date: '2025-02-15', harvest_date: '2025-04-30', area_planted: 0.75, expected_yield: 6000, actual_yield: undefined, unit: 'lbs', segment_id: 'seg-006', status: 'planted', notes: 'New plot' },
  { id: 'crop-005', name: 'Bell Pepper', variety: 'California Wonder', season: 'Spring', planting_date: '2025-01-20', harvest_date: '2025-04-20', area_planted: 0.5, expected_yield: 4000, actual_yield: undefined, unit: 'lbs', segment_id: 'seg-006', status: 'growing', notes: '' },
  { id: 'crop-006', name: 'Sorrel', variety: 'Red Sorrel', season: 'Seasonal (Nov-Dec)', planting_date: '2024-09-01', harvest_date: '2024-12-15', area_planted: 0.75, expected_yield: 3000, actual_yield: 2800, unit: 'lbs', segment_id: 'seg-006', status: 'harvested', notes: 'Sold for Christmas season' },
  { id: 'crop-007', name: 'Scotch Bonnet Pepper', variety: 'Yellow/Orange Mix', season: 'Year-round', planting_date: '2024-08-01', harvest_date: '2025-06-01', area_planted: 0.5, expected_yield: 2500, actual_yield: undefined, unit: 'lbs', segment_id: 'seg-006', status: 'growing', notes: 'High demand crop – selling well' },
];

export const MAINTENANCE_RECORDS: MaintenanceRecord[] = [
  { id: 'mnt-001', equipment_name: 'John Deere Tractor 5E', maintenance_type: 'Full Service', date: '2025-03-25', cost: 17500, vendor: 'TopBuild Materials', next_due_date: '2025-09-25', notes: 'Oil change, filter replacement, brake adjustment', status: 'completed' },
  { id: 'mnt-002', equipment_name: 'Water Pump – Irrigation Main', maintenance_type: 'Bearing Replacement', date: '2025-02-10', cost: 8500, vendor: 'Caribbean Mechanic Services', next_due_date: '2025-08-10', notes: 'Pump shaft bearings worn – replaced', status: 'completed' },
  { id: 'mnt-003', equipment_name: 'Generator – 15kVA Backup', maintenance_type: 'Oil & Filter Service', date: '2025-01-15', cost: 6000, vendor: 'Island Power Services', next_due_date: '2025-07-15', notes: 'Routine maintenance – every 6 months', status: 'completed' },
  { id: 'mnt-004', equipment_name: 'John Deere Tractor 5E', maintenance_type: 'Tire Inspection', date: '2025-07-01', cost: 0, vendor: '', next_due_date: '2025-07-01', notes: 'Schedule annual tire check', status: 'scheduled' },
  { id: 'mnt-005', equipment_name: 'Poultry Ventilation Fans', maintenance_type: 'Belt & Motor Check', date: '2025-03-01', cost: 4200, vendor: 'AirMech Solutions', next_due_date: '2025-05-01', notes: 'Fan belts were worn – replaced 3 units', status: 'overdue' },
];

export const BUDGETS: Budget[] = [
  { id: 'bud-001', segment_id: 'seg-001', segment_name: 'Broilers / Meat Poultry', category_id: 'cat-006', category_name: 'Broiler Feed', period: '2025-Q1', budgeted_amount: 150000, actual_amount: 135000, variance: 15000 },
  { id: 'bud-002', segment_id: 'seg-002', segment_name: 'Layers / Egg Production', category_id: 'cat-007', category_name: 'Layer Feed', period: '2025-Q1', budgeted_amount: 100000, actual_amount: 96000, variance: 4000 },
  { id: 'bud-003', segment_id: 'seg-006', segment_name: 'Crops', category_id: 'cat-013', category_name: 'Fertilizers', period: '2025-Q1', budgeted_amount: 50000, actual_amount: 57000, variance: -7000 },
  { id: 'bud-004', segment_id: 'seg-008', segment_name: 'Utilities', category_id: 'cat-002', category_name: 'Electricity', period: '2025-Q1', budgeted_amount: 40000, actual_amount: 40500, variance: -500 },
  { id: 'bud-005', segment_id: 'seg-010', segment_name: 'Transportation', category_id: 'cat-015', category_name: 'Transportation / Fuel', period: '2025-Q1', budgeted_amount: 30000, actual_amount: 30700, variance: -700 },
  { id: 'bud-006', segment_id: 'seg-009', segment_name: 'Payroll', category_id: 'cat-005', category_name: 'Payroll Expenses', period: '2025-Q1', budgeted_amount: 600000, actual_amount: 565000, variance: 35000 },
  { id: 'bud-007', segment_id: 'seg-004', segment_name: 'Pigs / Swine', category_id: 'cat-009', category_name: 'Pig Feed', period: '2025-Q1', budgeted_amount: 70000, actual_amount: 66000, variance: 4000 },
  { id: 'bud-008', segment_id: 'seg-003', segment_name: 'Goats', category_id: 'cat-008', category_name: 'Goat Feed', period: '2025-Q1', budgeted_amount: 45000, actual_amount: 42000, variance: 3000 },
];

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'aud-001', user_name: 'Admin User', action: 'CREATE', table_name: 'expenses', record_id: 'exp-001', details: 'Added broiler feed expense of $45,000', timestamp: '2025-01-05T08:05:00Z' },
  { id: 'aud-002', user_name: 'Manager User', action: 'CREATE', table_name: 'labor_entries', record_id: 'lab-001', details: 'Added labor entry for Anthony Brown – 4 hrs', timestamp: '2025-01-06T10:35:00Z' },
  { id: 'aud-003', user_name: 'Admin User', action: 'UPDATE', table_name: 'loans', record_id: 'loan-001', details: 'Updated loan-001 remaining balance after payment', timestamp: '2025-02-15T09:10:00Z' },
  { id: 'aud-004', user_name: 'Admin User', action: 'CREATE', table_name: 'loan_payments', record_id: 'lp-005', details: 'Recorded loan payment of $25,000 for loan-001', timestamp: '2025-06-15T10:00:00Z' },
  { id: 'aud-005', user_name: 'Manager User', action: 'CREATE', table_name: 'expenses', record_id: 'exp-014', details: 'Added broiler vaccination expense of $5,500', timestamp: '2025-02-18T11:05:00Z' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getTotalLoansOutstanding(loans: Loan[]): number {
  return loans.filter(l => l.status !== 'paid_off').reduce((sum, l) => sum + l.remaining_balance, 0);
}

export function getTotalRepaid(loans: Loan[]): number {
  return loans.reduce((sum, l) => sum + l.amount_repaid, 0);
}

export function getTotalLaborCost(labor: LaborEntry[]): number {
  return labor.reduce((sum, l) => sum + l.total_cost, 0);
}

export function getExpensesBySegment(expenses: Expense[]): Record<string, number> {
  return expenses.reduce((acc, e) => {
    acc[e.segment_name] = (acc[e.segment_name] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
}

export function getMonthlySpend(expenses: Expense[]): { month: string; amount: number }[] {
  const byMonth: Record<string, number> = {};
  expenses.forEach(e => {
    const month = e.date.substring(0, 7);
    byMonth[month] = (byMonth[month] || 0) + e.amount;
  });
  return Object.entries(byMonth).sort().map(([month, amount]) => ({ month, amount }));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD', minimumFractionDigits: 0 }).format(amount);
}

export function getOverdueLoans(loans: Loan[]): Loan[] {
  return loans.filter(l => l.status === 'overdue');
}

export function calculateGrowth(current: number, previous: number): string {
  if (previous === 0) return '+100%';
  const growth = ((current - previous) / previous) * 100;
  return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
}

export function getExecutiveBrief(sales: any[], expenses: any[], loans: any[]): string {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const totalSales = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalSales - totalExp;
  
  const topSegment = Object.entries(getExpensesBySegment(expenses))
    .sort((a, b) => b[1] - a[1])[0];
  
  const overdueCount = loans.filter(l => l.status === 'overdue').length;

  let brief = `Performance is ${profit >= 0 ? 'strong' : 'tight'} with ${formatCurrency(profit)} net yield. `;
  if (topSegment) brief += `Heavy investment noted in ${topSegment[0]}. `;
  if (overdueCount > 0) brief += `Warning: ${overdueCount} capital nodes require immediate attention.`;
  else brief += "Capital structure remains stable.";
  
  return brief;
}

export function getComparisonData(sales: any[], expenses: any[]): { month: string; revenue: number; expense: number }[] {
  const data: Record<string, { revenue: number; expense: number }> = {};
  
  sales.forEach(s => {
    const m = (s.date || '').substring(0, 7);
    if (!m) return;
    if (!data[m]) data[m] = { revenue: 0, expense: 0 };
    data[m].revenue += (s.total_amount || 0);
  });
  
  expenses.forEach(e => {
    const m = e.date.substring(0, 7);
    if (!data[m]) data[m] = { revenue: 0, expense: 0 };
    data[m].expense += e.amount;
  });

  return Object.entries(data).sort().map(([month, vals]) => ({
    month,
    revenue: vals.revenue,
    expense: vals.expense
  }));
}

export const DOCUMENTS: Document[] = [
  { id: 'doc-001', name: 'Land Title - Sector A.pdf', type: 'application/pdf', category: 'Legal', upload_date: '2024-01-15', file_size: '2.4 MB', url: '#', uploaded_by: 'Admin User' },
  { id: 'doc-002', name: 'Chicken Feed Invoice #4402.pdf', type: 'application/pdf', category: 'Invoice', upload_date: '2024-12-05', file_size: '1.1 MB', url: '#', uploaded_by: 'Admin User' },
  { id: 'doc-003', name: 'Equipment Lease Agreement.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'Contract', upload_date: '2024-03-20', file_size: '850 KB', url: '#', uploaded_by: 'Admin User' },
];

export function getAnomalies(expenses: Expense[]): { id: string; msg: string; severity: 'warning' | 'danger' }[] {
  const categories: Record<string, number[]> = {};
  expenses.forEach(e => {
    if (!categories[e.category_name]) categories[e.category_name] = [];
    categories[e.category_name].push(e.amount);
  });

  const anomalies: { id: string; msg: string; severity: 'warning' | 'danger' }[] = [];
  
  Object.entries(categories).forEach(([name, amounts]) => {
    if (amounts.length < 3) return;
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const last = amounts[amounts.length - 1];
    
    if (last > avg * 1.5) {
      anomalies.push({ 
        id: name, 
        msg: `${name} Spike: Current cost is 50%+ above average.`, 
        severity: last > avg * 2 ? 'danger' : 'warning' 
      });
    }
  });

  return anomalies;
}

export function getEfficiencyData(sales: any[], labor: LaborEntry[]): { month: string; efficiency: number }[] {
  const data: Record<string, { rev: number; hours: number }> = {};
  
  sales.forEach(s => {
    const m = (s.date || '').substring(0, 7);
    if (!m) return;
    if (!data[m]) data[m] = { rev: 0, hours: 0 };
    data[m].rev += (s.total_amount || 0);
  });
  
  labor.forEach(l => {
    const m = l.date.substring(0, 7);
    if (!data[m]) data[m] = { rev: 0, hours: 0 };
    data[m].hours += l.total_hours;
  });

  return Object.entries(data).sort().map(([month, vals]) => ({
    month,
    efficiency: vals.hours > 0 ? vals.rev / vals.hours : 0
  }));
}
