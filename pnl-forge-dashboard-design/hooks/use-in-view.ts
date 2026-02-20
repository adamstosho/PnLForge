'use client'

import { useEffect, useRef, useState } from 'react'

export function useInView(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px' } = options ?? {}

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, inView }
}
