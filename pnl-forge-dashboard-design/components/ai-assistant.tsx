'use client'

import React, { useState, useEffect } from 'react'
import { Send, Sparkles, Loader, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react'
import { useChat } from 'ai/react'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useFilters } from '@/lib/filter-context'
import { cn } from '@/lib/utils'


/**
 * AiAssistant Component
 * Professional AI Oracle with data-driven Alpha insights and real LLM integration.
 */
export function AiAssistant() {
  const { metrics } = useFilters()
  const [open, setOpen] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading } = useChat({
    api: '/api/ai/chat',
    body: {
      context: metrics
    },
    initialMessages: [
      {
        id: 'initial-welcome',
        role: 'assistant',
        content: `I've indexed your ${metrics.tradesCount} verified on-chain records. Portfolio Win Rate is currently ${(metrics.winRate * 100).toFixed(1)}%. How can I optimize your edge today?`
      }
    ]
  })

  const suggestions = [
    'How is my overall strategy performing?',
    'What is my Kelly Criterion recommendation?',
    'Analyze my win/loss consistency',
    'Where are my biggest risk leaks?',
  ]

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion)
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-muted-900 text-bg flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group relative border-2 border-white/20"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full border-2 border-white animate-pulse" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md flex flex-col p-0 border-muted-300 bg-bg shadow-2xl glass-dark dark:glass"
        >
          {/* Header */}
          <div className="border-b border-muted-300 p-6 flex items-center justify-between bg-background/50 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-lg rotate-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-muted-900 text-lg uppercase tracking-tight">Intelligence <span className="text-primary-500">Oracle</span></h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <p className="text-[10px] text-success font-black uppercase tracking-widest">Live Alpha Engine</p>
                </div>
              </div>
            </div>
            {/* Hidden Titles for Accessibility */}
            <div className="sr-only">
              <SheetTitle>Intelligence Oracle AI Assistant</SheetTitle>
              <SheetDescription>
                Data-driven trading strategist for the Deriverse ecosystem.
              </SheetDescription>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-6 space-y-6 scroll-smooth">
            {messages.length <= 1 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center text-primary-500 animate-bounce duration-[3000ms]">
                  <Target className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-muted-900 uppercase tracking-tight">Performance Strategist</h3>
                  <p className="text-xs text-muted-600 font-medium leading-relaxed max-w-[240px] mx-auto">
                    I've indexed your <span className="text-primary-600 font-bold">{metrics.tradesCount} verified Trades</span>. Ask me for a tactical audit.
                  </p>
                </div>
                <div className="w-full space-y-2">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSuggestion(suggestion)}
                      className="w-full text-left text-[10px] font-black uppercase tracking-widest px-4 py-4 rounded-xl border border-muted-200 bg-surface text-muted-500 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all group flex items-center justify-between shadow-sm"
                    >
                      {suggestion}
                      <Zap className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex flex-col',
                      message.role === 'user' ? 'items-end' : 'items-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm whitespace-pre-wrap',
                        message.role === 'user'
                          ? 'bg-muted-900 text-bg rounded-br-none'
                          : 'bg-surface border border-muted-200 text-muted-800 dark:text-muted-700 rounded-bl-none'
                      )}
                    >
                      {message.content}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-600 mt-2 px-1">
                      {message.role === 'user' ? 'Strategist' : 'Oracle AI'}
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-surface border border-muted-200 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-600 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                      Synthesizing Edge...
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-6 bg-bg border-t border-muted-200 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Query Alpha Tier Insights..."
                className="flex-1 h-14 px-5 bg-muted-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-muted-600 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.1em]"
              />
              <button
                type="submit"
                disabled={isLoading || !input?.trim()}
                className="w-14 h-14 bg-muted-900 text-bg rounded-2xl hover:bg-black disabled:opacity-20 disabled:grayscale transition-all shadow-xl flex items-center justify-center active:scale-95"
              >
                <Send className="w-5 h-5 focus:ring-opacity-0" />
              </button>
            </form>
            <p className="text-[10px] text-center text-muted-600 mt-4 font-black uppercase tracking-widest">
              Context: {metrics.tradesCount} On-Chain Records
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
