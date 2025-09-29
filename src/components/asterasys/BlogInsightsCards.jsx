'use client'

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { FiMoreVertical } from 'react-icons/fi'
import getIcon from '@/utils/getIcon'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const BlogInsightsCards = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [overview, setOverview] = useState(null)
  const [activeProductKey, setActiveProductKey] = useState(null)

  useEffect(() => {
    if (!month) return

    const fetchOverview = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(withMonthParam('/api/data/blog-overview', month))
        if (!response.ok) {
          throw new Error('블로그 개요 데이터를 불러오지 못했습니다.')
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || '블로그 개요 응답이 유효하지 않습니다.')
        }

        setOverview(data)
      } catch (err) {
        console.error('Blog overview fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [month])

  const summary = overview?.summary
  const technologyBreakdown = overview?.technologyBreakdown || []
  const asterasysProducts = overview?.asterasys || []

  const kpiCards = useMemo(() => {
    if (!summary) return []

    const totalPosts = summary.totalPosts || 0
    const asterasysPosts = summary.asterasysPosts || 0
    const participationPercent = (summary.averageParticipation || 0) * 100
    const postsPerThousand = summary.postsPerThousandSearch || 0

    return [
      {
        id: 1,
        title: '블로그 발행량',
        value: totalPosts ? totalPosts.toLocaleString() : '--',
        context: `검색량 ${summary.searchVolume?.toLocaleString() || 0}건 대비`,
        progress: Math.min((asterasysPosts / Math.max(totalPosts, 1)) * 100, 100),
        progressLabel: `Asterasys ${asterasysPosts.toLocaleString()}건`,
        icon: 'feather-activity',
        color: 'primary'
      },
      {
        id: 2,
        title: 'Asterasys 점유율',
        value: `${(summary.asterasysShare || 0).toFixed(1)}%`,
        context: `${asterasysPosts.toLocaleString()}건 / 전체`,
        progress: Math.min(summary.asterasysShare || 0, 100),
        progressLabel: '시장 점유율',
        icon: 'feather-target',
        color: 'success'
      },
      {
        id: 3,
        title: '평균 참여도',
        value: `${participationPercent.toFixed(1)}%`,
        context: `댓글 ${summary.totalComments?.toLocaleString() || 0} · 대댓글 ${summary.totalReplies?.toLocaleString() || 0}`,
        progress: Math.min(participationPercent, 100),
        progressLabel: '댓글 + 대댓글 / 발행량',
        icon: 'feather-message-circle',
        color: 'warning'
      },
      {
        id: 4,
        title: '콘텐츠 생성 지수',
        value: postsPerThousand ? postsPerThousand.toFixed(1) : '--',
        context: '검색 1천건당 블로그 수',
        progress: Math.min(postsPerThousand * 4, 100),
        progressLabel: '검색 대비 생성 속도',
        icon: 'feather-trending-up',
        color: 'info'
      }
    ]
  }, [summary])

  const totalMarketPosts = summary?.totalPosts || 0

  const technologyMap = useMemo(() => {
    const map = new Map()
    technologyBreakdown.forEach((item) => {
      if (item?.technology) {
        map.set(item.technology, item)
      }
    })
    return map
  }, [technologyBreakdown])

  const activeProduct = useMemo(() => {
    if (!activeProductKey) return null
    return asterasysProducts.find((product) => product.keyword === activeProductKey) || null
  }, [activeProductKey, asterasysProducts])

  const chartOptions = useMemo(() => {
    if (!technologyBreakdown.length) return null

    const buildOptions = ({ labels, colors, centerLabel, centerValue }) => ({
      chart: {
        type: 'donut',
        height: 260
      },
      labels,
      legend: {
        position: 'bottom',
        fontSize: '12px'
      },
      colors,
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`
      },
      stroke: {
        width: 0
      },
      plotOptions: {
        pie: {
          donut: {
            size: '78%',
            labels: {
              show: true,
              name: {
                show: true,
                offsetY: -10,
                formatter: () => centerLabel,
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600
              },
              value: {
                show: true,
                offsetY: 10,
                formatter: () => `${centerValue.toFixed(1)}%`,
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: 700
              },
              total: {
                show: false
              }
            }
          }
        }
      }
    })

    if (activeProduct) {
      const technology = technologyMap.get(activeProduct.technology)
      const technologyPosts = technology?.posts || 0
      const productPosts = activeProduct.totalPosts || 0
      const rawShare = technologyPosts ? (productPosts / technologyPosts) * 100 : 0
      const share = Math.min(Math.max(rawShare, 0), 100)

      return {
        series: [Number(share.toFixed(1)), Number((100 - share).toFixed(1))],
        options: buildOptions({
          labels: [activeProduct.keyword, `${technology?.label || activeProduct.technology} 기타`],
          colors: ['#6366f1', '#e2e8f0'],
          centerLabel: `${activeProduct.keyword} (${technology?.label || activeProduct.technology})`,
          centerValue: share
        })
      }
    }

    const labels = technologyBreakdown.map((item) => item.label || item.technology)
    const series = technologyBreakdown.map((item) => Number((item.share || 0).toFixed(1)))
    const totalShare = series.reduce((acc, value) => acc + value, 0)

    return {
      series,
      options: buildOptions({
        labels,
        colors: ['#6366f1', '#0ea5e9', '#94a3b8'],
        centerLabel: '기술군 점유율',
        centerValue: totalShare || 100
      })
    }
  }, [technologyBreakdown, technologyMap, activeProduct])

  const chartRenderKey = useMemo(
    () => (activeProduct ? `product-${activeProduct.keyword}` : 'technology-overview'),
    [activeProduct]
  )

  useEffect(() => {
    setActiveProductKey(null)
  }, [month])

  const handleProductHighlight = (productKey) => {
    setActiveProductKey((prev) => (prev === productKey ? null : productKey))
  }

  if (error) {
    return (
      <div className='col-12'>
        <div className='card border-0 shadow-sm'>
          <div className='card-body text-danger fw-semibold'>{error}</div>
        </div>
      </div>
    )
  }

  if (loading && !summary) {
    return (
      <div className='col-12'>
        <div className='card border-0 shadow-sm'>
          <div className='card-body'>
            <CardLoader />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {kpiCards.map(({ id, title, value, icon, color, progress, context, progressLabel }) => (
        <div key={id} className='col-xxl-3 col-xl-3 col-lg-6 col-md-6'>
          <div className='card stretch stretch-full short-info-card'>
            <div className='card-body'>
              <div className='d-flex align-items-start justify-content-between mb-4'>
                <div className='d-flex gap-4 align-items-center'>
                  <div className={`avatar-text avatar-lg bg-${color}-subtle text-${color} icon`}>
                    {React.cloneElement(getIcon(icon), { size: '16' })}
                  </div>
                  <div>
                    <div className='fs-4 fw-bold text-dark'>
                      <span className='counter'>{value}</span>
                    </div>
                    <h3 className='fs-13 fw-semibold text-truncate-1-line'>{title}</h3>
                  </div>
                </div>
                <Link href='#' className='lh-1 text-muted'>
                  <FiMoreVertical className='fs-16' />
                </Link>
              </div>
              <div className='pt-4'>
                <div className='d-flex align-items-center justify-content-between mb-2'>
                  <span className='fs-12 fw-medium text-muted text-truncate-1-line'>{context}</span>
                </div>
                <div className='small text-muted mb-2'>{progressLabel}</div>
                <div className='progress mt-2 ht-3'>
                  <div className={`progress-bar bg-${color}`} role='progressbar' style={{ width: `${progress || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className='col-xxl-12'>
        <div className='card stretch stretch-full'>
          <div className='card-header d-flex align-items-center justify-content-between'>
            <div>
              <h5 className='card-title mb-1'>RF vs HIFU 점유 구조</h5>
              <p className='text-muted fs-12 mb-0'>전체 블로그 발행량 대비 기술군 비중과 Asterasys 위치</p>
            </div>
            <span className='badge bg-primary-subtle text-primary'>월간 {month}</span>
          </div>
          <div className='card-body'>
            <div className='row align-items-center'>
              <div className='col-lg-5 border-end border-light-subtle'>
                {loading && <CardLoader />}
                {!loading && chartOptions && (
                  <ReactApexChart
                    key={chartRenderKey}
                    options={chartOptions.options}
                    series={chartOptions.series}
                    type='donut'
                    height={260}
                  />
                )}
              </div>
              <div className='col-lg-7'>
                <div className='row g-3'>
                  {technologyBreakdown.map((item) => (
                    <div key={item.technology} className='col-12'>
                      <div className='d-flex justify-content-between align-items-center mb-1'>
                        <span className='fw-semibold text-dark'>{item.label || item.technology}</span>
                        <span className='text-muted'>
                          {item.posts?.toLocaleString() || '--'}건 · {item.share?.toFixed(1) || '0.0'}%
                        </span>
                      </div>
                      <div className='progress ht-4'>
                        <div
                          className='progress-bar bg-primary'
                          role='progressbar'
                          style={{ width: `${Math.min(item.share || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='mt-4'>
                  <h6 className='fw-semibold mb-3'>Asterasys 제품 현황</h6>
                  <div className='row g-3'>
                    <div className='col-sm-6 col-md-4 col-lg-3'>
                      <button
                        type='button'
                        onClick={() => setActiveProductKey(null)}
                        className={`btn w-100 rounded-3 py-3 px-3 text-start border ${
                          !activeProductKey ? 'bg-primary-subtle border-primary text-primary fw-semibold' : 'bg-white border-light text-muted'
                        }`}
                      >
                        <span className='badge bg-primary text-white fs-12 mb-2'>RF/HIFU 전체분포</span>
                        <span className='d-block fs-12 text-muted'>전체 기술군 기준</span>
                      </button>
                    </div>
                    {asterasysProducts.map((product) => {
                      const isActive = activeProductKey === product.keyword
                      const marketShare = totalMarketPosts ? (product.totalPosts / totalMarketPosts) * 100 : 0

                      return (
                        <div key={product.keyword} className='col-sm-6 col-md-4 col-lg-3'>
                          <button
                            type='button'
                            onClick={() => handleProductHighlight(product.keyword)}
                            className={`btn w-100 rounded-3 py-3 px-3 text-start border ${
                              isActive ? 'bg-primary-subtle border-primary text-primary shadow-sm' : 'bg-white border-light text-dark'
                            }`}
                          >
                            <span className='badge bg-primary text-white fs-12 mb-2'>{product.keyword}</span>
                            <span className='d-block fs-12 text-muted'>점유율 {marketShare.toFixed(1)}%</span>
                            <span className='d-block fs-12 text-muted'>총 {product.totalPosts?.toLocaleString() || 0}건</span>
                          </button>
                        </div>
                      )
                    })}
                    {!asterasysProducts.length && <div className='col-12'><span className='text-muted fs-12'>Asterasys 제품 데이터 없음</span></div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BlogInsightsCards
