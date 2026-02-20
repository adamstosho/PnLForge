'use client'

import { useFilters } from '@/lib/filter-context'
import { Calendar, X } from 'lucide-react'

import { cn } from '@/lib/utils'

export function GlobalFilters({ className }: { className?: string }) {
  const { filters, setFilters, setDatePreset, resetFilters } = useFilters()

  const hasActiveFilters = filters.symbol || filters.side !== 'all' || filters.dateRange.preset !== 'all'

  return (
    <div className={cn("flex flex-col gap-4 border-b border-muted-300 bg-surface p-4 overflow-x-auto", className)}>
      {/* Date Range & Presets */}
      <div className="flex items-center gap-2 flex-wrap">
        <Calendar className="w-4 h-4 text-muted-600" />
        <div className="flex gap-2">
          {(['all', '1m', '3m', 'ytd'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setDatePreset(preset)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filters.dateRange.preset === preset
                ? 'bg-primary-500 text-white'
                : 'bg-muted-200 text-muted-700 hover:bg-muted-300'
                }`}
              aria-label={`Filter by ${preset === 'all' ? 'all time' : preset}`}
            >
              {preset === 'all' ? 'All' : preset.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Symbol & Side Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Symbol Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="symbol-filter" className="text-sm font-medium text-muted-600">
            Symbol:
          </label>
          <input
            id="symbol-filter"
            type="text"
            placeholder="e.g., SOL/USDC"
            value={filters.symbol || ''}
            onChange={(e) => setFilters({ symbol: e.target.value || null })}
            className="px-3 py-2 border border-muted-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-bg"
            aria-label="Filter by trading symbol"
          />
        </div>

        {/* Side Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="side-filter" className="text-sm font-medium text-muted-600">
            Side:
          </label>
          <select
            id="side-filter"
            value={filters.side}
            onChange={(e) => setFilters({ side: e.target.value as 'all' | 'long' | 'short' })}
            className="px-3 py-2 border border-muted-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-bg"
            aria-label="Filter by trade side"
          >
            <option value="all">All Sides</option>
            <option value="long">Long Only</option>
            <option value="short">Short Only</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-md transition-colors"
            aria-label="Reset all filters"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Active Filter Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-muted-600">
          <span className="font-medium">Active filters:</span>
          {filters.dateRange.preset !== 'all' && (
            <span className="bg-muted-200 px-2 py-1 rounded-md">
              {filters.dateRange.preset.toUpperCase()}
            </span>
          )}
          {filters.symbol && (
            <span className="bg-muted-200 px-2 py-1 rounded-md">
              {filters.symbol}
            </span>
          )}
          {filters.side !== 'all' && (
            <span className="bg-muted-200 px-2 py-1 rounded-md">
              {filters.side.charAt(0).toUpperCase() + filters.side.slice(1)} Only
            </span>
          )}
        </div>
      )}
    </div>
  )
}
