'use client'

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { getDefaultTrades } from './mock-data-generator'
import { getCurrentTime } from './date-utils'
import type { Trade } from './types'
import bs58 from 'bs58'
import {
  calculateTotalPnL,
  calculateWinRate,
  calculateAverageWin,
  calculateAverageLoss,
  calculateLargestGain,
  calculateLargestLoss,
  calculateAverageTradeDuration,
  calculateLongShortRatio,
  calculateTotalFees,
  buildEquityCurve,
  calculateMaxDrawdown,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateProfitFactor,
  calculateExpectancy,
  calculateKRatio,
  calculateCalmarRatio,
  calculateKellyCriterion,
  calculateRecoveryFactor,
} from './metrics'

export interface GlobalFilters {
  dateRange: {
    startDate: Date | null
    endDate: Date | null
    preset: 'all' | '1m' | '3m' | 'ytd'
  }
  symbol: string | null
  side: 'all' | 'long' | 'short'
  demoMode: boolean
}

export interface CalculatedMetrics {
  totalPnL: number
  winRate: number
  avgWin: number
  avgLoss: number
  largestGain: number
  largestLoss: number
  avgDuration: number
  longRatio: number
  shortRatio: number
  totalFees: number
  tradesCount: number
  sharpeRatio: number
  sortinoRatio: number
  profitFactor: number
  maxDrawdownPct: number
  expectancy: number
  kRatio: number
  calmarRatio: number
  kellyCriterion: number
  recoveryFactor: number
}

interface FilterContextType {
  filters: GlobalFilters
  trades: Trade[]
  allTrades: Trade[] // Alias for trades for compatibility
  filteredTrades: Trade[]
  metrics: CalculatedMetrics
  equityCurve: Array<{ date: string; equity: number; drawdown: number }>
  setFilters: (filters: Partial<GlobalFilters>) => void
  resetFilters: () => void
  setDatePreset: (preset: 'all' | '1m' | '3m' | 'ytd') => void
  isSyncing: boolean
  lastSync: string | null
  syncTrades: (address: string) => Promise<void>
  saveTradeNote: (tradeId: string, note: string, tags: string[]) => void
}

