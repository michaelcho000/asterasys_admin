'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const NewsPerformanceTable = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [sortField, setSortField] = useState('marketing_score')
  const [sortDirection, setSortDirection] = useState('desc')
  const month = useSelectedMonthStore((state) => state.selectedMonth)

  useEffect(() => {
    if (!month) return
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(withMonthParam('/api/data/news-analysis', month))
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        
        if (!result || !result.topPerformers) {
          console.error('Invalid data structure received:', result)
          return
        }
        
        setData(result)
      } catch (error) {
        console.error('Error fetching news analysis data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [month])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  if (loading || !data || !data.topPerformers) {
    return (
      <div className="col-12">
        <CardLoader />
      </div>
    )
  }

  const sortedData = [...data.topPerformers].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const getCampaignBadge = (intensity) => {
    const badgeMap = {
      'HIGH': { color: 'danger', text: '고강도' },
      'MEDIUM': { color: 'warning', text: '중강도' },
      'LOW': { color: 'info', text: '저강도' },
      'NONE': { color: 'secondary', text: '없음' }
    }
    
    const badge = badgeMap[intensity] || badgeMap['NONE']
    return (
      <span className={`badge bg-soft-${badge.color} text-${badge.color} border-0`}>
        {badge.text}
      </span>
    )
  }

  return (
    <div className="col-12">
      <div className="card stretch stretch-full">
        <CardHeader title="뉴스 성과 순위" />
        
        <div className="card-body custom-card-action p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr className="border-b">
                  <th className="ps-4">순위</th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('product_name')}
                  >
                    제품명
                    {sortField === 'product_name' && (
                      <i className={`feather-${sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'} ms-1`}></i>
                    )}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('total_articles')}
                  >
                    총 기사 수
                    {sortField === 'total_articles' && (
                      <i className={`feather-${sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'} ms-1`}></i>
                    )}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('marketing_score')}
                  >
                    마케팅 점수
                    {sortField === 'marketing_score' && (
                      <i className={`feather-${sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'} ms-1`}></i>
                    )}
                  </th>
                  <th>캠페인 강도</th>
                  <th>주요 카테고리</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={index} className={item.isAsterasys ? 'bg-soft-primary' : ''}>
                    <td className="ps-4">
                      <div className="fw-semibold text-dark">#{index + 1}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className={`fw-semibold ${item.isAsterasys ? 'text-primary' : 'text-dark'}`}>
                            {item.product_name}
                            {item.isAsterasys && (
                              <span className="ms-2 badge bg-primary text-white border-0 fs-10">
                                Asterasys
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">
                        {item.total_articles.toLocaleString()}건
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{item.marketing_score}점</div>
                    </td>
                    <td>
                      {getCampaignBadge(item.campaign_intensity)}
                    </td>
                    <td>
                      <div className="fs-12 text-muted">{item.dominant_category}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsPerformanceTable
