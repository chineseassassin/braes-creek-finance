import {
  Expense,
  Loan,
  LaborEntry,
  PayrollRecord,
  BusinessSegment,
  ExpenseCategory,
  Vendor,
  Budget,
  FeedPurchase,
  MaintenanceRecord,
  LoanPayment,
  LivestockUnit,
  CropType,
} from './types'

// ── Business Segments ──────────────────────────────────────────────────────────
export const SAMPLE_SEGMENTS: BusinessSegment[] = [
  { id: 'seg-1', name: 'Broilers / Meat Poultry', description: 'Broiler chicken operations', color: '#f97316', icon: '🐔', created_at: '2024-01-01' },
  { id: 'seg-2', name: 'Layers / Eggs Poultry', description: 'Egg-laying operations', color: '#eab308', icon: '🥚', created_at: '2024-01-01' },
  { id: 'seg-3', name: 'Goats', description: 'Goat farming', color: '#84cc16', icon: '🐐', created_at: '2024-01-01' },
  { id: 'seg-4', name: 'Pigs', description: 'Pig farming', color: '#f43f5e', icon: '🐷', created_at: '2024-01-01' },
  { id: 'seg-5', name: 'Cattle', description: 'Cattle operations', color: '#8b5cf6', icon: '🐄', created_at: '2024-01-01' },
  { id: 'seg-6', name: 'Crops', description: 'All crop production', color: '#10b981', icon: '🌱', created_at: '2024-01-01' },
  { id: 'seg-7', name: 'Utilities', description: 'Electricity, water, etc.', color: '#06b6d4', icon: '⚡', created_at: '2024-01-01' },
  { id: 'seg-8', name: 'Payroll', description: 'Employee wages', color: '#6366f1', icon: '💼', created_at: '2024-01-01' },
  { id: 'seg-9', name: 'Transportation', description: 'Fuel and transport costs', color: '#64748b', icon: '🚛', created_at: '2024-01-01' },
  { id: 'seg-10', name: 'Maintenance', description: 'Equipment maintenance', color: '#d97706', icon: '🔧', created_at: '2024-01-01' },
  { id: 'seg-11', name: 'Feed & Supplies', description: 'Animal feed and farm supplies', color: '#059669', icon: '🌾', created_at: '2024-01-01' },
  { id: 'seg-12', name: 'Fertilizers & Chemicals', description: 'Crop inputs', color: '#dc2626', icon: '🧪', created_at: '2024-01-01' },
  { id: 'seg-13', name: 'General Business', description: 'General operating expenses', color: '#2563eb', icon: '🏢', created_at: '2024-01-01' },
  { id: 'seg-14', name: 'Loans', description: 'Loan management', color: '#7c3aed', icon: '💰', created_at: '2024-01-01' },
]

