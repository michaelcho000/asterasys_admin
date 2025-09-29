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

const CAFE_PRODUCTS = ['쿨페이즈', '리프테라', '쿨소닉']

const CafeProductFocusCard = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [products, setProducts] = useState([])
  const [totals, setTotals] = useState(null)
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
        technologyShare: totals.share,
        totalSales: totals.totalSales
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
      <div className='col-xxl-4 col-lg-4 col-md-12'>
        <div className='card stretch stretch-full'>
          <div className='card-body text-muted fs-12'>표시할 데이터가 없습니다.</div>
        </div>
      </div>
    )
  }

  return (
    <div className='col-xxl-4 col-lg-4 col-md-12'>
      <div className='card stretch stretch-full'>
        <div className='card-header d-flex flex-column gap-2'>
          <div>
            <h5 className='card-title mb-1'>Asterasys 제품 집중</h5>
            <p className='text-muted fs-12 mb-0'>카페 발행과 검색→판매 전환 지표 요약</p>
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
              <span className='badge bg-primary-subtle text-primary'>기술군 점유율 {formatPercent(selectedProduct.technologyShare)}</span>
            </div>
            <div className='row g-3 mt-2'>
              <div className='col-6'>
                <div className='text-muted fs-12 mb-1'>카페 발행량</div>
                <div className='fw-semibold text-dark fs-5'>{formatNumber(selectedProduct.totalPosts, '건')}</div>
                <div className='text-muted fs-12'>참여도 {formatPercent((selectedProduct.participation || 0) * 100)}</div>
              </div>
              <div className='col-6'>
                <div className='text-muted fs-12 mb-1'>월간 판매</div>
                <div className='fw-semibold text-dark fs-5'>{formatNumber(selectedProduct.monthlySales, '건')}</div>
                <div className='text-muted fs-12'>누적 {formatNumber(selectedProduct.totalSales, '건')}</div>
              </div>
              <div className='col-6'>
                <div className='text-muted fs-12 mb-1'>검색량</div>
                <div className='fw-semibold text-dark fs-5'>{formatNumber(selectedProduct.searchVolume, '회')}</div>
                <div className='text-muted fs-12'>1K당 발행 {selectedProduct.postsPerThousandSearch != null ? `${selectedProduct.postsPerThousandSearch.toFixed(1)}건` : '--'}</div>
              </div>
              <div className='col-6'>
                <div className='text-muted fs-12 mb-1'>검색→판매</div>
                <div className='fw-semibold text-dark fs-5'>
                  {selectedProduct.salesPerThousandSearch != null
                    ? `${selectedProduct.salesPerThousandSearch.toFixed(1)}건/1K`
                    : '--'}
                </div>
                <div className='text-muted fs-12'>전환율 {formatPercent(selectedProduct.searchToSalesRate)}</div>
              </div>
            </div>
          </div>

          <div className='border rounded-3 border-light-subtle p-3 bg-light-subtle'>
            <div className='text-muted fs-12 mb-2'>제품별 메모</div>
            <ul className='list-unstyled mb-0 fs-12 text-muted d-flex flex-column gap-1'>
              <li>카페 점유율: {formatPercent(selectedProduct.technologyShare)}</li>
              <li>참여도: {formatPercent((selectedProduct.participation || 0) * 100)}</li>
              <li>검색→판매: {formatPercent(selectedProduct.searchToSalesRate)}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CafeProductFocusCard
