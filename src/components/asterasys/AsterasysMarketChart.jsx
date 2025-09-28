'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import CardHeader from '@/components/shared/CardHeader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useAsterasysCsvDataset } from '@/hooks/useAsterasysCsvDataset'
import { formatNumber } from '@/utils/formatNumber'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const parseNumber = (value) => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const sanitized = String(value).replace(/[^\d.-]/g, '')
  if (!sanitized) return 0
  const num = Number(sanitized)
  return Number.isNaN(num) ? 0 : num
}

const buildOptions = (categories, values) => ({
  chart: {
    type: 'bar',
    width: '100%',
    toolbar: { show: false },
    background: 'transparent'
  },
  colors: categories.map((category) => (category.includes('⭐') ? '#f59e0b' : '#8b5cf6')),
  series: [{
    name: '콘텐츠 발행량',
    data: values
  }],
  xaxis: {
    categories,
    labels: {
      style: {
        colors: '#64748b',
        fontSize: '12px'
      }
    }
  },
  yaxis: {
    title: {
      text: '발행량 (건)',
      style: { color: '#64748b' }
    }
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '70%',
      distributed: true
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val, opts) => `${opts.dataPointIndex + 1}위`,
    style: {
      colors: ['#fff'],
      fontSize: '11px',
      fontWeight: 'bold'
    }
  },
  tooltip: {
    custom: function({ dataPointIndex }) {
      const name = categories[dataPointIndex]
      const value = values[dataPointIndex]
      return `
        <div class="px-3 py-2">
          <div class="fw-bold">${name.replace('⭐ ', '')}</div>
          <div>순위: ${dataPointIndex + 1}위</div>
          <div>발행량: ${formatNumber(value)}건</div>
          <div class="text-muted small">출처: cafe_rank.csv</div>
        </div>
      `
    }
  }
})

const AsterasysMarketChart = () => {
  const { data, loading, monthLabel } = useAsterasysCsvDataset(['cafe_rank'])
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()

  const chartData = useMemo(() => {
    const rows = data.cafe_rank?.marketData || []
    const rfRows = rows.filter((row) => (row.그룹 || '').trim() === '고주파')
    const sorted = rfRows
      .map((row) => ({
        name: row.키워드,
        value: parseNumber(row['총 발행량']),
        rank: parseNumber(row['발행량 순위'])
      }))
      .sort((a, b) => a.rank - b.rank)

    const categories = sorted.map((item) => {
      const label = item.name
      return ['쿨페이즈'].includes(label) ? `⭐ ${label}` : label
    })
    const values = sorted.map((item) => item.value)

    const asterasysRow = sorted.find((item) => item.name === '쿨페이즈')
    const totalRfPosts = sorted.reduce((sum, item) => sum + item.value, 0)
    const asterasysShare = totalRfPosts ? ((asterasysRow?.value || 0) / totalRfPosts) * 100 : 0

    return {
      categories,
      values,
      highlight: {
        name: '쿨페이즈',
        rank: asterasysRow?.rank || '-',
        posts: asterasysRow?.value || 0,
        share: asterasysShare
      },
      totals: {
        brands: sorted.length,
        posts: totalRfPosts,
        share: asterasysShare
      }
    }
  }, [data])

  if (isRemoved) {
    return null
  }

  return (
    <div className={`card stretch stretch-full ${isExpanded ? 'card-expand' : ''} ${refreshKey ? 'card-loading' : ''}`}>
      <CardHeader
        title={`RF (고주파) 시장 순위 • ${monthLabel}`}
        refresh={handleRefresh}
        remove={handleDelete}
        expanded={handleExpand}
      />
      <div className="card-body custom-card-action p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <ReactApexChart
            options={buildOptions(chartData.categories, chartData.values)}
            series={[{ name: '콘텐츠 발행량', data: chartData.values }]}
            type="bar"
            height={350}
          />
        )}

        {!loading && (
          <div className="alert alert-warning border-0 mt-4 mb-0">
            <div className="d-flex align-items-center">
              <span className="badge bg-warning text-dark me-3">⭐</span>
              <div>
                <strong>{chartData.highlight.name}</strong>: {chartData.highlight.rank}위 • {formatNumber(chartData.highlight.posts)}건 발행량
                <br />
                <small className="text-muted">RF 시장 점유율 {chartData.highlight.share.toFixed(1)}%</small>
              </div>
            </div>
          </div>
        )}
      </div>
      {!loading && (
        <div className="card-footer bg-light">
          <div className="row text-center">
            <div className="col-4">
              <div className="small text-muted">RF 총 브랜드</div>
              <div className="fw-bold">{formatNumber(chartData.totals.brands)}개</div>
            </div>
            <div className="col-4">
              <div className="small text-muted">총 발행량</div>
              <div className="fw-bold">{formatNumber(chartData.totals.posts)}건</div>
            </div>
            <div className="col-4">
              <div className="small text-muted">Asterasys 점유율</div>
              <div className="fw-bold text-warning">{chartData.highlight.share.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AsterasysMarketChart