// ── Expense Categories ─────────────────────────────────────────────────────────
export const SAMPLE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-1', name: 'Tools & Equipment', segment_id: 'seg-13', color: '#64748b', created_at: '2024-01-01' },
  { id: 'cat-2', name: 'Light Bill', segment_id: 'seg-7', color: '#eab308', created_at: '2024-01-01' },
  { id: 'cat-3', name: 'Water Bill', segment_id: 'seg-7', color: '#06b6d4', created_at: '2024-01-01' },
  { id: 'cat-4', name: 'Property Taxes', segment_id: 'seg-13', color: '#8b5cf6', created_at: '2024-01-01' },
  { id: 'cat-5', name: 'Poultry Feed - Broilers', segment_id: 'seg-1', color: '#f97316', created_at: '2024-01-01' },
  { id: 'cat-6', name: 'Poultry Feed - Layers', segment_id: 'seg-2', color: '#eab308', created_at: '2024-01-01' },
  { id: 'cat-7', name: 'Goat Feed', segment_id: 'seg-3', color: '#84cc16', created_at: '2024-01-01' },
  { id: 'cat-8', name: 'Pig Feed', segment_id: 'seg-4', color: '#f43f5e', created_at: '2024-01-01' },
  { id: 'cat-9', name: 'Cattle Feed', segment_id: 'seg-5', color: '#8b5cf6', created_at: '2024-01-01' },
  { id: 'cat-10', name: 'Veterinary & Medicines', segment_id: 'seg-13', color: '#10b981', created_at: '2024-01-01' },
  { id: 'cat-11', name: 'Fertilizer', segment_id: 'seg-12', color: '#84cc16', created_at: '2024-01-01' },
  { id: 'cat-12', name: 'Chemicals & Pesticides', segment_id: 'seg-12', color: '#dc2626', created_at: '2024-01-01' },
  { id: 'cat-13', name: 'Building Materials', segment_id: 'seg-13', color: '#d97706', created_at: '2024-01-01' },
  { id: 'cat-14', name: 'Fuel', segment_id: 'seg-9', color: '#64748b', created_at: '2024-01-01' },
  { id: 'cat-15', name: 'Marketing', segment_id: 'seg-13', color: '#ec4899', created_at: '2024-01-01' },
  { id: 'cat-16', name: 'Equipment Maintenance', segment_id: 'seg-10', color: '#d97706', created_at: '2024-01-01' },
  { id: 'cat-17', name: 'Cassava Production', segment_id: 'seg-6', color: '#10b981', created_at: '2024-01-01' },
  { id: 'cat-18', name: 'Sweet Potato Production', segment_id: 'seg-6', color: '#f97316', created_at: '2024-01-01' },
  { id: 'cat-19', name: 'Tomato Production', segment_id: 'seg-6', color: '#dc2626', created_at: '2024-01-01' },
  { id: 'cat-20', name: 'Cucumber Production', segment_id: 'seg-6', color: '#16a34a', created_at: '2024-01-01' },
  { id: 'cat-21', name: 'Bell Pepper Production', segment_id: 'seg-6', color: '#ca8a04', created_at: '2024-01-01' },
  { id: 'cat-22', name: 'Sorrel Production', segment_id: 'seg-6', color: '#be185d', created_at: '2024-01-01' },
  { id: 'cat-23', name: 'Scotch Bonnet Production', segment_id: 'seg-6', color: '#b91c1c', created_at: '2024-01-01' },
]

// ── Vendors ────────────────────────────────────────────────────────────────────
export const SAMPLE_VENDORS: Vendor[] = [
  { id: 'v-1', name: 'AgriStar Supplies', contact_name: 'Marcus Brown', phone: '+1-868-555-0100', email: 'marcus@agristar.tt', segment_id: 'seg-11', notes: 'Primary feed supplier', created_at: '2024-01-05' },
  { id: 'v-2', name: 'Caribbean Vet Services', contact_name: 'Dr. Sandra Lee', phone: '+1-868-555-0201', email: 'dr.lee@caribvet.tt', segment_id: 'seg-13', created_at: '2024-01-10' },
  { id: 'v-3', name: 'Trinidad Power Co.', phone: '+1-868-555-0300', segment_id: 'seg-7', notes: 'Electricity provider', created_at: '2024-01-01' },
  { id: 'v-4', name: 'WASA', phone: '+1-868-555-0400', segment_id: 'seg-7', notes: 'Water authority', created_at: '2024-01-01' },
  { id: 'v-5', name: 'FarmTech Equipment', contact_name: 'Joseph Rampersad', phone: '+1-868-555-0500', email: 'joseph@farmtech.tt', segment_id: 'seg-13', created_at: '2024-02-01' },
  { id: 'v-6', name: 'Caribbean Agromart', contact_name: 'Priya Singh', phone: '+1-868-555-0600', email: 'priya@agromart.tt', segment_id: 'seg-12', created_at: '2024-01-15' },
  { id: 'v-7', name: 'Island Transport Ltd', phone: '+1-868-555-0700', segment_id: 'seg-9', created_at: '2024-02-01' },
]

