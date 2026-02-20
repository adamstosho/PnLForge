'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Settings, LogOut, BarChart3, List, BookOpen, Zap, Award, TrendingDown, Sparkles, LayoutDashboard } from 'lucide-react'
import { AiAssistant } from '@/components/ai-assistant'
import { LogoAnimated } from '@/components/logo-animated'
import { FilterProvider } from '@/lib/filter-context'
import { useWallet } from '@/lib/wallet-context'
import { ConnectWalletButton } from '@/components/connect-wallet-button'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { publicKey, disconnect } = useWallet()
  const address = publicKey?.toBase58() || null
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/trades', label: 'Trade History', icon: List },
    { href: '/dashboard/journal', label: 'Journal', icon: BookOpen },
    { href: '/dashboard/simulator', label: 'Simulator', icon: Zap },
    { href: '/dashboard/achievements', label: 'Achievements', icon: Award },
    { href: '/dashboard/benchmarks', label: 'Benchmarks', icon: TrendingDown },
  ]

  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative md:w-60 w-60 h-full bg-surface border-r border-muted-300 z-40 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="h-16 border-b border-muted-300 flex items-center px-6">
          <div className="flex items-center gap-3">
            <LogoAnimated size={32} />
            <span className="font-bold text-muted-700">PnlForge</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-md text-muted-600 hover:bg-muted-100 hover:text-muted-700 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-muted-300 p-4">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-2 rounded-md text-muted-600 hover:bg-muted-100 hover:text-muted-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-muted-300 bg-bg flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-muted-100 rounded-md"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {address ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-muted-700">Wallet</p>
                  <p className="text-xs text-muted-600 font-mono" title={address}>
                    {address.slice(0, 4)}...{address.slice(-4)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    disconnect()
                    router.push('/')
                  }}
                  className="text-muted-600 hover:text-danger hover:bg-danger/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="sr-only">Disconnect</span>
                </Button>
              </div>
            ) : (
              <ConnectWalletButton
                className="gap-1"
              />
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* AI Assistant - opens via "Ask AI" button */}
      <AiAssistant />
    </div>
  )
}
