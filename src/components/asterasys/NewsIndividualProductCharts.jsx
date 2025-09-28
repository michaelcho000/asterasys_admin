'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const ReactApexChart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="d-flex justify-content-center align-items-center" style={{height: '200px'}}><div className="spinner-border spinner-border-sm" role="status"></div></div>
  }
)

const NewsIndividualProductCharts = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const month = useSelectedMonthStore((state) => state.selectedMonth)

  useEffect(() => {
    if (!month) return
    const fetchData = async () => {
      try {
        const response = await fetch(withMonthParam('/api/data/news-analysis', month))
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        
        if (!result) {
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

  if (loading || !data) {
    return (
      <div className="row">
        {[...Array(18)].map((_, index) => (
          <div key={index} className="col-xxl-2 col-xl-3 col-lg-4 col-md-6 mb-4">
            <CardLoader />
          </div>
        ))}
      </div>
    )
  }

  const categories = [
    '뷰티/성형',
    '경제',
    '라이프',
    '스포츠',
    '연예',
    '의료/건강',
    '정치',
    'IT/과학'
  ]

  const createProductChart = (product) => {
    const categoryData = categories.map(cat => {
      const value = parseInt(product[cat] || 0)
      return value
    })

    const total = categoryData.reduce((sum, val) => sum + val, 0)
    
    if (total === 0) {
      return null
    }

    const percentageData = categoryData.map(val => 
      total > 0 ? ((val / total) * 100).toFixed(1) : 0
    )

    return {
      series: [{
        data: percentageData.map(Number)
      }],
      options: {
        chart: {
          type: 'bar',
          height: 200,
          toolbar: {
            show: false
          },
          sparkline: {
            enabled: false
          }
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
            barHeight: '70%',
            distributed: true
          }
        },
        colors: [
          '#FF6B6B', // 뷰티/성형 - Red
          '#4ECDC4', // 경제 - Teal
          '#45B7D1', // 라이프 - Sky Blue
          '#FFA07A', // 스포츠 - Light Salmon
          '#98D8C8', // 연예 - Mint
          '#FFD700', // 의료/건강 - Gold
          '#7B68EE', // 정치 - Medium Slate Blue
          '#20B2AA'  // IT/과학 - Light Sea Green
        ],
        xaxis: {
          categories: categories,
          labels: {
            show: false
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
              fontSize: '10px',
              colors: '#6b7280'
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val) {
            return val > 0 ? `${val}%` : ''
          },
          style: {
            fontSize: '10px',
            colors: ['#fff']
          }
        },
        grid: {
          show: false
        },
        tooltip: {
          enabled: true,
          y: {
            formatter: function(val) {
              return `${val}%`
            }
          }
        },
        legend: {
          show: false
        }
      }
    }
  }

  const rfProducts = data.rfProducts || []
  const hifuProducts = data.hifuProducts || []

  return (
    <div className="row">
      {/* RF Products Section */}
      <div className="col-12 mb-4">
        <h5 className="text-dark fw-semibold mb-3">
          <span className="badge bg-soft-primary text-primary me-2">RF</span>
          고주파 제품군
        </h5>
        <div className="row">
          {rfProducts.map((product, index) => {
            const chartConfig = createProductChart(product)
            if (!chartConfig) return null

            return (
              <div key={index} className="col-xxl-3 col-xl-4 col-lg-6 col-md-6 mb-4">
                <div className="card stretch stretch-full">
                  <div className="card-header p-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className={`mb-0 ${product.isAsterasys ? 'text-primary fw-bold' : 'text-dark fw-semibold'}`}>
                          {product.product_name}
                          {product.isAsterasys && (
                            <span className="ms-2 badge bg-primary text-white fs-10">Asterasys</span>
                          )}
                        </h6>
                        <small className="text-muted">
                          총 {product.total_articles}건 | 순위 #{index + 1}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-2">
                    <ReactApexChart
                      type='bar'
                      options={chartConfig.options}
                      series={chartConfig.series}
                      height={200}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* HIFU Products Section */}
      <div className="col-12">
        <h5 className="text-dark fw-semibold mb-3">
          <span className="badge bg-soft-success text-success me-2">HIFU</span>
          초음파 제품군
        </h5>
        <div className="row">
          {hifuProducts.map((product, index) => {
            const chartConfig = createProductChart(product)
            if (!chartConfig) return null

            return (
              <div key={index} className="col-xxl-3 col-xl-4 col-lg-6 col-md-6 mb-4">
                <div className="card stretch stretch-full">
                  <div className="card-header p-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className={`mb-0 ${product.isAsterasys ? 'text-primary fw-bold' : 'text-dark fw-semibold'}`}>
                          {product.product_name}
                          {product.isAsterasys && (
                            <span className="ms-2 badge bg-primary text-white fs-10">Asterasys</span>
                          )}
                        </h6>
                        <small className="text-muted">
                          총 {product.total_articles}건 | 순위 #{rfProducts.length + index + 1}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-2">
                    <ReactApexChart
                      type='bar'
                      options={chartConfig.options}
                      series={chartConfig.series}
                      height={200}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category Legend */}
      <div className="col-12 mt-4">
        <div className="card">
          <div className="card-body">
            <h6 className="text-muted mb-3">카테고리 범례</h6>
            <div className="d-flex flex-wrap gap-3">
              {categories.map((cat, index) => (
                <div key={index} className="d-flex align-items-center">
                  <div 
                    className="rounded-circle me-2" 
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
                        '#98D8C8', '#FFD700', '#7B68EE', '#20B2AA'
                      ][index]
                    }}
                  ></div>
                  <small className="text-muted">{cat}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsIndividualProductCharts
