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
            rawScore: cafePosition.rawScore,
            insight: '8월 카페 마케팅은 쿨페이즈(789건, 5,255댓글)가 고주파 2위, 쿨소닉(605건, 4,275댓글)이 초음파 2위로 강력한 입지를 보였으나, 9월에는 쿨페이즈(598건, -24.2%), 리프테라(430건, -14.5%), 쿨소닉(522건, -13.7%)로 모두 하락했습니다. 경쟁사인 써마지는 8월 1,258건에서 9월 1,702건(+35.3%)으로 급증하며 1위를 공고히 했고, 울쎄라도 1,321건에서 2,369건(+79.3%)으로 폭발적 성장을 보였습니다. 여우야, 여생남정 카페 외 재잘재잘, 성형위키백과로 카페 다각화가 필요하며, 써마지/울쎄라의 리프팅 효과 비교 후기 콘텐츠에 대응하는 쿨페이즈 vs 써마지 실제 사용자 비교, 리프테라 vs 울쎄라 통증/회복 차이 콘텐츠를 집중 투입해야 합니다.'
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
            rawScore: blogPosition.rawScore,
            insight: '8월 블로그는 쿨페이즈(101건, 9위), 리프테라(176건, 6위)로 중하위권이었고, 9월에는 쿨페이즈(132건, +30.7%로 증가했으나 여전히 9위)로 순위 변동이 없었습니다. 경쟁사 분석 시 덴서티는 메디컬 웰니스 저널(8월 16건→9월 27건)과 닥터에버스 계열 블로그를 활용해 전문성 있는 병원블로그 마케팅을 강화했고, 올리지오는 닥터에버스 계열(8월 37건→9월 118건)로 폭발적 증가를 보였습니다. 유어힐의원, 더블에이의원 외에 협력 병원을 10개 이상 확보해 병원블로그 발행량을 월 200건 이상으로 늘리고, 쿨페이즈 시술 후기, 리프테라 효과 지속기간 등 롱테일 키워드 중심의 플레이스블로그 콘텐츠를 강화해야 합니다.'
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
            rawScore: newsPosition.rawScore,
            insight: '8월 뉴스는 쿨페이즈(12건, 8위), 쿨소닉(12건, 5위), 리프테라(4건, 6위)로 극히 낮은 노출을 보였고, 9월에도 쿨페이즈(12건, 9위), 쿨소닉(11건, 4위), 리프테라(6건, 6위)로 개선되지 않았습니다. 반면 볼뉴머는 8월 71건(캠페인 강도 HIGH, 74.6% 기업소식)에서 9월 38건으로 감소했지만 여전히 상위권이며, 슈링크는 8월 33건에서 9월 200건(+506%)으로 급증하며 병원발행 중심의 B2B PR을 강화했습니다. 월 1회 이상 쿨페이즈 신규 병원 도입, 리프테라 시술 건수 돌파, 쿨소닉 기술 업데이트 등 기업소식 보도자료를 배포하고, 의학 전문가 추천, 피부과 트렌드 각도의 전문 기사로 신뢰도를 높여야 합니다.'
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
            rawScore: youtubePosition.rawScore,
            insight: '8월 YouTube는 쿨페이즈(2건), 리프테라(7건), 쿨소닉(65건)으로 경쟁사 대비 심각하게 낮았으며, 9월에는 쿨페이즈(62건, +3,000%), 리프테라(203건, +2,800%), 쿨소닉(65건, 유지)로 폭발적 증가를 보였습니다. 그러나 여전히 써마지(8월 1,010건→9월 457건), 덴서티(8월 355건→9월 245건), 인모드(8월 306건→9월 200건) 대비 낮은 수준입니다. 스위츠, 비본영, 리마인드, 유어힐 외에 인플루언서 협력을 확대하고, 쿨페이즈 500샷 실제 효과, 리프테라 vs 울쎄라 통증 비교, 쿨소닉 시술 과정 전격 공개 등 실사용자 관점의 롱폼 콘텐츠(10분 이상)를 월 10개 이상 제작해야 합니다.'
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
                <div className="mb-3">
                  <p className="fs-12 text-muted mb-0">
                    <i className="feather-target me-1"></i>
                    {channel.strategy}
                  </p>
                </div>

                {/* Channel Insights */}
                {channel.insight && (
                  <div className="mt-3 pt-3 border-top">
                    <div className="d-flex align-items-start">
                      <i className="feather-info fs-14 text-info me-2 mt-1"></i>
                      <p className="fs-11 text-dark mb-0" style={{ lineHeight: '1.6' }}>
                        {channel.insight}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default ChannelCompetitivePosition