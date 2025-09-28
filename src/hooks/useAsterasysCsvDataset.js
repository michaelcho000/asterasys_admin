import { useEffect, useMemo, useState } from 'react'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const FILE_MAP = {
  blog_rank: '/api/data/files/blog_rank',
  cafe_rank: '/api/data/files/cafe_rank',
  traffic: '/api/data/files/traffic',
  sale: '/api/data/files/sale',
  news_rank: '/api/data/files/news_rank',
  youtube_rank: '/api/data/files/youtube_rank',
  youtube_sponsor: '/api/data/files/youtube_sponsor ad',
  facebook_targeting: '/api/data/files/facebook_targeting',
  blog_post: '/api/data/files/blog_post',
  news_release: '/api/data/files/news_release',
  cafe_seo: '/api/data/files/cafe_seo',
  bad_writing: '/api/data/files/bad writing',
  naver_datalab: '/api/data/files/naver datalab',
  youtube_comments: '/api/data/files/youtube_comments',
  youtube_contents: '/api/data/files/youtube_contents'
}

const formatMonthLabel = (month) => {
  if (!month) return '데이터 준비 중'
  const [year, monthPart] = month.split('-')
  return `${year}년 ${parseInt(monthPart, 10)}월`
}

export const useAsterasysCsvDataset = (keys = []) => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!month || keys.length === 0) return

    const controller = new AbortController()

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const timestamp = Date.now()
        const fetchOptions = {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache'
          },
          signal: controller.signal
        }

        const responses = await Promise.all(
          keys.map(async (key) => {
            const path = FILE_MAP[key]
            if (!path) {
              console.warn(`[useAsterasysCsvDataset] Unknown file key: ${key}`)
              return [key, { success: false, marketData: [] }]
            }

            const url = withMonthParam(`${path}?t=${timestamp}`, month)
            const res = await fetch(url, fetchOptions)
            if (!res.ok) {
              throw new Error(`Failed to load ${key} (${res.status})`)
            }
            const json = await res.json()
            return [key, json]
          })
        )

        const mapped = responses.reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {})

        setData(mapped)
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('useAsterasysCsvDataset error:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    load()

    return () => controller.abort()
  }, [month, keys.join('|')])

  const monthLabel = useMemo(() => formatMonthLabel(month), [month])

  return {
    data,
    loading,
    error,
    month,
    monthLabel
  }
}

export default useAsterasysCsvDataset
