import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAppStore } from './useAppStore'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  attachment_url?: string
  status?: 'pending' | 'approved' | 'rejected'
  segment_id?: string
  category_id?: string
  vendor_id?: string
  payment_method?: string
  is_recurring?: boolean
  recurring_frequency?: string
  created_by?: string
  metadata?: any
}

interface DashboardState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchTransactions: () => Promise<void>
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction | null>
  updateTransactionStatus: (id: string, status: Transaction['status']) => Promise<void>
  updateStatus: (id: string, status: Transaction['status']) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  
  // Computed (from state)
  getTotalRevenue: () => number
  getTotalExpenses: () => number
  getNetProfit: () => number
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      set({ error: error.message, isLoading: false })
    } else {
      // Default mock status to 'approved' if missing
      const processed = (data || []).map(t => ({ ...t, status: t.status || 'approved' }))
      set({ transactions: processed, isLoading: false })
    }
  },

  addTransaction: async (transaction) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, status: transaction.status || 'pending' }])
      .select()
    
    if (error) {
      set({ error: error.message })
      return null
    } else if (data) {
      const newRecord = data[0];
      
      // ── AUDIT & APPROVAL REACTIONS ──────────────────────────────
      useAppStore.getState().logEmployeeSubmission(
        transaction.category === 'Payroll' ? 'Payroll' : 'Expenses',
        'add',
        transaction.category === 'Payroll' ? 'payroll' : 'expense',
        newRecord.id,
        { amount: transaction.amount, description: transaction.description }
      );
      // ────────────────────────────────────────────────────────────────

      set((state) => ({ transactions: [newRecord, ...state.transactions] }))
      return newRecord
    }
    return null
  },

  updateTransactionStatus: async (id, status) => {
    // Optimistic update
    set((state) => ({
      transactions: state.transactions.map(t => t.id === id ? { ...t, status } : t)
    }))

    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id)
    
    if (error) {
      console.error("Status update failed:", error.message)
    }
  },

  updateStatus: async (id, status) => {
    await get().updateTransactionStatus(id, status);
  },

  updateTransaction: async (id, updates) => {
    const old = get().transactions.find(t => t.id === id);
    set((state) => ({
      transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
    }))

    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      set({ error: error.message })
    } else if (old) {
      useAppStore.getState().logEmployeeSubmission(
        old.category === 'Payroll' ? 'Payroll' : 'Expenses',
        'update',
        old.category === 'Payroll' ? 'payroll' : 'expense',
        id,
        { updates }
      );
    }
  },

  deleteTransaction: async (id) => {
    const transaction = get().transactions.find(t => t.id === id);
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (error) {
      set({ error: error.message })
    } else {
      // ── Foundation Wiring ───────────────────────────────────────────
      if (transaction && transaction.status === 'approved') {
        useAppStore.getState().emitSystemEvent({
          type: 'deletion',
          severity: 'warning',
          module: 'Finance',
          message: `Transaction record purged: ${transaction.description}`,
          metadata: { id }
        });
      }
      // ────────────────────────────────────────────────────────────────

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id)
      }))
    }
  },

  getTotalRevenue: () => {
    return get().transactions
      .filter((t) => t.type === 'income' && t.status === 'approved')
      .reduce((acc, curr) => acc + Number(curr.amount), 0)
  },

  getTotalExpenses: () => {
    return get().transactions
      .filter((t) => t.type === 'expense' && t.status === 'approved')
      .reduce((acc, curr) => acc + Number(curr.amount), 0)
  },

  getNetProfit: () => {
    return get().getTotalRevenue() - get().getTotalExpenses()
  }
})
)
