'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, BarChart3, Shield, Sparkles, Wallet } from 'lucide-react'

const WELCOME_PHRASES = [
  'Welcome to PnlForge',
  'Your trades. Your analytics.',
  'On-chain verified.',
  'Built for serious traders.',
]

export function HeroMotionPanel() {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % WELCOME_PHRASES.length)
    }, 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className="relative w-full min-h-[320px] md:min-h-[400px] rounded-lg overflow-hidden border border-muted-300 bg-surface shadow-lg"
      aria-hidden
    >
      {/* Background: subtle grid + gradient */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, var(--color-primary-50) 0%, transparent 50%),
            linear-gradient(90deg, var(--color-muted-200) 1px, transparent 1px),
            linear-gradient(var(--color-muted-200) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 24px 24px, 24px 24px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 via-transparent to-accent-1/5" />

      {/* Floating KPI-style cards */}
      <div className="absolute top-[12%] left-[8%] w-20 h-16 md:w-24 md:h-20 rounded-md border border-muted-300 bg-bg/90 shadow-sm flex items-center justify-center animate-hero-float">
        <TrendingUp className="w-7 h-7 text-primary-500" />
      </div>
      <div
        className="absolute top-[28%] right-[10%] w-20 h-16 md:w-24 md:h-20 rounded-md border border-muted-300 bg-bg/90 shadow-sm flex items-center justify-center animate-hero-float"
        style={{ animationDelay: '1.2s' }}
      >
        <BarChart3 className="w-7 h-7 text-primary-600" />
      </div>
      <div
        className="absolute bottom-[32%] left-[12%] w-16 h-14 md:w-20 md:h-16 rounded-md border border-muted-300 bg-bg/90 shadow-sm flex items-center justify-center animate-hero-float"
        style={{ animationDelay: '2.4s' }}
      >
        <Shield className="w-6 h-6 text-success" />
      </div>
      <div
        className="absolute bottom-[18%] right-[14%] w-16 h-14 md:w-20 md:h-16 rounded-md border border-muted-300 bg-bg/90 shadow-sm flex items-center justify-center animate-hero-float"
        style={{ animationDelay: '0.8s' }}
      >
        <Sparkles className="w-6 h-6 text-accent-1" />
      </div>

      {/* Mini equity curve (SVG line) */}
      <div className="absolute bottom-[12%] left-[50%] -translate-x-1/2 w-[85%] h-20 opacity-90">
        <svg viewBox="0 0 200 40" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="heroLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary-400)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M0 32 Q25 28 50 26 T100 22 T150 18 T200 8"
            fill="none"
            stroke="url(#heroLineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="120"
            strokeDashoffset="120"
            className="animate-hero-line-flow"
            style={{ animationDuration: '4s' }}
          />
        </svg>
      </div>

      {/* Welcome / intro speech bubble */}
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 px-4">
        <div className="relative rounded-2xl border border-muted-300 bg-bg/95 shadow-md px-6 py-4 max-w-[260px] animate-welcome-pulse">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-l border-t border-muted-300 bg-bg/95" />
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-primary-500 shrink-0" />
            <span className="text-xs font-medium text-muted-600 uppercase tracking-wider">
              PnlForge
            </span>
          </div>
          <p
            key={phraseIndex}
            className="text-sm font-medium text-muted-900 text-center min-h-[2rem] flex items-center justify-center transition-opacity duration-300"
          >
            {WELCOME_PHRASES[phraseIndex]}
          </p>
        </div>
        <p className="text-xs text-muted-600 mt-3 text-center max-w-[200px]">
          Connect wallet to start
        </p>
      </div>
    </div>
  )
}
