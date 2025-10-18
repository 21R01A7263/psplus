import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Prefer static HTML for the app shell and set a default ISR window
export const dynamic = 'force-static'
export const revalidate = 7200

export const metadata: Metadata = {
  title: 'PS Plus Extra Games',
  description: 'Browse the current PlayStation Plus monthly catalogue in one clean, fast page.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://image.api.playstation.com" />
        <link rel="dns-prefetch" href="//image.api.playstation.com" />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
