'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const ChannelCompetitivePosition = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [loading, setLoading] = useState(true)
  const [channelsData, setChannelsData] = useState([])

  useEffect(() => {
    if (!month) return

    const fetchChannelData = async () => {
      try {
        setLoading(true)

        // Load channel data
        const [blogRes, cafeRes, newsRes, youtubeRes] = await Promise.all([
          fetch(withMonthParam('/api/data/files/blog_rank', month)),
          fetch(withMonthParam('/api/data/files/cafe_rank', month)),
          fetch(withMonthParam('/api/data/files/news_rank', month)),
          fetch(withMonthParam('/api/data/files/youtube_rank', month))
        ])

        const [blogData, cafeData, newsData, youtubeData] = await Promise.all([
          blogRes.json(),
          cafeRes.json(),
          newsRes.json(),
          youtubeRes.json()
        ])

        const asterasysKeywords = ['쿨페이즈', '리프테라', '쿨소닉']
        const competitorKeywords = ['덴서티', '세르프', '올리지오', '볼뉴머', '텐써마']
        const leaderKeywords = ['울쎄라', '슈링크', '써마지', '인모드']

        // CAFE CHANNEL ANALYSIS
        const asterasysCafe = (cafeData.marketData || []).filter(item => asterasysKeywords.includes(item.키워드))

        const asterasysCafeData = asterasysCafe.map(item => parseInt(item['총 발행량'] || 0))
        const asterasysCafeAvg = asterasysCafeData.length > 0
          ? Math.round(asterasysCafeData.reduce((sum, val) => sum + val, 0) / asterasysCafeData.length)
          : 0

        const competitorCafeData = competitorKeywords.map(keyword => {
          const data = (cafeData.marketData || []).find(item => item.키워드 === keyword)
          return parseInt(data?.['총 발행량'] || 0)
        })
        const competitorCafeAvg = competitorCafeData.length > 0
          ? Math.round(competitorCafeData.reduce((sum, val) => sum + val, 0) / competitorCafeData.length)
          : 0

        const leaderCafeData = leaderKeywords.map(keyword => {
          const data = (cafeData.marketData || []).find(item => item.키워드 === keyword)
          return parseInt(data?.['총 발행량'] || 0)
        })
        const leaderCafeAvg = leaderCafeData.length > 0
          ? Math.round(leaderCafeData.reduce((sum, val) => sum + val, 0) / leaderCafeData.length)
          : 0

        // BLOG CHANNEL ANALYSIS
        const asterasysBlog = (blogData.marketData || []).filter(item => asterasysKeywords.includes(item.키워드))

        const asterasysBlogData = asterasysKeywords.map(keyword => {
          const keywordData = (blogData.marketData || []).filter(item => item.키워드 === keyword)
          return keywordData.reduce((sum, item) => {
            const value = String(item['발행량합'] || '0').replace(/,/g, '')
            return sum + parseInt(value || 0)
          }, 0)
        })
        const asterasysBlogAvg = asterasysBlogData.length > 0
          ? Math.round(asterasysBlogData.reduce((sum, val) => sum + val, 0) / asterasysBlogData.length)
          : 0

        const competitorBlogData = competitorKeywords.map(keyword => {
          const keywordData = (blogData.marketData || []).filter(item => item.키워드 === keyword)
          return keywordData.reduce((sum, item) => {
            const value = String(item['발행량합'] || '0').replace(/,/g, '')
            return sum + parseInt(value || 0)
          }, 0)
        })
        const competitorBlogAvg = competitorBlogData.length > 0
          ? Math.round(competitorBlogData.reduce((sum, val) => sum + val, 0) / competitorBlogData.length)
          : 0

        const leaderBlogData = leaderKeywords.map(keyword => {
          const keywordData = (blogData.marketData || []).filter(item => item.키워드 === keyword)
          return keywordData.reduce((sum, item) => {
            const value = String(item['발행량합'] || '0').replace(/,/g, '')
            return sum + parseInt(value || 0)
          }, 0)
        })
        const leaderBlogAvg = leaderBlogData.length > 0
          ? Math.round(leaderBlogData.reduce((sum, val) => sum + val, 0) / leaderBlogData.length)
          : 0

        // NEWS CHANNEL ANALYSIS
        const asterasysNewsData = asterasysKeywords.map(keyword => {
          const data = (newsData.marketData || []).find(item => item.키워드 === keyword)
          return parseInt(data?.['총 발행량'] || 0)
        })
        const asterasysNewsAvg = asterasysNewsData.length > 0
          ? Math.round(asterasysNewsData.reduce((sum, val) => sum + val, 0) / asterasysNewsData.length)
          : 0

        const competitorNewsData = competitorKeywords.map(keyword => {
          const data = (newsData.marketData || []).find(item => item.키워드 === keyword)
          return parseInt(data?.['총 발행량'] || 0)
        })
        const competitorNewsAvg = competitorNewsData.length > 0
          ? Math.round(competitorNewsData.reduce((sum, val) => sum + val, 0) / competitorNewsData.length)
          : 0

        const leaderNewsData = leaderKeywords.map(keyword => {
          const data = (newsData.marketData || []).find(item => item.키워드 === keyword)
          return parseInt(data?.['총 발행량'] || 0)
        })
        const leaderNewsAvg = leaderNewsData.length > 0
          ? Math.round(leaderNewsData.reduce((sum, val) => sum + val, 0) / leaderNewsData.length)
          : 0

        // YOUTUBE CHANNEL ANALYSIS
        const asterasysYoutubeData = asterasysKeywords.map(keyword => {
          const data = (youtubeData.marketData || []).find(item => item.키워드 === keyword)
          return parseInt(data?.['총 발행량'] || 0)
        })
        const asterasysYoutubeAvg = asterasysYoutubeData.length > 0
          ? Math.round(asterasysYoutubeData.reduce((sum, val) => sum + val, 0) / asterasysYoutubeData.length)
          : 0

        const competitorYoutubeData = competitorKeywords.map(keyword => {
          const data = (youtubeData.marketData || []).find(item => item.키워드 === keyword)
          return parseInt(data?.['총 발행량'] || 0)
        })
        const competitorYoutubeAvg = competitorYoutubeData.length > 0
          ? Math.round(competitorYoutubeData.reduce((sum, val) => sum + val, 0) / competitorYoutubeData.length)
          : 0

        const leaderYoutubeData = leaderKeywords.map(keyword => {
          const data = (youtubeData.marketData || []).find(item => item.키워드 === keyword)
          return parseInt(data?.['총 발행량'] || 0)
        })
        const leaderYoutubeAvg = leaderYoutubeData.length > 0
          ? Math.round(leaderYoutubeData.reduce((sum, val) => sum + val, 0) / leaderYoutubeData.length)
          : 0

        // Calculate competitive scores using weighted average (competitor 50% + leader 50%)
        // Cafe
        const cafeCompetitorScore = competitorCafeAvg > 0 ? Math.round((asterasysCafeAvg / competitorCafeAvg) * 100) : 0
        const cafeLeaderScore = leaderCafeAvg > 0 ? Math.round((asterasysCafeAvg / leaderCafeAvg) * 100) : 0
        const cafeRawScore = Math.round((cafeCompetitorScore * 0.5) + (cafeLeaderScore * 0.5))
        const cafeScore = Math.min(cafeRawScore, 100)

        // Blog
        const blogCompetitorScore = competitorBlogAvg > 0 ? Math.round((asterasysBlogAvg / competitorBlogAvg) * 100) : 0
        const blogLeaderScore = leaderBlogAvg > 0 ? Math.round((asterasysBlogAvg / leaderBlogAvg) * 100) : 0
        const blogRawScore = Math.round((blogCompetitorScore * 0.5) + (blogLeaderScore * 0.5))
        const blogScore = Math.min(blogRawScore, 100)

        // News
        const newsCompetitorScore = competitorNewsAvg > 0 ? Math.round((asterasysNewsAvg / competitorNewsAvg) * 100) : 0
        const newsLeaderScore = leaderNewsAvg > 0 ? Math.round((asterasysNewsAvg / leaderNewsAvg) * 100) : 0
        const newsRawScore = Math.round((newsCompetitorScore * 0.5) + (newsLeaderScore * 0.5))
        const newsScore = Math.min(newsRawScore, 100)

        // YouTube
        const youtubeCompetitorScore = competitorYoutubeAvg > 0 ? Math.round((asterasysYoutubeAvg / competitorYoutubeAvg) * 100) : 0
        const youtubeLeaderScore = leaderYoutubeAvg > 0 ? Math.round((asterasysYoutubeAvg / leaderYoutubeAvg) * 100) : 0
        const youtubeRawScore = Math.round((youtubeCompetitorScore * 0.5) + (youtubeLeaderScore * 0.5))
        const youtubeScore = Math.min(youtubeRawScore, 100)

        // Determine position and strategy based on score
        const getPositionAndStrategy = (score, rawScore, channel, asterasysAvg, competitorAvg, leaderAvg) => {
          if (score >= 80) {
            const ratio = (asterasysAvg / competitorAvg).toFixed(1)
            const vsLeader = asterasysAvg >= leaderAvg
              ? '리더 포지션'
              : `리더 그룹 평균(${leaderAvg}건) 대비 ${Math.round((asterasysAvg/leaderAvg)*100)}%`
            return {
              position: '강점',
              color: 'success',
              strategy: `경쟁 그룹의 ${ratio}배 (${asterasysAvg}건 vs ${competitorAvg}건) · ${vsLeader}`,
              rawScore
            }
          } else if (score >= 50) {
            return {
              position: '경쟁력 확보',
              color: 'info',
              strategy: `현재 수준 유지 및 점진적 확대 (${asterasysAvg}건 → ${competitorAvg + 50}건)`,
              rawScore
            }
          } else if (score >= 25) {
            return {
              position: '성장 필요',
              color: 'warning',
              strategy: `2배 증량 목표 (${asterasysAvg}건 → ${Math.round(competitorAvg * 2)}건)`,
              rawScore
            }
          } else {
            return {
              position: '전략 재검토',
              color: 'danger',
              strategy: `집중 투자 필요 (${asterasysAvg}건 → ${Math.round(competitorAvg * 0.8)}건)`,
              rawScore
            }
          }
        }

        const cafePosition = getPositionAndStrategy(cafeScore, cafeRawScore, '카페', asterasysCafeAvg, competitorCafeAvg, leaderCafeAvg)
        const blogPosition = getPositionAndStrategy(blogScore, blogRawScore, '블로그', asterasysBlogAvg, competitorBlogAvg, leaderBlogAvg)
        const newsPosition = getPositionAndStrategy(newsScore, newsRawScore, '뉴스', asterasysNewsAvg, competitorNewsAvg, leaderNewsAvg)
        const youtubePosition = getPositionAndStrategy(youtubeScore, youtubeRawScore, '유튜브', asterasysYoutubeAvg, competitorYoutubeAvg, leaderYoutubeAvg)

        // Calculate metrics for each channel
        const channels = [
          {
            name: '카페',
            position: cafePosition.position,
            score: cafeScore,
            data: {
              asterasys: asterasysCafeAvg,
              competitor: competitorCafeAvg,
              leader: leaderCafeAvg
            },
            strategy: cafePosition.strategy,
            color: cafePosition.color,
            icon: 'feather-message-circle',
            rawScore: cafePosition.rawScore
          },
          {
            name: '블로그',
            position: blogPosition.position,
            score: blogScore,
            data: {
              asterasys: asterasysBlogAvg,
              competitor: competitorBlogAvg,
              leader: leaderBlogAvg
            },
            strategy: blogPosition.strategy,
            color: blogPosition.color,
            icon: 'feather-edit-3',
            rawScore: blogPosition.rawScore
          },
          {
            name: '뉴스',
            position: newsPosition.position,
            score: newsScore,
            data: {
              asterasys: asterasysNewsAvg,
              competitor: competitorNewsAvg,
              leader: leaderNewsAvg
            },
            strategy: newsPosition.strategy,
            color: newsPosition.color,
            icon: 'feather-file-text',
            rawScore: newsPosition.rawScore
          },
          {
            name: '유튜브',
            position: youtubePosition.position,
            score: youtubeScore,
            data: {
              asterasys: asterasysYoutubeAvg,
              competitor: competitorYoutubeAvg,
              leader: leaderYoutubeAvg
            },
            strategy: youtubePosition.strategy,
            color: youtubePosition.color,
            icon: 'feather-youtube',
            rawScore: youtubePosition.rawScore
          }
        ]

        setChannelsData(channels)
      } catch (error) {
        console.error('채널 경쟁 포지션 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChannelData()
  }, [month])

  const getPositionBadgeClass = (position) => {
    switch (position) {
      case '강점':
        return 'bg-success'
      case '성장 기회':
        return 'bg-warning'
      case '최대 약점':
        return 'bg-danger'
      case '미개척':
        return 'bg-info'
      default:
        return 'bg-secondary'
    }
  }

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-md-3">
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
      {channelsData.map((channel, index) => {
        const chartOptions = {
          chart: {
            type: 'bar',
            toolbar: {
              show: false
            },
            sparkline: {
              enabled: false
            }
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '60%',
              distributed: true
            }
          },
          colors: ['#3b82f6', '#94a3b8', '#10b981'],
          dataLabels: {
            enabled: false
          },
          xaxis: {
            categories: ['아스테라시스', '경쟁 그룹 평균', '리더 그룹 평균'],
            labels: {
              style: {
                fontSize: '10px'
              }
            }
          },
          yaxis: {
            labels: {
              formatter: (val) => val.toFixed(0)
            }
          },
          legend: {
            show: false
          },
          tooltip: {
            y: {
              formatter: (val) => val.toLocaleString() + '건'
            }
          }
        }

        return (
          <div key={index} className="col-md-3">
            <div className={`card stretch stretch-full border-${channel.color}`}>
              <div className="card-body">
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h6 className="fs-13 fw-bold mb-1">{channel.name}</h6>
                  </div>
                  <div>
                    <span className={`badge ${getPositionBadgeClass(channel.position)} text-white fs-11`}>
                      {channel.position}
                    </span>
                  </div>
                </div>

                {/* Score Progress */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fs-11 text-muted">경쟁력 점수</span>
                    <span className="fs-11 fw-bold text-dark">
                      {channel.score}점
                      {channel.rawScore && channel.rawScore > 100 && (
                        <span className="text-muted ms-1">({channel.rawScore})</span>
                      )}
                    </span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar bg-${channel.color}`}
                      style={{ width: `${channel.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Chart */}
                <div className="mb-3">
                  <Chart
                    options={chartOptions}
                    series={[{
                      name: '발행량 평균',
                      data: [
                        channel.data.asterasys,
                        channel.data.competitor,
                        channel.data.leader
                      ]
                    }]}
                    type="bar"
                    height={150}
                  />
                </div>

                {/* Stats */}
                <div className="mb-3 pb-3 border-bottom">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fs-11 text-muted">아스테라시스 평균</span>
                    <span className="fs-11 fw-bold text-dark">{channel.data.asterasys.toLocaleString()}건</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fs-11 text-muted">경쟁 그룹 평균</span>
                    <span className="fs-11 fw-semibold">{channel.data.competitor.toLocaleString()}건</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="fs-11 text-muted">리더 그룹 평균</span>
                    <span className="fs-11 fw-semibold">{channel.data.leader.toLocaleString()}건</span>
                  </div>
                </div>

                {/* Strategy */}
                <div>
                  <p className="fs-12 text-muted mb-0">
                    <i className="feather-target me-1"></i>
                    {channel.strategy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default ChannelCompetitivePosition