// ── Expenses ───────────────────────────────────────────────────────────────────
export const SAMPLE_EXPENSES: Expense[] = [
  { id: 'exp-1', date: '2024-11-01', description: 'Monthly electricity bill', amount: 2450.00, category_id: 'cat-2', segment_id: 'seg-7', vendor_id: 'v-3', payment_method: 'bank_transfer', is_recurring: true, recurring_frequency: 'monthly', created_by: 'user-1', created_at: '2024-11-01', updated_at: '2024-11-01' },
  { id: 'exp-2', date: '2024-11-02', description: 'Broiler starter feed (500kg)', amount: 3800.00, category_id: 'cat-5', segment_id: 'seg-1', vendor_id: 'v-1', payment_method: 'cash', is_recurring: false, created_by: 'user-1', created_at: '2024-11-02', updated_at: '2024-11-02' },
  { id: 'exp-3', date: '2024-11-03', description: 'Water bill', amount: 620.00, category_id: 'cat-3', segment_id: 'seg-7', vendor_id: 'v-4', payment_method: 'bank_transfer', is_recurring: true, recurring_frequency: 'monthly', created_by: 'user-1', created_at: '2024-11-03', updated_at: '2024-11-03' },
  { id: 'exp-4', date: '2024-11-05', description: 'Veterinary visit - cattle deworming', amount: 1200.00, category_id: 'cat-10', segment_id: 'seg-5', vendor_id: 'v-2', payment_method: 'cash', is_recurring: false, created_by: 'user-2', created_at: '2024-11-05', updated_at: '2024-11-05' },
  { id: 'exp-5', date: '2024-11-06', description: 'NPK Fertilizer (20 bags)', amount: 2900.00, category_id: 'cat-11', segment_id: 'seg-12', vendor_id: 'v-6', payment_method: 'cash', is_recurring: false, created_by: 'user-2', created_at: '2024-11-06', updated_at: '2024-11-06' },
  { id: 'exp-6', date: '2024-11-08', description: 'Diesel for tractor', amount: 1800.00, category_id: 'cat-14', segment_id: 'seg-9', vendor_id: 'v-7', payment_method: 'cash', is_recurring: false, created_by: 'user-1', created_at: '2024-11-08', updated_at: '2024-11-08' },
  { id: 'exp-7', date: '2024-11-10', description: 'Layer pellets (800kg)', amount: 5600.00, category_id: 'cat-6', segment_id: 'seg-2', vendor_id: 'v-1', payment_method: 'cash', is_recurring: false, created_by: 'user-1', created_at: '2024-11-10', updated_at: '2024-11-10' },
  { id: 'exp-8', date: '2024-11-12', description: 'Pesticide for tomatoes', amount: 780.00, category_id: 'cat-12', segment_id: 'seg-12', vendor_id: 'v-6', payment_method: 'cash', is_recurring: false, created_by: 'user-2', created_at: '2024-11-12', updated_at: '2024-11-12' },
  { id: 'exp-9', date: '2024-11-14', description: 'Pig feed sacks x40', amount: 3200.00, category_id: 'cat-8', segment_id: 'seg-4', vendor_id: 'v-1', payment_method: 'bank_transfer', is_recurring: false, created_by: 'user-1', created_at: '2024-11-14', updated_at: '2024-11-14' },
  { id: 'exp-10', date: '2024-11-15', description: 'Goat feed and mineral blocks', amount: 950.00, category_id: 'cat-7', segment_id: 'seg-3', vendor_id: 'v-1', payment_method: 'cash', is_recurring: false, created_by: 'user-1', created_at: '2024-11-15', updated_at: '2024-11-15' },
  { id: 'exp-11', date: '2024-11-18', description: 'Tractor belt replacement', amount: 2100.00, category_id: 'cat-16', segment_id: 'seg-10', vendor_id: 'v-5', payment_method: 'cash', is_recurring: false, created_by: 'user-2', created_at: '2024-11-18', updated_at: '2024-11-18' },
  { id: 'exp-12', date: '2024-11-20', description: 'Marketing - Facebook ads', amount: 500.00, category_id: 'cat-15', segment_id: 'seg-13', payment_method: 'credit_card', is_recurring: true, recurring_frequency: 'monthly', created_by: 'user-1', created_at: '2024-11-20', updated_at: '2024-11-20' },
  { id: 'exp-13', date: '2024-11-22', description: 'Building materials - chicken pen extension', amount: 8500.00, category_id: 'cat-13', segment_id: 'seg-1', vendor_id: 'v-5', payment_method: 'bank_transfer', is_recurring: false, created_by: 'user-1', created_at: '2024-11-22', updated_at: '2024-11-22' },
  { id: 'exp-14', date: '2024-11-25', description: 'Sweet potato seedlings + planting supplies', amount: 1450.00, category_id: 'cat-18', segment_id: 'seg-6', payment_method: 'cash', is_recurring: false, created_by: 'user-2', created_at: '2024-11-25', updated_at: '2024-11-25' },
  { id: 'exp-15', date: '2024-11-28', description: 'Cattle vitamins and supplements', amount: 1750.00, category_id: 'cat-10', segment_id: 'seg-5', vendor_id: 'v-2', payment_method: 'cash', is_recurring: false, created_by: 'user-1', created_at: '2024-11-28', updated_at: '2024-11-28' },
  { id: 'exp-16', date: '2024-12-01', description: 'Monthly electricity bill', amount: 2680.00, category_id: 'cat-2', segment_id: 'seg-7', vendor_id: 'v-3', payment_method: 'bank_transfer', is_recurring: true, recurring_frequency: 'monthly', created_by: 'user-1', created_at: '2024-12-01', updated_at: '2024-12-01' },
  { id: 'exp-17', date: '2024-12-03', description: 'Broiler finisher feed (600kg)', amount: 4200.00, category_id: 'cat-5', segment_id: 'seg-1', vendor_id: 'v-1', payment_method: 'cash', is_recurring: false, created_by: 'user-1', created_at: '2024-12-03', updated_at: '2024-12-03' },
  { id: 'exp-18', date: '2024-12-05', description: 'Scotch bonnet transplants', amount: 600.00, category_id: 'cat-23', segment_id: 'seg-6', payment_method: 'cash', is_recurring: false, created_by: 'user-2', created_at: '2024-12-05', updated_at: '2024-12-05' },
  { id: 'exp-19', date: '2024-12-08', description: 'Property tax payment', amount: 4500.00, category_id: 'cat-4', segment_id: 'seg-13', payment_method: 'bank_transfer', is_recurring: true, recurring_frequency: 'annually', created_by: 'user-1', created_at: '2024-12-08', updated_at: '2024-12-08' },
  { id: 'exp-20', date: '2024-12-10', description: 'Cassava cuttings and fertilizer', amount: 2200.00, category_id: 'cat-17', segment_id: 'seg-6', payment_method: 'cash', is_recurring: false, created_by: 'user-2', created_at: '2024-12-10', updated_at: '2024-12-10' },
]

