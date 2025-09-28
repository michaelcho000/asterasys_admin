'use client'
import { useState, useEffect } from 'react'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

/**
 * Asterasys 동적 데이터 Hook
 * 파일명 기반으로 실제 CSV 데이터를 동적으로 로드
 * 사용법: const { data, loading } = useAsterasysData('blog_rank')
 */

export const useAsterasysData = (filename) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const month = useSelectedMonthStore((state) => state.selectedMonth)

  useEffect(() => {
    if (!filename || !month) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(withMonthParam(`/api/data/files/${filename}`, month))
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
        
      } catch (err) {
        console.error(`Failed to fetch ${filename}:`, err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filename, month])

  return { data, loading, error }
}

/**
 * 처리된 데이터 Hook (kpis.json, dashboard.json 등)
 */
export const useProcessedData = (dataType = 'kpis') => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const month = useSelectedMonthStore((state) => state.selectedMonth)

  useEffect(() => {
    if (!month) return
    const fetchProcessedData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(withMonthParam(`/api/data/${dataType}`, month))
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
        
      } catch (err) {
        console.error(`Failed to fetch processed ${dataType}:`, err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProcessedData()
  }, [dataType, month])

  return { data, loading, error }
}

/**
 * 다중 파일 동적 로드 Hook
 * 사용법: const { data } = useMultipleAsterasysData(['blog_rank', 'cafe_rank', 'sale'])
 */
export const useMultipleAsterasysData = (filenames = []) => {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const month = useSelectedMonthStore((state) => state.selectedMonth)

  useEffect(() => {
    if (filenames.length === 0 || !month) return

    const fetchMultipleData = async () => {
      try {
        setLoading(true)
        setError(null)

        const promises = filenames.map(filename => 
          fetch(withMonthParam(`/api/data/files/${filename}`, month)).then(res => res.json())
        )

        const results = await Promise.all(promises)
        
        const dataMap = {}
        filenames.forEach((filename, index) => {
          dataMap[filename] = results[index]
        })

        setData(dataMap)
        
      } catch (err) {
        console.error('Failed to fetch multiple files:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMultipleData()
  }, [filenames.join(','), month])

  return { data, loading, error }
}

export default useAsterasysData
