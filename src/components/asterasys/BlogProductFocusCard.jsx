'use client'

import React, { useEffect, useMemo, useState } from 'react'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const ASTERASYS_PRODUCTS = ['쿨페이즈', '리프테라', '쿨소닉']

function aggregateProducts(products) {
  if (!products.length) return null

  const totals = products.reduce(
    (acc, product) => {
      acc.totalPosts += product.totalPosts
      acc.monthlySales += product.monthlySales || 0
      acc.totalSales += product.totalSales || 0
      acc.searchVolume += product.searchVolume || 0
      acc.searchToPostValues.push(product.searchToPostRatio || 0)
      acc.salesEfficiencies.push(product.salesEfficiency || 0)

      product.blogTypes.forEach((type) => {
        if (!acc.blogTypeMap[type.type]) {
          acc.blogTypeMap[type.type] = { posts: 0 }
        }
        acc.blogTypeMap[type.type].posts += type.posts
      })

      return acc
    },
    {
      totalPosts: 0,
      monthlySales: 0,
      totalSales: 0,
      searchVolume: 0,
      searchToPostValues: [],
      salesEfficiencies: [],
      blogTypeMap: {}
    }
  )

  const blogTypes = Object.entries(totals.blogTypeMap).map(([type, values]) => ({
    type,
    posts: values.posts
  }))

  const salesEfficiency = totals.totalPosts
    ? (totals.monthlySales / totals.totalPosts) * 100
    : totals.salesEfficiencies.reduce((sum, value) => sum + value, 0) / Math.max(totals.salesEfficiencies.length, 1)

  const searchToPostRatio = totals.searchVolume
    ? (totals.totalPosts / totals.searchVolume) * 1000
    : totals.searchToPostValues.reduce((sum, value) => sum + value, 0) / Math.max(totals.searchToPostValues.length, 1)

  return {
    product: '전체',
    technology: 'Asterasys',
    technologyLabel: 'Asterasys',
    rank: null,
    totalPosts: totals.totalPosts,
    monthlySales: totals.monthlySales,
    totalSales: totals.totalSales,
    salesEfficiency,
    searchVolume: totals.searchVolume,
    searchRank: null,
    searchToPostRatio,
    blogTypes
  }
}