// ── Loans ──────────────────────────────────────────────────────────────────────
export const SAMPLE_LOANS: Loan[] = [
  {
    id: 'loan-1',
    lender_name: 'First Citizens Bank',
    loan_date: '2024-03-15',
    principal_amount: 250000.00,
    interest_rate: 8.5,
    repayment_terms: '60 months, equal monthly installments',
    due_date: '2029-03-15',
    total_repaid: 42500.00,
    remaining_balance: 207500.00,
    loan_purpose: 'Farm expansion - new livestock pens and equipment',
    segment_id: 'seg-1',
    status: 'active',
    notes: 'Collateralized by farm property deed',
    created_by: 'user-1',
    created_at: '2024-03-15',
    updated_at: '2024-11-01',
  },
  {
    id: 'loan-2',
    lender_name: 'Personal Investor - R. Williams',
    loan_date: '2024-06-01',
    principal_amount: 75000.00,
    interest_rate: 6.0,
    repayment_terms: '24 months, quarterly payments',
    due_date: '2026-06-01',
    total_repaid: 20000.00,
    remaining_balance: 55000.00,
    loan_purpose: 'Crop expansion - irrigation system',
    segment_id: 'seg-6',
    status: 'active',
    notes: 'Informal agreement, signed promissory note',
    created_by: 'user-1',
    created_at: '2024-06-01',
    updated_at: '2024-10-01',
  },
  {
    id: 'loan-3',
    lender_name: 'Caribbean Development Fund',
    loan_date: '2023-08-10',
    principal_amount: 100000.00,
    interest_rate: 5.0,
    repayment_terms: '36 months, monthly',
    due_date: '2026-08-10',
    total_repaid: 72000.00,
    remaining_balance: 28000.00,
    loan_purpose: 'Working capital - feed, veterinary, operational costs',
    status: 'partial',
    notes: 'Agricultural development grant supplement',
    created_by: 'user-1',
    created_at: '2023-08-10',
    updated_at: '2024-11-01',
  },
]

