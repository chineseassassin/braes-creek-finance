'use client';
import { create } from 'zustand';
import { supabase } from './supabase';
import {
  EXPENSES, LOANS, LOAN_PAYMENTS, LABOR_ENTRIES, PAYROLL, SALES,
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
  navSections: any[];
  notifications: import('./data').Notification[];
  controlPanelOpen: boolean;
  setControlPanelOpen: (open: boolean) => void;
  selectedItem: any | null;
  setSelectedItem: (item: any | null) => void;

  // SYSTEM ACTIONS
  clearAllData: () => Promise<void>;

  // Real DB Loading
  loadAllData: (userId: string) => Promise<void>;

  // Actions
  renameNavItem: (id: string, newLabel: string) => void;
  deleteNavItem: (id: string) => void;
  resetNavigation: () => void;
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
  addNotification: (notification: import('./data').Notification) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  setSidebarOpen: (open: boolean) => void;
  uploadDocument: (file: File, category: string) => Promise<void>;
}

const STORAGE_KEY = 'braes_creek_estate_data';

export const useAppStore = create<AppState>((set, get) => ({
  expenses: EXPENSES,
  loans: LOANS,
  loanPayments: LOAN_PAYMENTS,
  laborEntries: LABOR_ENTRIES,
  payroll: PAYROLL,
  livestockUnits: LIVESTOCK_UNITS,
  cropTypes: CROP_TYPES,
  vendors: VENDORS,
  budgets: BUDGETS,
  maintenanceRecords: MAINTENANCE_RECORDS,
  auditLogs: AUDIT_LOGS,
  documents: DOCUMENTS,
  sales: SALES,
  production: [],
  inventory: [],
  farmLocation: 'Jamaica',
  temperature: '88°F',
  weatherIcon: '☀️',
  currentUser: { name: 'Admin User', email: 'admin@braescreek.com', role: 'admin' },
  sidebarOpen: true,
  navSections: [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', color: 'blue' },
        { id: 'alerts', label: 'Alerts Hub', icon: '🔔', color: 'red' },
        { id: 'reports', label: 'Reports', icon: '📋', color: 'purple' },
      ],
    },
    {
      label: 'Finance',
      items: [
        { id: 'pl', label: 'P&L Intelligence', icon: '📈', color: 'green' },
        { id: 'expenses', label: 'Expenses', icon: '💸', color: 'red' },
        { id: 'loans', label: 'Loans', icon: '🏦', color: 'blue' },
        { id: 'budgets', label: 'Budgets', icon: '🎯', color: 'amber' },
        { id: 'payroll', label: 'Payroll', icon: '💰', color: 'green' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { id: 'operations', label: 'Yield & Sales', icon: '🚜', color: 'teal' },
        { id: 'labor', label: 'Labor', icon: '👷', color: 'amber' },
        { id: 'livestock', label: 'Livestock', icon: '🐄', color: 'red' },
        { id: 'crops', label: 'Crops', icon: '🌿', color: 'green' },
        { id: 'maintenance', label: 'Maintenance', icon: '🔧', color: 'purple' },
      ],
    },
    {
      label: 'Business',
      items: [
        { id: 'vendors', label: 'Vendors', icon: '🏪', color: 'blue' },
        { id: 'inventory', label: 'Inventory', icon: '📦', color: 'amber' },
        { id: 'documents', label: 'Documents', icon: '📁', color: 'amber' },
        { id: 'audit', label: 'Audit Trail', icon: '🔍', color: 'teal' },
        { id: 'settings', label: 'Settings', icon: '⚙️', color: 'gray' },
      ],
    },
  ],
  notifications: [],
  controlPanelOpen: false,
  setControlPanelOpen: (open) => set({ controlPanelOpen: open }),
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item, controlPanelOpen: !!item }),

  clearAllData: async () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      expenses: EXPENSES,
      loans: LOANS,
      loanPayments: LOAN_PAYMENTS,
      laborEntries: LABOR_ENTRIES,
      payroll: PAYROLL,
      livestockUnits: LIVESTOCK_UNITS,
      cropTypes: CROP_TYPES,
      vendors: VENDORS,
      budgets: BUDGETS,
      maintenanceRecords: MAINTENANCE_RECORDS,
      auditLogs: AUDIT_LOGS,
      documents: DOCUMENTS,
      sales: SALES,
      production: [],
      inventory: [],
      notifications: [],
    });
    // Ensure navigation is also reset to factory demo state
    get().resetNavigation();
  },

  loadAllData: async (userId: string) => {
    // Try LocalStorage First for instant hydration
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      set(parsed);
    }

    try {
      const results = await Promise.all([
        supabase.from('expenses').select('*').eq('user_id', userId),
        supabase.from('loans').select('*').eq('user_id', userId),
        supabase.from('labor').select('*').eq('user_id', userId),
        supabase.from('payroll').select('*').eq('user_id', userId),
        supabase.from('livestock').select('*').eq('user_id', userId),
        supabase.from('maintenance').select('*').eq('user_id', userId),
        supabase.from('sales').select('*').eq('user_id', userId),
        supabase.from('production').select('*').eq('user_id', userId),
        supabase.from('inventory').select('*').eq('user_id', userId),
        supabase.from('notifications').select('*').eq('user_id', userId),
      ]);

      const [exp, loan, lab, pay, live, maint, sale, prod, inv, note] = results;
      
      const remoteData: Partial<AppState> = {};
      if (exp.data) remoteData.expenses = exp.data;
      if (loan.data) remoteData.loans = loan.data;
      if (lab.data) remoteData.laborEntries = lab.data;
      if (pay.data) remoteData.payroll = pay.data;
      if (live.data) remoteData.livestockUnits = live.data;
      if (maint.data) remoteData.maintenanceRecords = maint.data;
      if (sale.data) remoteData.sales = sale.data;
      if (prod.data) remoteData.production = prod.data;
      if (inv.data) remoteData.inventory = inv.data;
      if (note.data) remoteData.notifications = note.data;

      set(remoteData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...get(), ...remoteData }));
    } catch (e) {
      console.warn("Supabase Sync Failed - Running in Autonomous Mode");
    }
  },

  _sync: () => {
    const state = get();
    const dataToSave = {
      expenses: state.expenses,
      loans: state.loans,
      loanPayments: state.loanPayments,
      laborEntries: state.laborEntries,
      payroll: state.payroll,
      livestockUnits: state.livestockUnits,
      cropTypes: state.cropTypes,
      vendors: state.vendors,
      budgets: state.budgets,
      maintenanceRecords: state.maintenanceRecords,
      auditLogs: state.auditLogs,
      documents: state.documents,
      sales: state.sales,
      production: state.production,
      inventory: state.inventory,
      notifications: state.notifications
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  },

  addExpense: async (expense) => {
    // 1. Instantly update local state so the UI stays reactive
    const localId = expense.id || `pending-${Date.now()}`;
    set((s) => ({ expenses: [{ ...expense, id: localId }, ...s.expenses] }));

    const { data: { user } } = await supabase.auth.getUser();
    get()._sync();
    if (!user) {
      console.warn("Saving locally (No Supabase detected)");
      return; 
    }
    
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
    get()._sync();
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
    get()._sync();
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

  addCropType: async (crop) => {
    const localId = crop.id || `pending-${Date.now()}`;
    set((s) => ({ cropTypes: [{ ...crop, id: localId }, ...s.cropTypes] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, ...dbEntry } = crop as any;
    const { data, error } = await supabase.from('crops').insert([{ ...dbEntry, user_id: user.id }]).select();
    if (!error && data) {
      set((s) => ({ cropTypes: s.cropTypes.map(x => x.id === localId ? data[0] : x) }));
    }
  },
  updateCropType: async (id, updates) => {
    const { error } = await supabase.from('crops').update(updates).eq('id', id);
    if (!error) set((s) => ({ cropTypes: s.cropTypes.map(c => c.id === id ? { ...c, ...updates } : c) }));
  },
  deleteCropType: async (id) => {
    set((s) => ({ cropTypes: s.cropTypes.filter(c => c.id !== id) }));
    await supabase.from('crops').delete().eq('id', id);
  },

  addLivestockUnit: async (unit) => {
    const localId = unit.id || `pending-${Date.now()}`;
    const newUnit = { ...unit, id: localId };
    set((s) => ({ livestockUnits: [newUnit, ...s.livestockUnits] }));
    get()._sync();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn("Livestock saved locally only.");
      return;
    }
    
    // Remote Sync
    const { id, ...dbEntry } = newUnit as any;
    const { data, error } = await supabase.from('livestock').insert([{ ...dbEntry, user_id: user.id }]).select();
    if (!error && data) {
      set((s) => ({ livestockUnits: s.livestockUnits.map(x => x.id === localId ? data[0] : x) }));
      get()._sync();
    }
  },
  updateLivestockUnit: async (id, updates) => {
    const { error } = await supabase.from('livestock').update(updates).eq('id', id);
    if (!error) set((s) => ({ livestockUnits: s.livestockUnits.map(u => u.id === id ? { ...u, ...updates } : u) }));
  },
  deleteLivestockUnit: async (id) => {
    set((s) => ({ livestockUnits: s.livestockUnits.filter(u => u.id !== id) }));
    await supabase.from('livestock').delete().eq('id', id);
  },

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
    const total_amount = (record.quantity || 0) * (record.unit_price || 0);
    const enrichedRecord = { ...record, total_amount };
    const localId = enrichedRecord.id || `pending-${Date.now()}`;
    
    set((s) => ({ sales: [{ ...enrichedRecord, id: localId }, ...s.sales] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, ...dbEntry } = enrichedRecord as any;
    const { data, error } = await supabase.from('sales').insert([{ ...dbEntry, user_id: user.id }]).select();
    if (!error && data) {
      set((s) => ({ sales: s.sales.map(x => x.id === localId ? data[0] : x) }));
    }
  },

  deleteSalesRecord: async (id) => {
    set((s) => ({ sales: s.sales.filter(x => x.id !== id) }));
    const { data: { user } } = await supabase.auth.getUser();
    get()._sync();
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

  addAuditLog: (log) => {
    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    get()._sync();
  },
  addNotification: async (notification) => {
    const localId = notification.id || `pending-${Date.now()}`;
    set((s) => ({ notifications: [{ ...notification, id: localId, read: false }, ...s.notifications] }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { id, ...dbEntry } = notification as any;
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...dbEntry, user_id: user.id, read: false }])
      .select();

    if (!error && data) {
      set((s) => ({ notifications: s.notifications.map(n => n.id === localId ? data[0] : n) }));
    }
  },

  markNotificationAsRead: async (id) => {
    // 1. Instant local update
    set((s) => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));

    // 2. Persist to DB
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    if (error) console.error("Notification mark read error:", error.message);
  },

  deleteNotification: async (id) => {
    set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) }));
    await supabase.from('notifications').delete().eq('id', id);
  },
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

  renameNavItem: (id, newLabel) => set((s) => ({
    navSections: s.navSections.map(section => ({
      ...section,
      items: section.items.map(item => item.id === id ? { ...item, label: newLabel } : item)
    }))
  })),

  deleteNavItem: (id) => set((s) => ({
    navSections: s.navSections.map(section => ({
      ...section,
      items: section.items.filter(item => item.id !== id)
    })).filter(section => section.items.length > 0)
  })),

  resetNavigation: () => set({
    navSections: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: '📊', color: 'blue' },
          { id: 'alerts', label: 'Alerts Hub', icon: '🔔', color: 'red' },
          { id: 'reports', label: 'Reports', icon: '📋', color: 'purple' },
        ],
      },
      {
        label: 'Finance',
        items: [
          { id: 'pl', label: 'P&L Intelligence', icon: '📈', color: 'green' },
          { id: 'expenses', label: 'Expenses', icon: '💸', color: 'red' },
          { id: 'loans', label: 'Loans', icon: '🏦', color: 'blue' },
          { id: 'budgets', label: 'Budgets', icon: '🎯', color: 'amber' },
          { id: 'payroll', label: 'Payroll', icon: '💰', color: 'green' },
        ],
      },
      {
        label: 'Operations',
        items: [
          { id: 'operations', label: 'Yield & Sales', icon: '🚜', color: 'teal' },
          { id: 'labor', label: 'Labor', icon: '👷', color: 'amber' },
          { id: 'livestock', label: 'Livestock', icon: '🐄', color: 'red' },
          { id: 'crops', label: 'Crops', icon: '🌿', color: 'green' },
          { id: 'maintenance', label: 'Maintenance', icon: '🔧', color: 'purple' },
        ],
      },
      {
        label: 'Business',
        items: [
          { id: 'vendors', label: 'Vendors', icon: '🏪', color: 'blue' },
          { id: 'inventory', label: 'Inventory', icon: '📦', color: 'amber' },
          { id: 'documents', label: 'Documents', icon: '📁', color: 'amber' },
          { id: 'audit', label: 'Audit Trail', icon: '🔍', color: 'teal' },
          { id: 'settings', label: 'Settings', icon: '⚙️', color: 'gray' },
        ],
      },
    ]
  }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  uploadDocument: async (file, category) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Storage Error:", uploadError.message);
      return;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // 3. Save Record to DB
    const newDoc: Document = {
      id: uuidv4(),
      name: file.name,
      type: file.type,
      category,
      upload_date: new Date().toISOString().split('T')[0],
      file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: publicUrl,
      uploaded_by: get().currentUser.name
    };

    get().addDocument(newDoc);
  },
}));