function enrichBlogTypes(blogTypes, totalPosts, monthlySales) {
  if (!Array.isArray(blogTypes)) return []
  return blogTypes
    .filter((entry) => entry.posts > 0)
    .map((entry) => ({
      ...entry,
      share: totalPosts ? (entry.posts / totalPosts) * 100 : 0,
      salesPerPost: entry.posts && monthlySales ? (monthlySales / totalPosts * entry.share / 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.posts - a.posts)
}

const BlogProductFocusCard = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [products, setProducts] = useState([])
  const [selectedProductKey, setSelectedProductKey] = useState('ALL')

  useEffect(() => {
    if (!month) return

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(withMonthParam('/api/data/blog-products', month))
        if (!response.ok) {
          throw new Error('블로그 제품 데이터를 불러오지 못했습니다.')
        }
        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || '제품 데이터가 유효하지 않습니다.')
        }
        const asterasysOnly = data.products.filter((product) => product.isAsterasys)
        setProducts(asterasysOnly)
      } catch (err) {
        console.error('Blog product fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [month, refreshKey])

  const selectedProduct = useMemo(() => {
    if (!products.length) return null

    if (selectedProductKey === 'ALL') {
      return aggregateProducts(products)
    }

    return products.find((product) => product.product === selectedProductKey) || products[0]
  }, [products, selectedProductKey])

  const blogTypeBreakdown = useMemo(() => {
    if (!selectedProduct) return []
    return enrichBlogTypes(selectedProduct.blogTypes, selectedProduct.totalPosts, selectedProduct.monthlySales)
  }, [selectedProduct])

  const conversionProgress = useMemo(() => {
    if (!selectedProduct) return 0
    const ratio = selectedProduct.searchToPostRatio || 0
    const benchmark = 20
    return (ratio / benchmark) * 100
  }, [selectedProduct])

  if (isRemoved) return null

  return (
    <div className='col-xxl-4 col-lg-4 col-md-12'>
      <div className={`card stretch stretch-full ${isExpanded ? 'card-expand' : ''} ${refreshKey ? 'card-loading' : ''}`}>
        <div className='card-header d-flex align-items-center justify-content-between'>
          <div>
            <h5 className='card-title mb-1'>Asterasys 제품 집중</h5>
            <p className='text-muted fs-12 mb-0'>제품별 발행량 · 참여도 · 검색 연계 지표</p>
          </div>
          <div className='btn-group btn-group-sm' role='group'>
            <button
              type='button'
              className={`btn ${selectedProductKey === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedProductKey('ALL')}
            >
              전체
            </button>
            {ASTERASYS_PRODUCTS.map((product) => (
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

        <div className='card-body custom-card-action'>
          {loading ? (
            <CardLoader />
          ) : error ? (
            <div className='text-danger fw-semibold'>{error}</div>
          ) : selectedProduct ? (
            <>
              <div className='border rounded-3 border-light-subtle p-3 mb-3'>
                <div className='d-flex justify-content-between align-items-start flex-wrap gap-3'>
                  <div>
                    <h6 className='mb-1 text-dark'>
                      {selectedProduct.product === '전체' ? 'Asterasys 전체 제품' : selectedProduct.product}
                    </h6>
                    <p className='text-muted fs-12 mb-2'>
                      {selectedProduct.product === '전체'
                        ? '쿨페이즈 · 리프테라 · 쿨소닉 종합'
                        : `${selectedProduct.technologyLabel || selectedProduct.technology} 포지션`}
                    </p>
                    <div className='d-flex gap-3 text-dark fw-semibold fs-12'>
                      <span>발행 {selectedProduct.totalPosts?.toLocaleString()}건</span>
                      <span>월간 판매 {(selectedProduct.monthlySales || 0).toLocaleString()}건</span>
                      <span>
                        발행→판매 {(selectedProduct.salesEfficiency || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className='text-end'>
                    <span className='badge bg-primary-subtle text-primary px-3'>검색 {selectedProduct.searchVolume?.toLocaleString() || '--'}건</span>
                    <div className='text-muted fs-12 mt-2'>
                      검색 1천건당 {(selectedProduct.searchToPostRatio || 0).toFixed(1)}건 생성
                    </div>
                  </div>
                </div>
              </div>

              <div className='mb-3'>
                <h6 className='fw-semibold mb-2'>블로그 유형별 구성</h6>
                {blogTypeBreakdown.length ? (
                  <div className='d-flex flex-column gap-3'>
                    {blogTypeBreakdown.map((item) => (
                      <div key={item.type}>
                        <div className='d-flex justify-content-between align-items-center mb-1'>
                          <span className='text-dark fw-semibold'>{item.type}</span>
                          <span className='text-muted fs-12'>
                            {item.posts.toLocaleString()}건 · {item.share.toFixed(1)}% · 발행당 판매 {item.salesPerPost}건
                          </span>
                        </div>
                        <div className='progress ht-3'>
                          <div className='progress-bar bg-primary' role='progressbar' style={{ width: `${Math.min(item.share, 100)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted fs-12 mb-0'>유형별 데이터가 없습니다.</p>
                )}
              </div>

              <div className='pt-3'>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <span className='text-muted fs-12'>검색 → 발행 전환 지표</span>
                  <span className='fw-semibold text-dark fs-12'>
                    {(selectedProduct.searchToPostRatio || 0).toFixed(1)}건 / 1천 검색
                  </span>
                </div>
                <div className='progress ht-4'>
                  <div
                    className='progress-bar bg-primary'
                    role='progressbar'
                    style={{ width: `${Math.min(Math.max(conversionProgress, 0), 100)}%` }}
                  ></div>
                </div>
                <div className='text-muted fs-12 mt-1'>업계 벤치마크: 20건/1천 검색</div>
              </div>
            </>
          ) : (
            <p className='text-muted fs-12 mb-0'>표시할 제품 데이터가 없습니다.</p>
          )}
        </div>

      </div>
    </div>
  )
}

export default BlogProductFocusCard