// ── Loan Payments ──────────────────────────────────────────────────────────────
export const SAMPLE_LOAN_PAYMENTS: LoanPayment[] = [
  { id: 'lp-1', loan_id: 'loan-1', payment_date: '2024-04-15', amount: 5200.00, principal_portion: 3500.00, interest_portion: 1700.00, created_by: 'user-1', created_at: '2024-04-15' },
  { id: 'lp-2', loan_id: 'loan-1', payment_date: '2024-05-15', amount: 5200.00, principal_portion: 3550.00, interest_portion: 1650.00, created_by: 'user-1', created_at: '2024-05-15' },
  { id: 'lp-3', loan_id: 'loan-1', payment_date: '2024-06-15', amount: 5200.00, principal_portion: 3600.00, interest_portion: 1600.00, created_by: 'user-1', created_at: '2024-06-15' },
  { id: 'lp-4', loan_id: 'loan-2', payment_date: '2024-09-01', amount: 10000.00, principal_portion: 7500.00, interest_portion: 2500.00, notes: 'Q3 quarterly payment', created_by: 'user-1', created_at: '2024-09-01' },
  { id: 'lp-5', loan_id: 'loan-3', payment_date: '2024-11-10', amount: 3000.00, principal_portion: 2500.00, interest_portion: 500.00, created_by: 'user-1', created_at: '2024-11-10' },
]

// ── Labor Entries ──────────────────────────────────────────────────────────────
export const SAMPLE_LABOR: LaborEntry[] = [
  { id: 'lab-1', worker_name: 'Calvin James', task: 'Chicken pen cleaning and feeding', date: '2024-11-04', start_time: '06:00', end_time: '14:00', hours_worked: 8, hourly_rate: 35, total_cost: 280, segment_id: 'seg-1', created_by: 'user-1', created_at: '2024-11-04' },
  { id: 'lab-2', worker_name: 'Denise Martin', task: 'Crop weeding - tomatoes & peppers', date: '2024-11-04', start_time: '07:00', end_time: '13:00', hours_worked: 6, hourly_rate: 30, total_cost: 180, segment_id: 'seg-6', created_by: 'user-1', created_at: '2024-11-04' },
  { id: 'lab-3', worker_name: 'Marcus Baptiste', task: 'Cattle herding and feed distribution', date: '2024-11-05', start_time: '05:30', end_time: '12:30', hours_worked: 7, hourly_rate: 35, total_cost: 245, segment_id: 'seg-5', created_by: 'user-1', created_at: '2024-11-05' },
  { id: 'lab-4', worker_name: 'Aisha Rampersad', task: 'Egg collection and grading', date: '2024-11-06', start_time: '06:00', end_time: '10:00', hours_worked: 4, hourly_rate: 30, total_cost: 120, segment_id: 'seg-2', created_by: 'user-2', created_at: '2024-11-06' },
  { id: 'lab-5', worker_name: 'Calvin James', task: 'Pig pen maintenance', date: '2024-11-07', start_time: '07:00', end_time: '13:00', hours_worked: 6, hourly_rate: 35, total_cost: 210, segment_id: 'seg-4', created_by: 'user-1', created_at: '2024-11-07' },
  { id: 'lab-6', worker_name: 'Denise Martin', task: 'Cassava planting', date: '2024-11-11', start_time: '06:30', end_time: '14:30', hours_worked: 8, hourly_rate: 30, total_cost: 240, segment_id: 'seg-6', created_by: 'user-1', created_at: '2024-11-11' },
  { id: 'lab-7', worker_name: 'Thomas Singh', task: 'Irrigation system maintenance', date: '2024-11-13', start_time: '08:00', end_time: '16:00', hours_worked: 8, hourly_rate: 40, total_cost: 320, segment_id: 'seg-6', created_by: 'user-2', created_at: '2024-11-13' },
  { id: 'lab-8', worker_name: 'Marcus Baptiste', task: 'Goat health check and feeding', date: '2024-11-15', start_time: '06:00', end_time: '10:00', hours_worked: 4, hourly_rate: 35, total_cost: 140, segment_id: 'seg-3', created_by: 'user-1', created_at: '2024-11-15' },
]

