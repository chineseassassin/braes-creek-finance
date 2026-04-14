import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Braes Creek Estate | Farm & Business Finance Platform',
  description: 'Enterprise-grade financial and operations management for mixed agriculture and business enterprise. Track loans, expenses, labor, livestock, and crops.',
  icons: {
    icon: [
      { url: '/logo-transparent.png' },
      { url: '/logo-transparent.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/logo-transparent.png',
    apple: '/logo-transparent.png',
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/logo-transparent.png',
      },
    ],
  },
  manifest: '/manifest.json',

};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

