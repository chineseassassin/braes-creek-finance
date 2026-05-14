import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Handle invalid/placeholder credentials gracefully to prevent runtime crash
const isValid = supabaseUrl && supabaseUrl.startsWith('http') && supabaseUrl !== 'your_supabase_project_url'

if (!supabaseUrl && !supabaseAnonKey) {
  console.warn('⚠️ SUPABASE ERROR: Invalid or missing NEXT_PUBLIC_SUPABASE_URL. Dashboard will operate in read-only/demo mode.')
}

// If invalid, we use placeholders to avoid crashing 'createClient', but it will fail on actual requests
export const supabase = createClient(
  isValid ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isValid ? supabaseAnonKey : 'placeholder-key'
)
