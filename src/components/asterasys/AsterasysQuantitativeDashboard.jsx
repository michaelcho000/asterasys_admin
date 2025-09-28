'use client'

import React, { useMemo, useState } from 'react'
import { useAsterasysCsvDataset } from '@/hooks/useAsterasysCsvDataset'
import { formatNumber } from '@/utils/formatNumber'
import getIcon from '@/utils/getIcon'
import { FiMoreVertical } from 'react-icons/fi'

const ASTERASYS_PRODUCTS = [
  { name: '쿨페이즈', technology: '고주파' },
  { name: '리프테라', technology: '초음파' },
  { name: '쿨소닉', technology: '초음파' }
]

const parseNumber = (value) => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const sanitized = String(value).replace(/[^\d.-]/g, '')
  if (!sanitized) return 0
  const num = Number(sanitized)
  return Number.isNaN(num) ? 0 : num
}

const getField = (row, field) => {
  if (!row) return undefined
  if (row[field] !== undefined) return row[field]
  const match = Object.keys(row).find((key) => key && key.trim() === field.trim())
  return match ? row[match] : undefined
}

const formatDisplay = (value, unit = '') => {
  if (value === null || value === undefined) return unit ? `0${unit}` : '0'
  const formatted = formatNumber(value)
  return unit ? `${formatted}${unit}` : formatted
}

