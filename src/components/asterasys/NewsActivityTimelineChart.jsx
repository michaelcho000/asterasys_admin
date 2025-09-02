'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import dynamic from 'next/dynamic'
const ReactApexChart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="d-flex justify-content-center align-items-center" style={{height: '350px'}}><div className="spinner-border" role="status"></div></div>
  }
)

const NewsActivityTimelineChart = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data/news-analysis')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        
        if (!result || !result.activityAnalysis) {
          console.error('Invalid data structure received:', result)
          return
        }
        
        setData(result)
      } catch (error) {
        console.error('Error fetching news analysis data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || !data || !data.activityAnalysis) {
    return (
      <div className="col-xxl-6">
        <CardLoader />
      </div>
    )
  }

  // Prepare timeline data
  const asterasysProducts = data.activityAnalysis.filter(item => item.isAsterasys)
  const topCompetitors = data.activityAnalysis
    .filter(item => !item.isAsterasys)
    .sort((a, b) => b.total_articles - a.total_articles)
    .slice(0, 3)

  const timelineData = [
    {
      name: 'Asterasys 평균',
      data: asterasysProducts.map(item => ({
        x: item.product_name,
        y: item.avg_daily_articles
      })),
      color: '#3b82f6'
    },
    {
      name: '상위 경쟁사',
      data: topCompetitors.map(item => ({
        x: item.product_name,
        y: item.avg_daily_articles
      })),
      color: '#6b7280'
    }
  ]

  const chartOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#3b82f6', '#6b7280'],
    series: timelineData,
    xaxis: {
      type: 'category',
      labels: {
        rotate: -45,
        style: {
          fontSize: '10px',
          colors: '#6b7280'
        }
      },
      title: {
        text: '제품명',
        style: {
          fontSize: '12px',
          color: '#6b7280'
        }
      }
    },
    yaxis: {
      title: {
        text: '일평균 기사 수',
        style: {
          fontSize: '12px',
          color: '#6b7280'
        }
      },
      labels: {
        formatter: function(val) {
          return val.toFixed(1) + '건'
        },
        style: {
          fontSize: '11px',
          colors: '#6b7280'
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      fillOpacity: 1,
      hover: {
        size: 8
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function({series, seriesIndex, dataPointIndex, w}) {
        const productName = w.globals.labels[dataPointIndex]
        const value = series[seriesIndex][dataPointIndex]
        const productData = data.activityAnalysis.find(item => item.product_name === productName)
        const isAsterasys = productData?.isAsterasys
        
        return `
          <div class="px-3 py-2">
            <div class="fw-semibold ${isAsterasys ? 'text-primary' : 'text-dark'}">${productName}</div>
            <div class="fs-11 text-muted">일평균: ${value}건</div>
            <div class="fs-11 text-muted">최대: ${productData?.max_daily_articles || 0}건</div>
            <div class="fs-11 text-muted">스파이크: ${productData?.spike_dates_count || 0}회</div>
            <div class="fs-11 text-muted">총 기사: ${productData?.total_articles || 0}건</div>
            ${isAsterasys ? '<div class="badge bg-primary text-white mt-1">Asterasys</div>' : ''}
          </div>
        `
      }
    },
    legend: {
      show: true,
      position: 'top',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif'
    }
  }

  return (
    <div className="col-xxl-6">
      <div className="card stretch stretch-full">
        <CardHeader title="일평균 활동 추이 분석" />
        
        <div className="card-body custom-card-action">
          <div className="activity-timeline-chart">
            <ReactApexChart
              type='line'
              options={chartOptions}
              series={chartOptions.series}
              height={350}
            />
          </div>
          
          <div className="mt-4">
            <div className="row g-3">
              <div className="col-4">
                <div className="text-center">
                  <div className="fs-11 text-muted">최고 활성도</div>
                  <div className="fw-bold text-success">
                    {Math.max(...data.activityAnalysis.map(item => item.avg_daily_articles)).toFixed(1)}건/일
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center">
                  <div className="fs-11 text-muted">Asterasys 평균</div>
                  <div className="fw-bold text-primary">
                    {(asterasysProducts.reduce((sum, item) => sum + item.avg_daily_articles, 0) / asterasysProducts.length).toFixed(1)}건/일
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center">
                  <div className="fs-11 text-muted">스파이크 총합</div>
                  <div className="fw-bold text-warning">
                    {data.activityAnalysis.reduce((sum, item) => sum + item.spike_dates_count, 0)}회
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsActivityTimelineChart