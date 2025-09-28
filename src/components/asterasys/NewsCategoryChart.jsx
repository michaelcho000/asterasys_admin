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

const NewsCategoryChart = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState('RF')
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
        
        if (!result || !result.rfProducts || !result.hifuProducts) {
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

  if (loading || !data || !data.rfProducts || !data.hifuProducts) {
    return (
      <div className="col-12">
        <CardLoader />
      </div>
    )
  }

  const currentProducts = activeTab === 'RF' ? data.rfProducts : data.hifuProducts
  const categoryNames = ['기업소식', '병원발행', '연예인', '투자주식', '고객반응', '기술자료', '의학', '기타']
  
  // Create series data - each category is a series
  const seriesData = categoryNames.map(categoryName => ({
    name: categoryName,
    data: currentProducts.map(product => product.categories[categoryName] || 0)
  }))

  const chartOptions = {
    chart: {
      type: "bar",
      height: 400,
      stacked: true,
      stackType: '100%',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        columnWidth: "75%",
        horizontal: false
      }
    },
    colors: ["#283c50", "#3454d1", "#fb8500", "#25b865", "#ffb703", "#06b6d4", "#8b5cf6", "#6b7280"],
    series: seriesData,
    xaxis: {
      categories: currentProducts.map(product => product.name),
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          fontSize: "11px",
          colors: "#64748b",
          fontFamily: "Inter, sans-serif"
        },
        rotate: -45,
        rotateAlways: true
      }
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return Math.floor(val) + "%"
        },
        style: {
          colors: "#64748b",
          fontSize: "11px",
          fontFamily: "Inter, sans-serif"
        }
      }
    },
    grid: {
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      borderColor: "#e5e7eb",
      strokeDashArray: 3,
      padding: {
        left: 20,
        right: -10
      }
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      intersect: false,
      shared: true,
      inverseOrder: true,
      y: {
        formatter: function (val) {
          return val.toFixed(1) + "%"
        }
      },
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif"
      }
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: "11px",
      fontFamily: "Inter, sans-serif",
      labels: {
        fontSize: "11px",
        colors: "#64748b"
      },
      markers: {
        shape: "circle",
        width: 6,
        height: 6
      },
      itemMargin: {
        horizontal: 6,
        vertical: 3
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 350
        },
        legend: {
          position: "bottom",
          fontSize: "10px"
        },
        xaxis: {
          labels: {
            fontSize: "9px"
          }
        }
      }
    }]
  }

  return (
    <div className="col-12">
      <div className="card stretch stretch-full">
        <div className="card-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h5 className="card-title">뉴스 분석 - 제품별 카테고리 비중</h5>
              <p className="text-muted fs-12 mb-0">각 제품별 뉴스 카테고리 분포 현황</p>
            </div>
            <div className="card-header-action">
              <div className="nav nav-tabs" role="tablist">
                <button 
                  className={`nav-link ${activeTab === 'RF' ? 'active' : ''}`}
                  onClick={() => setActiveTab('RF')}
                  type="button"
                >
                  RF (고주파)
                </button>
                <button 
                  className={`nav-link ${activeTab === 'HIFU' ? 'active' : ''}`}
                  onClick={() => setActiveTab('HIFU')}
                  type="button"
                >
                  HIFU (초음파)
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-body custom-card-action">
          <div className="leads-inquiry-channel">
            <ReactApexChart
              type='bar'
              options={chartOptions}
              series={seriesData}
              height={400}
            />
          </div>
          
          <div className="mt-4">
            <div className="d-flex justify-content-center">
              <small className="text-muted">
                {activeTab} 기술 {currentProducts.length}개 제품의 뉴스 카테고리별 비중 (100% 스택 차트)
              </small>
            </div>
            
            <div className="row g-2 mt-3">
              {currentProducts.map((product, index) => (
                <div key={index} className="col-6 col-md-4 col-lg-3">
                  <div className="d-flex align-items-center justify-content-between py-2 px-3 bg-light rounded">
                    <span className={`fs-11 fw-semibold ${product.isAsterasys ? 'text-primary' : 'text-dark'}`}>
                      {product.name}
                      {product.isAsterasys && (
                        <span className="badge bg-primary text-white ms-1" style={{fontSize: '7px'}}>
                          Asterasys
                        </span>
                      )}
                    </span>
                    <span className="fs-10 text-muted">{product.total_articles}건</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsCategoryChart
