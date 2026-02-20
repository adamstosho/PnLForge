'use client'

import React, { useMemo } from 'react'
import {
  TrendingUp,
  Shield,
  Zap,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Layout,
  Info,
  ChevronDown,
  MoreHorizontal,
  Calendar as CalendarIcon
} from 'lucide-react'
import { useFilters } from '@/lib/filter-context'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { ConnectWalletButton } from '@/components/connect-wallet-button'
import { GlobalFilters } from '@/components/global-filters'
import { cn } from '@/lib/utils'

/**
 * Metric Card Component
 */
function MetricCard({ title, value, change, trend, className }: {
  title: string,
  value: string,
  change: string,
  trend: 'up' | 'down',
  className?: string
}) {
  return (
    <Card className={cn("p-6 transition-all duration-300", className)}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-[10px] font-black text-muted-600 uppercase tracking-widest">{title}</h3>
        {trend === 'up' ?
          <TrendingUp className="h-4 w-4 text-success" /> :
          <Activity className="h-4 w-4 text-danger" />
        }
      </div>
      <div className="mt-2">
        <div className="text-3xl font-black text-muted-900 tracking-tight">{value}</div>
        <div className={cn(
          "text-[10px] font-bold mt-1 flex items-center gap-1",
          trend === 'up' ? "text-success" : "text-danger"
        )}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change} <span className="text-muted-500 font-medium ml-1">vs period</span>
        </div>
      </div>
    </Card>
  )
}

/**
 * Overview Chart Component
 */
function DashboardOverview() {
  const { equityCurve } = useFilters()

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-chart-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-muted-500)', fontSize: 10, fontWeight: 700 }}
            tickFormatter={(str) => {
              const d = new Date(str)
              return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-muted-500)', fontSize: 10, fontWeight: 700 }}
            tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-muted-300)',
              boxShadow: 'var(--box-shadow-lg)',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-muted-900)'
            }}
            itemStyle={{ color: 'var(--color-primary-500)' }}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="var(--color-chart-primary)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorEquity)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Recent Trades List Component
 */
