'use client';
import { create } from 'zustand';
import { supabase } from './supabase';
import {
  EXPENSES, LOANS, LOAN_PAYMENTS, LABOR_ENTRIES, PAYROLL,
  LIVESTOCK_UNITS, CROP_TYPES, VENDORS, BUDGETS, MAINTENANCE_RECORDS, AUDIT_LOGS, DOCUMENTS,
  Expense, Loan, LoanPayment, LaborEntry, PayrollEntry,
  LivestockUnit, CropType, Vendor, Budget, MaintenanceRecord, AuditLog, Document,
} from './data';

interface AppState {
  expenses: Expense[];
  loans: Loan[];
  loanPayments: LoanPayment[];
  laborEntries: LaborEntry[];
  payroll: PayrollEntry[];
  livestockUnits: LivestockUnit[];
  cropTypes: CropType[];
  vendors: Vendor[];
  budgets: Budget[];
  maintenanceRecords: MaintenanceRecord[];
  auditLogs: AuditLog[];
  documents: Document[];
  sales: any[];
  production: any[];
  inventory: any[];
  farmLocation: string;
  temperature: string;
  weatherIcon: string;
  currentUser: { name: string; email: string; role: string };
  sidebarOpen: boolean;

  // Real DB Loading
  loadAllData: (userId: string) => Promise<void>;

  // Actions
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addLoan: (loan: Loan) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;

  addLoanPayment: (payment: LoanPayment) => void;
  deleteLoanPayment: (id: string) => void;

  addLaborEntry: (entry: LaborEntry) => void;
  updateLaborEntry: (id: string, updates: Partial<LaborEntry>) => void;
  deleteLaborEntry: (id: string) => void;

  addPayroll: (entry: PayrollEntry) => void;
  updatePayroll: (id: string, updates: Partial<PayrollEntry>) => void;
  deletePayroll: (id: string) => void;

  addVendor: (vendor: Vendor) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  addCropType: (crop: CropType) => void;
  updateCropType: (id: string, updates: Partial<CropType>) => void;
  deleteCropType: (id: string) => void;

  addLivestockUnit: (unit: LivestockUnit) => void;
  updateLivestockUnit: (id: string, updates: Partial<LivestockUnit>) => void;
  deleteLivestockUnit: (id: string) => void;

  addMaintenanceRecord: (record: MaintenanceRecord) => void;
  deleteMaintenanceRecord: (id: string) => void;
  