// ── Payroll ────────────────────────────────────────────────────────────────────
export const SAMPLE_PAYROLL: PayrollRecord[] = [
  { id: 'pay-1', employee_name: 'Calvin James', employee_id: 'EMP-001', pay_period_start: '2024-11-01', pay_period_end: '2024-11-30', base_salary: 4500, overtime_hours: 10, overtime_rate: 52.50, deductions: 450, net_pay: 4575, segment_id: 'seg-1', status: 'paid', payment_date: '2024-12-01', created_by: 'user-1', created_at: '2024-12-01' },
  { id: 'pay-2', employee_name: 'Denise Martin', employee_id: 'EMP-002', pay_period_start: '2024-11-01', pay_period_end: '2024-11-30', base_salary: 3800, overtime_hours: 5, overtime_rate: 45, deductions: 380, net_pay: 3645, segment_id: 'seg-6', status: 'paid', payment_date: '2024-12-01', created_by: 'user-1', created_at: '2024-12-01' },
  { id: 'pay-3', employee_name: 'Marcus Baptiste', employee_id: 'EMP-003', pay_period_start: '2024-11-01', pay_period_end: '2024-11-30', base_salary: 4200, overtime_hours: 8, overtime_rate: 52.50, deductions: 420, net_pay: 4200, segment_id: 'seg-5', status: 'paid', payment_date: '2024-12-01', created_by: 'user-1', created_at: '2024-12-01' },
  { id: 'pay-4', employee_name: 'Aisha Rampersad', employee_id: 'EMP-004', pay_period_start: '2024-11-01', pay_period_end: '2024-11-30', base_salary: 3600, overtime_hours: 0, overtime_rate: 45, deductions: 360, net_pay: 3240, segment_id: 'seg-2', status: 'paid', payment_date: '2024-12-01', created_by: 'user-1', created_at: '2024-12-01' },
  { id: 'pay-5', employee_name: 'Thomas Singh', employee_id: 'EMP-005', pay_period_start: '2024-11-01', pay_period_end: '2024-11-30', base_salary: 5200, overtime_hours: 12, overtime_rate: 65, deductions: 520, net_pay: 5460, segment_id: 'seg-6', status: 'pending', created_by: 'user-1', created_at: '2024-12-01' },
]

// ── Livestock ──────────────────────────────────────────────────────────────────
export const SAMPLE_LIVESTOCK: LivestockUnit[] = [
  { id: 'ls-1', animal_type: 'broiler', breed: 'Ross 308', quantity: 500, acquisition_date: '2024-10-15', acquisition_cost: 7500, current_value: 45000, status: 'active', notes: 'Batch 12 - expected harvest Dec 2024', created_at: '2024-10-15' },
  { id: 'ls-2', animal_type: 'layer', breed: 'Hy-Line Brown', quantity: 300, acquisition_date: '2024-02-01', acquisition_cost: 6000, current_value: 18000, status: 'active', notes: 'Currently producing ~260 eggs/day', created_at: '2024-02-01' },
  { id: 'ls-3', animal_type: 'goat', breed: 'Boer Cross', quantity: 45, acquisition_date: '2024-01-10', acquisition_cost: 27000, current_value: 54000, status: 'active', created_at: '2024-01-10' },
  { id: 'ls-4', animal_type: 'pig', breed: 'Large White', quantity: 28, acquisition_date: '2024-04-01', acquisition_cost: 14000, current_value: 42000, status: 'active', notes: '8 sows, 2 boars, 18 growers', created_at: '2024-04-01' },
  { id: 'ls-5', animal_type: 'cattle', breed: 'Brahman Cross', quantity: 15, acquisition_date: '2023-09-01', acquisition_cost: 75000, current_value: 120000, status: 'active', created_at: '2023-09-01' },
]

