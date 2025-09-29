'use client'

import React, { useEffect, useMemo, useState } from 'react'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const formatPercent = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return `${value.toFixed(1)}%`
}

const formatNumber = (value, suffix = '') => {
  if (value == null) return '--'
  return `${Number(value).toLocaleString()}${suffix}`
}

const clampPercent = (value, max = 100) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.min(Math.max(value, 0), max)
}

const CAFE_PRODUCTS = ['쿨페이즈', '리프테라', '쿨소닉']

const CafeProductFocusCard = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [products, setProducts] = useState([])
  const [totals, setTotals] = useState(null)
  const [marketTotals, setMarketTotals] = useState(null)
  const [selectedProductKey, setSelectedProductKey] = useState('ALL')

  useEffect(() => {
    if (!month) return

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(withMonthParam('/api/data/cafe-products', month))
        if (!response.ok) {
          throw new Error('카페 제품 데이터를 불러오지 못했습니다.')
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || '제품 데이터가 유효하지 않습니다.')
        }

        setProducts(data.products || [])
        setTotals(data.totals || null)
        setMarketTotals(data.marketTotals || null)
      } catch (err) {
        console.error('Cafe product fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [month])

  const selectedProduct = useMemo(() => {
    if (!totals) return null

    if (selectedProductKey === 'ALL') {
      const participation = totals.totalPosts ? totals.totalEngagement / totals.totalPosts : 0
      const salesPerPost = totals.totalPosts ? (totals.monthlySales / totals.totalPosts) * 100 : null
      return {
        keyword: 'Asterasys 전체 제품',
        technologyLabel: 'RF/HIFU',
        totalPosts: totals.totalPosts,
        totalEngagement: totals.totalEngagement,
        participation,
        searchVolume: totals.searchVolume,
        postsPerThousandSearch: totals.postsPerThousandSearch,
        monthlySales: totals.monthlySales,
        salesPerThousandSearch: totals.salesPerThousandSearch,
        searchToSalesRate: totals.searchToSalesRate,
        technologyShare: typeof totals.share === 'number' ? totals.share : null,
        totalSales: totals.totalSales,
        salesPerPost
      }
    }

    return products.find((product) => product.keyword === selectedProductKey) || products[0] || null
  }, [selectedProductKey, totals, products])

  const availableProducts = useMemo(() => {
    if (!products.length) return []
    return CAFE_PRODUCTS.filter((product) => products.some((item) => item.keyword === product))
  }, [products])

  if (loading) {
    return (
      <div className='col-xxl-4 col-lg-4 col-md-12'>
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
      <div className='col-xxl-4 col-lg-4 col-md-12'>
        <div className='card stretch stretch-full'>
          <div className='card-body text-danger fw-semibold'>{error}</div>
        </div>
      </div>
    )
  }

  if (!totals || !selectedProduct) {
    return (
      <div className='col-12'>
        <div className='card stretch stretch-full'>
          <div className='card-body text-muted fs-12'>표시할 데이터가 없습니다.</div>
        </div>
      </div>
    )
  }

  const marketPostsPerThousand = marketTotals?.postsPerThousandSearch ?? null
  const marketSalesPerPost = marketTotals?.totalPosts
    ? (marketTotals.monthlySales / marketTotals.totalPosts) * 100
    : null

  const performanceVsMarket =
    selectedProduct.salesPerPost != null && marketSalesPerPost
      ? (selectedProduct.salesPerPost / marketSalesPerPost) * 100
      : null

  const sharePercent =
    typeof selectedProduct.technologyShare === 'number' ? selectedProduct.technologyShare : null
  const salesPerPostValue = selectedProduct.salesPerPost ?? null

  const overallMetrics = [
    {
      id: 'share',
      title: '카페 점유율',
      valueLabel: sharePercent != null ? formatPercent(sharePercent) : '--',
      progress: clampPercent(sharePercent ?? 0),
      comparison: 'Asterasys 제품 비중',
      barClass: 'bg-primary'
    },
    {
      id: 'sales-efficiency',
      title: '발행→판매 효율',
      valueLabel: salesPerPostValue != null ? formatPercent(salesPerPostValue) : '--',
      progress: clampPercent(salesPerPostValue ?? 0),
      comparison:
        marketSalesPerPost != null ? `시장 평균 ${formatPercent(marketSalesPerPost)}` : '시장 평균 없음',
      barClass: 'bg-success'
    },
    {
      id: 'market-index',
      title: '시장 대비 효율 지수',
      valueLabel: performanceVsMarket != null ? formatPercent(performanceVsMarket) : '--',
      progress: clampPercent(performanceVsMarket ?? 0, 150),
      comparison: '시장=100% 기준',
      barClass: 'bg-warning'
    }
  ]

  const funnelMetrics = [
    {
      id: 'search',
      title: '검색량',
      value: formatNumber(selectedProduct.searchVolume, '회'),
      details: [
        selectedProduct.postsPerThousandSearch != null
          ? `1K당 발행 ${selectedProduct.postsPerThousandSearch.toFixed(1)}건`
          : null,
        marketPostsPerThousand != null ? `시장 1K당 발행 ${marketPostsPerThousand.toFixed(1)}건` : null
      ]
    },
    {
      id: 'publish',
      title: '카페 발행',
      value: formatNumber(selectedProduct.totalPosts, '건'),
      details: [
        `발행→판매 ${formatPercent(selectedProduct.salesPerPost)}`,
        marketSalesPerPost != null ? `시장 평균 ${formatPercent(marketSalesPerPost)}` : null
      ]
    },
    {
      id: 'sales',
      title: '월간 판매',
      value: formatNumber(selectedProduct.monthlySales, '건'),
      details: [
        selectedProduct.totalSales != null ? `누적 ${formatNumber(selectedProduct.totalSales, '건')}` : null,
        performanceVsMarket != null ? `시장 대비 ${formatPercent(performanceVsMarket)}` : null
      ]
    }
  ]

  return (
    <div className='col-12'>
      <div className='card stretch stretch-full'>
        <div className='card-header d-flex flex-column gap-2'>
          <div>
            <h5 className='card-title mb-1'>Asterasys 제품 집중</h5>
            <p className='text-muted fs-12 mb-0'>검색→발행→판매 퍼널 지표 요약</p>
          </div>
          <div className='btn-group btn-group-sm' role='group'>
            <button
              type='button'
              className={`btn ${selectedProductKey === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedProductKey('ALL')}
            >
              전체
            </button>
            {availableProducts.map((product) => (
              <button
                key={product}
                type='button'
                className={`btn ${selectedProductKey === product ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedProductKey(product)}
              >
                {product}
              </button>
            ))}
          </div>
        </div>
        <div className='card-body d-flex flex-column gap-4'>
          <div className='border rounded-3 border-light-subtle p-3'>
            <div className='d-flex justify-content-between align-items-start flex-wrap gap-2'>
              <div>
                <h6 className='mb-1 text-dark'>{selectedProduct.keyword}</h6>
                <p className='text-muted fs-12 mb-0'>{selectedProduct.technologyLabel || '카페 채널'}</p>
              </div>
              {selectedProduct.technologyShare != null && (
                <span className='badge bg-primary-subtle text-primary'>
                  기술군 점유율 {formatPercent(selectedProduct.technologyShare)}
                </span>
              )}
            </div>
            <div className='row g-4 mt-1'>
              {overallMetrics.map((metric) => {
                const width = Math.min(metric.progress, 100)
                return (
                  <div key={metric.id} className='col-lg-4 col-md-6 col-12'>
                    <div className='d-flex justify-content-between align-items-center gap-2'>
                      <div className='text-muted fs-12 text-uppercase'>{metric.title}</div>
                      <span className='fw-semibold text-dark'>{metric.valueLabel}</span>
                    </div>
                    <div className='progress progress-thin mt-2' role='progressbar' aria-valuenow={metric.progress}>
                      <div
                        className={`progress-bar ${metric.barClass}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <div className='text-muted fs-12 mt-1'>{metric.comparison}</div>
                  </div>
                )
              })}
            </div>
            <div className='row g-3 mt-3'>
              {funnelMetrics.map((metric) => (
                <div key={metric.id} className='col-12 col-lg-4'>
                  <div className='border rounded-3 p-3 h-100 bg-light-subtle'>
                    <div className='text-muted fs-12 text-uppercase mb-1'>{metric.title}</div>
                    <div className='fw-semibold text-dark fs-4'>{metric.value}</div>
                    <ul className='list-unstyled mb-0 mt-2 fs-12 text-muted d-flex flex-column gap-1'>
                      {metric.details.filter(Boolean).map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CafeProductFocusCard
