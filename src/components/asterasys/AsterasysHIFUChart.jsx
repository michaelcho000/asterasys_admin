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

const buildOptions = (labels, series, total) => ({
  chart: {
    type: 'donut',
    width: '100%',
    toolbar: { show: false }
  },
  colors: labels.map((label) => (label.includes('⭐') ? '#f59e0b' : '#0ea5e9')),
  series,
  labels,
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: '총 발행',
            formatter: () => `${formatNumber(total)}건`
          },
          value: {
            show: true,
            formatter: (val) => `${formatNumber(val)}건`
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val, opts) => `${opts.seriesIndex + 1}위`
  },
  legend: {
    show: true,
    position: 'bottom',
    fontSize: '12px',
    formatter: (seriesName, opts) => {
      const value = opts.w.config.series[opts.seriesIndex]
      return `${opts.seriesIndex + 1}위 ${seriesName}: ${formatNumber(value)}건`
    }
  },
  tooltip: {
    custom: function({ seriesIndex, w }) {
      const name = labels[seriesIndex]
      const value = series[seriesIndex]
      const percentage = total ? ((value / total) * 100).toFixed(1) : '0.0'
      return `
        <div class="px-3 py-2">
          <div class="fw-bold">${name.replace('⭐ ', '')}</div>
          <div>순위: ${seriesIndex + 1}위</div>
          <div>발행량: ${formatNumber(value)}건</div>
          <div>점유율: ${percentage}%</div>
          <div class="text-muted small">출처: cafe_rank.csv</div>
        </div>
      `
    }
  }
})

const AsterasysHIFUChart = () => {
  const { data, loading, monthLabel } = useAsterasysCsvDataset(['cafe_rank'])
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()

  const chartData = useMemo(() => {
    const rows = data.cafe_rank?.marketData || []
    const hifuRows = rows.filter((row) => (row.그룹 || '').trim() === '초음파')
    const sorted = hifuRows
      .map((row) => ({
        name: row.키워드,
        value: parseNumber(row['총 발행량']),
        rank: parseNumber(row['발행량 순위'])
      }))
      .sort((a, b) => a.rank - b.rank)

    const labels = sorted.map((item) => ['쿨소닉', '리프테라'].includes(item.name) ? `⭐ ${item.name}` : item.name)
    const series = sorted.map((item) => item.value)
    const total = series.reduce((sum, value) => sum + value, 0)

    const asterasysValue = sorted
      .filter((item) => ['쿨소닉', '리프테라'].includes(item.name))
      .reduce((sum, item) => sum + item.value, 0)

    return {
      labels,
      series,
      total,
      asterasysShare: total ? (asterasysValue / total) * 100 : 0,
      asterasysDetails: sorted.filter((item) => ['쿨소닉', '리프테라'].includes(item.name))
    }
  }, [data])

  if (isRemoved) {
    return null
  }

  return (
    <div className={`card stretch stretch-full leads-overview ${isExpanded ? 'card-expand' : ''} ${refreshKey ? 'card-loading' : ''}`}>
      <CardHeader
        title={`HIFU (초음파) 시장 분포 • ${monthLabel}`}
        refresh={handleRefresh}
        remove={handleDelete}
        expanded={handleExpand}
      />

      <div className="card-body custom-card-action">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <ReactApexChart
            options={buildOptions(chartData.labels, chartData.series, chartData.total)}
            series={chartData.series}
            type="donut"
            height={315}
          />
        )}

        {!loading && (
          <div className="row g-2 pt-3 mt-3 border-top">
            {chartData.asterasysDetails.map((detail) => (
              <div key={detail.name} className="col-6">
                <div className="text-center p-3 bg-warning-subtle rounded">
                  <div className="fw-bold text-warning h6 mb-1">⭐ {detail.name}</div>
                  <div className="small text-muted">{detail.rank ? `${detail.rank}위` : '순위 없음'} • {formatNumber(detail.value)}건</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="row mt-3">
            <div className="col-12">
              <div className="alert alert-info border-0 p-3">
                <div className="text-center">
                  <strong>HIFU 시장 Asterasys 점유율</strong>
                  <div className="h5 text-info fw-bold mt-1">{chartData.asterasysShare.toFixed(1)}%</div>
                  <small className="text-muted">쿨소닉 + 리프테라</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AsterasysHIFUChart