function RecentTradesList() {
  const { filteredTrades } = useFilters()
  const recent = useMemo(() => filteredTrades.slice(-6).reverse(), [filteredTrades])

  return (
    <div className="space-y-4">
      {recent.map((trade, i) => (
        <div key={trade.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted-50 transition-colors group cursor-pointer border border-transparent hover:border-muted-200">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-tighter",
              trade.side === 'long' ? "bg-primary-100 text-primary-600" : "bg-danger/10 text-danger"
            )}>
              {trade.side === 'long' ? 'L' : 'S'}
            </div>
            <div>
              <p className="text-xs font-black text-muted-900 tracking-tight">{trade.symbol}</p>
              <p className="text-[10px] text-muted-600 font-bold">{new Date(trade.exit_time).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn(
              "text-xs font-black tracking-tight",
              trade.pnl >= 0 ? "text-success" : "text-danger"
            )}>
              {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-600 font-bold">{(trade.pnl / trade.entry_price * 100).toFixed(2)}%</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Main Dashboard Page
 */
export default function DashboardPage() {
  const { metrics, equityCurve, filteredTrades, filters, setFilters } = useFilters()

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 mesh-bg min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Performance <span className="text-primary-500">Oracle</span></h2>
          <p className="text-muted-600 font-medium">
            Real-time Alpha analysis for your Deriverse portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GlobalFilters className="hidden sm:flex" />
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total PnL"
          value={`$${metrics.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={metrics.totalPnL >= 0 ? `+${((metrics.totalPnL / Math.max(Math.abs(metrics.totalPnL - metrics.totalPnL * 0.1), 1)) * 100).toFixed(1)}%` : `${((metrics.totalPnL / Math.max(Math.abs(metrics.totalPnL - metrics.totalPnL * 0.1), 1)) * 100).toFixed(1)}%`}
          trend={metrics.totalPnL >= 0 ? "up" : "down"}
          className="glass border-l-4 border-primary-500"
        />
        <MetricCard
          title="Win Rate"
          value={`${(metrics.winRate * 100).toFixed(1)}%`}
          change={metrics.winRate >= 0.5 ? `+${((metrics.winRate - 0.5) * 100).toFixed(1)}%` : `${((metrics.winRate - 0.5) * 100).toFixed(1)}%`}
          trend={metrics.winRate >= 0.5 ? "up" : "down"}
          className="glass"
        />
        <MetricCard
          title="Profit Factor"
          value={metrics.profitFactor.toFixed(2)}
          change={metrics.profitFactor >= 1 ? `+${(metrics.profitFactor - 1).toFixed(2)}` : `${(metrics.profitFactor - 1).toFixed(2)}`}
          trend={metrics.profitFactor >= 1 ? "up" : "down"}
          className="glass"
        />
        <MetricCard
          title="Max Drawdown"
          value={`${metrics.maxDrawdownPct.toFixed(1)}%`}
          change={`${metrics.maxDrawdownPct >= 0 ? '+' : ''}${metrics.maxDrawdownPct.toFixed(1)}%`}
          trend="down"
          className="glass border-l-4 border-danger"
        />
      </div>

      {/* Advanced Alpha Metrics Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass p-6 rounded-lg alpha-glow group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Tier 1 Alpha</span>
            <TrendingUp className="w-4 h-4 text-primary-500" />
          </div>
          <h3 className="text-xs font-bold text-muted-600 uppercase tracking-wider">K-Ratio</h3>
          <p className="text-3xl font-black text-muted-900 mt-1">{metrics.kRatio.toFixed(3)}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 flex-1 bg-muted-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500" style={{ width: `${Math.min(metrics.kRatio * 100, 100)}%` }} />
            </div>
            <span className="text-[9px] text-muted-600 font-black uppercase">Consistent</span>
          </div>
        </div>

        <div className="glass p-6 rounded-lg alpha-glow group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-1">Risk Adjusted</span>
            <Shield className="w-4 h-4 text-accent-1" />
          </div>
          <h3 className="text-xs font-bold text-muted-600 uppercase tracking-wider">Calmar Ratio</h3>
          <p className="text-3xl font-black text-muted-900 mt-1">{metrics.calmarRatio.toFixed(2)}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 flex-1 bg-muted-100 rounded-full overflow-hidden">
              <div className="h-full bg-accent-1" style={{ width: `${Math.min(metrics.calmarRatio * 20, 100)}%` }} />
            </div>
            <span className="text-[9px] text-muted-600 font-black uppercase">Optimal</span>
          </div>
        </div>

        <div className="glass p-6 rounded-lg alpha-glow group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-success">Optimal Size</span>
            <Zap className="w-4 h-4 text-success" />
          </div>
          <h3 className="text-xs font-bold text-muted-600 uppercase tracking-wider">Kelly Criterion</h3>
          <p className="text-3xl font-black text-muted-900 mt-1">{(metrics.kellyCriterion * 100).toFixed(1)}%</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 flex-1 bg-muted-100 rounded-full overflow-hidden">
              <div className="h-full bg-success" style={{ width: `${Math.min(metrics.kellyCriterion * 100, 100)}%` }} />
            </div>
            <span className="text-[9px] text-muted-600 font-black uppercase">Math</span>
          </div>
        </div>

        <div className="glass p-6 rounded-lg alpha-glow group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-warning">Resilience</span>
            <Activity className="w-4 h-4 text-warning" />
          </div>
          <h3 className="text-xs font-bold text-muted-600 uppercase tracking-wider">Recovery Factor</h3>
          <p className="text-3xl font-black text-muted-900 mt-1">{metrics.recoveryFactor.toFixed(2)}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 flex-1 bg-muted-100 rounded-full overflow-hidden">
              <div className="h-full bg-warning" style={{ width: `${Math.min(metrics.recoveryFactor * 10, 100)}%` }} />
            </div>
            <span className="text-[9px] text-muted-600 font-black uppercase">Repair</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-1 lg:col-span-4 glass border-none shadow-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              Equity Curve
              <span className="text-[10px] bg-primary-100 dark:bg-primary-900 text-primary-600 px-2 py-0.5 rounded-full font-bold">Live Pulse</span>
            </CardTitle>
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-600 uppercase tracking-widest">
              <Clock className="w-3 h-3" /> Real-time Sync
            </div>
          </CardHeader>
          <CardContent className="pl-4 pb-8">
            <DashboardOverview />
          </CardContent>
        </Card>
        <Card className="md:col-span-1 lg:col-span-3 glass border-none shadow-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <RecentTradesList />
            <Button variant="ghost" className="w-full mt-4 text-[10px] font-black uppercase tracking-widest text-muted-600 hover:text-primary-500">
              View All History <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Kelly Criterion Advisory Section */}
      <div className="mt-8 gradient-border p-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-1 flex items-center justify-center shadow-2xl relative overflow-hidden group">
            <Zap className="w-10 h-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="absolute -inset-4 bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest">
              <Info className="w-3 h-3" /> Alpha Rule Engine
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Kelly Criterion Advisory</h3>
            <p className="text-muted-600 font-medium leading-relaxed max-w-2xl text-sm">
              Based on your win rate of <span className="text-success font-bold">{(metrics.winRate * 100).toFixed(1)}%</span> and profit factor of <span className="text-primary-500 font-bold">{metrics.profitFactor.toFixed(2)}</span>,
              the mathematical optimal risk per trade is <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded font-bold">{(metrics.kellyCriterion * 100).toFixed(1)}%</span>.
              We recommend using a <span className="underline decoration-accent-1 decoration-2 underline-offset-4 font-bold text-muted-900">Half-Kelly</span> strategy ({(metrics.kellyCriterion * 50).toFixed(1)}%) to mitigate tail risk.
            </p>
          </div>
          <Button className="shrink-0 bg-muted-900 text-bg hover:bg-black font-black uppercase tracking-widest px-8 h-14 rounded-xl shadow-xl shadow-black/10 active:scale-95 transition-all text-[10px]">
            Apply Risk Rules
          </Button>
        </div>
      </div>

    </div>
  )
}
