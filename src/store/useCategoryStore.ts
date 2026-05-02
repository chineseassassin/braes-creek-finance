import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SAMPLE_CATEGORIES, SAMPLE_SEGMENTS } from '@/lib/sample-data'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  color: string
  segment_id: string
}

interface Segment {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

interface CategoryState {
  categories: Category[]
  segments: Segment[]
  
  // Actions
  addCategory: (category: Omit<Category, 'id'>) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  
  addSegment: (segment: Omit<Segment, 'id'>) => void
  updateSegment: (id: string, updates: Partial<Segment>) => void
  deleteSegment: (id: string) => void
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set) => ({
      categories: SAMPLE_CATEGORIES,
      segments: SAMPLE_SEGMENTS,

      addCategory: (category) => {
        const newCat = { ...category, id: `cat-${Date.now()}` }
        set((state) => ({ categories: [...state.categories, newCat] }))
        toast.success(`Category "${category.name}" created successfully`)
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
        }))
        toast.success('Category updated')
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter(c => c.id !== id)
        }))
        toast.success('Category deleted')
      },

      addSegment: (segment) => {
        const newSeg = { ...segment, id: `seg-${Date.now()}` }
        set((state) => ({ segments: [...state.segments, newSeg] }))
        toast.success(`Segment "${segment.name}" registered`)
      },

      updateSegment: (id, updates) => {
        set((state) => ({
          segments: state.segments.map(s => s.id === id ? { ...s, ...updates } : s)
        }))
        toast.success('Segment updated')
      },

      deleteSegment: (id) => {
        set((state) => ({
          segments: state.segments.filter(s => s.id !== id)
        }))
        toast.success('Segment removed')
      }
    }),
    {
      name: 'braes-creek-category-storage',
    }
  )
)
