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
  metadata?: any
}

interface DashboardState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchTransactions: () => Promise<void>
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>
  updateTransactionStatus: (id: string, status: Transaction['status']) => Promise<void>
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
      
      // ── PHASE 4 REACTIONS ───────────────────────────────────────────
      if (newRecord.status === 'approved') {
        useAppStore.getState().emitSystemEvent({
          type: 'DATA_APPROVED',
          severity: 'info',
          module: transaction.category === 'Payroll' ? 'Payroll' : 'Expenses',
          message: `${transaction.category === 'Payroll' ? 'Payroll' : 'Expense'} approved: ${transaction.description}`,
          entity_id: newRecord.id,
          metadata: { id: newRecord.id, amount: transaction.amount }
        });
      } else if (newRecord.status === 'pending') {
        useAppStore.getState().emitSystemEvent({
          type: 'SUBMITTED',
          severity: 'info',
          module: transaction.category === 'Payroll' ? 'Payroll' : 'Expenses',
          message: `${transaction.category === 'Payroll' ? 'Payroll' : 'Expense'} submitted for verification: ${transaction.description}`,
          entity_id: newRecord.id,
          metadata: { id: newRecord.id, amount: transaction.amount }
        });
      }
      // ────────────────────────────────────────────────────────────────

      set((state) => ({ transactions: [newRecord, ...state.transactions] }))
      return newRecord
    }
    return null
  },

  updateTransactionStatus: async (id, status) => {
    const transaction = get().transactions.find(t => t.id === id);
    
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
    } else if (status === 'approved' && transaction) {
      // 🧠 PHASE 4: REACTION ON APPROVAL
      useAppStore.getState().emitSystemEvent({
        type: 'DATA_APPROVED',
        severity: 'success',
        module: transaction.category === 'Payroll' ? 'Payroll' : 'Expenses',
        message: `${transaction.category === 'Payroll' ? 'Payroll' : 'Expense'} entry finalized and approved`,
        entity_id: id,
        metadata: { id, amount: transaction.amount }
      });
    }
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
      useAppStore.getState().emitSystemEvent({
        type: 'DATA_UPDATED',
        severity: 'info',
        module: old.category === 'Payroll' ? 'Payroll' : 'Expenses',
        message: `Transaction record updated: ${old.description}`,
        metadata: { id, updates }
      });
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
