export function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-10 bg-muted-200 rounded-md w-48 mb-2" />
          <div className="h-4 bg-muted-200 rounded-md w-64" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-muted-200 rounded-md w-16" />
          ))}
        </div>
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-lg border border-muted-300 bg-surface p-6">
            <div className="h-4 bg-muted-200 rounded-md w-20 mb-4" />
            <div className="h-8 bg-muted-200 rounded-md w-32 mb-2" />
            <div className="h-3 bg-muted-200 rounded-md w-24" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="rounded-lg border border-muted-300 bg-surface p-6">
        <div className="h-6 bg-muted-200 rounded-md w-32 mb-6" />
        <div className="h-96 bg-muted-200 rounded-md" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div>
        <div className="h-6 bg-muted-200 rounded-md w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-md border border-muted-300 bg-surface p-4">
              <div className="h-3 bg-muted-200 rounded-md w-16 mb-2" />
              <div className="h-5 bg-muted-200 rounded-md w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
