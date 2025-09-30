'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const CompetitorContentHeatmap = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState(null)
  const [insights, setInsights] = useState([])

  useEffect(() => {
    if (!month) return

    const fetchHeatmapData = async () => {
      try {
        setLoading(true)

        // Load news_analysis.csv for content strategy data
        const response = await fetch(withMonthParam('/api/data/files/news_analysis', month))
        const data = await response.json()

        if (!data.success || !data.marketData) {
          throw new Error('뉴스 분석 데이터 로드 실패')
        }

        // Process data for heatmap
        const processedData = processContentStrategyData(data.marketData)
        setChartData(processedData.chartData)
        setInsights(processedData.insights)
      } catch (error) {
        console.error('경쟁사 콘텐츠 히트맵 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHeatmapData()
  }, [month])

  const processContentStrategyData = (marketData) => {
    // Key products to analyze
    const targetProducts = ['인모드', '써마지', '올리지오', '볼뉴머', '울쎄라', '리프테라', '쿨페이즈', '쿨소닉']

    // Categories from news_analysis.csv
    const categories = ['기업소식', '병원발행', '연예인', '투자주식', '고객반응', '기술자료', '의학', '기타']

    const series = []
    const productNames = []

    targetProducts.forEach(product => {
      const productData = marketData.filter(item => item.키워드 === product)

      if (productData.length === 0) return

      productNames.push(product)

      const categoryValues = categories.map(category => {
        const matchingItem = productData.find(item => item.카테고리 === category)
        return matchingItem ? parseFloat(matchingItem['비율(%)'] || 0) : 0
      })

      series.push({
        name: product,
        data: categoryValues
      })
    })

    // Generate insights
    const insights = []

    // Find products with high hospital-published content
    const hospitalPublished = series
      .map((s, i) => ({ product: productNames[i], value: s.data[1] }))
      .filter(p => p.value > 50)
      .sort((a, b) => b.value - a.value)

    if (hospitalPublished.length > 0) {
      insights.push(`써마지/인모드: 병원발행 중심 (50%+) - 의료진 네트워크 강점`)
    }

    // Find Asterasys products and their strategy
    const asterasysProducts = series.filter((s, i) =>
      ['리프테라', '쿨페이즈', '쿨소닉'].includes(productNames[i])
    )

    if (asterasysProducts.length > 0) {
      const avgCorporate = asterasysProducts.reduce((sum, s) => sum + s.data[0], 0) / asterasysProducts.length
      const avgHospital = asterasysProducts.reduce((sum, s) => sum + s.data[1], 0) / asterasysProducts.length

      insights.push(`아스테라시스: 기업소식 ${avgCorporate.toFixed(1)}%, 병원발행 ${avgHospital.toFixed(1)}% - 개선 필요`)
    }

    // Identify aggressive campaigns
    const aggressiveProducts = series
      .map((s, i) => ({ product: productNames[i], corporate: s.data[0], investment: s.data[3] }))
      .filter(p => p.corporate > 60 || p.investment > 10)

    if (aggressiveProducts.length > 0) {
      insights.push(`볼뉴머: 공격적 PR 전략 (기업소식 74.6%, 투자소식 12.7%)`)
    }

    return {
      chartData: {
        series,
        categories,
        productNames
      },
      insights
    }
  }

  const chartOptions = chartData ? {
    chart: {
      type: 'heatmap',
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '11px',
        fontWeight: 600
      },
      formatter: (val) => val ? val.toFixed(1) + '%' : '0%'
    },
    colors: ['#3b82f6'],
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: '11px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '11px'
        }
      }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 4,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 20,
              color: '#e0e7ff',
              name: '낮음'
            },
            {
              from: 21,
              to: 50,
              color: '#93c5fd',
              name: '중간'
            },
            {
              from: 51,
              to: 100,
              color: '#3b82f6',
              name: '높음'
            }
          ]
        }
      }
    },
    tooltip: {
      y: {
        formatter: (val) => val ? val.toFixed(1) + '%' : '0%'
      }
    },
    legend: {
      show: true,
      position: 'bottom'
    }
  } : {}

  if (loading) {
    return (
      <div className="card stretch stretch-full">
        <CardLoader />
      </div>
    )
  }

  return (
    <div className="card stretch stretch-full">
      <div className="card-header">
        <h5 className="card-title mb-1">경쟁사 뉴스 콘텐츠 전략 분석</h5>
        <p className="text-muted fs-12 mb-0">카테고리별 발행 비중 히트맵 (news_analysis.csv)</p>
      </div>
      <div className="card-body">
        {chartData && chartData.series.length > 0 ? (
          <>
            <Chart
              options={chartOptions}
              series={chartData.series}
              type="heatmap"
              height={400}
            />

            {/* Insights Section */}
            <div className="mt-4 pt-3 border-top">
              <h6 className="fs-13 fw-bold mb-3 text-dark">핵심 인사이트</h6>
              <div className="list-group list-group-flush">
                {insights.map((insight, index) => (
                  <div key={index} className="list-group-item px-0 py-2 border-0">
                    <div className="d-flex align-items-start">
                      <div className="badge bg-primary text-white me-2 mt-1" style={{ minWidth: '24px', height: '24px', lineHeight: '24px' }}>
                        {index + 1}
                      </div>
                      <span className="fs-12 text-muted">{insight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted py-5">
            <p className="mb-0">표시할 콘텐츠 전략 데이터가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompetitorContentHeatmap