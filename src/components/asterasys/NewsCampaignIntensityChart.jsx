'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import dynamic from 'next/dynamic'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'
const ReactApexChart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="d-flex justify-content-center align-items-center" style={{height: '350px'}}><div className="spinner-border" role="status"></div></div>
  }
)

const NewsCampaignIntensityChart = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const month = useSelectedMonthStore((state) => state.selectedMonth)

  useEffect(() => {
    if (!month) return
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(withMonthParam('/api/data/news-analysis', month))
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        
        if (!result || !result.campaignIntensity) {
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
  }, [month])

  if (loading || !data || !data.campaignIntensity) {
    return (
      <div className="col-xxl-6">
        <CardLoader />
      </div>
    )
  }

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    colors: ['#ef4444', '#f59e0b', '#3b82f6', '#6b7280'],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '50%',
        horizontal: false,
        distributed: true
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        colors: ['#fff']
      }
    },
    xaxis: {
      categories: ['HIGH', 'MEDIUM', 'LOW', 'NONE'],
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          colors: '#6b7280'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          colors: '#6b7280'
        },
        formatter: function (val) {
          return Math.floor(val) + '개'
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + '개 제품'
        }
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      }
    },
    legend: {
      show: false
    }
  }

  const seriesData = [
    data.campaignIntensity.HIGH,
    data.campaignIntensity.MEDIUM,
    data.campaignIntensity.LOW,
    data.campaignIntensity.NONE
  ]

  return (
    <div className="col-xxl-6">
      <div className="card stretch stretch-full">
        <CardHeader title="캠페인 집중도 분석" />
        
        <div className="card-body custom-card-action">
          <div className="campaign-intensity-chart">
            <ReactApexChart
              type='bar'
              options={chartOptions}
              series={[{
                name: '제품 수',
                data: seriesData
              }]}
              height={350}
            />
          </div>
          
          <div className="mt-4">
            <div className="row g-3">
              <div className="col-6">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 me-2">
                    <div 
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#ef4444',
                        borderRadius: '2px'
                      }}
                    ></div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fs-12 text-muted">고강도 캠페인</div>
                    <div className="fw-semibold text-dark">{data.campaignIntensity.HIGH}개</div>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 me-2">
                    <div 
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#f59e0b',
                        borderRadius: '2px'
                      }}
                    ></div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fs-12 text-muted">중강도 캠페인</div>
                    <div className="fw-semibold text-dark">{data.campaignIntensity.MEDIUM}개</div>
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

export default NewsCampaignIntensityChart
