'use client'

import { useState, useMemo } from 'react'
import { useFilters } from '@/lib/filter-context'
import { calculateTagAggregates } from '@/lib/analytics-helpers'
import { Tag } from 'lucide-react'

export default function JournalPage() {
  const { filteredTrades } = useFilters()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const tagAggregates = useMemo(() => calculateTagAggregates(filteredTrades), [filteredTrades])

  const filteredByTag = selectedTag
    ? filteredTrades.filter(t => t.tags.includes(selectedTag))
    : []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-muted-900">Trading Journal</h1>
        <p className="text-muted-600 mt-1">Analyze performance by strategy tags</p>
      </div>

      {/* Tag Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tagAggregates.map((tagData) => (
          <div
            key={tagData.tag}
            onClick={() => setSelectedTag(selectedTag === tagData.tag ? null : tagData.tag)}
            className={`rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-md ${selectedTag === tagData.tag
              ? 'border-primary-500 bg-primary-50'
              : 'border-muted-300 bg-surface'
              }`}
          >
            {/* Tag Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tagData.total_pnl >= 0
                ? 'bg-success/10'
                : 'bg-danger/10'
                }`}>
                <Tag className={`w-5 h-5 ${tagData.total_pnl >= 0 ? 'text-success' : 'text-danger'
                  }`} />
              </div>
              <div>
                <h3 className="font-bold text-muted-900 capitalize">{tagData.tag}</h3>
                <p className="text-xs text-muted-600">{tagData.trades_count} trades</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-600">Total PnL</span>
                <span className={`font-bold ${tagData.total_pnl >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                  {tagData.total_pnl >= 0 ? '+' : ''}${tagData.total_pnl.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-600">Win Rate</span>
                <span className="font-bold text-muted-900">
                  {(tagData.win_rate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-600">Expectancy</span>
                <span className={`font-bold ${tagData.expectancy >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                  ${tagData.expectancy.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-2 bg-muted-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${tagData.total_pnl >= 0 ? 'bg-success' : 'bg-danger'
                    }`}
                  style={{ width: `${Math.min(100, (tagData.win_rate * 100))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Tag Details */}
      {selectedTag && (
        <div className="rounded-lg border border-primary-500 bg-surface p-6 shadow-md">
          <h2 className="text-xl font-bold text-muted-900 mb-4 capitalize">
            {selectedTag} Trades ({filteredByTag.length})
          </h2>
          <div className="space-y-2">
            {filteredByTag.slice(0, 10).map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 bg-muted-50 rounded-md"
              >
                <div>
                  <p className="font-medium text-muted-900">{trade.symbol}</p>
                  <p className="text-xs text-muted-600">
                    {new Date(trade.exit_time).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${trade.pnl >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-600">{trade.side}</p>
                </div>
              </div>
            ))}
            {filteredByTag.length > 10 && (
              <p className="text-sm text-muted-600 text-center pt-2">
                And {filteredByTag.length - 10} more trades...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