const defaultFilters: GlobalFilters = {
  dateRange: {
    startDate: null,
    endDate: null,
    preset: 'all',
  },
  symbol: null,
  side: 'all',
  demoMode: false,
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<GlobalFilters>(defaultFilters)

  // Get all trades from generator, seeded by wallet address if connected
  const { publicKey, signMessage } = useWallet()
  const [trades, setTrades] = useState<Trade[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch verified trades from our backend with real-time updates
  const syncTrades = async (address: string, forceRefresh: boolean = false) => {
    if (!address || !/^[1-9A-HJ-NP-Z]{32,44}$/.test(address)) {
      console.warn('[syncTrades] Invalid or missing wallet address:', address)
      return
    }
    setIsSyncing(true)
    try {
      // Get or create JWT token
      let token = ''
      try {
        // 1. Get challenge from API
        const challengeRes = await fetch('/api/auth/challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address }),
        })
        const { challenge } = await challengeRes.json()

        // 2. Sign the challenge with the connected wallet
        if (signMessage) {
          const message = new TextEncoder().encode(challenge)
          const signatureBytes = await signMessage(message)
          const signature = bs58.encode(signatureBytes)

          // 3. Verify signature and get JWT token
          const verifyRes = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: address,
              signature,
              challenge
            }),
          })
          const verifyData = await verifyRes.json()
          token = verifyData.token || ''
        }
      } catch (authError) {
        console.warn('Auth failed, continuing without token:', authError)
      }

      // 4. Sync trades with authorization
      const syncRes = await fetch('/api/trades/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          walletAddress: address,
          forceRefresh
        }),
      })

      if (!syncRes.ok) {
        throw new Error(`Sync failed: ${syncRes.statusText}`)
      }

      const data = await syncRes.json()

      if (data.success) {
        // Merge with locally stored annotations
        const storageKey = `pnlforge_notes_${address}`
        const storedNotes = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(storageKey) || '{}') : {}

        const mergedTrades = data.trades.map((t: Trade) => ({
          ...t,
          ...(storedNotes[t.id] || {})
        }))
        setTrades(mergedTrades)
        setLastSync(data.syncMetadata?.timestamp || new Date().toISOString())
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (error) {
      console.error('Failed to sync trades:', error)
      // Only fallback to mock data if we have no trades at all
      if (trades.length === 0) {
        setTrades(getDefaultTrades(address))
      }
    } finally {
      setIsSyncing(false)
    }
  }

  // Auto-refresh trades every 30 seconds if wallet is connected
  useEffect(() => {
    const walletAddress = publicKey?.toBase58()
    if (!walletAddress) return

    // Initial sync
    syncTrades(walletAddress)

    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      syncTrades(walletAddress, false) // Incremental sync
    }, 30000) // 30 seconds

    return () => clearInterval(refreshInterval)
  }, [publicKey])

  // Note: Sync is now handled in the auto-refresh effect above

  // Apply filters to trades
  const filteredTrades = useMemo(() => {
    let result = [...trades]

    // Filter by date range
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      result = result.filter((trade) => {
        const exitDate = new Date(trade.exit_time)
        return exitDate >= filters.dateRange.startDate! && exitDate <= filters.dateRange.endDate!
      })
    }

    // Filter by symbol
    if (filters.symbol) {
      const symbolLower = filters.symbol.toLowerCase()
      result = result.filter((trade) => trade.symbol.toLowerCase().includes(symbolLower))
    }

    // Filter by side
    if (filters.side !== 'all') {
      result = result.filter((trade) => trade.side === filters.side)
    }

    return result
  }, [trades, filters])

  // Calculate metrics from filtered trades
  const metrics = useMemo((): CalculatedMetrics => {
    const totalPnL = calculateTotalPnL(filteredTrades)
    const winRate = calculateWinRate(filteredTrades)
    const avgWin = calculateAverageWin(filteredTrades)
    const avgLoss = calculateAverageLoss(filteredTrades)
    const { long_ratio, short_ratio } = calculateLongShortRatio(filteredTrades)

    const equityCurve = buildEquityCurve(filteredTrades, 10000)
    const mdd = calculateMaxDrawdown(equityCurve) // Renamed for clarity
    const sharpeRatio = calculateSharpeRatio(equityCurve, 0.01)
    const sortinoRatio = calculateSortinoRatio(equityCurve, 0.01)
    const profitFactor = calculateProfitFactor(filteredTrades)

    const expectancy = calculateExpectancy(filteredTrades)
    const kRatio = calculateKRatio(equityCurve)
    const calmarRatio = calculateCalmarRatio(filteredTrades, equityCurve)
    const kellyCriterion = calculateKellyCriterion(filteredTrades)
    const recoveryFactor = calculateRecoveryFactor(totalPnL, mdd.max_drawdown_absolute)

    return {
      totalPnL,
      winRate,
      avgWin,
      avgLoss,
      largestGain: calculateLargestGain(filteredTrades),
      largestLoss: calculateLargestLoss(filteredTrades),
      avgDuration: calculateAverageTradeDuration(filteredTrades),
      longRatio: long_ratio,
      shortRatio: short_ratio,
      totalFees: calculateTotalFees(filteredTrades),
      tradesCount: filteredTrades.length,
      sharpeRatio,
      sortinoRatio,
      profitFactor,
      maxDrawdownPct: mdd.max_drawdown_pct,
      expectancy,
      kRatio,
      calmarRatio,
      kellyCriterion,
      recoveryFactor,
    }
  }, [filteredTrades])

  // Build equity curve for charts
  const equityCurve = useMemo(() => {
    const curve = buildEquityCurve(filteredTrades, 10000)
    return curve.map((point) => ({
      date: point.date,
      equity: point.equity,
      drawdown: point.drawdown_pct,
    }))
  }, [filteredTrades])

  const saveTradeNote = async (tradeId: string, note: string, tags: string[]) => {
    const walletAddress = publicKey?.toBase58()
    if (!walletAddress) return

    // Update local state immediately for responsive UI
    setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, note, tags, reviewed: true } : t))

    // Save to backend API
    try {
      // Get JWT token if available
      const token = localStorage.getItem('auth_token') || ''

      const response = await fetch(`/api/trades/${tradeId}/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ note, tags, reviewed: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to save annotation')
      }

      const data = await response.json()
      // Update with server response
      if (data.trade) {
        setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, ...data.trade } : t))
      }
    } catch (error) {
      console.error('Error saving annotation to backend:', error)
      // Keep local state even if backend save fails
      // Fallback: also save to localStorage as backup
      const storageKey = `pnlforge_notes_${walletAddress}`
      const storedNotes = JSON.parse(localStorage.getItem(storageKey) || '{}')
      storedNotes[tradeId] = { note, tags, reviewed: true }
      localStorage.setItem(storageKey, JSON.stringify(storedNotes))
    }
  }

  const setFilters = (newFilters: Partial<GlobalFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setFiltersState(defaultFilters)
  }

  const setDatePreset = (preset: 'all' | '1m' | '3m' | 'ytd') => {
    const now = getCurrentTime()
    let startDate: Date | null = null

    switch (preset) {
      case '1m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case '3m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = null
    }

    setFiltersState((prev) => ({
      ...prev,
      dateRange: {
        startDate,
        endDate: preset === 'all' ? null : now,
        preset,
      },
    }))
  }

  return (
    <FilterContext.Provider
      value={{
        filters,
        trades,
        allTrades: trades, // Alias for compatibility
        filteredTrades,
        metrics,
        equityCurve,
        setFilters,
        resetFilters,
        setDatePreset,
        isSyncing,
        lastSync,
        syncTrades,
        saveTradeNote,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider')
  }
  return context
}
