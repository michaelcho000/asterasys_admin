'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'
import CardLoader from '@/components/shared/CardLoader'
import InsightRenderer from './InsightRenderer'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const ViralTypeAnalysis = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [loading, setLoading] = useState(true)
  const [brandingData, setBrandingData] = useState({
    current: { organic: 14, managed: 86 },
    competitor: { organic: 43, managed: 57 },
    target: { organic: 35, managed: 65 }
  })
  const [llmInsights, setLlmInsights] = useState(null)

  useEffect(() => {
    if (!month) return

    const fetchBrandingData = async () => {
      try {
        setLoading(true)

        // Load organic viral analysis results (dynamic calculation from CSV)
        const analysisRes = await fetch(withMonthParam('/api/organic-viral-analysis', month))
        const analysisData = await analysisRes.json()

        // Use pre-calculated organic scores
        const asterasysOrganic = analysisData.asterasys?.organic || 14
        const asterasysManaged = analysisData.asterasys?.managed || 86
        const competitorOrganic = analysisData.competitor?.organic || 43
        const competitorManaged = analysisData.competitor?.managed || 57

        setBrandingData({
          current: { organic: asterasysOrganic, managed: asterasysManaged },
          competitor: { organic: competitorOrganic, managed: competitorManaged },
          target: { organic: 35, managed: 65 }
        })

        // Load LLM-generated insights
        try {
          const insightsRes = await fetch(`/api/llm-insights?month=${month}`)
          if (insightsRes.ok) {
            const insights = await insightsRes.json()
            setLlmInsights(insights)
          }
        } catch (insightError) {
          console.warn('LLM 인사이트 로드 실패:', insightError)
        }

      } catch (error) {
        console.error('브랜딩 전략 데이터 로드 실패:', error)
        // Fallback to calculated values from analysis
        setBrandingData({
          current: { organic: 14, managed: 86 },
          competitor: { organic: 43, managed: 57 },
          target: { organic: 35, managed: 65 }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBrandingData()
  }, [month])

  const roadmapData = [
    {
      quarter: 'Q4 2025',
      target: { organic: 20, managed: 80 },
      actions: [
        '병원 네트워크 30개 확대 (병원블로그 268 → 400건)',
        '카페 비중 유지하되 질적 개선'
      ]
    },
    {
      quarter: 'Q1 2026',
      target: { organic: 28, managed: 72 },
      actions: [
        '카페 점진적 감소 (1,550 → 1,200건)',
        '병원 자발적 콘텐츠 증가'
      ]
    },
    {
      quarter: 'Q2 2026',
      target: { organic: 35, managed: 65 },
      actions: [
        '경쟁사 평균(43%) 근접',
        '병원 중심 Organic 브랜딩 확립'
      ]
    }
  ]

  const createDonutOptions = (title, color) => ({
    chart: {
      type: 'donut',
      toolbar: {
        show: false
      }
    },
    labels: ['Organic Growth', 'Managed Branding'],
    colors: [color === 'primary' ? '#3b82f6' : color === 'warning' ? '#ffc107' : '#10b981', '#94a3b8'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              formatter: (val) => val + '%'
            },
            total: {
              show: true,
              label: title,
              fontSize: '12px',
              fontWeight: 600,
              formatter: () => ''
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toFixed(0) + '%',
      style: {
        fontSize: '13px',
        fontWeight: 600
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '12px'
    }
  })

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
        <h5 className="card-title mb-1">브랜딩 전략 로드맵</h5>
        <p className="text-muted fs-12 mb-0">Organic Growth vs Managed Branding 균형 전략</p>
      </div>
      <div className="card-body">
        {/* Donut Charts Row */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="text-center mb-3">
              <h6 className="fs-13 fw-bold text-dark mb-3">현재 (아스테라시스)</h6>
              <Chart
                options={createDonutOptions('현재', 'primary')}
                series={[brandingData.current.organic, brandingData.current.managed]}
                type="donut"
                height={280}
              />
              <div className="mt-3">
                <span className="badge bg-soft-warning text-warning">Managed 주도</span>
                <p className="fs-11 text-muted mt-2 mb-0">카페 1,550건 (Managed의 85%)</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="text-center mb-3">
              <h6 className="fs-13 fw-bold text-dark mb-3">경쟁사 5개 평균</h6>
              <Chart
                options={createDonutOptions('경쟁사', 'warning')}
                series={[brandingData.competitor.organic, brandingData.competitor.managed]}
                type="donut"
                height={280}
              />
              <div className="mt-3">
                <span className="badge bg-soft-info text-info">균형 전략</span>
                <p className="fs-11 text-muted mt-2 mb-0">덴서티/세르프/볼뉴머/텐써마 (4개 평균)</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="text-center mb-3">
              <h6 className="fs-13 fw-bold text-dark mb-3">목표 (6개월 후)</h6>
              <Chart
                options={createDonutOptions('목표', 'success')}
                series={[brandingData.target.organic, brandingData.target.managed]}
                type="donut"
                height={280}
              />
              <div className="mt-3">
                <span className="badge bg-soft-success text-success">Organic 증가 목표</span>
                <p className="fs-11 text-muted mt-2 mb-0">35% 달성 → 경쟁사 평균 근접</p>
              </div>
            </div>
          </div>
        </div>

        {/* LLM Generated Insights - 2x2 Grid */}
        {llmInsights?.viral && (
          <div className="mt-4 pt-4 border-top">
            <div className="row g-3">
              {/* 현재 분석 */}
              {llmInsights.viral.current && (
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <span className="badge bg-soft-primary text-primary" style={{ whiteSpace: 'nowrap' }}>
                        {llmInsights.viral.current.title}
                      </span>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <InsightRenderer content={llmInsights.viral.current.content} />
                    </div>
                  </div>
                </div>
              )}

              {/* 향후 전략 */}
              {llmInsights.viral.strategy && (
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <span className="badge bg-soft-success text-success" style={{ whiteSpace: 'nowrap' }}>
                        {llmInsights.viral.strategy.title}
                      </span>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <InsightRenderer content={llmInsights.viral.strategy.content} />
                    </div>
                  </div>
                </div>
              )}

              {/* 현재 상황 */}
              {llmInsights.viral.situation && (
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <span className="badge bg-soft-info text-info" style={{ whiteSpace: 'nowrap' }}>
                        {llmInsights.viral.situation.title}
                      </span>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <InsightRenderer content={llmInsights.viral.situation.content} />
                    </div>
                  </div>
                </div>
              )}

              {/* 성장 방향 */}
              {llmInsights.viral.growth && (
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <span className="badge bg-soft-warning text-warning" style={{ whiteSpace: 'nowrap' }}>
                        {llmInsights.viral.growth.title}
                      </span>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <InsightRenderer content={llmInsights.viral.growth.content} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViralTypeAnalysis