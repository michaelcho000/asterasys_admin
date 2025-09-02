'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import dynamic from 'next/dynamic'
const ReactApexChart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="d-flex justify-content-center align-items-center" style={{height: '300px'}}><div className="spinner-border" role="status"></div></div>
  }
)

const NewsCelebrityInfluenceChart = () => {
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
        
        if (!result || !result.celebrityData) {
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

  if (loading || !data || !data.celebrityData) {
    return (
      <div className="col-xxl-6">
        <CardLoader />
      </div>
    )
  }

  // Parse celebrity data
  const celebrityMap = new Map()
  
  data.celebrityData.forEach(item => {
    const usage = item.celebrity_usage
    if (usage && usage !== '없음') {
      // Parse celebrity mentions like "전지현(18); 이민호(18); 김태희(2)"
      const mentions = usage.split(';').map(mention => mention.trim())
      
      mentions.forEach(mention => {
        const match = mention.match(/^(.*?)\((\d+)\)$/)
        if (match) {
          const [, name, count] = match
          if (!celebrityMap.has(name)) {
            celebrityMap.set(name, { products: [], totalImpact: 0 })
          }
          const celeb = celebrityMap.get(name)
          celeb.products.push({
            product: item.product_name,
            impact: parseInt(count),
            isAsterasys: item.isAsterasys
          })
          celeb.totalImpact += parseInt(count)
        }
      })
    }
  })

  const celebrities = Array.from(celebrityMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.totalImpact - a.totalImpact)

  if (celebrities.length === 0) {
    return (
      <div className="col-xxl-6">
        <div className="card stretch stretch-full">
          <CardHeader title="셀럽 영향력 분석" />
          <div className="card-body">
            <div className="text-center py-5">
              <i className="feather-star fs-1 text-muted mb-3"></i>
              <p className="text-muted">셀럽 연계 데이터가 없습니다</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
        horizontal: false,
        distributed: true
      }
    },
    colors: ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
    series: [{
      name: '영향력 점수',
      data: celebrities.map((celeb, index) => ({
        x: celeb.name,
        y: celeb.totalImpact,
        products: celeb.products
      }))
    }],
    xaxis: {
      labels: {
        style: {
          fontSize: '11px',
          colors: '#6b7280'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(val) {
          return Math.floor(val) + '점'
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
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '10px',
        colors: ['#fff']
      }
    },
    tooltip: {
      custom: function({series, seriesIndex, dataPointIndex, w}) {
        const celeb = celebrities[dataPointIndex]
        return `
          <div class="px-3 py-2">
            <div class="fw-semibold text-dark">${celeb.name}</div>
            <div class="fs-11 text-muted mb-2">총 영향력: ${celeb.totalImpact}점</div>
            ${celeb.products.map(p => `
              <div class="d-flex justify-content-between align-items-center">
                <span class="fs-10 ${p.isAsterasys ? 'text-primary fw-semibold' : 'text-muted'}">${p.product}</span>
                <span class="fs-10 text-muted">${p.impact}점</span>
              </div>
            `).join('')}
          </div>
        `
      }
    },
    legend: {
      show: false
    }
  }

  return (
    <div className="col-xxl-6">
      <div className="card stretch stretch-full">
        <CardHeader title="셀럽 영향력 분석" />
        
        <div className="card-body custom-card-action">
          <div className="celebrity-influence-chart">
            <ReactApexChart
              type='bar'
              options={chartOptions}
              series={chartOptions.series}
              height={300}
            />
          </div>
          
          <div className="mt-4">
            <div className="celebrity-breakdown">
              {celebrities.slice(0, 4).map((celeb, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <div className="fw-semibold text-dark">{celeb.name}</div>
                    <div className="fs-11 text-muted">
                      {celeb.products.length}개 제품 연계
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold text-warning">{celeb.totalImpact}점</div>
                    <div className="fs-10 text-muted">
                      {celeb.products.filter(p => p.isAsterasys).length > 0 && 
                        <span className="badge bg-primary text-white">Asterasys</span>
                      }
                    </div>
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

export default NewsCelebrityInfluenceChart