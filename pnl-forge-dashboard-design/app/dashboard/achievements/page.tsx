'use client'

import { useMemo } from 'react'
import { useFilters } from '@/lib/filter-context'
import { calculateAchievementProgress } from '@/lib/analytics-helpers'
import { Award, Trophy, Star, Zap, Target, TrendingUp } from 'lucide-react'

export default function AchievementsPage() {
  const { filteredTrades, metrics } = useFilters()

  const progress = useMemo(() =>
    calculateAchievementProgress(filteredTrades, metrics),
    [filteredTrades, metrics]
  )

  const achievements = [
    {
      id: 1,
      title: 'First Trade',
      description: 'Execute your first trade',
      icon: <TrendingUp className="w-6 h-6" />,
      unlocked: filteredTrades.length > 0,
      progress: Math.min(1, filteredTrades.length),
      total: 1,
      unlockedDate: filteredTrades.length > 0 ? filteredTrades[0].exit_time : null,
    },
    {
      id: 2,
      title: 'Reviewed Trader',
      description: 'Review 10 trades in your journal',
      icon: <Target className="w-6 h-6" />,
      unlocked: progress.reviewedCount >= 10,
      progress: progress.reviewedCount,
      total: 10,
      unlockedDate: progress.reviewedCount >= 10 ? '2026-01-10' : null,
    },
    {
      id: 3,
      title: 'Consistency Master',
      description: '30 days without exceeding max drawdown threshold',
      icon: <Zap className="w-6 h-6" />,
      unlocked: progress.maxDrawdown < 10,
      progress: progress.maxDrawdown < 10 ? 30 : 15,
      total: 30,
      unlockedDate: progress.maxDrawdown < 10 ? '2026-01-10' : null,
    },
    {
      id: 4,
      title: 'Win Streak',
      description: '10 consecutive winning trades',
      icon: <Star className="w-6 h-6" />,
      unlocked: progress.maxWinStreak >= 10,
      progress: progress.maxWinStreak,
      total: 10,
      unlockedDate: progress.maxWinStreak >= 10 ? '2026-01-12' : null,
    },
    {
      id: 5,
      title: 'PnL Pioneer',
      description: 'Achieve $1000+ total profit',
      icon: <Trophy className="w-6 h-6" />,
      unlocked: progress.totalPnL >= 1000,
      progress: Math.min(1000, progress.totalPnL),
      total: 1000,
      unlockedDate: progress.totalPnL >= 1000 ? '2026-01-12' : null,
    },
    {
      id: 6,
      title: 'Diversifier',
      description: 'Trade 5+ different symbols',
      icon: <Award className="w-6 h-6" />,
      unlocked: progress.uniqueSymbols >= 5,
      progress: progress.uniqueSymbols,
      total: 5,
      unlockedDate: progress.uniqueSymbols >= 5 ? '2026-01-08' : null,
    },
    {
      id: 7,
      title: 'Risk Manager',
      description: 'Keep max drawdown under 5%',
      icon: <Target className="w-6 h-6" />,
      unlocked: progress.maxDrawdown < 5,
      progress: progress.maxDrawdown < 5 ? 1 : 0,
      total: 1,
      unlockedDate: progress.maxDrawdown < 5 ? '2026-01-14' : null,
    },
    {
      id: 8,
      title: 'Data Analyst',
      description: 'Export data 5 times',
      icon: <Zap className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      total: 5,
      unlockedDate: null,
    },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-muted-900">Achievements</h1>
        <p className="text-muted-600 mt-1">
          {unlockedCount} of {totalCount} achievements unlocked
        </p>
      </div>

      {/* Progress Bar */}
      <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-muted-900">Overall Progress</p>
          <p className="text-lg font-bold text-primary-500">
            {Math.round((unlockedCount / totalCount) * 100)}%
          </p>
        </div>
        <div className="h-3 bg-muted-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-1 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-lg border-2 transition-all ${achievement.unlocked
                ? 'border-success bg-surface shadow-md'
                : 'border-muted-300 bg-surface opacity-75'
              } p-6`}
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${achievement.unlocked
                  ? 'bg-success text-white'
                  : 'bg-muted-200 text-muted-600'
                }`}
            >
              {achievement.icon}
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-muted-900 mb-1">
              {achievement.title}
            </h3>
            <p className="text-sm text-muted-600 mb-4">{achievement.description}</p>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-600">
                  {achievement.progress} / {achievement.total}
                </span>
                {achievement.unlocked && (
                  <span className="text-success font-medium">Unlocked</span>
                )}
              </div>
              <div className="h-2 bg-muted-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${achievement.unlocked
                      ? 'bg-success'
                      : 'bg-primary-500'
                    }`}
                  style={{
                    width: `${(achievement.progress / achievement.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Unlocked Date */}
            {achievement.unlocked && achievement.unlockedDate && (
              <p className="text-xs text-muted-500 mt-4">
                Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
        <h3 className="font-semibold text-muted-900 mb-2">Keep Trading</h3>
        <p className="text-sm text-muted-600">
          Complete more trades and maintain consistent performance to unlock new achievements. Track your progress
          and celebrate your trading milestones!
        </p>
      </div>
    </div>
  )
}
