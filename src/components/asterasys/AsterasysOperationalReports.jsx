'use client'

import React, { useMemo } from 'react'
import { useAsterasysCsvDataset } from '@/hooks/useAsterasysCsvDataset'
import { formatNumber } from '@/utils/formatNumber'
import { FiSearch, FiYoutube, FiEdit3, FiTrendingUp } from 'react-icons/fi'

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

const formatDuration = (start, end) => {
  if (!start || !end) return '기간 정보 없음'
  return `${start} ~ ${end}`
}

const AsterasysOperationalReports = () => {
  const { data, loading, monthLabel } = useAsterasysCsvDataset([
    'cafe_seo',
    'youtube_sponsor',
    'blog_post',
    'news_release'
  ])

  const metrics = useMemo(() => {
    const seoRows = data.cafe_seo?.marketData || []
    const youtubeRows = data.youtube_sponsor?.marketData || []
    const blogPostRows = data.blog_post?.marketData || []
    const newsRows = data.news_release?.marketData || []

    const seoTotals = seoRows.reduce(
      (acc, row) => {
        const exposure = parseNumber(getField(row, '노출현황'))
        if ((row['키워드'] || '').trim()) acc.totalKeywords += 1
        if (exposure === 2) acc.exposureSuccess += 1
        if ((row['스마트블록'] || '').trim()) acc.smartBlock += 1
        if ((row['인기글'] || '').trim()) acc.popularPosts += 1
        const position = parseNumber(row['카페순위'])
        if (position) acc.positions.push(position)
        return acc
      },
      { totalKeywords: 0, exposureSuccess: 0, smartBlock: 0, popularPosts: 0, positions: [] }
    )

    const averagePosition = seoTotals.positions.length
      ? (seoTotals.positions.reduce((sum, value) => sum + value, 0) / seoTotals.positions.length).toFixed(1)
      : null

    const youtubeCampaigns = youtubeRows.filter((row) => (row['캠페인'] || row['캠페인 이름'])?.trim())
    const youtubeAverageCPV = youtubeCampaigns.length
      ? youtubeCampaigns.reduce((sum, row) => sum + parseNumber(row['평균 CPV'] || row['평균 CPV ']), 0) / youtubeCampaigns.length
      : 0
    const youtubeImpressions = youtubeRows.reduce((sum, row) => sum + parseNumber(getField(row, '노출')), 0)
    const youtubeViews = youtubeRows.reduce((sum, row) => sum + parseNumber(getField(row, '조회수')), 0)

    const blogHospitals = new Set()
    let blogTotalPosts = 0
    blogPostRows.forEach((row) => {
      if ((row['병원명'] || '').trim()) blogHospitals.add(row['병원명'])
      blogTotalPosts += parseNumber(row['총 발행 수'])
    })

    const releaseDates = newsRows
      .map((row) => row['릴리즈 날짜'])
      .filter(Boolean)
    const parseDate = (value) => {
      const parts = value.split(/[./-]/)
      if (parts.length < 2) return null
      const [month, day] = parts.map((part) => parseInt(part, 10))
      const year = new Date().getFullYear()
      return new Date(year, month - 1, day)
    }
    const dateObjects = releaseDates
      .map(parseDate)
      .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()))

    const periodStart = dateObjects.length
      ? dateObjects.reduce((min, date) => (date < min ? date : min), dateObjects[0])
      : null
    const periodEnd = dateObjects.length
      ? dateObjects.reduce((max, date) => (date > max ? date : max), dateObjects[0])
      : null

    const mediaOutlets = new Set()
    newsRows.forEach((row) => {
      if (!row.url) return
      try {
        const url = new URL(row.url)
        mediaOutlets.add(url.hostname.replace(/^www\./, ''))
      } catch (error) {
        // ignore invalid url
      }
    })

    return {
      seo: {
        totalKeywords: seoTotals.totalKeywords,
        exposureSuccess: seoTotals.exposureSuccess,
        smartBlock: seoTotals.smartBlock,
        popularPosts: seoTotals.popularPosts,
        averagePosition: averagePosition ? `${averagePosition}위` : '자료 없음'
      },
      youtube: {
        campaigns: youtubeCampaigns.length,
        averageCPV: Math.round(youtubeAverageCPV),
        impressions: youtubeImpressions,
        views: youtubeViews
      },
      blog: {
        hospitals: blogHospitals.size,
        totalPosts: blogTotalPosts,
        averagePosts:
          blogHospitals.size > 0 ? (blogTotalPosts / blogHospitals.size).toFixed(1) : '0.0'
      },
      news: {
        totalReleases: newsRows.length,
        period: formatDuration(
          periodStart?.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
          periodEnd?.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
        ),
        outlets: mediaOutlets.size,
        coverageByProduct: newsRows.reduce((acc, row) => {
          const key = (row['기기구분'] || '기타').trim()
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {})
      }
    }
  }, [data])

  if (loading) {
    return (
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-body py-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3 mb-0">{monthLabel} 운영 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* SEO 성과 */}
      <div className="col-lg-6">
        <div className="card stretch stretch-full">
          <div className="card-header">
            <h5 className="card-title">
              <FiSearch className="me-2 text-primary" />
              SEO 성과 현황
              <span className="badge bg-primary ms-2">{monthLabel}</span>
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-6">
                <div className="text-center p-3 border rounded-3">
                  <div className="h4 text-primary fw-bold">{formatNumber(metrics.seo.totalKeywords)}</div>
                  <small className="text-muted">총 키워드</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-3 border rounded-3">
                  <div className="h4 text-success fw-bold">{formatNumber(metrics.seo.exposureSuccess)}</div>
                  <small className="text-muted">노출 성공</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-3 border rounded-3">
                  <div className="h4 text-warning fw-bold">{formatNumber(metrics.seo.smartBlock)}</div>
                  <small className="text-muted">스마트블록</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-3 border rounded-3">
                  <div className="h4 text-info fw-bold">{formatNumber(metrics.seo.popularPosts)}</div>
                  <small className="text-muted">인기글</small>
                </div>
              </div>
            </div>
            <div className="alert alert-light border mt-4 mb-0">
              <div className="d-flex justify-content-between">
                <span className="text-muted">평균 카페 순위</span>
                <span className="fw-semibold">{metrics.seo.averagePosition}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube 광고 성과 */}
      <div className="col-lg-6">
        <div className="card stretch stretch-full">
          <div className="card-header">
            <h5 className="card-title">
              <FiYoutube className="me-2 text-danger" />
              YouTube 광고 성과
              <span className="badge bg-danger ms-2">{metrics.youtube.campaigns}개 캠페인</span>
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-6">
                <div className="text-center p-3 bg-danger-subtle rounded">
                  <div className="h4 text-danger fw-bold">₩{formatNumber(metrics.youtube.averageCPV)}</div>
                  <small className="text-muted">평균 CPV</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-3 border rounded">
                  <div className="h4 fw-bold">{formatNumber(metrics.youtube.views)}</div>
                  <small className="text-muted">조회수 (회)</small>
                </div>
              </div>
              <div className="col-12">
                <div className="alert alert-light border mb-0">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">노출 수</span>
                    <span className="fw-semibold">{formatNumber(metrics.youtube.impressions)}회</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 블로그 운영 현황 */}
      <div className="col-lg-6">
        <div className="card stretch stretch-full">
          <div className="card-header">
            <h5 className="card-title">
              <FiEdit3 className="me-2 text-info" />
              블로그 운영 현황
              <span className="badge bg-info ms-2">{monthLabel}</span>
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="text-center p-3 border rounded-3">
                  <div className="h4 text-info fw-bold">{formatNumber(metrics.blog.hospitals)}</div>
                  <small className="text-muted">협력 병원</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-3 border rounded-3">
                  <div className="h4 text-success fw-bold">{formatNumber(metrics.blog.totalPosts)}</div>
                  <small className="text-muted">총 게시물</small>
                </div>
              </div>
            </div>
            <div className="alert alert-light border mb-0">
              <div className="d-flex justify-content-between">
                <span className="text-muted">병원당 평균 게시물</span>
                <span className="fw-semibold">{metrics.blog.averagePosts}건</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 뉴스 릴리즈 성과 */}
      <div className="col-lg-6">
        <div className="card stretch stretch-full">
          <div className="card-header">
            <h5 className="card-title">
              <FiTrendingUp className="me-2 text-warning" />
              뉴스 릴리즈 성과
              <span className="badge bg-warning ms-2">{monthLabel}</span>
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="text-center p-3 border rounded-3">
                  <div className="h4 text-warning fw-bold">{formatNumber(metrics.news.totalReleases)}</div>
                  <small className="text-muted">총 릴리즈</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-3 border rounded-3">
                  <div className="h4 text-primary fw-bold">{formatNumber(metrics.news.outlets)}</div>
                  <small className="text-muted">언론사 수</small>
                </div>
              </div>
            </div>
            <div className="alert alert-light border">
              <div className="d-flex justify-content-between">
                <span className="text-muted">보도 기간</span>
                <span className="fw-semibold">{metrics.news.period}</span>
              </div>
            </div>
            <div className="border-top pt-3">
              <h6 className="text-muted small mb-2">제품별 보도 현황</h6>
              {Object.entries(metrics.news.coverageByProduct).map(([product, count]) => (
                <div key={product} className="d-flex justify-content-between mb-1">
                  <span className="small">{product}</span>
                  <span className="badge bg-warning">{formatNumber(count)}건</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AsterasysOperationalReports
