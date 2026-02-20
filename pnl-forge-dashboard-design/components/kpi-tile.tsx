import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPITileProps {
  label: string
  value: string
  delta: number
  deltaLabel: string
  icon: ReactNode
}

export function KPITile({ label, value, delta, deltaLabel, icon }: KPITileProps) {
  const isPositive = delta >= 0

  return (
    <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="text-primary-500">{icon}</div>
        <div
          className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
            isPositive
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {Math.abs(delta).toFixed(1)}%
        </div>
      </div>

      <p className="text-muted-600 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-muted-900 mb-2">{value}</p>
      <p className="text-xs text-muted-600">{deltaLabel}</p>
    </div>
  )
}
