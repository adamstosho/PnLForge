'use client'

import { useInView } from '@/hooks/use-in-view'
import { cn } from '@/lib/utils'

interface SectionRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function SectionReveal({ children, className, delay = 0 }: SectionRevealProps) {
  const { ref, inView } = useInView({ threshold: 0.08, rootMargin: '0px 0px -60px 0px' })

  return (
    <div
      ref={ref}
      className={cn(
        inView ? 'animate-scroll-in opacity-100' : 'opacity-0',
        className
      )}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
