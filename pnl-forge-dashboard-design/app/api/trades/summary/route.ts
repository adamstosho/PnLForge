/**
 * API Route: /api/trades/summary
 * Returns comprehensive analytics summary for a wallet
 * Includes KPIs, equity curve, daily metrics, and advanced calculations
 */

// @ts-ignore - next/server may not be available in all environments
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { getUserTrades } from '@/lib/supabase'
import * as metrics from '@/lib/metrics'
import type { Trade, SummaryResponse } from '@/lib/types'

export const dynamic = 'force-dynamic'

function buildSummary(trades: Trade[], includeCharts: boolean = true): SummaryResponse {
  if (!trades || trades.length === 0) {
    return {
      wallet: 'unknown',
      kpis: {
        total_pnl: 0,
        win_rate: 0,
        max_drawdown_pct: 0,
        sharpe: 0,
        sortino: 0,
        trades_count: 0,
        avg_win: 0,
        avg_loss: 0,
        largest_gain: 0,
        largest_loss: 0,
        avg_duration_minutes: 0,
        long_ratio: 0,
        short_ratio: 0,
        total_fees: 0,
        expectancy: 0,
      },
      equity_curve: [],
      daily_pnl: [],
      status: 'ready',
      last_updated: new Date().toISOString(),
    } as any
  }

  // Build equity curve
  const equityCurve = metrics.buildEquityCurve(trades, 10000)

  // Calculate all KPIs
  const totalPnL = metrics.calculateTotalPnL(trades)
  const maxDrawdown = metrics.calculateMaxDrawdown(equityCurve)
  const longShortRatio = metrics.calculateLongShortRatio(trades)
  const sharpe = metrics.calculateSharpeRatio(equityCurve)
  const sortino = metrics.calculateSortinoRatio(equityCurve)
  const kelly = metrics.calculateKellyCriterion(trades)
  const calmar = metrics.calculateCalmarRatio(trades, equityCurve)
  const kRatio = metrics.calculateKRatio(equityCurve)

  // Build daily metrics
  const dailyMetrics = metrics.buildDailyMetrics(trades)

  return {
    wallet: trades[0]?.wallet_address || 'unknown',
    kpis: {
      total_pnl: totalPnL,
      win_rate: metrics.calculateWinRate(trades),
      max_drawdown_pct: maxDrawdown.max_drawdown_pct,
      sharpe: sharpe,
      sortino: sortino,
      trades_count: trades.length,
      avg_win: metrics.calculateAverageWin(trades),
      avg_loss: metrics.calculateAverageLoss(trades),
      largest_gain: metrics.calculateLargestGain(trades),
      largest_loss: metrics.calculateLargestLoss(trades),
      avg_duration_minutes: metrics.calculateAverageTradeDuration(trades),
      long_ratio: longShortRatio.long_ratio,
      short_ratio: longShortRatio.short_ratio,
      total_fees: metrics.calculateTotalFees(trades),
      expectancy: metrics.calculateExpectancy(trades),
    },
    equity_curve: includeCharts
      ? equityCurve.map((point) => ({
          ts: point.timestamp,
          equity: point.equity,
          cumulative_pnl: point.cumulative_pnl,
          drawdown_pct: point.drawdown_pct,
        }))
      : [],
    daily_pnl: includeCharts
      ? dailyMetrics.map((m) => ({
          date: m.date,
          pnl: m.pnl,
        }))
      : [],
    status: 'ready',
    last_updated: new Date().toISOString(),
  } as any
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const { walletAddress, valid } = verifyJWT(token)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet') || walletAddress
    const includeCharts = searchParams.get('charts') !== 'false'

    // Fetch trades from database
    const trades: any[] = await getUserTrades(wallet, 5000)

    if (!trades || trades.length === 0) {
      return NextResponse.json(buildSummary([], includeCharts))
    }

    // Build comprehensive summary
    const summary = buildSummary(trades as Trade[], includeCharts)

    // Add additional metadata
    const response = {
      ...summary,
      metadata: {
        fetched_at: new Date().toISOString(),
        trades_count: trades.length,
        date_range: trades.length > 0 ? {
          start: (trades[0] as any)?.entry_time || new Date().toISOString(),
          end: (trades[trades.length - 1] as any)?.exit_time || new Date().toISOString(),
        } : null,
        verified_onchain: true,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Summary API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const { walletAddress, valid } = verifyJWT(token)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { trades, format = 'full' } = body

    if (!trades || !Array.isArray(trades)) {
      return NextResponse.json(
        { error: 'Trades array is required' },
        { status: 400 }
      )
    }

    // Allow filtering
    const filtered = format === 'minimal' ? trades.slice(0, 100) : trades

    const summary = buildSummary(filtered, format !== 'minimal')

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Summary POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process summary' },
      { status: 500 }
    )
  }
}
