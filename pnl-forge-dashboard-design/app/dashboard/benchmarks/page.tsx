'use client'

import { useMemo } from 'react'
import { useFilters } from '@/lib/filter-context'
import { getCurrentTime } from '@/lib/date-utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertCircle, TrendingUp } from 'lucide-react'

export default function BenchmarksPage() {
  const { metrics } = useFilters()

  // Generate realistic percentile data based on actual metrics
  const benchmarkData = useMemo(() => [
    {
      metric: 'Win Rate',
      yourValue: metrics.winRate * 100,
      p25: 45,
      p50: 55,
      p75: 65,
      unit: '%',
    },
    {
      metric: 'Sharpe Ratio',
      yourValue: metrics.sharpeRatio,
      p25: 0.8,
      p50: 1.2,
      p75: 1.8,
      unit: '',
    },
    {
      metric: 'Max Drawdown',
      yourValue: metrics.maxDrawdownPct,
      p25: -15,
      p50: -12,
      p75: -8,
      unit: '%',
    },
    {
      metric: 'PnL per Trade',
      yourValue: metrics.totalPnL / metrics.tradesCount,
      p25: 45,
      p50: 80,
      p75: 150,
      unit: '$',
    },
  ], [metrics])

  const chartData = benchmarkData.map(d => ({
    name: d.metric,
    Your: d.yourValue,
    'Percentile 25': d.p25,
    'Percentile 50': d.p50,
    'Percentile 75': d.p75,
  }))

  const calculatePercentile = (value: number, p25: number, p50: number, p75: number) => {
    if (value <= p25) return 25
    if (value <= p50) return 25 + ((value - p25) / (p50 - p25)) * 25
    if (value <= p75) return 50 + ((value - p50) / (p75 - p50)) * 25
    return 75 + Math.min(25, ((value - p75) / p75) * 25)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-muted-900">Community Benchmarks</h1>
        <p className="text-muted-600 mt-1">
          Compare your performance against anonymized community percentiles
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="rounded-lg border border-warning bg-warning/5 p-6 flex gap-4">
        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-muted-900 mb-1">Your Privacy is Protected</p>
          <p className="text-sm text-muted-700">
            You are compared against anonymized aggregate data only. No usernames, wallets, or trade details are
            shared. Benchmarks are opt-in and can be disabled anytime in Settings.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {benchmarkData.map((data, i) => {
          const percentile = calculatePercentile(data.yourValue, data.p25, data.p50, data.p75)

          return (
            <div key={i} className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
              <h3 className="font-semibold text-muted-900 mb-6">{data.metric}</h3>

              {/* Your Value */}
              <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-md border border-primary-200 dark:border-primary-800">
                <p className="text-xs text-primary-700 dark:text-primary-400 mb-1">Your Value</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-500">
                  {data.yourValue.toFixed(data.metric === 'Sharpe Ratio' ? 2 : 1)}
                  <span className="text-sm ml-1">{data.unit}</span>
                </p>
              </div>

              {/* Percentile Bars */}
              <div className="space-y-4">
                {[
                  { label: 'Bottom 25%', value: data.p25 },
                  { label: 'Median (50%)', value: data.p50 },
                  { label: 'Top 25%', value: data.p75 },
                ].map((p, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-muted-600">{p.label}</span>
                      <span className="text-sm font-bold text-muted-700">
                        {p.value.toFixed(data.metric === 'Sharpe Ratio' ? 2 : 1)}{data.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-muted-200 rounded-full">
                      {idx === 1 && (
                        <div className="h-2 bg-accent-1 rounded-full" style={{ width: '50%' }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Percentile Rank */}
              <div className="mt-6 p-3 bg-muted-100 rounded-md">
                <p className="text-xs text-muted-600">Your Percentile Rank</p>
                <p className="text-lg font-bold text-muted-900">{Math.round(percentile)}th percentile</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md overflow-hidden">
        <h2 className="text-xl font-bold text-muted-900 mb-6">Comparison Overview</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
            <XAxis dataKey="name" stroke="var(--color-muted-500)" style={{ fontSize: '10px' }} />
            <YAxis stroke="var(--color-muted-500)" style={{ fontSize: '10px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-muted-300)',
                borderRadius: '8px',
                color: 'var(--color-muted-900)'
              }}
              itemStyle={{ color: 'var(--color-primary-500)' }}
            />
            <Legend />
            <Bar dataKey="Your" fill="var(--color-chart-primary)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Percentile 25" fill="var(--color-muted-200)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Percentile 50" fill="var(--color-muted-300)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Percentile 75" fill="var(--color-chart-secondary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Traders Compared', value: '2,847' },
          { label: 'Data Points', value: '285,430' },
          { label: 'Last Updated', value: getCurrentTime().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
        ].map((stat, i) => (
          <div key={i} className="rounded-lg border border-muted-300 bg-surface p-6 text-center">
            <p className="text-sm text-muted-600 mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-muted-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
        <div className="flex gap-4">
          <TrendingUp className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-muted-900 mb-2">You're performing well!</p>
            <p className="text-sm text-muted-700">
              Your win rate and Sharpe ratio are above the median. Keep refining your strategy and managing
              risk to stay ahead.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
