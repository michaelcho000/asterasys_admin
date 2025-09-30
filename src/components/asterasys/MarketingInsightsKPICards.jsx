'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { FiTrendingUp, FiTrendingDown, FiEye, FiMessageCircle, FiPieChart, FiUsers } from 'react-icons/fi'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const MarketingInsightsKPICards = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [kpiData, setKpiData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!month) return

    const fetchKPIData = async () => {
      try {
        setLoading(true)

        // Check if current month is August 2025 (first data month)
        const isFirstMonth = month === '2025-08'

        // Load current month data
        const [blogRes, cafeRes, newsRes, youtubeRes, trafficRes] = await Promise.all([
          fetch(withMonthParam('/api/data/files/blog_rank', month)),
          fetch(withMonthParam('/api/data/files/cafe_rank', month)),
          fetch(withMonthParam('/api/data/files/news_rank', month)),
          fetch(withMonthParam('/api/data/files/youtube_rank', month)),
          fetch(withMonthParam('/api/data/files/traffic', month))
        ])

        const [blogData, cafeData, newsData, youtubeData, trafficData] = await Promise.all([
          blogRes.json(),
          cafeRes.json(),
          newsRes.json(),
          youtubeRes.json(),
          trafficRes.json()
        ])

        // Load previous month data if not first month
        let prevBlogData, prevCafeData, prevNewsData, prevYoutubeData, prevTrafficData
        if (!isFirstMonth) {
          const prevMonth = getPreviousMonth(month)
          const [prevBlogRes, prevCafeRes, prevNewsRes, prevYoutubeRes, prevTrafficRes] = await Promise.all([
            fetch(withMonthParam('/api/data/files/blog_rank', prevMonth)),
            fetch(withMonthParam('/api/data/files/cafe_rank', prevMonth)),
            fetch(withMonthParam('/api/data/files/news_rank', prevMonth)),
            fetch(withMonthParam('/api/data/files/youtube_rank', prevMonth)),
            fetch(withMonthParam('/api/data/files/traffic', prevMonth))
          ])

          const prevDataArray = await Promise.all([
            prevBlogRes.json(),
            prevCafeRes.json(),
            prevNewsRes.json(),
            prevYoutubeRes.json(),
            prevTrafficRes.json()
          ])

          prevBlogData = prevDataArray[0]
          prevCafeData = prevDataArray[1]
          prevNewsData = prevDataArray[2]
          prevYoutubeData = prevDataArray[3]
          prevTrafficData = prevDataArray[4]
        }

        // Calculate brand exposure KPIs
        const asterasysKeywords = ['쿨페이즈', '리프테라', '쿨소닉']

        // Total publications
        const blogPubs = (blogData.marketData || [])
          .filter(item => asterasysKeywords.includes(item.키워드))
          .reduce((sum, item) => sum + parseInt(item['발행량합'] || 0), 0)

        const cafePubs = (cafeData.marketData || [])
          .filter(item => asterasysKeywords.includes(item.키워드))
          .reduce((sum, item) => sum + parseInt(item['총 발행량'] || 0), 0)

        const newsPubs = (newsData.marketData || [])
          .filter(item => asterasysKeywords.includes(item.키워드))
          .reduce((sum, item) => sum + parseInt(item['총 발행량'] || 0), 0)

        const youtubePubs = (youtubeData.marketData || [])
          .filter(item => asterasysKeywords.includes(item.키워드))
          .reduce((sum, item) => sum + parseInt(item['총 발행량'] || 0), 0)

        const totalPublications = blogPubs + cafePubs + newsPubs + youtubePubs

        // Calculate previous month metrics if not first month
        let prevTotalPublications = 0
        let prevDominantChannelPercent = 0
        let prevMarketShare = 0
        let prevBrandEngagement = 0

        if (!isFirstMonth) {
          const prevBlogPubs = (prevBlogData.marketData || [])
            .filter(item => asterasysKeywords.includes(item.키워드))
            .reduce((sum, item) => sum + parseInt(item['발행량합'] || 0), 0)

          const prevCafePubs = (prevCafeData.marketData || [])
            .filter(item => asterasysKeywords.includes(item.키워드))
            .reduce((sum, item) => sum + parseInt(item['총 발행량'] || 0), 0)

          const prevNewsPubs = (prevNewsData.marketData || [])
            .filter(item => asterasysKeywords.includes(item.키워드))
            .reduce((sum, item) => sum + parseInt(item['총 발행량'] || 0), 0)

          const prevYoutubePubs = (prevYoutubeData.marketData || [])
            .filter(item => asterasysKeywords.includes(item.키워드))
            .reduce((sum, item) => sum + parseInt(item['총 발행량'] || 0), 0)

          prevTotalPublications = prevBlogPubs + prevCafePubs + prevNewsPubs + prevYoutubePubs

          const prevChannelPubs = {
            cafe: prevCafePubs,
            youtube: prevYoutubePubs,
            news: prevNewsPubs,
            blog: prevBlogPubs
          }
          const prevDominantChannel = Object.entries(prevChannelPubs).reduce((max, [key, val]) =>
            val > max.value ? { name: key, value: val } : max,
            { name: '', value: 0 }
          )
          prevDominantChannelPercent = ((prevDominantChannel.value / prevTotalPublications) * 100)

          const prevTotalMarketPubs = [
            ...(prevBlogData.marketData || []),
            ...(prevCafeData.marketData || []),
            ...(prevNewsData.marketData || []),
            ...(prevYoutubeData.marketData || [])
          ].reduce((sum, item) => {
            const pubs = parseInt(item['총 발행량'] || item['발행량합'] || 0)
            return sum + pubs
          }, 0)
          prevMarketShare = ((prevTotalPublications / prevTotalMarketPubs) * 100)

          const prevTotalComments = (prevCafeData.marketData || [])
            .filter(item => asterasysKeywords.includes(item.키워드))
            .reduce((sum, item) => sum + parseInt(item['총 댓글수']?.replace(/,/g, '') || 0), 0)
          prevBrandEngagement = (prevTotalComments / prevTotalPublications)
        }

        // Dominant channel (cafe)
        const channelPubs = {
          cafe: cafePubs,
          youtube: youtubePubs,
          news: newsPubs,
          blog: blogPubs
        }
        const dominantChannel = Object.entries(channelPubs).reduce((max, [key, val]) =>
          val > max.value ? { name: key, value: val } : max,
          { name: '', value: 0 }
        )
        const dominantChannelPercent = ((dominantChannel.value / totalPublications) * 100).toFixed(1)

        // Market share
        const totalMarketPubs = [
          ...(blogData.marketData || []),
          ...(cafeData.marketData || []),
          ...(newsData.marketData || []),
          ...(youtubeData.marketData || [])
        ].reduce((sum, item) => {
          const pubs = parseInt(item['총 발행량'] || item['발행량합'] || 0)
          return sum + pubs
        }, 0)

        const marketShare = ((totalPublications / totalMarketPubs) * 100).toFixed(1)

        // Brand engagement (participation rate)
        const cafeComments = (cafeData.marketData || [])
          .filter(item => asterasysKeywords.includes(item.키워드))
          .reduce((sum, item) => sum + parseInt(item['총 댓글수']?.replace(/,/g, '') || 0), 0)

        const brandEngagement = cafePubs > 0 ? (cafeComments / cafePubs).toFixed(2) : 0

        // Industry average engagement (for comparison)
        const industryAvgEngagement = 3.62

        // Calculate changes if not first month
        const calculateChange = (current, previous) => {
          if (previous === 0) return { change: '0%', trend: 'neutral' }
          const diff = ((current - previous) / previous) * 100
          return {
            change: (diff > 0 ? '+' : '') + diff.toFixed(1) + '%',
            trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral'
          }
        }

        const pubsChange = !isFirstMonth ? calculateChange(totalPublications, prevTotalPublications) : null
        const channelChange = !isFirstMonth ? calculateChange(parseFloat(dominantChannelPercent), prevDominantChannelPercent) : null
        const shareChange = !isFirstMonth ? calculateChange(parseFloat(marketShare), prevMarketShare) : null
        const engagementChange = !isFirstMonth ? calculateChange(parseFloat(brandEngagement), prevBrandEngagement) : null

        const kpis = [
          {
            id: 1,
            title: '총 브랜드 노출',
            value: totalPublications.toLocaleString() + '건',
            change: pubsChange?.change,
            trend: pubsChange?.trend,
            context: '전체 발행량 (블로그+카페+뉴스+유튜브)',
            icon: FiEye,
            color: 'primary'
          },
          {
            id: 2,
            title: '최고 채널 도달률',
            value: dominantChannelPercent + '%',
            change: channelChange?.change,
            trend: channelChange?.trend,
            context: `${dominantChannel.name === 'cafe' ? '카페' : dominantChannel.name} 채널 점유율`,
            icon: FiMessageCircle,
            color: 'success'
          },
          {
            id: 3,
            title: '시장 점유율',
            value: marketShare + '%',
            change: shareChange?.change,
            trend: shareChange?.trend,
            context: '18개 브랜드 중 발행량 기준',
            icon: FiPieChart,
            color: 'warning'
          },
          {
            id: 4,
            title: '브랜드 참여도',
            value: brandEngagement,
            change: engagementChange?.change,
            trend: engagementChange?.trend,
            context: `업계 평균 ${industryAvgEngagement} 대비`,
            icon: FiUsers,
            color: 'info'
          }
        ]

        setKpiData(kpis)
      } catch (error) {
        console.error('마케팅 인사이트 KPI 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchKPIData()
  }, [month])

  // Helper function to get previous month string
  const getPreviousMonth = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    date.setMonth(date.getMonth() - 1)
    const prevYear = date.getFullYear()
    const prevMonth = String(date.getMonth() + 1).padStart(2, '0')
    return `${prevYear}-${prevMonth}`
  }

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-xxl-3 col-md-6">
            <div className="card stretch stretch-full">
              <CardLoader />
            </div>
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      {kpiData.map((kpi) => {
        const IconComponent = kpi.icon
        return (
          <div key={kpi.id} className="col-xxl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="hstack justify-content-between mb-4">
                  <div>
                    <h6 className="fw-bold text-uppercase mb-2 fs-11 text-muted">{kpi.title}</h6>
                    <h2 className="fs-3 fw-bold mb-0">{kpi.value}</h2>
                  </div>
                  <div>
                    <div className={`avatar-text avatar-lg bg-soft-${kpi.color} text-${kpi.color}`}>
                      <IconComponent size={24} />
                    </div>
                  </div>
                </div>
                {kpi.change && (
                  <div className="hstack gap-2 mb-3">
                    <span className="fs-11 text-muted">전월대비</span>
                    <span className={`badge ${kpi.trend === 'up' ? 'bg-success' : kpi.trend === 'down' ? 'bg-danger' : 'bg-secondary'} text-white fs-11`}>
                      {kpi.trend === 'up' && <FiTrendingUp className="me-1" />}
                      {kpi.trend === 'down' && <FiTrendingDown className="me-1" />}
                      {kpi.change}
                    </span>
                  </div>
                )}
                <p className="fs-12 text-muted mb-0">{kpi.context}</p>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default MarketingInsightsKPICards