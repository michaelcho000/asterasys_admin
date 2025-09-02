'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'

const NewsCompetitorAnalysisTable = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [sortField, setSortField] = useState('total_articles')
  const [sortDirection, setSortDirection] = useState('desc')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data/news-analysis')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        
        if (!result || !result.competitorAnalysis) {
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
  }, [])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  if (loading || !data || !data.competitorAnalysis) {
    return (
      <div className="col-12">
        <CardLoader />
      </div>
    )
  }

  const sortedData = [...data.competitorAnalysis].sort((a, b) => {
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

  const parseCompetitorMentions = (details) => {
    if (!details || details === '없음') return []
    
    return details.split(';').map(mention => {
      const match = mention.trim().match(/^(.*?)\((\d+)\)$/)
      return match ? { name: match[1], count: parseInt(match[2]) } : null
    }).filter(Boolean)
  }

  return (
    <div className="col-12">
      <div className="card stretch stretch-full">
        <CardHeader title="경쟁사 언급 분석" />
        
        <div className="card-body custom-card-action p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">제품명</th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('total_articles')}
                  >
                    총 기사
                    {sortField === 'total_articles' && (
                      <i className={`feather-${sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'} ms-1`}></i>
                    )}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('competitor_mentions_count')}
                  >
                    경쟁사 언급
                    {sortField === 'competitor_mentions_count' && (
                      <i className={`feather-${sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'} ms-1`}></i>
                    )}
                  </th>
                  <th>주요 경쟁사</th>
                  <th>상세 언급 내역</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => {
                  const competitorMentions = parseCompetitorMentions(item.competitor_mentions_detail)
                  
                  return (
                    <tr key={index} className={item.isAsterasys ? 'table-primary' : ''}>
                      <td className="ps-4">
                        <div className={`fw-semibold ${item.isAsterasys ? 'text-primary' : 'text-dark'}`}>
                          {item.product_name}
                          {item.isAsterasys && (
                            <span className="ms-2 badge bg-primary text-white border-0 fs-10">
                              Asterasys
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">
                          {item.total_articles.toLocaleString()}건
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">
                          {item.competitor_mentions_count}회
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-soft-warning text-warning border-0">
                          {item.top_competitor_mentioned}
                        </span>
                      </td>
                      <td>
                        <div className="competitor-mentions">
                          {competitorMentions.slice(0, 3).map((mention, mIndex) => (
                            <span key={mIndex} className="badge bg-soft-secondary text-secondary me-1 mb-1 fs-10">
                              {mention.name}({mention.count})
                            </span>
                          ))}
                          {competitorMentions.length > 3 && (
                            <span className="fs-10 text-muted">+{competitorMentions.length - 3}개</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="card-footer">
            <div className="row g-3 text-center">
              <div className="col-md-3">
                <div className="fs-11 text-muted">총 경쟁 관계</div>
                <div className="fw-bold text-dark">
                  {data.competitorAnalysis.reduce((sum, item) => sum + item.competitor_mentions_count, 0)}회
                </div>
              </div>
              <div className="col-md-3">
                <div className="fs-11 text-muted">Asterasys 언급률</div>
                <div className="fw-bold text-primary">
                  {data.competitorAnalysis.filter(item => item.isAsterasys).length > 0 ? 
                    (data.competitorAnalysis
                      .filter(item => item.isAsterasys)
                      .reduce((sum, item) => sum + item.competitor_mentions_count, 0) /
                     data.competitorAnalysis
                      .reduce((sum, item) => sum + item.competitor_mentions_count, 0) * 100
                    ).toFixed(1) + '%' : '0%'
                  }
                </div>
              </div>
              <div className="col-md-3">
                <div className="fs-11 text-muted">최다 언급 제품</div>
                <div className="fw-bold text-warning">
                  {data.competitorAnalysis
                    .sort((a, b) => b.competitor_mentions_count - a.competitor_mentions_count)[0]?.product_name || 'N/A'
                  }
                </div>
              </div>
              <div className="col-md-3">
                <div className="fs-11 text-muted">경쟁 집중도</div>
                <div className="fw-bold text-info">
                  {(data.competitorAnalysis.filter(item => item.competitor_mentions_count > 5).length / 
                    data.competitorAnalysis.length * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsCompetitorAnalysisTable