'use client'
import React, { useState, useEffect } from 'react'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const NewsAnalysisKPICards = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
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
        
        // Validate data structure
        if (!result || !result.summary) {
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

  if (loading || !data || !data.summary) {
    return (
      <>
        <div className="col-xxl-3 col-lg-6">
          <CardLoader />
        </div>
        <div className="col-xxl-3 col-lg-6">
          <CardLoader />
        </div>
        <div className="col-xxl-3 col-lg-6">
          <CardLoader />
        </div>
        <div className="col-xxl-3 col-lg-6">
          <CardLoader />
        </div>
      </>
    )
  }

  const kpiCards = [
    {
      title: "총 뉴스 기사",
      value: data.summary.totalArticles,
      suffix: "건",
      trend: "+12.5%",
      trendType: "up",
      icon: "fi fi-rr-newspaper",
      color: "primary"
    },
    {
      title: "Asterasys 기사",
      value: data.summary.asterasysArticles,
      suffix: "건",
      trend: "+8.3%",
      trendType: "up", 
      icon: "fi fi-rr-star",
      color: "success"
    },
    {
      title: "시장 점유율",
      value: data.summary.marketShare,
      suffix: "%",
      trend: "+2.1%",
      trendType: "up",
      icon: "fi fi-rr-chart-pie",
      color: "warning"
    },
    {
      title: "평균 마케팅 점수",
      value: data.summary.averageMarketingScore,
      suffix: "점",
      trend: "+5.7%",
      trendType: "up",
      icon: "fi fi-rr-target",
      color: "info"
    }
  ]

  return (
    <>
      {kpiCards.map((card, index) => (
        <div key={index} className="col-xxl-3 col-lg-6">
          <div className="card stretch stretch-full">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-4">
                <div className="content-area">
                  <h4 className="fw-bold mb-2 text-dark">
                    {card.value}
                    <small className="fs-13 fw-medium text-muted ms-1">
                      {card.suffix}
                    </small>
                  </h4>
                  <p className="fs-12 fw-medium text-muted mb-0">
                    {card.title}
                  </p>
                </div>
                <div className={`avatar-text avatar-md rounded bg-${card.color} text-white`}>
                  <i className={card.icon}></i>
                </div>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div className={`badge bg-soft-${card.trendType === 'up' ? 'success' : 'danger'} text-${card.trendType === 'up' ? 'success' : 'danger'} border-0`}>
                  <i className={`feather-${card.trendType === 'up' ? 'trending-up' : 'trending-down'} me-1`}></i>
                  {card.trend}
                </div>
                <span className="fs-12 text-muted">vs last month</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default NewsAnalysisKPICards
