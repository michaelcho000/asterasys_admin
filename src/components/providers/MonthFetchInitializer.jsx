'use client'
import { useEffect } from 'react'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const MonthFetchInitializer = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.__ASTERASYS_FETCH_PATCHED__) return

    const originalFetch = window.fetch.bind(window)

    window.fetch = (input, init) => {
      try {
        const month = useSelectedMonthStore.getState().selectedMonth
        if (typeof input === 'string' && input.startsWith('/api/data/')) {
          const hasMonthParam = input.includes('month=')
          if (month && !hasMonthParam) {
            return originalFetch(withMonthParam(input, month), init)
          }
        }
      } catch (error) {
        console.warn('Failed to append month parameter:', error)
      }
      return originalFetch(input, init)
    }

    window.__ASTERASYS_FETCH_PATCHED__ = true

    return () => {
      window.fetch = originalFetch
      delete window.__ASTERASYS_FETCH_PATCHED__
    }
  }, [])

  return null
}

export default MonthFetchInitializer
