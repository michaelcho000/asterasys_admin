'use client'
import React, { useState, useEffect } from 'react'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const NewsExecutiveKPICards = () => {
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
        {[...Array(5)].map((_, index) => (
          <div key={index} className="col-xl col-md-4 col-sm-6">
            <CardLoader />
          </div>
        ))}
      </>
    )
  }

  const kpiCards = [
    {
      title: "총 시장 볼륨",
      value: data.summary.totalArticles,
      suffix: "건",
      trend: "+12.5%",
      trendType: "up",
      icon: "fi fi-rr-trending-up",
      color: "primary",
      subtitle: `${data.summary.totalProducts}개 제품 분석`
    },
    {
      title: "Asterasys 시장 점유율",
      value: data.summary.marketShare,
      suffix: "%",
      trend: "+2.1%",
      trendType: "up", 
      icon: "fi fi-rr-target",
      color: "info",
      subtitle: `${data.summary.asterasysArticles}건 기사`
    },
    {
      title: "캠페인 활성 제품",
      value: data.campaignIntensity.HIGH?.length + data.campaignIntensity.MEDIUM?.length || 0,
      suffix: "개",
      trend: "+5.2%",
      trendType: "up",
      icon: "fi fi-rr-rocket-lunch",
      color: "warning",
      subtitle: "HIGH/MEDIUM 강도"
    },
    {
      title: "최고 성과 기록",
      value: data.summary.peakArticles,
      suffix: "건",
      trend: data.summary.peakProduct,
      trendType: "info",
      icon: "fi fi-rr-chart-line-up",
      color: "success",
      subtitle: "단일 피크 기록"
    },
    {
      title: "셀럽 연계 제품",
      value: data.summary.celebrityProductsCount,
      suffix: "개",
      trend: "4명 활용",
      trendType: "up",
      icon: "fi fi-rr-star",
      color: "danger",
      subtitle: "영향력 마케팅"
    }
  ]

  return (
    <>
      {kpiCards.map((card, index) => (
        <div key={index} className="col-xl col-md-4 col-sm-6">
          <div className="card stretch stretch-full">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="content-area">
                  <h3 className="fw-bold mb-1 text-dark">
                    {card.value}
                    <small className="fs-12 fw-medium text-muted ms-1">
                      {card.suffix}
                    </small>
                  </h3>
                  <p className="fs-11 fw-semibold text-dark mb-1">
                    {card.title}
                  </p>
                  <p className="fs-10 text-muted mb-0">
                    {card.subtitle}
                  </p>
                </div>
                <div className={`avatar-text avatar-lg rounded bg-soft-${card.color} text-${card.color}`}>
                  <i className={card.icon}></i>
                </div>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div className={`badge bg-soft-${card.trendType === 'up' ? 'success' : card.trendType === 'info' ? 'info' : 'danger'} text-${card.trendType === 'up' ? 'success' : card.trendType === 'info' ? 'info' : 'danger'} border-0 fs-10`}>
                  {card.trendType === 'up' && <i className="feather-trending-up me-1"></i>}
                  {card.trendType === 'info' && <i className="feather-info me-1"></i>}
                  {card.trend}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default NewsExecutiveKPICards