// ── Crops ──────────────────────────────────────────────────────────────────────
export const SAMPLE_CROPS: CropType[] = [
  { id: 'crop-1', name: 'Cassava', variety: 'TMS 30572', planting_date: '2024-09-01', expected_harvest: '2025-03-01', area_acres: 3, notes: 'Main staple crop', created_at: '2024-09-01' },
  { id: 'crop-2', name: 'Sweet Potato', variety: 'Beauregard', planting_date: '2024-10-01', expected_harvest: '2025-01-15', area_acres: 1.5, created_at: '2024-10-01' },
  { id: 'crop-3', name: 'Tomato', variety: 'UC-82', planting_date: '2024-10-15', expected_harvest: '2025-01-01', area_acres: 0.75, notes: 'Greenhouse grown', created_at: '2024-10-15' },
  { id: 'crop-4', name: 'Cucumber', variety: 'Long Green', planting_date: '2024-11-01', expected_harvest: '2024-12-20', area_acres: 0.5, created_at: '2024-11-01' },
  { id: 'crop-5', name: 'Bell Pepper', variety: 'California Wonder', planting_date: '2024-09-15', expected_harvest: '2024-12-15', area_acres: 0.5, created_at: '2024-09-15' },
  { id: 'crop-6', name: 'Sorrel', planting_date: '2024-08-01', expected_harvest: '2024-12-01', area_acres: 0.25, notes: 'Christmas harvest target', created_at: '2024-08-01' },
  { id: 'crop-7', name: 'Scotch Bonnet Pepper', variety: 'Trinidad Perfume', planting_date: '2024-10-20', expected_harvest: '2025-01-20', area_acres: 0.25, notes: 'High-value crop', created_at: '2024-10-20' },
]

// ── Feed Purchases ─────────────────────────────────────────────────────────────
export const SAMPLE_FEED_PURCHASES: FeedPurchase[] = [
  { id: 'fp-1', date: '2024-11-02', feed_type: 'Broiler Starter', quantity_kg: 500, unit_cost: 7.60, total_cost: 3800, supplier: 'AgriStar Supplies', segment_id: 'seg-1', created_at: '2024-11-02' },
  { id: 'fp-2', date: '2024-11-10', feed_type: 'Layer Pellets', quantity_kg: 800, unit_cost: 7.00, total_cost: 5600, supplier: 'AgriStar Supplies', segment_id: 'seg-2', created_at: '2024-11-10' },
  { id: 'fp-3', date: '2024-11-14', feed_type: 'Pig Grower Meal', quantity_kg: 640, unit_cost: 5.00, total_cost: 3200, supplier: 'AgriStar Supplies', segment_id: 'seg-4', created_at: '2024-11-14' },
  { id: 'fp-4', date: '2024-11-15', feed_type: 'Goat Browse Mix', quantity_kg: 190, unit_cost: 5.00, total_cost: 950, supplier: 'Caribbean Agromart', segment_id: 'seg-3', created_at: '2024-11-15' },
  { id: 'fp-5', date: '2024-12-03', feed_type: 'Broiler Finisher', quantity_kg: 600, unit_cost: 7.00, total_cost: 4200, supplier: 'AgriStar Supplies', segment_id: 'seg-1', created_at: '2024-12-03' },
]

