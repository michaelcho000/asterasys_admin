'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { FiArrowDown, FiArrowUp } from 'react-icons/fi'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const TABS = ['ALL', 'RF', 'HIFU']

const CafeMarketLeaderboard = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)
  const [activeTab, setActiveTab] = useState('ALL')
  const [sortField, setSortField] = useState('rank')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    if (!month) return

    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(withMonthParam('/api/data/cafe-engagement', month))
        if (!response.ok) {
          throw new Error('카페 순위 데이터를 불러오지 못했습니다.')
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || '순위 데이터가 유효하지 않습니다.')
        }

        setLeaderboard(data.leaderboard)
      } catch (err) {
        console.error('Cafe leaderboard fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [month])

  const rows = useMemo(() => {
    if (!leaderboard) return []
    const data = leaderboard[activeTab] || []

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortField] ?? 0
      const bValue = b[sortField] ?? 0

      if (typeof aValue === 'string') {
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue)
        }
        return bValue.localeCompare(aValue)
      }

      if (sortOrder === 'asc') {
        return aValue - bValue
      }
      return bValue - aValue
    })

    return sorted
  }, [leaderboard, activeTab, sortField, sortOrder])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder(field === 'keyword' ? 'asc' : 'desc')
    }
  }

  const renderSortIcon = (field) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? <FiArrowUp className='ms-1 text-primary' /> : <FiArrowDown className='ms-1 text-primary' />
  }

  return (
    <div className='col-12'>
      <div className='card stretch stretch-full'>
        <div className='card-header d-flex align-items-center justify-content-between flex-wrap gap-3'>
          <div>
            <h5 className='card-title mb-1'>카페 시장 순위 현황</h5>
            <p className='text-muted fs-12 mb-0'>RF/HIFU 제품군 전체 순위와 Asterasys 위치 비교</p>
          </div>
          <div className='btn-group btn-group-sm'>
            {TABS.map((tab) => (
              <button
                key={tab}
                type='button'
                className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className='card-body p-0'>
          {loading ? (
            <CardLoader />
          ) : error ? (
            <div className='text-danger fw-semibold p-4'>{error}</div>
          ) : rows.length ? (
            <div className='table-responsive'>
              <table className='table table-hover mb-0 align-middle'>
                <thead className='bg-body-tertiary'>
                  <tr>
                    <th scope='col' style={{ width: '80px', cursor: 'pointer' }} onClick={() => handleSort('rank')}>
                      <div className='d-flex align-items-center gap-1 text-nowrap'>
                        <span className='text-muted text-uppercase fs-12'>순위</span>
                        {renderSortIcon('rank')}
                      </div>
                    </th>
                    <th scope='col' style={{ cursor: 'pointer' }} onClick={() => handleSort('keyword')}>
                      <div className='d-flex align-items-center gap-1 text-nowrap'>
                        <span className='text-muted text-uppercase fs-12'>제품</span>
                        {renderSortIcon('keyword')}
                      </div>
                    </th>
                    <th scope='col'>
                      <span className='text-muted text-uppercase fs-12'>기술군</span>
                    </th>
                    <th scope='col' style={{ cursor: 'pointer' }} onClick={() => handleSort('totalPosts')}>
                      <div className='d-flex align-items-center gap-1 text-nowrap'>
                        <span className='text-muted text-uppercase fs-12'>발행량</span>
                        {renderSortIcon('totalPosts')}
                      </div>
                    </th>
                    <th scope='col' style={{ cursor: 'pointer' }} onClick={() => handleSort('participation')}>
                      <div className='d-flex align-items-center gap-1 text-nowrap'>
                        <span className='text-muted text-uppercase fs-12'>참여도</span>
                        {renderSortIcon('participation')}
                      </div>
                    </th>
                    <th scope='col' style={{ cursor: 'pointer' }} onClick={() => handleSort('searchVolume')}>
                      <div className='d-flex align-items-center gap-1 text-nowrap'>
                        <span className='text-muted text-uppercase fs-12'>검색량</span>
                        {renderSortIcon('searchVolume')}
                      </div>
                    </th>
                    <th scope='col' style={{ cursor: 'pointer' }} onClick={() => handleSort('searchToPostRatio')}>
                      <div className='d-flex align-items-center gap-1 text-nowrap'>
                        <span className='text-muted text-uppercase fs-12'>검색→발행</span>
                        {renderSortIcon('searchToPostRatio')}
                      </div>
                    </th>
                    <th scope='col' style={{ cursor: 'pointer' }} onClick={() => handleSort('salesPerThousandSearch')}>
                      <div className='d-flex align-items-center gap-1 text-nowrap'>
                        <span className='text-muted text-uppercase fs-12'>검색→판매</span>
                        {renderSortIcon('salesPerThousandSearch')}
                      </div>
                    </th>
                    <th scope='col' style={{ cursor: 'pointer' }} onClick={() => handleSort('monthlySales')}>
                      <div className='d-flex align-items-center gap-1 text-nowrap'>
                        <span className='text-muted text-uppercase fs-12'>월간 판매</span>
                        {renderSortIcon('monthlySales')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${row.keyword}-${row.rank}`} className={`align-middle ${row.isAsterasys ? 'table-primary' : ''}`}>
                      <td className='py-3'>
                        <div className='fw-bold text-dark fs-6'>{row.rank}</div>
                      </td>
                      <td className='py-3'>
                        <div className='fw-semibold text-dark d-flex align-items-center'>
                          <span className='fs-6'>{row.keyword}</span>
                          {row.isAsterasys && (
                            <span className='badge bg-primary-subtle text-primary fw-semibold ms-2'>Asterasys</span>
                          )}
                        </div>
                      </td>
                      <td className='py-3'>
                        <span
                          className={`badge ${row.technology === 'RF' ? 'bg-primary' : row.technology === 'HIFU' ? 'bg-info' : 'bg-secondary'}`}
                        >
                          {row.technology}
                        </span>
                      </td>
                      <td className='py-3 fw-semibold text-dark'>{row.totalPosts?.toLocaleString()}</td>
                      <td className='py-3 fw-semibold text-dark'>{((row.participation || 0) * 100).toFixed(1)}%</td>
                      <td className='py-3 fw-semibold text-dark'>{row.searchVolume?.toLocaleString() || '--'}</td>
                      <td className='py-3 fw-semibold text-dark'>{(row.searchToPostRatio || 0).toFixed(1)}건/1K</td>
                      <td className='py-3 fw-semibold text-dark'>{(row.salesPerThousandSearch || 0).toFixed(1)}건/1K</td>
                      <td className='py-3 fw-semibold text-dark'>{row.monthlySales?.toLocaleString() || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='p-4 text-muted fs-12'>표시할 순위 데이터가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CafeMarketLeaderboard
