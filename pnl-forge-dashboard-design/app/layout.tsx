import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import React from "react"

import './globals.css'
import { WalletProvider } from '@/lib/wallet-context'
import { FilterProvider } from '@/lib/filter-context'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900']
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'PnlForge - Trading Analytics Dashboard',
  description: 'Professional trading analytics and journal for Deriverse traders. Track PnL, analyze performance, annotate trades, and get AI-powered insights.',
  generator: 'PnlForge',
  robots: 'index, follow',
  openGraph: {
    title: 'PnlForge - Trading Analytics Dashboard',
    description: 'Professional trading analytics and journal for Deriverse traders',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <WalletProvider>
          <FilterProvider>
            {children}
          </FilterProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
