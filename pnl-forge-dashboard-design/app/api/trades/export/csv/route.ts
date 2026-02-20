/**
 * API Route: /api/trades/export/csv
 * Exports trades as CSV file
 */

// @ts-ignore - next/server may not be available in all environments
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { getUserTrades } from '@/lib/supabase'
import type { Trade } from '@/lib/types'

export const dynamic = 'force-dynamic'

function tradesToCSV(trades: Trade[]): string {
  if (trades.length === 0) {
    return 'No trades to export'
  }

  const headers = [
    'Date',
    'Symbol',
    'Side',
    'Size',
    'Entry Price',
    'Exit Price',
    'PnL',
    'PnL %',
    'Fees',
    'Duration (mins)',
    'Order Type',
    'Tags',
    'Reviewed',
  ]

  const rows = trades.map((trade) => [
    new Date(trade.exit_time).toISOString().split('T')[0],
    trade.symbol,
    trade.side.toUpperCase(),
    trade.size.toFixed(4),
    trade.entry_price.toFixed(8),
    trade.exit_price.toFixed(8),
    trade.pnl.toFixed(2),
    ((trade.pnl / (trade.entry_price * trade.size)) * 100).toFixed(2),
    trade.fees.toFixed(2),
    (
      (new Date(trade.exit_time).getTime() -
        new Date(trade.entry_time).getTime()) /
      60000
    ).toFixed(0),
    trade.order_type,
    trade.tags?.join(';') || '',
    trade.reviewed ? 'Yes' : 'No',
  ])

  // CSV formatting with proper escaping
  const csv = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell)
          return `"${str.replace(/"/g, '""')}"`
        })
        .join(',')
    ),
  ].join('\n')

  return csv
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

    // Fetch all trades for user
    const trades = await getUserTrades(walletAddress, 10000)

    const csv = tradesToCSV(trades)

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="trades_${walletAddress.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('CSV Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export CSV' },
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

    const { trades, filters } = await request.json()

    if (!trades || !Array.isArray(trades)) {
      return NextResponse.json(
        { error: 'Trades array required' },
        { status: 400 }
      )
    }

    // Apply filters if provided
    let filtered = trades
    if (filters?.symbol) {
      filtered = filtered.filter((t: Trade) => t.symbol.includes(filters.symbol))
    }
    if (filters?.side) {
      filtered = filtered.filter((t: Trade) => t.side === filters.side)
    }

    const csv = tradesToCSV(filtered)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="trades_export_${new Date().getTime()}.csv"`,
      },
    })
  } catch (error) {
    console.error('CSV POST error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    )
  }
}