const AsterasysQuantitativeDashboard = () => {
  const [activeTab, setActiveTab] = useState('all')
  const { data, loading, monthLabel } = useAsterasysCsvDataset([
    'blog_rank',
    'cafe_rank',
    'traffic',
    'sale',
    'news_rank',
    'youtube_sponsor',
    'facebook_targeting',
    'blog_post',
    'news_release',
    'cafe_seo',
    'bad_writing'
  ])

  const metrics = useMemo(() => {
    const blogData = data.blog_rank?.marketData || []
    const cafeData = data.cafe_rank?.marketData || []
    const trafficData = data.traffic?.marketData || []
    const saleData = data.sale?.marketData || []
    const newsRankData = data.news_rank?.marketData || []
    const youtubeSponsorData = data.youtube_sponsor?.marketData || []
    const facebookData = data.facebook_targeting?.marketData || []
    const blogPostData = data.blog_post?.marketData || []
    const newsReleaseData = data.news_release?.marketData || []
    const cafeSeoData = data.cafe_seo?.marketData || []
    const badWritingData = data.bad_writing?.marketData || []

    const productMetrics = ASTERASYS_PRODUCTS.reduce((acc, product) => {
      const blogRows = blogData.filter((row) => (row.키워드 || '').trim() === product.name)
      const cafeRows = cafeData.filter((row) => (row.키워드 || '').trim() === product.name)
      const trafficRows = trafficData.filter((row) => (row.키워드 || '').trim() === product.name)
      const newsRows = newsRankData.filter((row) => (row.키워드 || '').trim() === product.name)
      const salesRows = saleData.filter((row) => (row.키워드 || '').trim() === product.name)

      const blogPosts = blogRows.reduce((sum, row) => sum + parseNumber(getField(row, '발행량합')), 0)
      const blogRank = blogRows.reduce((min, row) => {
        const rankValue = parseNumber(getField(row, '발행량 순위'))
        return rankValue ? Math.min(min, rankValue) : min
      }, Infinity)

      const cafePosts = cafeRows.reduce((sum, row) => sum + parseNumber(row['총 발행량']), 0)
      const cafeRank = cafeRows.reduce((min, row) => {
        const rankValue = parseNumber(row['발행량 순위'])
        return rankValue ? Math.min(min, rankValue) : min
      }, Infinity)
      const cafeComments = cafeRows.reduce((sum, row) => sum + parseNumber(row['총 댓글수']), 0)
      const cafeReplies = cafeRows.reduce((sum, row) => sum + parseNumber(row['총 대댓글수']), 0)
      const cafeViews = cafeRows.reduce((sum, row) => sum + parseNumber(row['총 조회수']), 0)

      const searchVolume = trafficRows.reduce((sum, row) => sum + parseNumber(getField(row, '월감 검색량')), 0)
      const searchRank = trafficRows.reduce((min, row) => {
        const rankValue = parseNumber(getField(row, '검색량 순위'))
        return rankValue ? Math.min(min, rankValue) : min
      }, Infinity)

      const newsPosts = newsRows.reduce((sum, row) => sum + parseNumber(row['총 발행량']), 0)
      const newsRank = newsRows.reduce((min, row) => {
        const rankValue = parseNumber(row['발행량 순위'])
        return rankValue ? Math.min(min, rankValue) : min
      }, Infinity)

      const totalSales = salesRows.reduce((sum, row) => sum + parseNumber(row['총 판매량']), 0)

      acc[product.name] = {
        technology: product.technology,
        blog: {
          posts: blogPosts,
          rank: Number.isFinite(blogRank) ? blogRank : null
        },
        cafe: {
          posts: cafePosts,
          rank: Number.isFinite(cafeRank) ? cafeRank : null,
          comments: cafeComments,
          replies: cafeReplies,
          views: cafeViews
        },
        search: {
          volume: searchVolume,
          rank: Number.isFinite(searchRank) ? searchRank : null
        },
        news: {
          posts: newsPosts,
          rank: Number.isFinite(newsRank) ? newsRank : null
        },
        sales: {
          volume: totalSales
        }
      }

      return acc
    }, {})

    const totalSales = ASTERASYS_PRODUCTS.reduce((sum, product) => sum + (productMetrics[product.name]?.sales.volume || 0), 0)

    const blogHighlights = ASTERASYS_PRODUCTS.map((product) => {
      const metrics = productMetrics[product.name]
      return {
        name: product.name,
        posts: metrics?.blog.posts || 0,
        rank: metrics?.blog.rank || null,
        technology: product.technology
      }
    })

    const cafeHighlights = ASTERASYS_PRODUCTS.map((product) => {
      const metrics = productMetrics[product.name]
      return {
        name: product.name,
        posts: metrics?.cafe.posts || 0,
        rank: metrics?.cafe.rank || null,
        technology: product.technology,
        comments: metrics?.cafe.comments || 0,
        views: metrics?.cafe.views || 0
      }
    })

    const newsHighlights = ASTERASYS_PRODUCTS.map((product) => {
      const metrics = productMetrics[product.name]
      return {
        name: product.name,
        posts: metrics?.news.posts || 0,
        rank: metrics?.news.rank || null
      }
    })

    const searchHighlights = ASTERASYS_PRODUCTS.map((product) => {
      const metrics = productMetrics[product.name]
      return {
        name: product.name,
        volume: metrics?.search.volume || 0,
        rank: metrics?.search.rank || null,
        technology: product.technology
      }
    })

    const bestBlog = blogHighlights.reduce((best, current) => {
      if (!best || (current.rank && current.rank < (best.rank || Infinity))) {
        return current
      }
      return best
    }, null)

    const bestCafe = cafeHighlights.reduce((best, current) => {
      if (!best || (current.rank && current.rank < (best.rank || Infinity))) {
        return current
      }
      return best
    }, null)

    const bestNews = newsHighlights.reduce((best, current) => {
      if (!best || (current.rank && current.rank < (best.rank || Infinity))) {
        return current
      }
      return best
    }, null)

    const bestSearch = searchHighlights.reduce((best, current) => {
      if (!best || (current.rank && current.rank < (best.rank || Infinity))) {
        return current
      }
      return best
    }, null)

    const coreRankingCards = [
      {
        id: 1,
        title: '블로그 발행량',
        subtitle: bestBlog ? `${bestBlog.name} (${bestBlog.technology})` : '데이터 없음',
        value: formatDisplay(bestBlog?.posts || 0),
        unit: '건',
        rank: bestBlog?.rank ? `${bestBlog.rank}위` : null,
        source: 'blog_rank.csv',
        icon: 'feather-edit-3',
        color: 'warning'
      },
      {
        id: 2,
        title: '카페 발행량',
        subtitle: bestCafe ? `${bestCafe.name} (${bestCafe.technology})` : '데이터 없음',
        value: formatDisplay(bestCafe?.posts || 0),
        unit: '건',
        rank: bestCafe?.rank ? `${bestCafe.rank}위` : null,
        source: 'cafe_rank.csv',
        icon: 'feather-message-circle',
        color: 'success'
      },
      {
        id: 3,
        title: 'Asterasys 판매량',
        subtitle: '3종 제품 합계',
        value: formatDisplay(totalSales),
        unit: '대',
        rank: null,
        source: 'sale.csv',
        icon: 'feather-shopping-cart',
        color: 'primary'
      },
      {
        id: 4,
        title: '뉴스 발행량',
        subtitle: bestNews ? `${bestNews.name}` : '데이터 없음',
        value: formatDisplay(bestNews?.posts || 0),
        unit: '건',
        rank: bestNews?.rank ? `${bestNews.rank}위` : null,
        source: 'news_rank.csv',
        icon: 'feather-file-text',
        color: 'info'
      },
      {
        id: 5,
        title: '검색량',
        subtitle: bestSearch ? `${bestSearch.name} (${bestSearch.technology})` : '데이터 없음',
        value: formatDisplay(bestSearch?.volume || 0),
        unit: '건',
        rank: bestSearch?.rank ? `${bestSearch.rank}위` : null,
        source: 'traffic.csv',
        icon: 'feather-search',
        color: 'danger'
      }
    ]

    const engagementCards = [
      {
        id: 6,
        title: '블로그 댓글',
        value: formatNumber(
          ASTERASYS_PRODUCTS.reduce((sum, product) => {
            const rows = blogData.filter((row) => (row.키워드 || '').trim() === product.name)
            return sum + rows.reduce((acc, row) => acc + parseNumber(getField(row, '댓글 총 개수')) + parseNumber(getField(row, '대댓글 총 개수')), 0)
          }, 0)
        ),
        unit: '개',
        subtitle: 'Asterasys 3종 합계',
        source: 'blog_rank.csv',
        icon: 'feather-message-square'
      },
      {
        id: 7,
        title: '카페 댓글',
        value: formatNumber(
          ASTERASYS_PRODUCTS.reduce((sum, product) => {
            const rows = cafeData.filter((row) => (row.키워드 || '').trim() === product.name)
            return sum + rows.reduce((acc, row) => acc + parseNumber(row['총 댓글수']), 0)
          }, 0)
        ),
        unit: '개',
        subtitle: '3종 합계',
        source: 'cafe_rank.csv',
        icon: 'feather-message-circle'
      },
      {
        id: 8,
        title: '카페 조회수',
        value: formatNumber(
          ASTERASYS_PRODUCTS.reduce((sum, product) => {
            const rows = cafeData.filter((row) => (row.키워드 || '').trim() === product.name)
            return sum + rows.reduce((acc, row) => acc + parseNumber(row['총 조회수']), 0)
          }, 0)
        ),
        unit: '회',
        subtitle: '3종 합계',
        source: 'cafe_rank.csv',
        icon: 'feather-eye'
      },
      {
        id: 9,
        title: '카페 대댓글',
        value: formatNumber(
          ASTERASYS_PRODUCTS.reduce((sum, product) => {
            const rows = cafeData.filter((row) => (row.키워드 || '').trim() === product.name)
            return sum + rows.reduce((acc, row) => acc + parseNumber(row['총 대댓글수']), 0)
          }, 0)
        ),
        unit: '개',
        subtitle: '3종 합계',
        source: 'cafe_rank.csv',
        icon: 'feather-corner-down-right'
      }
    ]

    const youtubeCPVAverage = (() => {
      if (!youtubeSponsorData.length) return 0
      const total = youtubeSponsorData.reduce((sum, row) => sum + parseNumber(row['평균 CPV']), 0)
      return total / youtubeSponsorData.length
    })()

    const youtubeTotalViews = youtubeSponsorData.reduce((sum, row) => sum + parseNumber(getField(row, '조회수')), 0)

    const facebookReach = facebookData.reduce((sum, row) => sum + parseNumber(row['도달수']), 0)
    const facebookImpressions = facebookData.reduce((sum, row) => sum + parseNumber(row['노출']), 0)
    const facebookClicks = facebookData.reduce((sum, row) => sum + parseNumber(row['클릭수']), 0)

    const blogHospitalSet = new Set()
    let blogTotalPosts = 0
    blogPostData.forEach((row) => {
      const device = (row['기기구분'] || '').trim()
      if (ASTERASYS_PRODUCTS.find((p) => p.name === device)) {
        if (row['병원명']) {
          blogHospitalSet.add(row['병원명'])
        }
        blogTotalPosts += parseNumber(row['총 발행 수'])
      }
    })

    const newsDates = newsReleaseData
      .filter((row) => row['릴리즈 날짜'])
      .map((row) => row['릴리즈 날짜'])

    const parseDate = (value) => {
      if (!value) return null
      const parts = value.split(/[./-]/)
      if (parts.length < 2) return null
      const [month, day] = parts.map((part) => parseInt(part, 10))
      const year = new Date().getFullYear()
      return new Date(year, month - 1, day)
    }

    const newsDateObjects = newsDates
      .map(parseDate)
      .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()))

    const newsPeriod = newsDateObjects.length
      ? `${newsDateObjects.reduce((min, date) => (date < min ? date : min), newsDateObjects[0]).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })} ~ ${newsDateObjects.reduce((max, date) => (date > max ? date : max), newsDateObjects[0]).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}`
      : '기간 정보 없음'

    const newsOutlets = new Set()
    newsReleaseData.forEach((row) => {
      if (!row.url) return
      try {
        const url = new URL(row.url)
        newsOutlets.add(url.hostname.replace(/^www\./, ''))
      } catch (error) {
        // ignore invalid URL
      }
    })

    const cafeSeoTotals = cafeSeoData.reduce(
      (acc, row) => {
        const exposure = getField(row, '노출현황')
        if (parseNumber(exposure) === 2) acc.exposureSuccess += 1
        if ((row['스마트블록'] || '').trim()) acc.smartBlock += 1
        if ((row['인기글'] || '').trim()) acc.popularPosts += 1
        acc.totalKeywords += (row['키워드'] || '').trim() ? 1 : 0
        const position = parseNumber(row['카페순위'])
        if (position) {
          acc.positions.push(position)
        }
        return acc
      },
      { totalKeywords: 0, exposureSuccess: 0, smartBlock: 0, popularPosts: 0, positions: [] }
    )

    const cafeAveragePosition = cafeSeoTotals.positions.length
      ? (cafeSeoTotals.positions.reduce((sum, value) => sum + value, 0) / cafeSeoTotals.positions.length).toFixed(1)
      : null

    const badWritingResolved = badWritingData.filter((row) => (row['검토결과'] || '').includes('게시중단')).length

    const operationalCards = [
      {
        id: 10,
        title: 'YouTube 광고',
        subtitle: '평균 CPV / 조회수',
        value: `₩${formatNumber(Math.round(youtubeCPVAverage))}`,
        unit: '',
        additionalData: {
          조회수: `${formatNumber(youtubeTotalViews)}회`
        },
        source: 'youtube_sponsor ad.csv',
        icon: 'feather-youtube'
      },
      {
        id: 11,
        title: 'Facebook 광고',
        subtitle: '도달/노출/클릭',
        value: formatNumber(facebookReach),
        unit: '명',
        additionalData: {
          노출: `${formatNumber(facebookImpressions)}회`,
          클릭: `${formatNumber(facebookClicks)}회`
        },
        source: 'facebook_targeting.csv',
        icon: 'feather-facebook'
      },
      {
        id: 12,
        title: '블로그 운영',
        subtitle: '협력 병원 활동량',
        value: formatNumber(blogTotalPosts),
        unit: '건',
        additionalData: {
          병원수: `${blogHospitalSet.size}곳`
        },
        source: 'blog_post.csv',
        icon: 'feather-edit'
      },
      {
        id: 13,
        title: '뉴스 릴리즈',
        subtitle: '언론 노출',
        value: formatNumber(newsReleaseData.length),
        unit: '건',
        additionalData: {
          기간: newsPeriod,
          언론사: `${newsOutlets.size}곳`
        },
        source: 'news_release.csv',
        icon: 'feather-file-text'
      },
      {
        id: 14,
        title: '카페 SEO',
        subtitle: '노출/스마트블록/인기글',
        value: formatNumber(cafeSeoTotals.exposureSuccess),
        unit: '건',
        additionalData: {
          키워드: `${formatNumber(cafeSeoTotals.totalKeywords)}개`,
          스마트블록: `${formatNumber(cafeSeoTotals.smartBlock)}건`,
          인기글: `${formatNumber(cafeSeoTotals.popularPosts)}건`,
          평균순위: cafeAveragePosition ? `${cafeAveragePosition}위` : '자료 없음'
        },
        source: 'cafe_seo.csv',
        icon: 'feather-search'
      },
      {
        id: 15,
        title: '평판 관리',
        subtitle: '악성 게시물 대응',
        value: formatNumber(badWritingResolved),
        unit: '건',
        additionalData: {
          처리율: badWritingData.length ? `${((badWritingResolved / badWritingData.length) * 100).toFixed(1)}%` : '100%'
        },
        source: 'bad writing.csv',
        icon: 'feather-shield'
      }
    ]

    const summaryPerProduct = ASTERASYS_PRODUCTS.map((product) => ({
      name: product.name,
      sales: productMetrics[product.name]?.sales.volume || 0
    }))

    return {
      productMetrics,
      coreRankingCards,
      engagementCards,
      operationalCards,
      summaryPerProduct,
      totalSales
    }
  }, [data])

  const filteredProducts = useMemo(() => {
    const entries = Object.entries(metrics.productMetrics || {})
    if (activeTab === 'all') return entries
    return entries.filter(([, value]) => {
      if (!value) return false
      return activeTab === 'rf' ? value.technology === '고주파' : value.technology === '초음파'
    })
  }, [metrics.productMetrics, activeTab])

  if (loading) {
    return (
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-body py-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3 mb-0">{monthLabel} 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 기전별 탭 시스템 */}
      <div className="col-12 mb-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-3">
            <div className="d-flex justify-content-center">
              <div className="btn-group" role="group">
                <button
                  className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('all')}
                >
                  전체
                </button>
                <button
                  className={`btn ${activeTab === 'rf' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('rf')}
                >
                  고주파 (RF)
                </button>
                <button
                  className={`btn ${activeTab === 'hifu' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('hifu')}
                >
                  초음파 (HIFU)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 핵심 순위 섹션 */}
      <div className="col-12 mb-4">
        <div className="card stretch stretch-full">
          <div className="card-header">
            <h5 className="card-title">📊 핵심 순위 성과 (실제 CSV 데이터)</h5>
            <span className="badge bg-success">{monthLabel}</span>
          </div>
          <div className="card-body">
            <div className="row g-4">
              {metrics.coreRankingCards?.map((card) => (
                <div key={card.id} className="col-lg col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body text-center p-4">
                      <div className={`avatar-text avatar-lg bg-${card.color}-subtle text-${card.color} mb-3`}>
                        {React.cloneElement(getIcon(card.icon), { size: '20' })}
                      </div>

                      <div className={`h3 fw-bold text-${card.color} mb-1`}>
                        {card.value}
                        <small className="text-muted ms-1 fs-6">{card.unit}</small>
                      </div>

                      {card.rank && (
                        <div className={`badge bg-${card.color} mb-2`}>
                          {card.rank}
                        </div>
                      )}

                      <h6 className="card-title text-dark mb-1">{card.title}</h6>
                      <p className="text-muted small mb-0">{card.subtitle}</p>

                      <div className="mt-3 pt-2 border-top">
                        <small className="text-muted">데이터: {card.source}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 제품 정량 데이터 */}
      <div className="col-12 mb-4">
        <div className="card stretch stretch-full border-warning">
          <div className="card-header bg-warning text-white">
            <h5 className="card-title mb-0">⭐ Asterasys 3종 제품 정량 성과</h5>
          </div>
          <div className="card-body">
            <div className="row g-4">
              {filteredProducts.map(([productName, data]) => (
                <div key={productName} className="col-lg-4">
                  <div className="card border-warning h-100">
                    <div className="card-header bg-light d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="card-title mb-1 d-flex align-items-center">
                          <span className="badge bg-warning text-dark me-2">⭐</span>
                          {productName}
                        </h6>
                        <small className="text-muted">
                          {data.technology === '고주파' ? '고주파 (RF)' : '초음파 (HIFU)'}
                        </small>
                      </div>
                      <button className="btn btn-sm btn-light" type="button">
                        <FiMoreVertical size={16} />
                      </button>
                    </div>
                    <div className="card-body">
                      {data.blog && (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <span className="small text-muted">블로그</span>
                            <span className="fw-bold">{formatNumber(data.blog.posts)}건 {data.blog.rank ? `(${data.blog.rank}위)` : ''}</span>
                          </div>
                        </div>
                      )}

                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <span className="small text-muted">카페</span>
                          <span className="fw-bold">{formatNumber(data.cafe.posts)}건 {data.cafe.rank ? `(${data.cafe.rank}위)` : ''}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="small text-muted">댓글</span>
                          <span className="small">{formatNumber(data.cafe.comments)}개</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="small text-muted">조회</span>
                          <span className="small">{formatNumber(data.cafe.views)}회</span>
                        </div>
                      </div>

                      <div className="bg-primary-subtle rounded p-2 text-center">
                        <div className="fw-bold text-primary h5 mb-1">{formatNumber(data.sales.volume)}</div>
                        <small className="text-muted">판매량 (대)</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row mt-4">
              <div className="col-12">
                <div className="alert alert-warning border-0">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div>
                      <h6 className="mb-1">Asterasys 전체 판매량</h6>
                      <p className="mb-0">
                        {metrics.summaryPerProduct.map(({ name, sales }) => `${name} ${formatNumber(sales)}대`).join(' + ')}
                      </p>
                    </div>
                    <div className="text-end">
                      <div className="h3 text-warning fw-bold">{formatNumber(metrics.totalSales)}</div>
                      <small className="text-muted">대</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 참여도 데이터 */}
      <div className="col-12 mb-4">
        <div className="card stretch stretch-full">
          <div className="card-header">
            <h5 className="card-title">💬 참여도 정량 데이터</h5>
          </div>
          <div className="card-body">
            <div className="row g-4">
              {metrics.engagementCards?.map((card) => (
                <div key={card.id} className="col-lg-3 col-md-6">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body text-center p-3">
                      <div className="text-primary mb-2">
                        {React.cloneElement(getIcon(card.icon), { size: '24' })}
                      </div>
                      <div className="h4 fw-bold text-dark mb-1">
                        {card.value}
                        <small className="text-muted ms-1">{card.unit}</small>
                      </div>
                      <h6 className="card-title mb-1">{card.title}</h6>
                      <small className="text-muted">{card.subtitle}</small>

                      <div className="mt-2 pt-2 border-top">
                        <small className="text-muted">{card.source}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 운영 성과 카드 */}
      <div className="col-12">
        <div className="card stretch stretch-full">
          <div className="card-header">
            <h5 className="card-title">🛠️ 운영 성과 정량 데이터</h5>
          </div>
          <div className="card-body">
            <div className="row g-4">
              {metrics.operationalCards?.map((card) => (
                <div key={card.id} className="col-lg-4 col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="text-primary me-3">
                          {React.cloneElement(getIcon(card.icon), { size: '24' })}
                        </div>
                        <div>
                          <h6 className="card-title mb-0">{card.title}</h6>
                          <small className="text-muted">{card.subtitle}</small>
                        </div>
                      </div>

                      <div className="text-center mb-3">
                        <div className="h3 fw-bold text-primary">
                          {card.value}
                          {card.unit && <small className="text-muted ms-1">{card.unit}</small>}
                        </div>
                      </div>

                      {card.additionalData && (
                        <div className="border-top pt-3">
                          {Object.entries(card.additionalData).map(([key, value]) => (
                            <div key={key} className="d-flex justify-content-between mb-1">
                              <small className="text-muted">{key}</small>
                              <small className="fw-medium">{value}</small>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-top">
                        <small className="text-muted">{card.source}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AsterasysQuantitativeDashboard
