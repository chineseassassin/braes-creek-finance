import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgroFinance Pro | Farm & Business Financial Management',
  description: 'Enterprise-grade financial management platform for mixed agriculture and business operations. Track expenses, loans, payroll, livestock, and crops.',
  keywords: ['farm finance', 'agriculture management', 'loan tracking', 'expense management', 'livestock operations'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
