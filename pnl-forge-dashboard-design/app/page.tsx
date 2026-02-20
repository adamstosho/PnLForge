'use client'

import { ArrowRight, TrendingUp, BarChart3, Zap, Shield, LineChart, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ConnectWalletButton } from '@/components/connect-wallet-button'
import { LogoAnimated } from '@/components/logo-animated'
import { HeroMotionPanel } from '@/components/hero-motion-panel'
import { SectionReveal } from '@/components/section-reveal'

const features = [
  {
    icon: TrendingUp,
    title: 'Accurate Analytics',
    description: 'Auditable PnL computed directly from on-chain Deriverse trades',
  },
  {
    icon: BarChart3,
    title: 'Rich Visualizations',
    description: 'Equity curves, drawdown analysis, and time-of-day heatmaps',
  },
  {
    icon: Zap,
    title: 'AI Assistant',
    description: 'Natural language queries and automated trade analysis',
  },
  {
    icon: LineChart,
    title: 'Scenario Simulator',
    description: 'Test hypothetical trade adjustments and stop-loss rules',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Non-custodial with encrypted notes and zero trust design',
  },
  {
    icon: Sparkles,
    title: 'Professional Journal',
    description: 'Link qualitative notes and tags to quantitative outcomes',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <nav className="border-b border-muted-300 sticky top-0 z-50 bg-bg/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoAnimated size={32} />
            <span className="font-bold text-lg text-muted-700">PnlForge</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-muted-600 hover:text-muted-700 transition-colors">
              Features
            </a>
            <a href="#" className="text-muted-600 hover:text-muted-700 transition-colors">
              Docs
            </a>
            <ConnectWalletButton variant="secondary" redirectAfterConnect="/ingestion" className="gap-2" />
          </div>
        </div>
      </nav>

      {/* Hero Section - two columns: copy left, motion panel right */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-muted-900 mb-6 leading-tight">
              Trading Analytics Built on{' '}
              <span className="text-primary-500">On-Chain Truth</span>
            </h1>
            <p className="text-lg text-muted-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Connect your Deriverse wallet and unlock auditable analytics. Track PnL, annotate trades,
              simulate scenarios, and get AI-powered insights—all non-custodial, all on-chain verified.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-0">
              <ConnectWalletButton
                variant="primary"
                redirectAfterConnect="/ingestion"
                className="px-8 py-3 rounded-md font-medium gap-2"
              />
              <Link
                href="/dashboard"
                className="px-8 py-3 border border-muted-300 text-muted-700 font-medium rounded-md hover:bg-muted-100 transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                Try Demo
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <HeroMotionPanel />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-surface border-y border-muted-300 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-muted-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-muted-600 max-w-2xl mx-auto">
                Comprehensive trading analytics and journal for professional traders
              </p>
            </div>
          </SectionReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <SectionReveal key={feature.title} delay={80 * i}>
                <div
                  className="group rounded-lg border border-muted-300 bg-bg p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary-200"
                >
                  <div className="w-12 h-12 rounded-md bg-primary-50 flex items-center justify-center mb-4 text-primary-500 transition-colors duration-300 group-hover:bg-primary-100">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-muted-900 mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-600 leading-relaxed">{feature.description}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <SectionReveal>
          <div className="relative rounded-lg overflow-hidden bg-primary-500 p-12 text-center">
            <div className="absolute inset-0 bg-primary-600/50" aria-hidden />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Start Analyzing Your Trades
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Connect your wallet now and get instant access to professional-grade trading analytics
              </p>
              <ConnectWalletButton
                variant="primary"
                redirectAfterConnect="/ingestion"
                className="px-8 py-3 bg-bg text-primary-600 font-medium rounded-md hover:bg-muted-50 inline-flex gap-2"
              />
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-muted-300 bg-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <LogoAnimated size={24} />
                <span className="font-bold text-muted-700">PnlForge</span>
              </div>
              <p className="text-sm text-muted-600">
                Professional trading analytics for on-chain traders
              </p>
            </div>
            {[
              { title: 'Product', items: ['Features', 'Pricing', 'Security'] },
              { title: 'Resources', items: ['Documentation', 'API Docs', 'Blog'] },
              { title: 'Legal', items: ['Privacy', 'Terms', 'Security'] },
            ].map((col, i) => (
              <div key={col.title}>
                <h4 className="font-semibold text-muted-700 mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-muted-600 hover:text-muted-700 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-muted-300 pt-8 text-center text-sm text-muted-600">
            <p>© 2026 PnlForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
