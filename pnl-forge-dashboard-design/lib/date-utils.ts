/**
 * Date and time utilities for PnlForge Dashboard
 * Current time: February 16, 2026, 10:59 WAT (UTC+1)
 */

// Current time as specified by user: Feb 16, 2026, 10:59 WAT (UTC+1)
export const CURRENT_TIME = new Date('2026-02-16T10:59:00+01:00')

/**
 * Get the current time (Feb 16, 2026, 10:59 WAT)
 */
export function getCurrentTime(): Date {
    return CURRENT_TIME
}

/**
 * Format a date relative to current time (e.g., "2 minutes ago", "3 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
    const targetDate = typeof date === 'string' ? new Date(date) : date
    const now = CURRENT_TIME
    const diffMs = now.getTime() - targetDate.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
        return 'Just now'
    } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
        return targetDate.toLocaleDateString()
    }
}

/**
 * Format date according to the specified format
 */
export function formatDate(
    date: Date | string,
    format: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'YYYY-MM-DD'
): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    switch (format) {
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`
        case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`
        case 'YYYY-MM-DD':
        default:
            return `${year}-${month}-${day}`
    }
}

/**
 * Format time in HH:MM format
 */
export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

/**
 * Format datetime in a readable format
 */
export function formatDateTime(
    date: Date | string,
    dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'YYYY-MM-DD'
): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return `${formatDate(d, dateFormat)} ${formatTime(d)}`
}

/**
 * Get a date range based on a preset (1W, 1M, 3M, YTD, All)
 */
export function getDateRange(preset: '1W' | '1M' | '3M' | 'YTD' | 'All'): {
    startDate: Date
    endDate: Date
} {
    const endDate = CURRENT_TIME
    let startDate = new Date(endDate)

    switch (preset) {
        case '1W':
            startDate.setDate(startDate.getDate() - 7)
            break
        case '1M':
            startDate.setMonth(startDate.getMonth() - 1)
            break
        case '3M':
            startDate.setMonth(startDate.getMonth() - 3)
            break
        case 'YTD':
            startDate = new Date(endDate.getFullYear(), 0, 1) // Jan 1 of current year
            break
        case 'All':
            startDate = new Date('2026-01-01') // Start of trading data
            break
    }

    return { startDate, endDate }
}

/**
 * Calculate duration between two dates and format as human-readable string
 */
export function formatDuration(startDate: Date | string, endDate: Date | string): string {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate

    const diffMs = end.getTime() - start.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60

    if (hours === 0) {
        return `${minutes}m`
    } else if (minutes === 0) {
        return `${hours}h`
    } else {
        return `${hours}h ${minutes}m`
    }
}

/**
 * Check if a date falls within a range
 */
export function isDateInRange(date: Date | string, startDate: Date, endDate: Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date
    return d >= startDate && d <= endDate
}
