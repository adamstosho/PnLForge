'use client'

import { useState, useMemo } from 'react'
import { useFilters } from '@/lib/filter-context'
import { buildEquityCurve } from '@/lib/metrics'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Play, RotateCcw } from 'lucide-react'

export default function SimulatorPage() {
  const { filteredTrades } = useFilters()
  const [multiplier, setMultiplier] = useState(1.0)
  const [stopLoss, setStopLoss] = useState(0)
  const [excludeWorst, setExcludeWorst] = useState(0)
  const [hasRun, setHasRun] = useState(false)

  const originalEquity = useMemo(() => buildEquityCurve(filteredTrades, 10000), [filteredTrades])

  const simulatedData = useMemo(() => {
    if (!hasRun) return null

    // Apply modifications to trades
    let modifiedTrades = [...filteredTrades]

    // Exclude worst trades
    if (excludeWorst > 0) {
      const sorted = [...modifiedTrades].sort((a, b) => a.pnl - b.pnl)
      const toExclude = sorted.slice(0, excludeWorst).map(t => t.id)
      modifiedTrades = modifiedTrades.filter(t => !toExclude.includes(t.id))
    }

    // Apply multiplier and stop loss
    modifiedTrades = modifiedTrades.map(trade => {
      let pnl = trade.pnl * multiplier

      // Apply stop loss
      if (stopLoss > 0) {
        const maxLoss = trade.entry_price * trade.size * (stopLoss / 100)
        if (pnl < -maxLoss) {
          pnl = -maxLoss
        }
      }

      return { ...trade, pnl }
    })

    return buildEquityCurve(modifiedTrades, 10000)
  }, [filteredTrades, multiplier, stopLoss, excludeWorst, hasRun])

  const combinedData = useMemo(() => {
    if (!simulatedData) return originalEquity.map(point => ({ date: point.date, original: point.equity }))

    return originalEquity.map((point, i) => ({
      date: point.date,
      original: point.equity,
      simulated: simulatedData[i]?.equity || point.equity
    }))
  }, [originalEquity, simulatedData])

  const metrics = useMemo(() => {
    const originalFinal = originalEquity[originalEquity.length - 1]?.equity || 10000
    const simulatedFinal = simulatedData?.[simulatedData.length - 1]?.equity || originalFinal

    return {
      originalFinal,
      simulatedFinal,
      difference: simulatedFinal - originalFinal,
      percentChange: ((simulatedFinal - originalFinal) / originalFinal) * 100
    }
  }, [originalEquity, simulatedData])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-muted-900">Scenario Simulator</h1>
        <p className="text-muted-600 mt-1">Test what-if scenarios on your trading history</p>
      </div>

      {/* Controls */}
      <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
        <h2 className="text-xl font-bold text-muted-900 mb-6">Simulation Parameters</h2>

        <div className="space-y-6">
          {/* Position Size Multiplier */}
          <div>
            <label className="block text-sm font-medium text-muted-700 mb-2">
              Position Size Multiplier: {multiplier.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={multiplier}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-500 mt-1">
              <span>0.5x</span>
              <span>2.5x</span>
            </div>
          </div>

          {/* Stop Loss */}
          <div>
            <label className="block text-sm font-medium text-muted-700 mb-2">
              Stop Loss: {stopLoss}%
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={stopLoss}
              onChange={(e) => setStopLoss(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-500 mt-1">
              <span>None</span>
              <span>10%</span>
            </div>
          </div>

          {/* Exclude Worst Trades */}
          <div>
            <label className="block text-sm font-medium text-muted-700 mb-2">
              Exclude Worst Trades: {excludeWorst}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={excludeWorst}
              onChange={(e) => setExcludeWorst(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-500 mt-1">
              <span>0</span>
              <span>10</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setHasRun(true)}
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Run Simulation
            </button>
            <button
              onClick={() => {
                setMultiplier(1.0)
                setStopLoss(0)
                setExcludeWorst(0)
                setHasRun(false)
              }}
              className="px-6 py-3 border border-muted-300 text-muted-700 rounded-md font-medium hover:bg-muted-100 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {hasRun && (
        <>
          {/* Equity Curve Comparison */}
          <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md overflow-hidden">
            <h2 className="text-xl font-bold text-muted-900 mb-6">Equity Curve Comparison</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
                <XAxis dataKey="date" stroke="var(--color-muted-500)" style={{ fontSize: '10px' }} />
                <YAxis stroke="var(--color-muted-500)" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid var(--color-muted-300)`,
                    borderRadius: '8px',
                    color: 'var(--color-muted-900)'
                  }}
                  itemStyle={{ color: 'var(--color-primary-500)' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="original"
                  stroke="var(--color-muted-400)"
                  fill="var(--color-muted-200)"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="simulated"
                  stroke="var(--color-chart-primary)"
                  fill="var(--color-chart-primary)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics Comparison */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-muted-300 bg-surface p-6 text-center">
              <p className="text-sm text-muted-600 mb-2">Original Final Balance</p>
              <p className="text-2xl font-bold text-muted-900">
                ${metrics.originalFinal.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-muted-300 bg-surface p-6 text-center">
              <p className="text-sm text-muted-600 mb-2">Simulated Final Balance</p>
              <p className="text-2xl font-bold text-primary-600">
                ${metrics.simulatedFinal.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-muted-300 bg-surface p-6 text-center">
              <p className="text-sm text-muted-600 mb-2">Difference</p>
              <p className={`text-2xl font-bold ${metrics.difference >= 0 ? 'text-success' : 'text-danger'
                }`}>
                {metrics.difference >= 0 ? '+' : ''}${metrics.difference.toFixed(2)}
              </p>
              <p className="text-sm text-muted-600 mt-1">
                ({metrics.percentChange >= 0 ? '+' : ''}{metrics.percentChange.toFixed(1)}%)
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
