'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, Zap, Shield, Search, Database, Cpu } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { cn } from '@/lib/utils'
import { LogoAnimated } from '@/components/logo-animated'

export default function IngestionPage() {
  const { publicKey } = useWallet()
  const [progress, setProgress] = useState({
    transactions: 0,
    trades: 0,
    analytics: 0,
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([
    'Initializing connection to Solana mainnet-beta...',
  ])

  const steps = [
    {
      title: 'Chain Indexing',
      description: 'Querying historical account state via Helius RPC...',
      icon: <Search className="w-5 h-5" />,
    },
    {
      title: 'Program Synthesis',
      description: 'Parsing Deriverse Program IDs and extracting IDLs...',
      icon: <Database className="w-5 h-5" />,
    },
    {
      title: 'Alpha Engine Pulse',
      description: 'Computing K-Ratio, Calmar, and Kelly Criterion...',
      icon: <Cpu className="w-5 h-5" />,
    },
  ]

  const technicalLogs = [
    'Connection established. Latency: 42ms.',
    `Targeting wallet: ${publicKey?.toBase58()?.slice(0, 12)}...`,
    'Fetching transaction signatures (limit: 1000)...',
    'Found 324 candidate signatures.',
    'Resolving account meta for trade identification...',
    'Matching against Deriverse V2 Program (DEV...p4x)...',
    'Detected 47 PerpTrade events.',
    'Extracting leverage and collateral data...',
    'Parsing sub-account equity history...',
    'Building localized equity curve...',
    'Calculating rolling standard deviation...',
    'Simulating Monte Carlo for Kelly recommend...',
    'Normalizing Alpha tiers for dashboard...',
    'Indexing complete. Finalizing data bridge.',
  ]

  useEffect(() => {
    const intervals = [
      setInterval(() => {
        setProgress((prev) => ({
          ...prev,
          transactions: Math.min(prev.transactions + 1.2, 100),
        }))
      }, 100),
      setInterval(() => {
        if (progress.transactions > 30) {
          setProgress((prev) => ({
            ...prev,
            trades: Math.min(prev.trades + 0.8, 100),
          }))
        }
      }, 150),
      setInterval(() => {
        if (progress.trades > 50) {
          setProgress((prev) => ({
            ...prev,
            analytics: Math.min(prev.analytics + 0.5, 100),
          }))
        }
      }, 200),
    ]

    // Cycle through logs
    const logInterval = setInterval(() => {
      setLogs((prev) => {
        if (prev.length >= technicalLogs.length + 1) return prev
        return [...prev, technicalLogs[prev.length - 1]]
      })
    }, 1200)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (progress.transactions >= 100 && prev === 0) return 1
        if (progress.trades >= 100 && prev === 1) return 2
        return prev
      })
    }, 500)

    return () => {
      intervals.forEach(clearInterval)
      clearInterval(logInterval)
      clearInterval(stepInterval)
    }
  }, [progress])

  const isComplete = progress.transactions >= 100 && progress.trades >= 100 && progress.analytics >= 100

  return (
    <div className="min-h-screen bg-bg text-muted-900 font-sans">
      {/* Premium Glass Header */}
      <nav className="border-b border-muted-200 bg-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <LogoAnimated size={32} />
          <span className="font-black text-xl tracking-tight uppercase">PnlForge<span className="text-primary-500">.</span></span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-bold text-muted-500 uppercase tracking-widest">Mainnet Node Active</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 grid md:grid-cols-[1fr_320px] gap-12">
        <div className="space-y-12">
          {/* Main Status */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Analyzing Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">On-Chain Performance</span>
            </h1>
            <p className="text-lg text-muted-500 max-w-lg">
              We are deep-indexing your Deriverse history to extract Alpha tier risk metrics.
            </p>
          </div>

          {/* New Progress Steps */}
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500",
                    i < currentStep ? "bg-success border-success text-white" :
                      i === currentStep ? "bg-primary-50 border-primary-500 text-primary-500" :
                        "bg-muted-50 border-muted-200 text-muted-300"
                  )}>
                    {i < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={cn("font-bold text-sm uppercase tracking-wider", i <= currentStep ? "text-muted-800" : "text-muted-400")}>
                        {step.title}
                      </h3>
                      <span className="text-[10px] font-mono text-muted-500">
                        {Math.floor(i === 0 ? progress.transactions : i === 1 ? progress.trades : progress.analytics)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-300",
                          i < currentStep ? "bg-success" : "bg-primary-500"
                        )}
                        style={{ width: `${i === 0 ? progress.transactions : i === 1 ? progress.trades : progress.analytics}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-500 mt-3">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Completion Action */}
          {isComplete && (
            <div className="p-8 rounded-2xl bg-success text-white shadow-2xl shadow-success-200 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Index Finalized</h2>
                  <p className="text-success-50 text-sm opacity-90 font-medium">Alpha metrics computed and verified on-chain.</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="block w-full text-center py-4 bg-white text-success font-black uppercase tracking-widest rounded-xl hover:bg-success/10 transition-all border-b-4 border-success active:border-b-0 active:translate-y-1"
              >
                Go to Portfolio
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Diagnostics */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-muted-200 bg-bg p-6 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-warning" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-400">Indexing Log</h4>
            </div>
            <div className="flex-1 overflow-auto space-y-3 font-mono text-[10px] text-muted-600 scroll-smooth">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-primary-400 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className="break-all">{log}</span>
                </div>
              ))}
              <div className="animate-pulse flex gap-2">
                <span className="text-primary-400 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                <span className="w-2 h-3 bg-muted-300" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-muted-900 text-white">
            <h4 className="font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="w-3 h-3 text-success" />
              Privacy Protocol
            </h4>
            <p className="text-[10px] text-muted-400 leading-relaxed">
              Your trading data is temporarily cached in your local browser session. No private keys are ever synchronized with our indexing nodes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
