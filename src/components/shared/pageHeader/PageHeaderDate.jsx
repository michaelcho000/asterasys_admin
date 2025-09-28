'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { FiCalendar } from 'react-icons/fi'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'

const formatMonthLabel = (month) => {
  if (!month) return ''
  const [year, monthPart] = month.split('-')
  const monthNumber = parseInt(monthPart, 10)
  return `${year}년 ${monthNumber}월`
}

const PageHeaderDate = () => {
  const {
    selectedMonth,
    availableMonths,
    setSelectedMonth,
    setAvailableMonths,
    loading,
    setLoading
  } = useSelectedMonthStore((state) => ({
    selectedMonth: state.selectedMonth,
    availableMonths: state.availableMonths,
    setSelectedMonth: state.setSelectedMonth,
    setAvailableMonths: state.setAvailableMonths,
    loading: state.loading,
    setLoading: state.setLoading
  }))

  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const loadMonths = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/data/months')
        if (!response.ok) {
          throw new Error(`Failed to load month list (${response.status})`)
        }
        const result = await response.json()
        if (!mounted) return

        const months = Array.isArray(result.months) ? result.months.slice().sort().reverse() : []
        setAvailableMonths(months)

        let defaultMonth = selectedMonth
        if (!defaultMonth && typeof window !== 'undefined') {
          const storedMonth = window.localStorage.getItem('asterasys:selectedMonth')
          if (storedMonth && months.includes(storedMonth)) {
            defaultMonth = storedMonth
          }
        }
        if (!defaultMonth) {
          if (result.latest && months.includes(result.latest)) {
            defaultMonth = result.latest
          } else {
            defaultMonth = months[0] || null
          }
        }
        if (defaultMonth && selectedMonth !== defaultMonth) {
          setSelectedMonth(defaultMonth)
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('asterasys:selectedMonth', defaultMonth)
          }
        }
        setError(null)
      } catch (err) {
        if (mounted) {
          setError(err.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadMonths()
    return () => {
      mounted = false
    }
  }, [setAvailableMonths, setLoading, setSelectedMonth, selectedMonth])

  const orderedMonths = useMemo(() => availableMonths.slice(), [availableMonths])

  const handleMonthChange = (newMonth) => {
    if (!newMonth || newMonth === selectedMonth) return
    setSelectedMonth(newMonth)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('asterasys:selectedMonth', newMonth)
      window.location.reload()
    }
  }

  const currentLabel = selectedMonth
    ? formatMonthLabel(selectedMonth)
    : loading
      ? '불러오는 중...'
      : '월 선택'

  return (
    <div className='d-flex align-items-center gap-3 page-header-right-items-wrapper'>
      <div className='filter-dropdown'>
        <button
          type='button'
          className='btn btn-sm btn-light-brand d-flex align-items-center gap-2 text-nowrap'
          data-bs-toggle='dropdown'
          data-bs-offset='0, 10'
          disabled={loading || orderedMonths.length === 0}
        >
          <FiCalendar size={16} strokeWidth={1.6} />
          <span>{currentLabel}</span>
        </button>
        <div className='dropdown-menu dropdown-menu-end shadow-sm'>
          {orderedMonths.length === 0 && (
            <span className='dropdown-item text-muted small'>사용 가능한 월이 없습니다</span>
          )}
          {orderedMonths.map((month) => {
            const isActive = month === selectedMonth
            return (
              <button
                key={month}
                type='button'
                className={`dropdown-item d-flex align-items-center ${isActive ? 'active' : ''}`}
                onClick={() => handleMonthChange(month)}
              >
                <span className='me-auto'>{formatMonthLabel(month)}</span>
                {isActive && <span className='badge bg-primary ms-2'>현재</span>}
              </button>
            )
          })}
          {error && !loading && (
            <span className='dropdown-item text-danger small'>월 정보를 불러오지 못했습니다</span>
          )}
        </div>
      </div>
      {loading && <span className='text-muted small'>불러오는 중...</span>}
      {error && !loading && <span className='text-danger small'>월 정보 로드 실패</span>}
    </div>
  )
}

export default PageHeaderDate
