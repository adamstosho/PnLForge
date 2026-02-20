import type { Trade } from './types'
import { calculateTotalPnL } from './metrics'

/**
 * Helper functions for analytics calculations
 */

export interface TimeOfDayMetrics {
    hour: number
    pnl: number
    trades_count: number
    win_rate: number
}

/**
 * Group trades by hour of day and calculate PnL
 */
export function calculateTimeOfDayMetrics(trades: Trade[]): TimeOfDayMetrics[] {
    const hourlyMap = new Map<number, Trade[]>()

    trades.forEach((trade) => {
        const hour = new Date(trade.exit_time).getHours()
        if (!hourlyMap.has(hour)) {
            hourlyMap.set(hour, [])
        }
        hourlyMap.get(hour)!.push(trade)
    })

    return Array.from(hourlyMap.entries())
        .map(([hour, hourTrades]) => ({
            hour,
            pnl: calculateTotalPnL(hourTrades),
            trades_count: hourTrades.length,
            win_rate: hourTrades.filter((t) => t.pnl > 0).length / hourTrades.length,
        }))
        .sort((a, b) => a.hour - b.hour)
}

/**
 * Calculate fees breakdown by order type
 */
export function calculateOrderTypeMetrics(trades: Trade[]): Array<{
    type: string
    pnl: number
    fees: number
    trades_count: number
}> {
    const marketTrades = trades.filter((t) => t.order_type === 'market')
    const limitTrades = trades.filter((t) => t.order_type === 'limit')

    return [
        {
            type: 'Market',
            pnl: calculateTotalPnL(marketTrades),
            fees: marketTrades.reduce((sum, t) => sum + t.fees, 0),
            trades_count: marketTrades.length,
        },
        {
            type: 'Limit',
            pnl: calculateTotalPnL(limitTrades),
            fees: limitTrades.reduce((sum, t) => sum + t.fees, 0),
            trades_count: limitTrades.length,
        },
    ]
}

/**
 * Get tag aggregates for journal page
 */
export function calculateTagAggregates(trades: Trade[]): Array<{
    tag: string
    total_pnl: number
    trades_count: number
    win_rate: number
    expectancy: number
}> {
    const tagMap = new Map<string, Trade[]>()

    trades.forEach((trade) => {
        trade.tags.forEach((tag) => {
            if (!tagMap.has(tag)) {
                tagMap.set(tag, [])
            }
            tagMap.get(tag)!.push(trade)
        })
    })

    return Array.from(tagMap.entries())
        .map(([tag, tagTrades]) => {
            const wins = tagTrades.filter((t) => t.pnl > 0)
            const losses = tagTrades.filter((t) => t.pnl < 0)
            const winRate = wins.length / tagTrades.length
            const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0
            const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + Math.abs(t.pnl), 0) / losses.length : 0
            const expectancy = winRate * avgWin - (1 - winRate) * avgLoss

            return {
                tag,
                total_pnl: calculateTotalPnL(tagTrades),
                trades_count: tagTrades.length,
                win_rate: winRate,
                expectancy,
            }
        })
        .sort((a, b) => b.total_pnl - a.total_pnl)
}

/**
 * Calculate achievement progress from trades
 */
export function calculateAchievementProgress(trades: Trade[], metrics: any) {
    const uniqueSymbols = new Set(trades.map((t) => t.symbol)).size
    const reviewedCount = trades.filter((t) => t.reviewed).length

    // Find longest win streak
    let currentStreak = 0
    let maxStreak = 0
    const sortedTrades = [...trades].sort((a, b) => new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime())

    sortedTrades.forEach((trade) => {
        if (trade.pnl > 0) {
            currentStreak++
            maxStreak = Math.max(maxStreak, currentStreak)
        } else {
            currentStreak = 0
        }
    })

    return {
        uniqueSymbols,
        reviewedCount,
        maxWinStreak: maxStreak,
        totalPnL: metrics.totalPnL,
        maxDrawdown: Math.abs(metrics.maxDrawdownPct),
    }
}
