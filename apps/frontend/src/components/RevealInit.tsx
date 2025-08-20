'use client'
import { useEffect } from 'react'

/**
 * Initializes intersection-based reveal animations for elements
 * with [data-reveal] attribute. Keeps page.tsx as a Server Component.
 */
export function RevealInit() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = Array.from(document.querySelectorAll('[data-reveal]')) as HTMLElement[]
    if (prefersReduced) {
      els.forEach(el => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      })
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
