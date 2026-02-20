/**
 * API Route: /api/trades/export/chart
 * Exports equity curve or daily PnL as PNG image
 * Uses sharp for image generation
 */

// @ts-ignore - next/server may not be available in all environments
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { getUserTrades } from '@/lib/supabase'
import * as metrics from '@/lib/metrics'

export const dynamic = 'force-dynamic'

/**
 * Simple SVG-based chart generation
 * For production, use a library like Plotly or Recharts server rendering
 */
function generateChartSVG(
  data: Array<{ x: string | number; y: number }>,
  title: string,
  yAxisLabel: string
): string {
  const padding = { top: 40, right: 30, bottom: 30, left: 60 }
  const width = 1200
  const height = 600
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  if (data.length === 0) {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="24" fill="#666">
          No data to display
        </text>
      </svg>
    `
  }

  const yValues = data.map((d) => d.y)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)
  const yRange = maxY - minY || 1

  const yScale = chartHeight / yRange
  const xScale = chartWidth / Math.max(data.length - 1, 1)

  // Generate path data
  const pathData = data
    .map((d, i) => {
      const x = padding.left + i * xScale
      const y = padding.top + chartHeight - (d.y - minY) * yScale
      return `${x},${y}`
    })
    .join(' L ')

  const color = minY >= 0 || maxY <= 0 ? '#16a34a' : '#0aaadf'

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="white" />
      
      <!-- Grid lines -->
      ${Array.from({ length: 5 })
        .map((_, i) => {
          const y = padding.top + (chartHeight / 5) * i
          return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#ddd" stroke-width="1" />`
        })
        .join('\n')}
      
      <!-- Y-axis -->
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" stroke="#333" stroke-width="2" />
      
      <!-- X-axis -->
      <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" stroke="#333" stroke-width="2" />
      
      <!-- Chart area -->
      <polyline points="${pathData}" fill="none" stroke="${color}" stroke-width="2" />
      
      <!-- Title -->
      <text x="${width / 2}" y="25" text-anchor="middle" font-size="20" font-weight="bold" fill="#333">
        ${title}
      </text>
      
      <!-- Y-axis label -->
      <text x="${15}" y="${padding.top + chartHeight / 2}" text-anchor="middle" font-size="12" fill="#666" transform="rotate(-90 15 ${padding.top + chartHeight / 2})">
        ${yAxisLabel}
      </text>
      
      <!-- Summary -->
      <text x="${padding.left + 10}" y="${padding.top + chartHeight + 20}" font-size="11" fill="#666">
        Min: $${minY.toFixed(2)} | Max: $${maxY.toFixed(2)} | Range: $${(maxY - minY).toFixed(2)}
      </text>
    </svg>
  `
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

    const { chartType = 'equity', trades: inputTrades } = await request.json()

    let trades = inputTrades
    if (!trades) {
      trades = await getUserTrades(walletAddress, 5000)
    }

    if (!trades || trades.length === 0) {
      return NextResponse.json(
        { error: 'No trades available to chart' },
        { status: 400 }
      )
    }

    let svg: string
    let title: string
    let filename: string

    if (chartType === 'equity') {
      const equityCurve = metrics.buildEquityCurve(trades, 10000)
      const chartData = equityCurve.map((point, i) => ({
        x: point.date,
        y: point.equity,
      }))
      svg = generateChartSVG(chartData, 'Equity Curve', 'Equity ($)')
      filename = 'equity-curve.svg'
      title = 'Equity Curve'
    } else if (chartType === 'daily-pnl') {
      const dailyMetrics = metrics.buildDailyMetrics(trades)
      const chartData = dailyMetrics.map((m) => ({
        x: m.date,
        y: m.pnl,
      }))
      svg = generateChartSVG(chartData, 'Daily PnL', 'PnL ($)')
      filename = 'daily-pnl.svg'
      title = 'Daily PnL'
    } else {
      return NextResponse.json({ error: 'Invalid chart type' }, { status: 400 })
    }

    // Return SVG (can be converted to PNG in frontend or with additional server-side tool)
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Chart export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate chart' },
      { status: 500 }
    )
  }
}
