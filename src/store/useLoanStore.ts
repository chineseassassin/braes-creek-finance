import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAppStore } from './useAppStore'

export interface Loan {
  id: string
  lender_name: string
  amount: number
  remaining_balance: number
  interest_rate: number
  due_date: string
  status: 'active' | 'paid' | 'overdue'
  loan_type?: string
  term_months?: number
  notes?: string
  monthly_payment?: number
  workflow_status?: 'pending' | 'approved' | 'rejected'
  created_at?: string
  created_by?: string
}

interface LoanState {
  loans: Loan[]
  isLoading: boolean
  fetchLoans: () => Promise<void>
  addLoan: (loan: Omit<Loan, 'id' | 'workflow_status' | 'created_by' | 'created_at'>) => Promise<void>
  updateLoan: (id: string, updates: Partial<Loan>) => Promise<void>
  updateStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>
  deleteLoan: (id: string) => Promise<void>
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  isLoading: false,

  fetchLoans: async () => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('due_date', { ascending: true })

      if (error) throw error
      set({ loans: data || [] })
    } catch (err) {
      console.error('Error fetching loans:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  addLoan: async (loanData) => {
    const { currentUser } = useAppStore.getState()
    const isAdmin = currentUser.role === 'admin'
    
    const newLoan: Loan = {
      ...loanData,
      id: Math.random().toString(36).substr(2, 9),
      workflow_status: isAdmin ? 'approved' : 'pending',
      created_at: new Date().toISOString(),
      created_by: currentUser.id
    }

    // Update local state first for UX
    set((state) => ({ loans: [...state.loans, newLoan] }))

    // Log to Audit Engine
    useAppStore.getState().logEmployeeSubmission(
      'Capital & Debt',
      'creation',
      'loan',
      newLoan.id,
      { lender: newLoan.lender_name, amount: newLoan.amount }
    )
  },

  updateLoan: async (id, updates) => {
    const { currentUser } = useAppStore.getState()
    const isAdmin = currentUser.role === 'admin'

    set((state) => ({
      loans: state.loans.map((l) => (l.id === id ? { ...l, ...updates, workflow_status: isAdmin ? l.workflow_status : 'pending' } : l))
    }))

    if (!isAdmin) {
      useAppStore.getState().logEmployeeSubmission(
        'Capital & Debt',
        'update',
        'loan',
        id,
        updates
      )
    }
  },

  updateStatus: async (id, status) => {
    set((state) => ({
      loans: state.loans.map((l) => (l.id === id ? { ...l, workflow_status: status, status: status === 'approved' ? l.status : 'overdue' } : l))
    }))
  },

  deleteLoan: async (id) => {
    set((state) => ({
      loans: state.loans.filter((l) => l.id !== id)
    }))
  }
}))
