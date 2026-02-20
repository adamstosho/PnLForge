'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  Download,
  X,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  FileText,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag as TagIcon,
  TrendingUp
} from 'lucide-react'
import { useFilters } from '@/lib/filter-context'
import { formatDateTime, formatDuration } from '@/lib/date-utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

/**
 * Trades Page Component
 * Standardized with premium UI components and Alpha-tier aesthetic.
 */
export default function TradesPage() {
  const { filteredTrades, saveTradeNote } = useFilters()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTrade, setSelectedTrade] = useState<any>(null)

  // Filter trades by search query (symbol or tags)
  const displayedTrades = useMemo(() => {
    return filteredTrades.filter(trade =>
      trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ).reverse() // Show newest first
  }, [filteredTrades, searchQuery])

  /**
   * Export to CSV utility
   */
  const exportToCSV = () => {
    const headers = ['Date', 'Symbol', 'Side', 'Size', 'Entry', 'Exit', 'PnL', 'Fees', 'Duration']
    const rows = displayedTrades.map(t => [
      formatDateTime(t.exit_time),
      t.symbol,
      t.side,
      t.size,
      t.entry_price,
      t.exit_price,
      t.pnl,
      t.fees,
      formatDuration(t.entry_time, t.exit_time)
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pnl-forge-trades-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 mesh-bg min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Trade <span className="text-primary-500">Ledger</span></h2>
          <p className="text-muted-600 font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" /> {displayedTrades.length} transactions indexed on-chain.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={exportToCSV}
            className="bg-muted-900 text-bg hover:bg-black font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl shadow-lg active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            Export Archive
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-500" />
          <Input
            placeholder="Search by symbol or alpha-tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 h-12 glass border-none focus-visible:ring-2 focus-visible:ring-primary-500 font-medium"
          />
        </div>
        <Button variant="outline" className="h-12 glass border-none px-6 font-black uppercase tracking-widest text-[10px] text-muted-600 active:scale-95 transition-all">
          <Filter className="w-3.5 h-3.5 mr-2" />
          Filter Engine
        </Button>
      </div>

      {/* Trades Table Container */}
      <Card className="glass border-none shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted-50/50">
            <TableRow className="hover:bg-transparent border-muted-100">
              <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Exit Date</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Asset</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Execution</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Size</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Entry</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Exit</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">PnL (Alpha)</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Intelligence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTrades.length > 0 ? (
              displayedTrades.map((trade) => (
                <TableRow
                  key={trade.id}
                  onClick={() => setSelectedTrade(trade)}
                  className="group cursor-pointer hover:bg-primary-50/30 border-muted-100 transition-colors"
                >
                  <TableCell className="font-medium text-muted-600 text-xs py-4">
                    {new Date(trade.exit_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="font-black text-muted-900 tracking-tight">{trade.symbol}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-black text-[9px] uppercase tracking-tighter rounded-md px-2 py-0.5",
                      trade.side === 'long'
                        ? "bg-primary-100 text-primary-700 hover:bg-primary-200"
                        : "bg-danger/10 text-danger hover:bg-danger/20"
                    )}>
                      {trade.side}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-muted-700 text-xs">{trade.size}</TableCell>
                  <TableCell className="text-right font-medium text-muted-600 text-xs">${trade.entry_price.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium text-muted-600 text-xs">${trade.exit_price.toLocaleString()}</TableCell>
                  <TableCell className={cn(
                    "text-right font-black tracking-tight",
                    trade.pnl >= 0 ? "text-success" : "text-danger"
                  )}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      {trade.tags.slice(0, 1).map((tag: string, i: number) => (
                        <Badge key={i} className="border-muted-200 text-muted-700 text-[9px] font-bold h-5 px-1.5 uppercase bg-transparent">
                          {tag}
                        </Badge>
                      ))}
                      {trade.tags.length > 1 && (
                        <span className="text-[9px] font-black text-muted-600 self-center">+{trade.tags.length - 1}</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-600 font-medium uppercase tracking-widest text-[10px]">
                  No matching alpha signals detected.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Trade Detail Intelligent Sidebar */}
      <Sheet open={!!selectedTrade} onOpenChange={(open: boolean) => !open && setSelectedTrade(null)}>
        <SheetContent className="w-full sm:max-w-md border-l border-muted-200 p-0 overflow-hidden flex flex-col glass">
          {selectedTrade && (
            <>
              <SheetHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="text-primary-500 border-primary-200 font-black text-[9px] tracking-widest uppercase bg-transparent">
                    Execution Verified
                  </Badge>
                  <span className="text-[10px] text-muted-600 font-bold">Ref: {selectedTrade.id.slice(-8)}</span>
                </div>
                <SheetTitle className="text-4xl font-black text-muted-900 tracking-tighter uppercase">
                  {selectedTrade.symbol} <span className="text-primary-500">Oracle</span>
                </SheetTitle>
                <SheetDescription className="text-muted-600 font-medium flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {formatDateTime(selectedTrade.exit_time)}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                {/* Performance Summary Overlay */}
                <div className={cn(
                  "p-6 rounded-2xl relative overflow-hidden group transition-all duration-500",
                  selectedTrade.pnl >= 0 ? "bg-success/5" : "bg-danger/5"
                )}>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-600 mb-1">Delta Analysis</p>
                    <h3 className={cn(
                      "text-5xl font-black tracking-tighter",
                      selectedTrade.pnl >= 0 ? "text-success" : "text-danger"
                    )}>
                      {selectedTrade.pnl >= 0 ? '+' : ''}${Math.abs(selectedTrade.pnl).toFixed(2)}
                    </h3>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", selectedTrade.pnl >= 0 ? "bg-success" : "bg-danger")} />
                        <span className="text-[10px] font-bold text-muted-600 uppercase tracking-wider">
                          {(selectedTrade.pnl / selectedTrade.entry_price * 100).toFixed(2)}% ROI
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Subtle Background Icon */}
                  <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-175 duration-1000">
                    {selectedTrade.pnl >= 0 ? <TrendingUp className="w-40 h-40" /> : <ArrowDownRight className="w-40 h-40" />}
                  </div>
                </div>

                {/* Technical Coordinates Grid */}
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-600 block mb-1">Execution Side</label>
                    <span className="font-black text-muted-900 uppercase text-sm tracking-tight">{selectedTrade.side}</span>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-600 block mb-1">Volume (Size)</label>
                    <span className="font-black text-muted-900 text-sm tracking-tight">{selectedTrade.size} Units</span>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-600 block mb-1">Entry Equilibrium</label>
                    <span className="font-black text-muted-900 text-sm tracking-tight">${selectedTrade.entry_price.toLocaleString()}</span>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-600 block mb-1">Exit Point</label>
                    <span className="font-black text-muted-900 text-sm tracking-tight">${selectedTrade.exit_price.toLocaleString()}</span>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-600 block mb-1">Time Exposure</label>
                    <span className="font-black text-muted-900 text-sm tracking-tight">{formatDuration(selectedTrade.entry_time, selectedTrade.exit_time)}</span>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-600 block mb-1">Synthesis Fees</label>
                    <span className="font-black text-muted-900 text-sm tracking-tight">${selectedTrade.fees.toFixed(2)}</span>
                  </div>
                </div>

                {/* Intelligence Tags */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-600 block mb-3 flex items-center gap-1.5">
                    <TagIcon className="w-3 h-3" /> Synthesis Tags
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTrade.tags.map((tag: string, i: number) => (
                      <Badge key={i} className="bg-surface border-muted-200 text-muted-700 hover:bg-primary-50 hover:border-primary-200 transition-colors font-black text-[9px] uppercase tracking-wider py-1 px-2.5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Alpha Notes Implementation */}
                <div className="pt-6 border-t border-muted-100">
                  <label htmlFor="alpha-notes" className="text-[9px] font-black uppercase tracking-widest text-muted-600 block mb-3">
                    Strategist Annotation
                  </label>
                  <textarea
                    id="alpha-notes"
                    rows={4}
                    value={selectedTrade.note || ''}
                    onChange={(e) => saveTradeNote(selectedTrade.id, e.target.value, selectedTrade.tags)}
                    className="w-full p-4 bg-muted-50/50 border-none rounded-2xl focus:ring-1 focus:ring-primary-500 text-sm text-muted-800 placeholder:text-muted-300 font-medium resize-none shadow-inner"
                    placeholder="Document tactical insights or emotional state for this execution..."
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-8 bg-bg border-t border-muted-100 flex gap-3">
                <Button
                  onClick={() => setSelectedTrade(null)}
                  className="shrink-0 bg-muted-900 text-bg hover:bg-black font-black uppercase tracking-widest px-8 h-14 rounded-xl shadow-xl shadow-black/10 active:scale-95 transition-all text-[10px]"
                >
                  Save Intelligence
                </Button>
                <Button variant="outline" className="w-14 h-14 rounded-2xl border-muted-200 hover:bg-muted-50 active:scale-95 transition-all">
                  <ExternalLink className="w-5 h-5 text-muted-400" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
