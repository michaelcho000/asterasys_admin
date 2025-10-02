'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// Force dynamic rendering to fix useSearchParams prerendering error
export const dynamic = 'force-dynamic'

const InsightsPreviewV2 = () => {
  const searchParams = useSearchParams()
  const month = searchParams.get('month') || '2025-09'

  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState({})
  const [editedContent, setEditedContent] = useState({})

  useEffect(() => {
    loadInsights()
  }, [month])

  const loadInsights = async () => {
    try {
      const response = await fetch(`/api/llm-insights-v2?month=${month}`)
      const data = await response.json()
      setInsights(data)
    } catch (error) {
      console.error('인사이트 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeClass = (badge) => {
    const classes = {
      primary: 'bg-soft-primary text-primary',
      success: 'bg-soft-success text-success',
      warning: 'bg-soft-warning text-warning',
      danger: 'bg-soft-danger text-danger',
      info: 'bg-soft-info text-info'
    }
    return classes[badge] || classes.info
  }

  const getTrendIcon = (trend) => {
    if (trend === 'up') return 'feather-trending-up text-success'
    if (trend === 'down') return 'feather-trending-down text-danger'
    return 'feather-minus text-muted'
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">로딩중...</span>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4>인사이트가 없습니다</h4>
          <p>먼저 분석을 실행해주세요:</p>
          <code>npm run analyze-insights-enhanced {month}</code>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container-fluid px-4">
        {/* 헤더 */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-2">마케팅 인사이트 분석 ({insights.month})</h1>
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted">
                    <i className="feather-calendar me-1"></i>
                    대상 월: {insights.month}
                  </span>
                  <span className="text-muted">
                    <i className="feather-bar-chart me-1"></i>
                    비교 월: {insights.previousMonth}
                  </span>
                  <span className={`badge ${insights.status === 'approved' ? 'bg-success' : 'bg-warning'}`}>
                    {insights.status === 'approved' ? '승인됨' : '검수 대기'}
                  </span>
                </div>
              </div>
              <div>
                <button className="btn btn-outline-secondary me-2">
                  <i className="feather-refresh-cw me-1"></i>
                  전체 재분석
                </button>
                {insights.status !== 'approved' && (
                  <button className="btn btn-success">
                    <i className="feather-check me-1"></i>
                    승인하고 배포
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 주요 메트릭 */}
        {insights.summary?.keyMetrics && (
          <div className="row mb-4">
            {insights.summary.keyMetrics.map((metric, i) => (
              <div key={i} className="col-md-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="text-muted mb-1 fs-12">{metric.label}</p>
                        <h3 className="mb-0">{metric.value}</h3>
                      </div>
                      <span className={`badge ${getBadgeClass(metric.badge)}`}>
                        {metric.badge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 섹션별 인사이트 */}
        {insights.sections?.map((section, sectionIndex) => (
          <div key={section.id} className="card mb-4 shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-1">{section.title}</h5>
                  <p className="text-muted fs-12 mb-0">
                    시각화 타입: <code>{section.visualType}</code>
                  </p>
                </div>
                <span className="badge bg-soft-primary text-primary">
                  섹션 {sectionIndex + 1}
                </span>
              </div>
            </div>
            <div className="card-body">
              {/* 경쟁사 벤치마킹 */}
              {section.visualType === 'comparison-cards' && (
                <div className="row g-3">
                  {section.insights?.map((insight, i) => (
                    <div key={i} className="col-md-6 col-lg-4">
                      <div className="card border h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h6 className="mb-0">{insight.competitor}</h6>
                            {insight.strengths?.length > 0 && (
                              <div className="d-flex flex-wrap gap-1">
                                {insight.strengths.map((strength, si) => (
                                  <span key={si} className="badge bg-soft-success text-success fs-10">
                                    {strength}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 메트릭 */}
                          {insight.metrics && (
                            <div className="mb-3">
                              {Object.entries(insight.metrics).map(([key, metric]) => (
                                <div key={key} className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="text-muted fs-12">{key}</span>
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="fw-bold">{metric.value?.toLocaleString()}</span>
                                    <span className={`badge ${getBadgeClass(metric.badge)}`}>
                                      {metric.label}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 우리와의 격차 */}
                          {insight.ourGap && (
                            <div className="alert alert-light border mb-0">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="fw-bold fs-12">vs {insight.ourGap.product}</span>
                                <span className={`badge ${getBadgeClass(insight.ourGap.gapBadge)}`}>
                                  -{insight.ourGap.blogGap}
                                </span>
                              </div>
                              <p className="fs-11 text-muted mb-0">{insight.ourGap.gapDescription}</p>
                            </div>
                          )}

                          {/* 핵심 교훈 */}
                          {insight.keyTakeaway && (
                            <div className="mt-3 pt-3 border-top">
                              <p className="fs-12 text-primary mb-0">
                                <i className="feather-lightbulb me-1"></i>
                                {insight.keyTakeaway}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 아웃라이어 알림 카드 */}
              {section.visualType === 'alert-cards' && (
                <div className="row g-3">
                  {section.insights?.map((insight, i) => (
                    <div key={i} className="col-md-6">
                      <div className={`alert alert-${insight.badge === 'warning' ? 'warning' : 'info'} border-0`}>
                        <div className="d-flex align-items-start">
                          <i className={`feather-alert-triangle fs-4 me-3 text-${insight.badge === 'warning' ? 'warning' : 'info'}`}></i>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="mb-0">{insight.type}</h6>
                              <span className={`badge ${getBadgeClass(insight.badge)}`}>
                                {insight.channel}
                              </span>
                            </div>
                            <p className="mb-2"><strong>{insight.product}</strong>: {insight.value}</p>
                            <p className="fs-12 mb-2">원인: {insight.reason}</p>
                            <p className="fs-12 text-primary mb-0">
                              <i className="feather-arrow-right me-1"></i>
                              {insight.actionable}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 트렌드 인디케이터 */}
              {section.visualType === 'trend-indicators' && (
                <div className="row g-3">
                  {section.insights?.map((insight, i) => (
                    <div key={i} className="col-12">
                      <div className="card border">
                        <div className="card-body">
                          <h6 className="mb-3">{insight.product}</h6>
                          <div className="row g-3 mb-3">
                            {Object.entries(insight.changes || {}).map(([key, change]) => (
                              <div key={key} className="col-md-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="text-muted fs-12">{key}</span>
                                  <i className={getTrendIcon(change.trend)}></i>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <span className="fs-4 fw-bold">{change.value}</span>
                                  {change.percent && (
                                    <span className={`badge ${getBadgeClass(change.trend === 'up' ? 'success' : 'danger')}`}>
                                      {change.percent}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="alert alert-light border mb-0">
                            <p className="fs-12 mb-0">
                              <i className="feather-info me-1"></i>
                              {insight.interpretation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 실행 우선순위 버튼 */}
              {section.visualType === 'priority-buttons' && (
                <div className="row g-3">
                  {section.insights?.map((insight, i) => (
                    <div key={i} className="col-md-6 col-lg-4">
                      <div className={`card border-${insight.badge} h-100`}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <span className={`badge ${getBadgeClass(insight.badge)} fs-14`}>
                              우선순위 {insight.priority}
                            </span>
                            <span className="badge bg-soft-secondary text-secondary">
                              {insight.label}
                            </span>
                          </div>
                          <h6 className="mb-3">{insight.action}</h6>
                          <div className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                              <span className="fs-12 text-muted">목표</span>
                              <span className="fs-12 fw-bold">{insight.metric}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span className="fs-12 text-muted">기간</span>
                              <span className="fs-12 fw-bold">{insight.timeline}</span>
                            </div>
                          </div>
                          {insight.keyMetrics && (
                            <div className="mt-3 pt-3 border-top">
                              <p className="fs-11 text-muted mb-2">핵심 지표:</p>
                              {insight.keyMetrics.map((metric, mi) => (
                                <span key={mi} className="badge bg-soft-info text-info me-1 mb-1">
                                  {metric}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 기본 텍스트 인사이트 */}
              {!['comparison-cards', 'alert-cards', 'trend-indicators', 'priority-buttons'].includes(section.visualType) && section.insights && (
                <div className="row g-3">
                  {section.insights.map((insight, i) => (
                    <div key={i} className="col-12">
                      <div className="border-bottom pb-3 mb-3">
                        {insight.title && <h6>{insight.title}</h6>}
                        <p className="mb-0">{insight.content || JSON.stringify(insight)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 데이터 분석 상세 */}
        {insights.dataAnalysis && (
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">데이터 분석 상세</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="text-center">
                    <h2 className="mb-0">{Object.keys(insights.dataAnalysis.competitors || {}).length}</h2>
                    <p className="text-muted fs-12 mb-0">분석된 제품</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <h2 className="mb-0">{insights.dataAnalysis.outliers?.length || 0}</h2>
                    <p className="text-muted fs-12 mb-0">아웃라이어</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <h2 className="mb-0">{Object.keys(insights.dataAnalysis.trends?.products || {}).length}</h2>
                    <p className="text-muted fs-12 mb-0">트렌드 분석</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InsightsPreviewV2
