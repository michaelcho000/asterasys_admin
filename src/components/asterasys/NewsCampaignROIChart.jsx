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

const NewsCampaignROIChart = () => {
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
        
        if (!result || !result.campaignROI) {
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

  if (loading || !data || !data.campaignROI) {
    return (
      <div className="col-xxl-6">
        <CardLoader />
      </div>
    )
  }

  // Separate data by Asterasys vs competitors
  const asterasysData = data.campaignROI.filter(item => item.isAsterasys)
  const competitorData = data.campaignROI.filter(item => !item.isAsterasys)

  const chartOptions = {
    chart: {
      type: 'scatter',
      height: 380,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: true,
        type: 'xy'
      }
    },
    colors: ['#3b82f6', '#6b7280'],
    series: [
      {
        name: 'Asterasys 제품',
        data: asterasysData.map(item => ({
          x: item.campaign_score,
          y: item.marketing_score,
          z: item.total_articles,
          product: item.product_name
        }))
      },
      {
        name: '경쟁사 제품',
        data: competitorData.map(item => ({
          x: item.campaign_score,
          y: item.marketing_score,
          z: item.total_articles,
          product: item.product_name
        }))
      }
    ],
    xaxis: {
      title: {
        text: '캠페인 점수',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          color: '#6b7280'
        }
      },
      labels: {
        formatter: function(val) {
          return val.toFixed(1)
        },
        style: {
          fontSize: '11px',
          colors: '#6b7280'
        }
      },
      min: 0,
      max: 1
    },
    yaxis: {
      title: {
        text: '마케팅 키워드 점수',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          color: '#6b7280'
        }
      },
      labels: {
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
    tooltip: {
      custom: function({series, seriesIndex, dataPointIndex, w}) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex]
        const isAsterasys = seriesIndex === 0
        return `
          <div class="px-3 py-2">
            <div class="fw-semibold ${isAsterasys ? 'text-primary' : 'text-dark'}">${data.product}</div>
            <div class="fs-11 text-muted">캠페인 점수: ${data.x}</div>
            <div class="fs-11 text-muted">마케팅 점수: ${data.y}</div>
            <div class="fs-11 text-muted">총 기사: ${data.z}건</div>
            ${isAsterasys ? '<div class="badge bg-primary text-white mt-1">Asterasys</div>' : ''}
          </div>
        `
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif'
    },
    markers: {
      size: function(w) {
        // Bubble size based on article count
        return Math.max(4, Math.min(20, w.z / 5))
      },
      strokeWidth: 2,
      strokeColors: ['#3b82f6', '#6b7280'],
      fillOpacity: 0.8,
      hover: {
        size: undefined,
        sizeOffset: 3
      }
    },
    annotations: {
      xaxis: [
        {
          x: 0.5,
          strokeDashArray: 5,
          borderColor: '#ef4444',
          label: {
            text: '중간값',
            style: {
              fontSize: '10px',
              color: '#ef4444'
            }
          }
        }
      ],
      yaxis: [
        {
          y: 25,
          strokeDashArray: 5,
          borderColor: '#ef4444',
          label: {
            text: '평균값',
            style: {
              fontSize: '10px',
              color: '#ef4444'
            }
          }
        }
      ]
    }
  }

  return (
    <div className="col-xxl-6">
      <div className="card stretch stretch-full">
        <CardHeader title="캠페인 ROI 분석" />
        
        <div className="card-body custom-card-action">
          <div className="campaign-roi-chart">
            <ReactApexChart
              type='scatter'
              options={chartOptions}
              series={chartOptions.series}
              height={380}
            />
          </div>
          
          <div className="mt-3">
            <div className="row g-2">
              <div className="col-6">
                <div className="text-center p-2 bg-light rounded">
                  <div className="fs-11 text-muted">고성과 구간</div>
                  <div className="fw-semibold text-success">
                    {data.campaignROI.filter(item => 
                      item.campaign_score > 0.5 && item.marketing_score > 25
                    ).length}개 제품
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-2 bg-light rounded">
                  <div className="fs-11 text-muted">Asterasys 평균</div>
                  <div className="fw-semibold text-primary">
                    {(data.campaignROI
                      .filter(item => item.isAsterasys)
                      .reduce((sum, item) => sum + item.marketing_score, 0) / 
                     data.campaignROI.filter(item => item.isAsterasys).length
                    ).toFixed(1)}점
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

export default NewsCampaignROIChart