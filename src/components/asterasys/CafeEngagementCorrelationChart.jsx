'use client'

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const CATEGORIES = ['ALL', 'RF', 'HIFU']

const CafeEngagementCorrelationChart = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('ALL')
  const [correlation, setCorrelation] = useState(null)
  const [totals, setTotals] = useState(null)

  useEffect(() => {
    if (!month) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(withMonthParam('/api/data/cafe-engagement', month))
        if (!response.ok) {
          throw new Error('카페 상관관계 데이터를 불러오지 못했습니다.')
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || '상관관계 응답이 유효하지 않습니다.')
        }

        setCorrelation(data.correlation)
        setTotals(data.totals)
      } catch (err) {
        console.error('Cafe engagement fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [month])

  const currentData = useMemo(() => {
    if (!correlation) return []
    return correlation[activeTab] || []
  }, [correlation, activeTab])

  const apexConfig = useMemo(() => {
    if (!currentData.length) return null

    const categories = currentData.map((item) => item.keyword)
    const postSeries = currentData.map((item) => item.totalPosts || 0)
    const participationSeries = currentData.map((item) => Number(((item.participation || 0) * 100).toFixed(1)))
    const conversionSeries = currentData.map((item) => Number((item.salesPerPost || 0).toFixed(1)))
    const labelColors = currentData.map((item) => (item.isAsterasys ? '#2563eb' : '#64748b'))

    return {
      series: [
        {
          name: '발행량(건)',
          type: 'column',
          data: postSeries
        },
        {
          name: '참여도(%)',
          type: 'line',
          data: participationSeries
        },
        {
          name: '발행→판매 (%)',
          type: 'line',
          data: conversionSeries
        }
      ],
      options: {
        chart: {
          height: 360,
          stacked: false,
          toolbar: { show: false }
        },
        stroke: {
          width: [0, 3, 3],
          curve: 'smooth'
        },
        plotOptions: {
          bar: {
            columnWidth: '45%',
            borderRadius: 6
          }
        },
        markers: {
          size: 4,
          strokeColors: '#fff',
          strokeWidth: 2
        },
        colors: ['#1d4ed8', '#f97316', '#10b981'],
        xaxis: {
          categories,
          labels: {
            rotate: -45,
            trim: true,
            style: {
              colors: labelColors,
              fontSize: '12px',
              fontWeight: 500
            }
          }
        },
        yaxis: [
          {
            title: {
              text: '발행량(건)'
            },
            labels: {
              formatter: (value) => Math.round(value).toLocaleString()
            }
          },
          {
            opposite: true,
            title: {
              text: '참여도(%)'
            },
            labels: {
              formatter: (value) => `${value.toFixed(0)}%`
            }
          },
          {
            opposite: true,
            show: false
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: (value, { seriesIndex }) => {
              if (seriesIndex === 0) return `${Math.round(value).toLocaleString()}건`
              if (seriesIndex === 1) return `${value.toFixed(1)}%`
              return `${value.toFixed(1)}%`
            }
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left'
        }
      }
    }
  }, [currentData])

  const summaryMetrics = useMemo(() => {
    if (!currentData.length) {
      return {
        posts: 0,
        participation: 0,
        conversion: 0
      }
    }

    const totalPosts = currentData.reduce((sum, item) => sum + (item.totalPosts || 0), 0)
    const avgParticipation =
      currentData.reduce((sum, item) => sum + (item.participation || 0), 0) / currentData.length
    const avgConversion =
      currentData.reduce((sum, item) => sum + (item.salesPerPost || 0), 0) / currentData.length

    return {
      posts: totalPosts,
      participation: avgParticipation * 100,
      conversion: avgConversion
    }
  }, [currentData])

  return (
    <div className='col-12'>
      <div className='card stretch stretch-full'>
        <div className='card-header d-flex align-items-center justify-content-between flex-wrap gap-3'>
          <div>
            <h5 className='card-title mb-1'>검색량 대비 카페 참여 상관관계</h5>
            <p className='text-muted fs-12 mb-0'>제품별 발행량·참여도·발행→판매 효율 비교</p>
          </div>
          <div className='btn-group btn-group-sm'>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type='button'
                className={`btn ${activeTab === category ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className='card-body'>
          {loading ? (
            <CardLoader />
          ) : error ? (
            <div className='text-danger fw-semibold'>{error}</div>
          ) : apexConfig ? (
            <ReactApexChart options={apexConfig.options} series={apexConfig.series} type='line' height={360} />
          ) : (
            <p className='text-muted fs-12 mb-0'>표시할 데이터가 없습니다.</p>
          )}
        </div>
        {!loading && !error && currentData.length ? (
          <div className='card-footer bg-white border-top'>
            <div className='row text-center'>
              <div className='col-md-4'>
                <div className='fw-semibold text-dark'>총 발행 {summaryMetrics.posts.toLocaleString()}건</div>
                <small className='text-muted'>카테고리 합계</small>
              </div>
              <div className='col-md-4'>
                <div className='fw-semibold text-primary'>평균 참여 {summaryMetrics.participation.toFixed(1)}%</div>
                <small className='text-muted'>댓글+대댓글 / 발행</small>
              </div>
              <div className='col-md-4'>
                <div className='fw-semibold text-success'>발행→판매 {summaryMetrics.conversion.toFixed(1)}%</div>
                <small className='text-muted'>발행 100건 대비 판매</small>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default CafeEngagementCorrelationChart
