'use client'

import { useState, useMemo } from 'react'
import { useFilters } from '@/lib/filter-context'
import { buildDailyMetrics, calculateFeesBreakdown } from '@/lib/metrics'
import { calculateTimeOfDayMetrics, calculateOrderTypeMetrics } from '@/lib/analytics-helpers'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('performance')
  const { filteredTrades, metrics } = useFilters()

  // Calculate data for each tab
  const dailyPnL = useMemo(() => buildDailyMetrics(filteredTrades), [filteredTrades])
  const timeOfDayData = useMemo(() => {
    const hourlyData = calculateTimeOfDayMetrics(filteredTrades)
    // Group into 6 time slots for better visualization
    const slots = [0, 4, 8, 12, 16, 20]
    return slots.map(hour => {
      const hourData = hourlyData.filter(h => h.hour >= hour && h.hour < hour + 4)
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        pnl: hourData.reduce((sum, h) => sum + h.pnl, 0),
        trades: hourData.reduce((sum, h) => sum + h.trades_count, 0)
      }
    })
  }, [filteredTrades])

  const orderTypeData = useMemo(() => calculateOrderTypeMetrics(filteredTrades), [filteredTrades])
  const feesData = useMemo(() => {
    const breakdown = calculateFeesBreakdown(filteredTrades)
    return [
      { name: 'Maker', value: breakdown.maker, fill: 'var(--color-chart-primary)' },
      { name: 'Taker', value: breakdown.taker, fill: 'var(--color-chart-tertiary)' },
      { name: 'Other', value: breakdown.other, fill: 'var(--color-chart-secondary)' },
    ]
  }, [filteredTrades])

  const winLossData = useMemo(() => {
    const wins = filteredTrades.filter(t => t.pnl > 0).length
    const losses = filteredTrades.filter(t => t.pnl < 0).length
    return [
      { name: 'Wins', value: wins, fill: 'var(--color-chart-pnl-up)' },
      { name: 'Losses', value: losses, fill: 'var(--color-chart-pnl-down)' },
    ]
  }, [filteredTrades])

  const tabs = [
    { id: 'performance', label: 'Performance' },
    { id: 'time-of-day', label: 'Time of Day' },
    { id: 'fees', label: 'Fees & Order Types' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-muted-900">Advanced Analytics</h1>
        <p className="text-muted-600 mt-1">Deep dive into your trading metrics</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-muted-300 gap-4 md:gap-8 overflow-x-auto no-scrollbar" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`px-4 py-3 font-medium text-xs md:text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-muted-600 hover:text-muted-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md overflow-hidden">
            <h2 className="text-xl font-bold text-muted-900 mb-6">Daily PnL</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dailyPnL} aria-label="Daily PnL performance bar chart">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-600)" style={{ fontSize: '10px' }} />
                <YAxis stroke="var(--color-muted-600)" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid var(--color-muted-300)`,
                    borderRadius: '8px',
                    color: 'var(--color-muted-900)'
                  }}
                  itemStyle={{ color: 'var(--color-primary-500)' }}
                  formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                />
                <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
                  {dailyPnL.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'var(--color-chart-pnl-up)' : 'var(--color-chart-pnl-down)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
              <h2 className="text-xl font-bold text-muted-900 mb-6">Win Rate</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value} trades`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-around mt-4 text-sm">
                <div className="text-center">
                  <p className="text-success font-bold">{(metrics.winRate * 100).toFixed(1)}%</p>
                  <p className="text-muted-600 text-xs">Win Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-900 font-bold">{winLossData[0]?.value || 0}</p>
                  <p className="text-muted-600 text-xs">Winning Trades</p>
                </div>
                <div className="text-center">
                  <p className="text-danger font-bold">{((1 - metrics.winRate) * 100).toFixed(1)}%</p>
                  <p className="text-muted-600 text-xs">Loss Rate</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
              <h2 className="text-xl font-bold text-muted-900 mb-6">Trade Statistics</h2>
              <div className="space-y-4">
                {[
                  { label: 'Average Win', value: `$${metrics.avgWin.toFixed(2)}`, color: 'success' },
                  { label: 'Average Loss', value: `$${metrics.avgLoss.toFixed(2)}`, color: 'danger' },
                  { label: 'Largest Gain', value: `$${metrics.largestGain.toFixed(2)}`, color: 'success' },
                  { label: 'Largest Loss', value: `$${metrics.largestLoss.toFixed(2)}`, color: 'danger' },
                  { label: 'Avg Duration', value: `${metrics.avgDuration.toFixed(1)}m`, color: 'primary' },
                  { label: 'Expectancy', value: `$${metrics.expectancy.toFixed(2)}`, color: 'primary' },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-600">{stat.label}</span>
                      <span className={`text-lg font-bold ${stat.color === 'success' ? 'text-success' :
                        stat.color === 'danger' ? 'text-danger' :
                          'text-primary-500'
                        }`}>{stat.value}</span>
                    </div>
                    {i < 4 && <div className="h-px bg-muted-200 mt-4" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time of Day Tab */}
      {activeTab === 'time-of-day' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md overflow-hidden">
            <h2 className="text-xl font-bold text-muted-900 mb-6">Performance by Hour</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={timeOfDayData} aria-label="Performance by hour of day bar chart">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--color-muted-600)" style={{ fontSize: '10px' }} />
                <YAxis stroke="var(--color-muted-600)" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid var(--color-muted-300)`,
                    borderRadius: '8px',
                    color: 'var(--color-muted-900)'
                  }}
                  itemStyle={{ color: 'var(--color-primary-500)' }}
                  formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                />
                <Bar dataKey="pnl" fill="var(--color-chart-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
            <h2 className="text-xl font-bold text-muted-900 mb-4">Best Trading Hours</h2>
            <div className="space-y-3">
              {timeOfDayData
                .sort((a, b) => b.pnl - a.pnl)
                .slice(0, 3)
                .map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted-50 rounded-md">
                    <div>
                      <p className="font-medium text-muted-900">{item.hour}</p>
                      <p className="text-xs text-muted-600">{item.trades} trades</p>
                    </div>
                    <p className={`text-lg font-bold ${item.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md overflow-hidden">
            <h2 className="text-xl font-bold text-muted-900 mb-6">Performance by Order Type</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={orderTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
                <XAxis dataKey="type" stroke="var(--color-muted-600)" style={{ fontSize: '10px' }} />
                <YAxis stroke="var(--color-muted-600)" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid var(--color-muted-300)`,
                    borderRadius: '8px',
                    color: 'var(--color-muted-900)'
                  }}
                  itemStyle={{ color: 'var(--color-primary-500)' }}
                  formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="pnl" fill="var(--color-chart-pnl-up)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="fees" fill="var(--color-chart-pnl-down)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
              <h2 className="text-xl font-bold text-muted-900 mb-6">Fee Breakdown</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={feesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {feesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-around mt-4 text-sm">
                {feesData.map((item, i) => (
                  <div key={i} className="text-center">
                    <p className="font-bold text-muted-900">${item.value.toFixed(2)}</p>
                    <p className="text-muted-600 text-xs">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
              <h2 className="text-xl font-bold text-muted-900 mb-6">Fee Analysis</h2>
              <div className="space-y-4">
                {[
                  { label: 'Total Fees', value: `$${metrics.totalFees.toFixed(2)}` },
                  { label: 'Avg Fee per Trade', value: `$${(metrics.totalFees / metrics.tradesCount).toFixed(2)}` },
                  { label: 'Fees as % of PnL', value: `${((metrics.totalFees / Math.abs(metrics.totalPnL || 1)) * 100).toFixed(1)}%` },
                  {
                    label: 'Maker vs Taker',
                    value: `${((feesData[0].value / metrics.totalFees) * 100).toFixed(0)}% vs ${((feesData[1].value / metrics.totalFees) * 100).toFixed(0)}%`
                  },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-600">{stat.label}</span>
                      <span className="text-lg font-bold text-muted-900">{stat.value}</span>
                    </div>
                    {i < 3 && <div className="h-px bg-muted-200 mt-4" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
