import { create } from 'zustand'
import { Vendor } from '@/lib/types'
import { SAMPLE_VENDORS } from '@/lib/sample-data'
import { useAppStore } from './useAppStore'

interface VendorState {
  vendors: Vendor[]
  isLoading: boolean
  
  // Actions
  addVendor: (vendor: Omit<Vendor, 'id' | 'created_at'>) => Promise<Vendor | null>
  updateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>
  deleteVendor: (id: string) => Promise<void>
}

export const useVendorStore = create<VendorState>((set, get) => ({
  vendors: SAMPLE_VENDORS.map(v => ({
    ...v,
    // Add demo analytics if missing
    total_spend: Math.floor(Math.random() * 50000) + 5000,
    reliability: (Math.random() * 2 + 3).toFixed(1),
    cost_trend: Math.random() > 0.5 ? 'up' : 'down',
    last_transaction: '2026-04-25',
    avg_job_cost: Math.floor(Math.random() * 2000) + 500,
    risk: Math.random() > 0.8 ? 'High' : 'Low'
  })) as any,
  isLoading: false,

  addVendor: async (vendor) => {
    const newVendor: Vendor = {
      ...vendor,
      id: `v-${Math.random().toString(36).substring(7)}`,
      created_at: new Date().toISOString()
    }

    // Mock analytics for the new vendor
    const enrichedVendor = {
      ...newVendor,
      total_spend: 0,
      reliability: '5.0',
      cost_trend: 'stable',
      last_transaction: 'N/A',
      avg_job_cost: 0,
      risk: 'Low'
    }

    set((state) => ({ vendors: [enrichedVendor as any, ...state.vendors] }))

    // Emit event for activity feed and AI
    useAppStore.getState().emitSystemEvent({
      type: 'creation',
      severity: 'info',
      module: 'Vendors',
      message: `New supply chain entity registered: ${vendor.name}`,
      metadata: { id: newVendor.id, type: 'vendor' }
    })

    return enrichedVendor as any
  },

  updateVendor: async (id, updates) => {
    set((state) => ({
      vendors: state.vendors.map(v => v.id === id ? { ...v, ...updates } : v)
    }))
  },

  deleteVendor: async (id) => {
    set((state) => ({
      vendors: state.vendors.filter(v => v.id !== id)
    }))
  }
}))