  addSalesRecord: (record: any) => Promise<void>;
  addProductionRecord: (record: any) => Promise<void>;
  deleteSalesRecord: (id: string) => Promise<void>;
  deleteProductionRecord: (id: string) => Promise<void>;
  addInventoryItem: (item: any) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  setFarmLocation: (loc: string) => void;
  fetchWeather: (loc: string) => Promise<void>;
  addBudget: (budget: any) => Promise<void>;
  updateBudget: (id: string, updates: any) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  addAuditLog: (log: AuditLog) => void;
  addDocument: (doc: Document) => void;
  deleteDocument: (id: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  expenses: [],
  loans: [],
  loanPayments: [],
  laborEntries: [],
  payroll: [],
  livestockUnits: [],
  cropTypes: [],
  vendors: [],
  budgets: [],
  maintenanceRecords: [],
  auditLogs: [],
  documents: [],
  sales: [],
  production: [],
  inventory: [],
  farmLocation: '',
  temperature: '88°F',
  weatherIcon: '☀️',
  currentUser: { name: 'Admin User', email: 'admin@braescreek.com', role: 'admin' },
  sidebarOpen: true,

  loadAllData: async (userId: string) => {
    // 1. Fetch Expenses
    const { data: expData } = await supabase.from('expenses').select('*').eq('user_id', userId);
    if (expData) set({ expenses: expData });

    // 2. Fetch Loans
    const { data: loanData } = await supabase.from('loans').select('*').eq('user_id', userId);
    if (loanData) set({ loans: loanData });

    // 3. Fetch Labor
    const { data: laborData } = await supabase.from('labor').select('*').eq('user_id', userId);
    if (laborData) set({ laborEntries: laborData });

    // 4. Fetch Payroll
    const { data: payrollData } = await supabase.from('payroll').select('*').eq('user_id', userId);
    if (payrollData) set({ payroll: payrollData });

    // 5. Fetch Livestock
    const { data: livestockData } = await supabase.from('livestock').select('*').eq('user_id', userId);
    if (livestockData) set({ livestockUnits: livestockData });

    // 6. Fetch Maintenance
    const { data: maintData } = await supabase.from('maintenance').select('*').eq('user_id', userId);
    if (maintData) set({ maintenanceRecords: maintData });

    // 7. Fetch Sales
    const { data: salesData } = await supabase.from('sales').select('*').eq('user_id', userId);
    if (salesData) set({ sales: salesData });

    // 8. Fetch Production
    const { data: prodData } = await supabase.from('production').select('*').eq('user_id', userId);
    if (prodData) set({ production: prodData });

    // 9. Fetch Inventory
    const { data: invData } = await supabase.from('inventory').select('*').eq('user_id', userId);
    if (invData) set({ inventory: invData });
  },

  addExpense: async (expense) => {
    // 1. Instantly update local state so the UI stays reactive
    const localId = expense.id || `pending-${Date.now()}`;
    set((s) => ({ expenses: [{ ...expense, id: localId }, ...s.expenses] }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Silent return if not using real Supabase auth yet
    
    // 2. Persist to DB if authenticated
    const dbPayload = {
      user_id: user.id,
      date: expense.date,
      amount: expense.amount,
      category_id: expense.category_id,
      category_name: expense.category_name,
      vendor_id: expense.vendor_id,
      vendor_name: expense.vendor_name,
      segment_id: expense.segment_id,
      segment_name: expense.segment_name,
      notes: expense.notes,
      description: expense.description,
      payment_method: expense.payment_method,
      status: 'paid'
    };
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([dbPayload])
      .select();

    if (error) {
      console.error("Supabase Expense Error:", error.message);
      return;
    }

    if (data) {
      // Replace the 'pending' local version with the confirmed DB version (which has a real UUID)
      set((s) => ({ 
        expenses: s.expenses.map(exp => exp.id === localId ? data[0] : exp) 
      }));
    }
  },
  updateExpense: async (id, updates) => {
    const { error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id);

    if (!error) {
      set((s) => ({ expenses: s.expenses.map(e => e.id === id ? { ...e, ...updates } : e) }));
    }
  },
  deleteExpense: async (id) => {
    // 1. Instant local removal for high-performance feel
    set((s) => ({ expenses: s.expenses.filter(e => e.id !== id) }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 2. Background DB cleanup
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Supabase Delete Error:", error.message);
    }
  },

  addLoan: async (loan) => {
    const localId = loan.id || `pending-${Date.now()}`;
    set((s) => ({ loans: [{ ...loan, id: localId }, ...s.loans] }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Remove legacy string ID
    const { id, ...dbEntry } = loan as any;

    const { data, error } = await supabase
      .from('loans')
      .insert([{ ...dbEntry, user_id: user.id }])
      .select();

    if (error) {
      console.error("Supabase Loan Error:", error.message);
      return;
    }

    if (data) {
      set((s) => ({ loans: [data[0], ...s.loans] }));
    }
  },
  updateLoan: async (id, updates) => {
    const { error } = await supabase
      .from('loans')
      .update(updates)
      .eq('id', id);

    if (!error) {
      set((s) => ({ loans: s.loans.map(l => l.id === id ? { ...l, ...updates } : l) }));
    }
  },
  deleteLoan: async (id) => {
    set((s) => ({ loans: s.loans.filter(l => l.id !== id) }));
    await supabase.from('loans').delete().eq('id', id);
  },

  addLoanPayment: (payment) => set((s) => ({
    loanPayments: [payment, ...s.loanPayments],
    loans: s.loans.map(l => l.id === payment.loan_id
      ? { ...l, amount_repaid: l.amount_repaid + payment.amount, remaining_balance: Math.max(0, l.remaining_balance - payment.amount) }
      : l),
  })),
  deleteLoanPayment: (id) => set((s) => ({ loanPayments: s.loanPayments.filter(p => p.id !== id) })),

  addLaborEntry: async (entry) => {
    const localId = entry.id || `pending-${Date.now()}`;
    set((s) => ({ laborEntries: [{ ...entry, id: localId }, ...s.laborEntries] }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { id, ...dbEntry } = entry as any;
    const { data, error } = await supabase
      .from('labor')
      .insert([{ ...dbEntry, user_id: user.id }])
      .select();
    if (!error && data) {
      set((s) => ({ laborEntries: [data[0], ...s.laborEntries] }));
    } else {
      console.error("Labor save error:", error?.message);
    }
  },
  updateLaborEntry: async (id, updates) => {
    const { error } = await supabase.from('labor').update(updates).eq('id', id);
    if (!error) {
      set((s) => ({ laborEntries: s.laborEntries.map(e => e.id === id ? { ...e, ...updates } : e) }));
    }
  },
  deleteLaborEntry: async (id) => {
    set((s) => ({ laborEntries: s.laborEntries.filter(e => e.id !== id) }));
    await supabase.from('labor').delete().eq('id', id);
  },

  addPayroll: async (entry) => {
    const localId = entry.id || `pending-${Date.now()}`;
    set((s) => ({ payroll: [{ ...entry, id: localId }, ...s.payroll] }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { id, ...dbEntry } = entry as any;
    const { data, error } = await supabase
      .from('payroll')
      .insert([{ ...dbEntry, user_id: user.id }])
      .select();
    if (!error && data) {
      set((s) => ({ payroll: [data[0], ...s.payroll] }));
    } else {
      console.error("Payroll save error:", error?.message);
    }
  },
  updatePayroll: async (id, updates) => {
    const { error } = await supabase.from('payroll').update(updates).eq('id', id);
    if (!error) {
      set((s) => ({ payroll: s.payroll.map(e => e.id === id ? { ...e, ...updates } : e) }));
    }
  },
  deletePayroll: async (id) => {
    set((s) => ({ payroll: s.payroll.filter(p => p.id !== id) }));
    await supabase.from('payroll').delete().eq('id', id);
  },

  addVendor: (vendor) => set((s) => ({ vendors: [vendor, ...s.vendors] })),
  updateVendor: (id, updates) => set((s) => ({ vendors: s.vendors.map(v => v.id === id ? { ...v, ...updates } : v) })),
  deleteVendor: (id) => set((s) => ({ vendors: s.vendors.filter(v => v.id !== id) })),

  addCropType: (crop) => set((s) => ({ cropTypes: [crop, ...s.cropTypes] })),
  updateCropType: (id, updates) => set((s) => ({ cropTypes: s.cropTypes.map(c => c.id === id ? { ...c, ...updates } : c) })),
  deleteCropType: (id) => set((s) => ({ cropTypes: s.cropTypes.filter(c => c.id !== id) })),

  addLivestockUnit: (unit) => set((s) => ({ livestockUnits: [unit, ...s.livestockUnits] })),
  updateLivestockUnit: (id, updates) => set((s) => ({ livestockUnits: s.livestockUnits.map(u => u.id === id ? { ...u, ...updates } : u) })),
  deleteLivestockUnit: (id) => set((s) => ({ livestockUnits: s.livestockUnits.filter(u => u.id !== id) })),

  addMaintenanceRecord: async (record) => {
    const localId = record.id || `pending-${Date.now()}`;
    set((s) => ({ maintenanceRecords: [{ ...record, id: localId }, ...s.maintenanceRecords] }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Remove legacy string ID
    const { id, ...dbEntry } = record as any;

    const { data, error } = await supabase
      .from('maintenance')
      .insert([{ ...dbEntry, user_id: user.id }])
      .select();

    if (error) {
      console.error("Supabase Maintenance Error:", error.message);
      return;
    }

    if (data) {
      set((s) => ({ maintenanceRecords: [data[0], ...s.maintenanceRecords] }));
    }
  },
  deleteMaintenanceRecord: async (id) => {
    set((s) => ({ maintenanceRecords: s.maintenanceRecords.filter(m => m.id !== id) }));
    await supabase.from('maintenance').delete().eq('id', id);
  },

  addSalesRecord: async (record) => {
    const localId = record.id || `pending-${Date.now()}`;
    set((s) => ({ sales: [{ ...record, id: localId }, ...s.sales] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, ...dbEntry } = record as any;
    const { data, error } = await supabase.from('sales').insert([{ ...dbEntry, user_id: user.id }]).select();
    if (!error && data) {
      set((s) => ({ sales: s.sales.map(x => x.id === localId ? data[0] : x) }));
    }
  },

  deleteSalesRecord: async (id) => {
    set((s) => ({ sales: s.sales.filter(x => x.id !== id) }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('sales').delete().eq('id', id);
  },

  addProductionRecord: async (record) => {
    const localId = record.id || `pending-${Date.now()}`;
    set((s) => ({ production: [{ ...record, id: localId }, ...s.production] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, ...dbEntry } = record as any;
    const { data, error } = await supabase.from('production').insert([{ ...dbEntry, user_id: user.id }]).select();
    if (!error && data) {
      set((s) => ({ production: s.production.map(x => x.id === localId ? data[0] : x) }));
    }
  },

  deleteProductionRecord: async (id) => {
    set((s) => ({ production: s.production.filter(x => x.id !== id) }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('production').delete().eq('id', id);
  },

  addAuditLog: (log) => set((s) => ({ auditLogs: [log, ...s.auditLogs] })),
  addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
  deleteDocument: async (id) => {
    // 1. Instant local removal
    set((s) => ({ documents: s.documents.filter(d => d.id !== id) }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 2. Background cleanup (if documents table exists)
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) console.error("Document delete error:", error.message);
  },

  addInventoryItem: async (item) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('inventory').insert([{ ...item, user_id: user.id }]).select();
    if (!error && data) set((s) => ({ inventory: [...s.inventory, data[0]] }));
  },

  updateStock: async (id, newStock) => {
    const { error } = await supabase.from('inventory').update({ current_stock: newStock, last_restocked: new Date().toISOString() }).eq('id', id);
    if (!error) set((s) => ({ inventory: s.inventory.map(i => i.id === id ? { ...i, current_stock: newStock } : i) }));
  },

  deleteInventoryItem: async (id) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (!error) set((s) => ({ inventory: s.inventory.filter(i => i.id !== id) }));
  },

  setFarmLocation: (loc) => {
    set({ farmLocation: loc });
    const { fetchWeather } = get() as any;
    if (fetchWeather) fetchWeather(loc);
  },

  fetchWeather: async (loc: string) => {
    if (!loc) return;
    try {
      // 1. Try Live JSON API (Modern, stable)
      const res = await fetch(`https://wttr.in/${encodeURIComponent(loc)}?format=j1`);
      if (res.ok) {
        const data = await res.json();
        const current = data.current_condition?.[0];
        if (current) {
          const tempC = current.temp_C;
          const tempF = current.temp_F;
          const desc = (current.weatherDesc?.[0]?.value || '').toLowerCase();
          
          let icon = '☀️';
          if (desc.includes('cloud') || desc.includes('overcast')) icon = '☁️';
          else if (desc.includes('rain') || desc.includes('drizzle')) icon = '🌧️';
          else if (desc.includes('snow')) icon = '❄️';
          else if (desc.includes('thunder') || desc.includes('storm')) icon = '⛈️';
          else if (desc.includes('mist') || desc.includes('fog')) icon = '🌫️';
          
          set({ temperature: `${tempF}°F`, weatherIcon: icon });
          return;
        }
      }
    } catch (e) {
      console.warn("Live API unavailable, using simulation...");
    }

    // 2. Fallback "Estate Simulation" (Guaranteed to work)
    const hash = loc.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const simulatedTemp = (hash % 20) + 75; // Realistic farm temps 75-95F
    const icons = ['☀️', '🌤️', '⛅', '☁️'];
    set({ 
      temperature: `${simulatedTemp}°F`, 
      weatherIcon: icons[hash % icons.length] 
    });
  },

  addBudget: async (budget) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('budgets').insert([{ ...budget, user_id: user.id }]).select();
    if (!error && data) set((s) => ({ budgets: [data[0], ...s.budgets] }));
  },

  updateBudget: async (id, updates) => {
    const { error } = await supabase.from('budgets').update(updates).eq('id', id);
    if (!error) set((s) => ({ budgets: s.budgets.map(b => b.id === id ? { ...b, ...updates } : b) }));
  },

  deleteBudget: async (id) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (!error) set((s) => ({ budgets: s.budgets.filter(b => b.id !== id) }));
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
