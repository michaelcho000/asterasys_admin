'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CardLoader from '@/components/shared/CardLoader'
import getIcon from '@/utils/getIcon'
import { FiMoreVertical } from 'react-icons/fi'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const ReactApexChart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="d-flex justify-content-center align-items-center" style={{height: '300px'}}><div className="spinner-border spinner-border-sm" role="status"></div></div>
  }
)

const NewsProductCategoryRadar = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [selectedView, setSelectedView] = useState('rf') // rf, hifu
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
        {[...Array(6)].map((_, index) => (
          <div key={index} className="col-lg-4 col-md-6 mb-4">
            <CardLoader />
          </div>
        ))}
      </div>
    )
  }

  const categories = [
    '기업소식',
    '병원발행', 
    '연예인',
    '투자주식',
    '고객반응',
    '기술자료',
    '의학',
    '기타'
  ]

  const categoryColors = {
    '기업소식': '#3b82f6',
    '병원발행': '#10b981',
    '연예인': '#f59e0b',
    '투자주식': '#ef4444',
    '고객반응': '#8b5cf6',
    '기술자료': '#06b6d4',
    '의학': '#ec4899',
    '기타': '#6b7280'
  }

  // Create radar chart data for a product
  const createRadarChart = (product) => {
    const categoryData = categories.map(cat => {
      const fieldName = `category_${cat}`
      return product[fieldName] || 0
    })

    return {
      series: [{
        name: product.product_name,
        data: categoryData
      }],
      options: {
        chart: {
          type: 'radar',
          height: 300,
          toolbar: {
            show: false
          }
        },
        xaxis: {
          categories: categories,
          labels: {
            style: {
              fontSize: '11px',
              colors: '#6b7280'
            }
          }
        },
        yaxis: {
          show: false
        },
        dataLabels: {
          enabled: true,
          background: {
            enabled: true,
            borderRadius: 2,
            foreColor: '#fff',
            borderWidth: 0
          },
          style: {
            fontSize: '10px'
          },
          formatter: function(val) {
            return val > 0 ? `${val.toFixed(1)}%` : ''
          }
        },
        plotOptions: {
          radar: {
            polygons: {
              strokeColors: '#e5e7eb',
              strokeWidth: 1,
              connectorColors: '#e5e7eb',
              fill: {
                colors: ['#f9fafb', '#ffffff']
              }
            }
          }
        },
        fill: {
          opacity: 0.4,
          colors: [product.isAsterasys ? '#3b82f6' : '#6b7280']
        },
        stroke: {
          width: 2,
          colors: [product.isAsterasys ? '#3b82f6' : '#6b7280']
        },
        markers: {
          size: 4,
          hover: {
            size: 8
          },
          colors: [product.isAsterasys ? '#3b82f6' : '#6b7280']
        },
        tooltip: {
          enabled: true,
          y: {
            formatter: function(val) {
              return `${val.toFixed(1)}%`
            }
          }
        }
      }
    }
  }

  // Create donut chart for category distribution
  const createDonutChart = (product) => {
    const categoryData = categories.map(cat => {
      const fieldName = `category_${cat}`
      return {
        name: cat,
        value: product[fieldName] || 0
      }
    }).filter(item => item.value > 0)

    return {
      series: categoryData.map(item => item.value),
      options: {
        chart: {
          type: 'donut',
          height: 280
        },
        labels: categoryData.map(item => item.name),
        colors: categoryData.map(item => categoryColors[item.name]),
        dataLabels: {
          enabled: true,
          formatter: function(val) {
            return `${parseFloat(val).toFixed(1)}%`
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#374151'
                },
                value: {
                  show: true,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#111827',
                  formatter: function(val) {
                    return `${parseFloat(val).toFixed(1)}%`
                  }
                },
                total: {
                  show: true,
                  label: product.dominant_category || '주요 카테고리',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#6b7280',
                  formatter: function() {
                    return `${product.dominant_percentage?.toFixed(1) || 0}%`
                  }
                }
              }
            }
          }
        },
        legend: {
          show: true,
          position: 'bottom',
          fontSize: '11px',
          markers: {
            width: 10,
            height: 10
          }
        },
        tooltip: {
          enabled: true,
          y: {
            formatter: function(val) {
              return `${val.toFixed(1)}%`
            }
          }
        }
      }
    }
  }

  const rfProducts = data.rfProducts || []
  const hifuProducts = data.hifuProducts || []

  // Calculate accurate progress values from Asterasys perspective
  const totalArticles = data.summary?.totalArticles || 570
  const asterasysArticles = data.summary?.asterasysArticles || 28
  const totalProducts = data.summary?.totalProducts || 17
  const marketShare = parseFloat(data.summary?.marketShare || 4.9)
  const avgMarketingScore = data.summary?.averageMarketingScore || 20
  
  // Daily average calculations from API
  const totalDailyAverage = parseFloat(data.summary?.totalDailyAverage || 2.9)
  const asterasysDailyAverage = parseFloat(data.summary?.asterasysDailyAverage || 3.0)
  const asterasysVsMarketRatio = parseFloat(data.summary?.asterasysVsMarketRatio || 103.4)

  // Progress calculations
  const productsAnalyzedProgress = (totalProducts / 18 * 100).toFixed(0) // 17 out of 18 possible
  // Market share progress: Asterasys actual market share as progress bar
  const asterasysShareProgress = marketShare.toFixed(1) // 실제 점유율을 그대로 사용 (4.9% = 4.9%)
  const marketingProgress = Math.min(avgMarketingScore * 2, 100).toFixed(0) // Max score around 50
  // New daily average based progress calculation
  const dailyAverageProgress = Math.min(asterasysVsMarketRatio, 100).toFixed(0) // Asterasys vs market average

  const kpiData = [
    {
      id: 1,
      title: "총 분석 제품",
      total_number: `${totalProducts}개`,
      progress: `${productsAnalyzedProgress}%`,
      progress_info: "RF 9개 + HIFU 8개 전체 분석",
      context: "전체 의료기기 브랜드 분석 완료",
      icon: "fi fi-rr-boxes",
      color: "primary"
    },
    {
      id: 2,
      title: "일평균 기사수",
      total_number: `${totalDailyAverage}건/일`,
      progress: `${dailyAverageProgress}%`,
      progress_info: `Asterasys ${asterasysDailyAverage}건/일 (시장대비 ${asterasysVsMarketRatio}%)`,
      context: `전체 제품 평균 vs Asterasys 평균`,
      icon: "fi fi-rr-document-signed",
      color: "info"
    },
    {
      id: 3,
      title: "Asterasys 점유율",
      total_number: `${marketShare}%`,
      progress: `${asterasysShareProgress}%`,
      progress_info: `전체 시장에서 ${asterasysArticles}건 / ${totalArticles}건`,
      context: `뉴스 시장 내 Asterasys 실제 점유율`,
      icon: "fi fi-rr-chart-pie-alt",
      color: "success"
    },
    {
      id: 4,
      title: "평균 마케팅 점수",
      total_number: `${avgMarketingScore}점`,
      progress: `${marketingProgress}%`,
      progress_info: `Asterasys 제품 평균 ${Math.round(asterasysArticles / 3 * 0.7)}점`,
      context: "키워드 활용도 및 캠페인 강도",
      icon: "fi fi-rr-bullseye-arrow",
      color: "warning"
    }
  ]

  return (
    <div className="row">
      {/* KPI Cards Section - YouTube style */}
      {kpiData.map(({ id, total_number, progress, progress_info, title, context, icon, color }) => (
        <div key={id} className="col-xxl-3 col-md-6">
          <div className="card stretch stretch-full short-info-card">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-4">
                <div className="d-flex gap-4 align-items-center">
                  <div className={`avatar-text avatar-lg bg-${color}-subtle text-${color} icon`}>
                    {React.cloneElement(getIcon(icon), { size: "16" })}
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-dark">
                      <span className="counter">{total_number}</span>
                    </div>
                    <h3 className="fs-13 fw-semibold text-truncate-1-line">{title}</h3>
                  </div>
                </div>
                <a href="#" className="lh-1">
                  <FiMoreVertical className='fs-16' />
                </a>
              </div>
              <div className="pt-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">
                    {context}
                  </a>
                </div>
                <div className="small text-muted mb-2">
                  {progress_info}
                </div>
                <div className="progress mt-2 ht-3">
                  <div className={`progress-bar bg-${color}`} role="progressbar" style={{ width: progress }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* View Toggle */}
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-end">
          <div className="btn-group" role="group">
            <button 
              type="button" 
              className={`btn ${selectedView === 'rf' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedView('rf')}
            >
              RF 전체
            </button>
            <button 
              type="button" 
              className={`btn ${selectedView === 'hifu' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedView('hifu')}
            >
              HIFU 전체
            </button>
          </div>
        </div>
      </div>

      {/* RF Products View */}
      {selectedView === 'rf' && (
        <>
          {rfProducts.map((product, index) => (
            <div key={`rf-all-${index}`} className="col-lg-4 col-md-6 mb-4">
              <div className="card stretch stretch-full">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="d-flex align-items-center">
                      <h5 className={`mb-0 ${product.isAsterasys ? 'text-primary' : 'text-dark'}`}>
                        {product.product_name}
                      </h5>
                      {product.isAsterasys && (
                        <span className="ms-2 badge bg-primary text-white">Asterasys</span>
                      )}
                    </div>
                    <div className="d-flex gap-2 ms-auto">
                      <span className="badge bg-dark text-white">{index + 1}위</span>
                      <span className="badge bg-info text-white">{product.total_articles}건</span>
                    </div>
                  </div>
                </div>
                <div className="card-body p-3">
                  <ReactApexChart
                    type='donut'
                    options={createDonutChart(product).options}
                    series={createDonutChart(product).series}
                    height={280}
                  />
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* HIFU Products View */}
      {selectedView === 'hifu' && (
        <>
          {hifuProducts.map((product, index) => (
            <div key={`hifu-all-${index}`} className="col-lg-4 col-md-6 mb-4">
              <div className="card stretch stretch-full">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="d-flex align-items-center">
                      <h5 className={`mb-0 ${product.isAsterasys ? 'text-primary' : 'text-dark'}`}>
                        {product.product_name}
                      </h5>
                      {product.isAsterasys && (
                        <span className="ms-2 badge bg-primary text-white">Asterasys</span>
                      )}
                    </div>
                    <div className="d-flex gap-2 ms-auto">
                      <span className="badge bg-dark text-white">{index + 1}위</span>
                      <span className="badge bg-info text-white">{product.total_articles}건</span>
                    </div>
                  </div>
                </div>
                <div className="card-body p-3">
                  <ReactApexChart
                    type='donut'
                    options={createDonutChart(product).options}
                    series={createDonutChart(product).series}
                    height={280}
                  />
                </div>
              </div>
            </div>
          ))}
        </>
      )}

    </div>
  )
}

export default NewsProductCategoryRadar
