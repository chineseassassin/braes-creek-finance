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

    if (isAdmin) {
      emitSystemEvent({
        type: 'creation',
        severity: 'success',
        module: 'Inventory',
        message: `New inventory item: ${item.itemName} (${item.category})`,
        metadata: { id: newItem.id, name: item.itemName, quantity: item.quantity }
      })
      
      // Auto-check if approved item is below threshold
      if (newItem.quantity <= newItem.criticalThreshold) {
         emitSystemEvent({
            type: 'alert',
            severity: 'critical',
            module: 'Inventory',
            message: `CRITICAL STOCK ALERT: ${newItem.itemName} is at ${newItem.quantity} ${newItem.unit}.`
         })
      }
    } else {
      addApprovalRequest({
        entity_type: 'inventory' as any,
        entity_id: newItem.id,
        requester_id: currentUser.id,
        priority: 'medium',
        status: 'pending'
      })
      
      emitSystemEvent({
        type: 'creation',
        severity: 'info',
        module: 'Inventory',
        message: `New inventory item submitted for approval: ${item.itemName}`,
        metadata: { id: newItem.id }
      })
    }

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
          severity: 'success',
          module: 'Inventory',
          message: `Inventory item approved: ${item.itemName}`,
          metadata: { id, quantity: item.quantity }
       })
    }
  },

  deleteItem: async (id) => {
    set((state) => ({
      items: state.items.filter(i => i.id !== id)
    }))
  }
}))
