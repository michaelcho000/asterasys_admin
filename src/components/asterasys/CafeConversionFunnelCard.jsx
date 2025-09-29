'use client'

import React, { useEffect, useMemo, useState } from 'react'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const formatNumber = (value) => {
  if (value == null) return '--'
  return Number(value).toLocaleString()
}

const formatPercent = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return `${value.toFixed(1)}%`
}

const formatPerThousand = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return `${value.toFixed(1)}건/1K`
}

const CafeConversionFunnelCard = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)

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

        setSummary(data.summary)
      } catch (err) {
        console.error('Cafe funnel fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [month])

  const marketStages = useMemo(() => {
    if (!summary) return null

    const searchVolume = summary.searchVolume || 0
    const posts = summary.totalPosts || 0
    const sales = summary.monthlySales || 0

    return {
      searchVolume,
      posts,
      sales,
      postsPerThousand: summary.postsPerThousandSearch,
      salesPerPost: posts ? (sales / posts) * 100 : null
    }
  }, [summary])

  const asterasysStages = useMemo(() => {
    if (!summary) return null

    const searchVolume = summary.asterasysSearchVolume || 0
    const posts = summary.asterasysPosts || 0
    const sales = summary.asterasysMonthlySales || 0
    const marketSalesPerPost = summary.totalPosts ? (summary.monthlySales / summary.totalPosts) * 100 : null

    return {
      searchVolume,
      posts,
      sales,
      postsPerThousand: summary.asterasysPostsPerThousandSearch,
      salesPerPost: posts ? (sales / posts) * 100 : null,
      salesEfficiencyIndex:
        posts && marketSalesPerPost ? ((sales / posts) * 100) / marketSalesPerPost * 100 : null
    }
  }, [summary])

  const renderStage = (label, marketValue, asterasysValue) => (
    <div className='d-flex flex-column gap-2'>
      <div className='d-flex justify-content-between align-items-center'>
        <span className='text-muted fs-12 text-uppercase'>{label}</span>
        <span className='badge bg-light text-muted'>{month}</span>
      </div>
      <div className='row g-3'>
        <div className='col-6'>
          <div className='border rounded-3 p-3 h-100'>
            <div className='text-muted fs-12 mb-1'>전체 시장</div>
            <div className='fw-semibold text-dark fs-5'>{marketValue.primary}</div>
            <div className='text-muted fs-12'>{marketValue.secondary}</div>
          </div>
        </div>
        <div className='col-6'>
          <div className='border rounded-3 p-3 h-100 bg-primary-subtle border-primary-subtle'>
            <div className='text-primary fs-12 mb-1'>Asterasys</div>
            <div className='fw-semibold text-primary fs-5'>{asterasysValue.primary}</div>
            <div className='text-primary fs-12'>{asterasysValue.secondary}</div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className='col-xxl-8 col-lg-8'>
        <div className='card stretch stretch-full'>
          <div className='card-body'>
            <CardLoader />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='col-xxl-8 col-lg-8'>
        <div className='card stretch stretch-full'>
          <div className='card-body text-danger fw-semibold'>{error}</div>
        </div>
      </div>
    )
  }

  if (!summary || !marketStages || !asterasysStages) {
    return (
      <div className='col-xxl-8 col-lg-8'>
        <div className='card stretch stretch-full'>
          <div className='card-body text-muted fs-12'>표시할 데이터가 없습니다.</div>
        </div>
      </div>
    )
  }

  return (
    <div className='col-xxl-8 col-lg-8'>
      <div className='card stretch stretch-full'>
        <div className='card-header'>
          <h5 className='card-title mb-1'>검색→발행→판매 퍼널</h5>
          <p className='text-muted fs-12 mb-0'>검색 대비 발행·판매 전환 흐름 비교</p>
        </div>
        <div className='card-body d-flex flex-column gap-4'>
          {renderStage('검색량',
            {
              primary: `${formatNumber(marketStages.searchVolume)}회`,
              secondary: `1K당 발행 ${formatPerThousand(marketStages.postsPerThousand)}`
            },
            {
              primary: `${formatNumber(asterasysStages.searchVolume)}회`,
              secondary: `1K당 발행 ${formatPerThousand(asterasysStages.postsPerThousand)}`
            }
          )}

          {renderStage('카페 발행',
            {
              primary: `${formatNumber(marketStages.posts)}건`,
              secondary: `검색→발행 ${formatPerThousand(marketStages.postsPerThousand)}`
            },
            {
              primary: `${formatNumber(asterasysStages.posts)}건`,
              secondary: `검색→발행 ${formatPerThousand(asterasysStages.postsPerThousand)}`
            }
          )}

          {renderStage('발행→판매 효율',
            {
              primary: formatPercent(marketStages.salesPerPost),
              secondary: `월간 판매 ${formatNumber(marketStages.sales)}건`
            },
            {
              primary: formatPercent(asterasysStages.salesPerPost),
              secondary:
                asterasysStages.salesEfficiencyIndex != null
                  ? `시장 대비 ${formatPercent(asterasysStages.salesEfficiencyIndex)}`
                  : `월간 판매 ${formatNumber(asterasysStages.sales)}건`
            }
          )}
        </div>
      </div>
    </div>
  )
}

export default CafeConversionFunnelCard