// ── Maintenance Records ────────────────────────────────────────────────────────
export const SAMPLE_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'maint-1', date: '2024-11-18', equipment_name: 'Massey Ferguson Tractor', maintenance_type: 'repair', description: 'Drive belt replacement and hydraulic fluid top-up', cost: 2100, next_service_date: '2025-02-18', notes: 'Due for full service in 3 months', created_at: '2024-11-18' },
  { id: 'maint-2', date: '2024-10-05', equipment_name: 'Poultry Ventilation System', maintenance_type: 'routine', description: 'Fan blades cleaned, belts checked, motor lubricated', cost: 450, next_service_date: '2025-01-05', created_at: '2024-10-05' },
  { id: 'maint-3', date: '2024-09-20', equipment_name: 'Irrigation Pump #2', maintenance_type: 'repair', description: 'Impeller replaced, seals resealed', cost: 1800, next_service_date: '2025-03-20', created_at: '2024-09-20' },
  { id: 'maint-4', date: '2024-12-01', equipment_name: 'Feed Mixer', maintenance_type: 'routine', description: 'Monthly lubrication and gear check', cost: 200, next_service_date: '2025-01-01', created_at: '2024-12-01' },
]

// ── Budgets ────────────────────────────────────────────────────────────────────
export const SAMPLE_BUDGETS: Budget[] = [
  { id: 'bud-1', name: 'Q4 2024 - Broiler Operations', period_start: '2024-10-01', period_end: '2024-12-31', segment_id: 'seg-1', budgeted_amount: 35000, actual_amount: 28900, created_at: '2024-10-01' },
  { id: 'bud-2', name: 'Q4 2024 - Layer Operations', period_start: '2024-10-01', period_end: '2024-12-31', segment_id: 'seg-2', budgeted_amount: 18000, actual_amount: 14200, created_at: '2024-10-01' },
  { id: 'bud-3', name: 'Q4 2024 - Crop Production', period_start: '2024-10-01', period_end: '2024-12-31', segment_id: 'seg-6', budgeted_amount: 25000, actual_amount: 22400, created_at: '2024-10-01' },
  { id: 'bud-4', name: 'Q4 2024 - Utilities', period_start: '2024-10-01', period_end: '2024-12-31', segment_id: 'seg-7', budgeted_amount: 9000, actual_amount: 10400, created_at: '2024-10-01' },
  { id: 'bud-5', name: 'Q4 2024 - Payroll', period_start: '2024-10-01', period_end: '2024-12-31', segment_id: 'seg-8', budgeted_amount: 60000, actual_amount: 52440, created_at: '2024-10-01' },
  { id: 'bud-6', name: 'Q4 2024 - Transportation', period_start: '2024-10-01', period_end: '2024-12-31', segment_id: 'seg-9', budgeted_amount: 8000, actual_amount: 7200, created_at: '2024-10-01' },
  { id: 'bud-7', name: 'Q4 2024 - Maintenance', period_start: '2024-10-01', period_end: '2024-12-31', segment_id: 'seg-10', budgeted_amount: 6000, actual_amount: 4550, created_at: '2024-10-01' },
  { id: 'bud-8', name: 'Q4 2024 - Cattle Operations', period_start: '2024-10-01', period_end: '2024-12-31', segment_id: 'seg-5', budgeted_amount: 20000, actual_amount: 18500, created_at: '2024-10-01' },
]

// ── Monthly Trend ──────────────────────────────────────────────────────────────
export const MONTHLY_TREND = [
  { month: 'Jun', expenses: 42000, revenue: 38000, labor: 14000 },
  { month: 'Jul', expenses: 48500, revenue: 52000, labor: 16200 },
  { month: 'Aug', expenses: 51000, revenue: 49000, labor: 17000 },
  { month: 'Sep', expenses: 55000, revenue: 61000, labor: 18500 },
  { month: 'Oct', expenses: 63000, revenue: 58000, labor: 19000 },
  { month: 'Nov', expenses: 58400, revenue: 66000, labor: 17350 },
  { month: 'Dec', expenses: 52000, revenue: 72000, labor: 15500 },
]
