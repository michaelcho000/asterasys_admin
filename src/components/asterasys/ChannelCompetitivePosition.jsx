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

        // Calculate metrics for each channel
        const channels = [
          {
            name: '카페',
            position: '강점',
            score: 85,
            data: {
              asterasys: (cafeData.marketData || [])
                .filter(item => asterasysKeywords.includes(item.키워드))
                .reduce((sum, item) => sum + parseInt(item['총 발행량'] || 0), 0),
              average: 400,
              leader: 800
            },
            engagement: 4.08,
            strategy: '현재 전략 유지 + 자연 바이럴 증가',
            color: 'success',
            icon: 'feather-message-circle'
          },
          {
            name: '블로그',
            position: '성장 기회',
            score: 38,
            data: {
              asterasys: (blogData.marketData || [])
                .filter(item => asterasysKeywords.includes(item.키워드))
                .reduce((sum, item) => sum + parseInt(item['발행량합'] || 0), 0),
              average: 300,
              leader: 941
            },
            engagement: 3.9,
            strategy: '3배 증량 (114건 → 300건)',
            color: 'warning',
            icon: 'feather-edit-3'
          },
          {
            name: '뉴스',
            position: '최대 약점',
            score: 14,
            data: {
              asterasys: (newsData.marketData || [])
                .filter(item => asterasysKeywords.includes(item.키워드))
                .reduce((sum, item) => sum + parseInt(item['총 발행량'] || 0), 0),
              average: 60,
              leader: 198
            },
            engagement: 3.5,
            strategy: '병원 네트워크 구축 (28건 → 50건)',
            color: 'danger',
            icon: 'feather-file-text'
          },
          {
            name: '유튜브',
            position: '미개척',
            score: 0,
            data: {
              asterasys: (youtubeData.marketData || [])
                .filter(item => asterasysKeywords.includes(item.키워드))
                .reduce((sum, item) => sum + parseInt(item['총 발행량'] || 0), 0),
              average: 50,
              leader: 200
            },
            engagement: 3.8,
            strategy: '브랜드 채널 론칭 필수',
            color: 'info',
            icon: 'feather-youtube'
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
            categories: ['우리', '평균', '리더'],
            labels: {
              style: {
                fontSize: '11px'
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
                    <span className="fs-11 fw-bold text-dark">{channel.score}점</span>
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
                      name: '발행량',
                      data: [
                        channel.data.asterasys,
                        channel.data.average,
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
                    <span className="fs-11 text-muted">우리</span>
                    <span className="fs-11 fw-bold text-dark">{channel.data.asterasys.toLocaleString()}건</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fs-11 text-muted">평균</span>
                    <span className="fs-11 fw-semibold">{channel.data.average.toLocaleString()}건</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="fs-11 text-muted">리더</span>
                    <span className="fs-11 fw-semibold">{channel.data.leader.toLocaleString()}건</span>
                  </div>
                </div>

                {/* Engagement */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="fs-11 text-muted">참여도</span>
                    <span className={`badge bg-soft-${channel.color} text-${channel.color} fs-11`}>
                      {channel.engagement}
                    </span>
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