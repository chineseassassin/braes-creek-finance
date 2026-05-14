import { create } from 'zustand'
import { InventoryItem } from '@/lib/types'
import { useAppStore } from './useAppStore'
import { useWorkflowStore } from './useWorkflowStore'

interface InventoryState {
  items: InventoryItem[]
  isLoading: boolean
  
  fetchItems: () => Promise<void>
  addItem: (item: Omit<InventoryItem, 'id' | 'workflow_status' | 'created_by' | 'created_at'>) => Promise<InventoryItem | null>
  updateStock: (id: string, amount: number, type: 'add' | 'use') => Promise<void>
  updateStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>
  approveItem: (id: string) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [
    { 
      id: 'inv-1', itemName: 'Layer Mash', category: 'Feed', quantity: 45, unit: 'bags', 
      reorderThreshold: 50, criticalThreshold: 20, unitCost: 185, vendorName: 'Central Feed Supplies',
      workflow_status: 'approved', created_by: 'system', created_at: new Date().toISOString() 
    },
    { 
      id: 'inv-2', itemName: 'NPK 12-12-17', category: 'Fertilizer', quantity: 12, unit: 'bags', 
      reorderThreshold: 15, criticalThreshold: 5, unitCost: 240, vendorName: 'AgroTech Hub',
      workflow_status: 'approved', created_by: 'system', created_at: new Date().toISOString() 
    }
  ],
  isLoading: false,

  fetchItems: async () => {
    set({ isLoading: true })
    set({ isLoading: false })
  },

  addItem: async (item) => {
    const { currentUser, emitSystemEvent } = useAppStore.getState()
    const { addApprovalRequest } = useWorkflowStore.getState()
    
    const isAdmin = currentUser.role === 'admin'
    const status = isAdmin ? 'approved' : 'pending'

    const newItem: InventoryItem = { 
      ...item, 
      id: `inv-${Date.now()}`,
      workflow_status: status,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    } as InventoryItem

    set((state) => ({ items: [newItem, ...state.items] }))

    // ── AUDIT & APPROVAL REACTIONS ──────────────────────────────
    useAppStore.getState().logEmployeeSubmission(
      'Inventory',
      'add',
      'inventory',
      newItem.id,
      { name: item.itemName, quantity: item.quantity, category: item.category }
    );
    // ────────────────────────────────────────────────────────────────

    return newItem
  },

  updateStock: async (id, amount, type) => {
     const { emitSystemEvent } = useAppStore.getState()
     
     set((state) => ({
        items: state.items.map(item => {
           if (item.id === id) {
              const newQty = type === 'add' ? item.quantity + amount : Math.max(0, item.quantity - amount)
              
              // Alert triggers
              if (newQty <= item.criticalThreshold) {
                 emitSystemEvent({
                    type: 'alert',
                    severity: 'critical',
                    module: 'Inventory',
                    message: `CRITICAL STOCK ALERT: ${item.itemName} dropped to ${newQty} ${item.unit}.`
                 })
              } else if (newQty <= item.reorderThreshold) {
                 emitSystemEvent({
                    type: 'alert',
                    severity: 'warning',
                    module: 'Inventory',
                    message: `Low stock warning: ${item.itemName} is at ${newQty} ${item.unit}.`
                 })
              }

              return { ...item, quantity: newQty }
           }
           return item
        })
     }))

     const updatedItem = get().items.find(i => i.id === id)
     emitSystemEvent({
        type: 'update',
        severity: 'info',
        module: 'Inventory',
        message: `Stock ${type === 'add' ? 'added' : 'consumed'}: ${amount} ${updatedItem?.unit} of ${updatedItem?.itemName}`,
        metadata: { id, amount, type, newQuantity: updatedItem?.quantity }
     })
  },

  approveItem: async (id) => {
    set((state) => ({
      items: state.items.map(i => i.id === id ? { ...i, workflow_status: 'approved' } : i)
    }))
    
    const item = get().items.find(i => i.id === id)
    if (item) {
       useAppStore.getState().emitSystemEvent({
          type: 'approval',
          severity: 'info',
          module: 'Inventory',
          message: `Inventory item approved: ${item.itemName}`,
          metadata: { id, quantity: item.quantity }
       })
    }
  },

  updateStatus: async (id, status) => {
     set((state) => ({
       items: state.items.map(i => i.id === id ? { ...i, workflow_status: status } : i)
     }))
  },

  deleteItem: async (id) => {
    set((state) => ({
      items: state.items.filter(i => i.id !== id)
    }))
  }
}))
