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

const CafeInsightsCards = () => {
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

        const response = await fetch(withMonthParam('/api/data/cafe-overview', month))
        if (!response.ok) {
          throw new Error('카페 개요 데이터를 불러오지 못했습니다.')
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || '카페 개요 응답이 유효하지 않습니다.')
        }

        setOverview(data)
      } catch (err) {
        console.error('Cafe overview fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [month])

  useEffect(() => {
    setActiveProductKey(null)
  }, [month])

  const summary = overview?.summary
  const technologyBreakdown = overview?.technologyBreakdown || []
  const asterasysProducts = overview?.asterasys?.products || []
  const totalMarketPosts = summary?.totalPosts || 0

  const technologyShares = useMemo(() => {
    if (!technologyBreakdown.length) return {}

    return technologyBreakdown.reduce((acc, item) => {
      if (!item?.technology) return acc
      acc[item.technology] = {
        totalPosts: item.posts || 0,
        label: item.label || item.technology,
        asterasysPosts: item.asterasysPosts || 0,
        share: typeof item.share === 'number' ? item.share : null,
        asterasysShare: typeof item.asterasysShare === 'number' ? item.asterasysShare : null
      }
      return acc
    }, {})
  }, [technologyBreakdown])

  const clampPercent = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return 0
    return Math.min(Math.max(value, 0), 100)
  }

  const formatPercent = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '--'
    return value.toFixed(1)
  }

  const kpiCards = useMemo(() => {
    if (!summary) return []

    const totalPosts = summary.totalPosts || 0
    const asterasysPosts = summary.asterasysPosts || 0
    const marketShare = typeof summary.asterasysShare === 'number' ? summary.asterasysShare : 0

    const rfStats = technologyShares.RF
    const hifuStats = technologyShares.HIFU

    const asterasysSalesEfficiency = summary.asterasysPosts
      ? (summary.asterasysMonthlySales / summary.asterasysPosts) * 100
      : null
    const marketSalesEfficiency = summary.totalPosts
      ? (summary.monthlySales / summary.totalPosts) * 100
      : null
    const efficiencyComparison = marketSalesEfficiency
      ? (asterasysSalesEfficiency / marketSalesEfficiency) * 100
      : null
    const efficiencyProgress = efficiencyComparison != null
      ? clampPercent(efficiencyComparison)
      : clampPercent(asterasysSalesEfficiency ?? 0)

    return [
      {
        id: 'market-share',
        title: '시장 카페 점유율',
        value: `${formatPercent(marketShare)}%`,
        context: `Asterasys ${asterasysPosts.toLocaleString()}건 / 전체 ${totalPosts.toLocaleString()}건`,
        progress: clampPercent(marketShare),
        progressLabel: '전체 시장 대비',
        icon: 'feather-target',
        color: 'primary'
      },
      {
        id: 'rf-share',
        title: 'RF 카페 점유율',
        value: rfStats?.asterasysShare != null ? `${formatPercent(rfStats.asterasysShare)}%` : '--',
        context: rfStats
          ? `Asterasys ${rfStats.asterasysPosts.toLocaleString()}건 / RF ${rfStats.totalPosts.toLocaleString()}건`
          : 'RF 데이터 없음',
        progress: clampPercent(rfStats?.asterasysShare ?? 0),
        progressLabel: 'RF 시장 대비',
        icon: 'feather-radio',
        color: 'success'
      },
      {
        id: 'hifu-share',
        title: 'HIFU 카페 점유율',
        value: hifuStats?.asterasysShare != null ? `${formatPercent(hifuStats.asterasysShare)}%` : '--',
        context: hifuStats
          ? `Asterasys ${hifuStats.asterasysPosts.toLocaleString()}건 / HIFU ${hifuStats.totalPosts.toLocaleString()}건`
          : 'HIFU 데이터 없음',
        progress: clampPercent(hifuStats?.asterasysShare ?? 0),
        progressLabel: 'HIFU 시장 대비',
        icon: 'feather-crosshair',
        color: 'info'
      },
      {
        id: 'sales-efficiency',
        title: '발행량 대비 판매효율',
        value: asterasysSalesEfficiency != null ? `${formatPercent(asterasysSalesEfficiency)}%` : '--',
        context: summary.asterasysMonthlySales != null
          ? `Asterasys ${summary.asterasysMonthlySales.toLocaleString()}건 / 발행 ${summary.asterasysPosts?.toLocaleString() || '--'}건`
          : '판매 데이터 없음',
        progress: efficiencyProgress,
        progressLabel: efficiencyComparison != null ? `시장 대비 ${formatPercent(efficiencyComparison)}%` : '시장 대비 없음',
        icon: 'feather-trending-up',
        color: 'warning'
      }
    ]
  }, [summary, technologyShares])

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
                color: '#000000',
                fontSize: '14px',
                fontWeight: 600
              },
              value: {
                show: true,
                offsetY: 10,
                formatter: () => `${centerValue.toFixed(1)}%`,
                color: '#000000',
                fontSize: '22px',
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
          centerLabel: `${activeProduct.keyword}`,
          centerValue: share
        })
      }
    }

    const labels = technologyBreakdown.map((item) => item.label || item.technology)
    const series = technologyBreakdown.map((item) => Number((item.share || 0).toFixed(1)))
    const overallShare = series.reduce((acc, value) => acc + value, 0)

    return {
      series,
      options: buildOptions({
        labels,
        colors: ['#6366f1', '#0ea5e9', '#94a3b8'],
        centerLabel: '기술군 점유율',
        centerValue: overallShare || 100
      })
    }
  }, [technologyBreakdown, technologyMap, activeProduct])

  const chartRenderKey = useMemo(
    () => (activeProduct ? `product-${activeProduct.keyword}` : 'technology-overview'),
    [activeProduct]
  )

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
              <h5 className='card-title mb-1'>카페 기술군 점유 구조</h5>
              <p className='text-muted fs-12 mb-0'>전체 카페 발행량 대비 RF/HIFU 비중과 Asterasys 위치</p>
            </div>
            <span className='badge bg-primary-subtle text-primary'>월간 {month}</span>
          </div>
          <div className='card-body'>
            <div className='row align-items-center'>
              <div className='col-lg-5 border-end border-light-subtle pe-3 pe-lg-4'>
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
              <div className='col-lg-7 ps-3 ps-lg-4'>
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
                        className={`btn w-100 rounded-3 py-3 px-3 text-start border d-flex flex-column align-items-start gap-1 ${
                          !activeProductKey ? 'bg-primary-subtle border-primary text-primary fw-semibold' : 'bg-white border-light text-muted'
                        }`}
                      >
                        <span className='badge bg-primary text-white fs-12 px-2 py-1'>시장 전체 분포</span>
                        <span className='fs-12 text-muted'>RF/HIFU 전체분포</span>
                      </button>
                    </div>
                    {asterasysProducts.map((product) => {
                      const isActive = activeProductKey === product.keyword
                      const technologyTotal = technologyMap.get(product.technology)?.posts || 0
                      const technologyShare = technologyTotal ? (product.totalPosts / technologyTotal) * 100 : 0

                      return (
                        <div key={product.keyword} className='col-sm-6 col-md-4 col-lg-3'>
                          <button
                            type='button'
                            onClick={() => handleProductHighlight(product.keyword)}
                            className={`btn w-100 rounded-3 py-3 px-3 text-start border d-flex flex-column align-items-start gap-1 ${
                              isActive ? 'bg-primary-subtle border-primary text-primary shadow-sm' : 'bg-white border-light text-dark'
                            }`}
                          >
                            <span className='badge bg-primary text-white fs-12 px-2 py-1'>{product.keyword}</span>
                            <span className='fs-12 text-dark fw-semibold'>기술군 점유율 {technologyShare.toFixed(1)}%</span>
                          </button>
                        </div>
                      )
                    })}
                    {!asterasysProducts.length && (
                      <div className='col-12'>
                        <span className='text-muted fs-12'>Asterasys 제품 데이터 없음</span>
                      </div>
                    )}
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

export default CafeInsightsCards
