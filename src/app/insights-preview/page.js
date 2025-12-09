'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// 사용 가능한 월 목록
const AVAILABLE_MONTHS = ['2025-11', '2025-10', '2025-09', '2025-08']

const InsightsPreviewPage = () => {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState({})
  const [editedContent, setEditedContent] = useState({})
  const [selectedMonth, setSelectedMonth] = useState('2025-11')

  useEffect(() => {
    loadInsights(selectedMonth)
  }, [selectedMonth])

  const loadInsights = async (month) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/llm-insights?month=${month}&mode=admin`)
      const data = await response.json()
      if (data.error) {
        console.error('인사이트 로드 실패:', data.error)
        setInsights(null)
      } else {
        setInsights(data)
      }
    } catch (error) {
      console.error('인사이트 로드 실패:', error)
      setInsights(null)
    } finally {
      setLoading(false)
    }
  }

  const toggleEdit = (sectionId, insightIndex) => {
    const key = `${sectionId}-${insightIndex}`
    setEditMode(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleContentChange = (sectionId, insightIndex, newContent) => {
    const key = `${sectionId}-${insightIndex}`
    setEditedContent(prev => ({ ...prev, [key]: newContent }))
  }

  const saveEdit = (sectionId, insightIndex) => {
    const key = `${sectionId}-${insightIndex}`
    const newContent = editedContent[key]

    // 로컬 상태 업데이트
    setInsights(prev => {
      const updated = { ...prev }
      const section = updated.sections.find(s => s.id === sectionId)
      if (section && section.insights[insightIndex]) {
        section.insights[insightIndex].content = newContent
      }
      return updated
    })

    // 편집 모드 종료
    setEditMode(prev => ({ ...prev, [key]: false }))
  }

  const approveInsights = async () => {
    if (!confirm('이 인사이트를 승인하고 실제 페이지에 반영하시겠습니까?')) {
      return
    }

    try {
      await fetch(`/api/llm-insights?month=${selectedMonth}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...insights, status: 'approved' })
      })
      alert('승인 완료! 실제 페이지에 반영되었습니다.')
      loadInsights(selectedMonth)
    } catch (error) {
      alert('승인 실패: ' + error.message)
    }
  }

  const reAnalyze = async () => {
    if (!confirm('전체 인사이트를 재분석하시겠습니까? (약 1-2분 소요)')) {
      return
    }

    setLoading(true)
    try {
      await fetch(`/api/llm-insights/reanalyze?month=${selectedMonth}`, { method: 'POST' })
      alert('재분석 완료!')
      loadInsights(selectedMonth)
    } catch (error) {
      alert('재분석 실패: ' + error.message)
    }
  }

  const getBadgeClass = (badge) => {
    const classes = {
      danger: 'bg-soft-danger text-danger',
      success: 'bg-soft-success text-success',
      warning: 'bg-soft-warning text-warning',
      info: 'bg-soft-info text-info',
      primary: 'bg-soft-primary text-primary'
    }
    return classes[badge] || classes.info
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
          <code>npm run analyze-insights</code>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        {/* 헤더 */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="d-flex align-items-center mb-2">
                  <h1 className="mb-0 me-3">LLM 인사이트 검수</h1>
                  <select
                    className="form-select"
                    style={{ width: 'auto' }}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {AVAILABLE_MONTHS.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <p className="text-muted mb-0">
                  분석일: {new Date(insights.generatedAt).toLocaleString('ko-KR')} |
                  모델: {insights.model} |
                  상태: <span className={`badge ${insights.status === 'approved' ? 'bg-success' : 'bg-warning'}`}>
                    {insights.status === 'approved' ? '승인됨' : '검수 대기'}
                  </span>
                </p>
              </div>
              <div>
                <button className="btn btn-outline-secondary me-2" onClick={reAnalyze}>
                  <i className="feather-refresh-cw me-1"></i>
                  전체 재분석
                </button>
                {insights.status !== 'approved' && (
                  <button className="btn btn-success" onClick={approveInsights}>
                    <i className="feather-check me-1"></i>
                    승인하고 배포
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Viral 분석 섹션 */}
        {insights.viral && (
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">📊 바이럴 분석</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(insights.viral).map(([key, section]) => (
                  <div key={key} className="col-md-6 mb-4">
                    <div className="card h-100 border">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">{section.title}</h6>
                      </div>
                      <div className="card-body">
                        <div
                          className="markdown-content"
                          dangerouslySetInnerHTML={{
                            __html: section.content
                              ?.replace(/\n/g, '<br/>')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/## (.*?)(<br\/>|$)/g, '<h6 class="mt-3 mb-2 text-primary">$1</h6>')
                              .replace(/- (.*?)(<br\/>|$)/g, '<li>$1</li>')
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 채널별 인사이트 */}
        {insights.channels && (
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">📢 채널별 인사이트</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(insights.channels).map(([channel, data]) => {
                  const channelNames = {
                    cafe: '☕ 카페',
                    blog: '📝 블로그',
                    news: '📰 뉴스',
                    youtube: '🎬 유튜브'
                  }
                  return (
                    <div key={channel} className="col-md-6 mb-4">
                      <div className="card h-100 border">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">{channelNames[channel] || channel}</h6>
                        </div>
                        <div className="card-body">
                          <div
                            className="markdown-content"
                            dangerouslySetInnerHTML={{
                              __html: data.insight
                                ?.replace(/\n/g, '<br/>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* 레거시 섹션 지원 */}
        {insights.sections?.map((section, sectionIndex) => (
          <div key={section.id} className="card mb-4">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-1">{section.title}</h5>
                  <p className="text-muted fs-12 mb-0">
                    적용 위치: <code>{section.targetCard}</code> → <code>{section.position}</code>
                  </p>
                </div>
                <span className="badge bg-soft-info text-info">
                  섹션 {sectionIndex + 1}
                </span>
              </div>
            </div>
            <div className="card-body">
              {section.insights?.map((insight, insightIndex) => {
                const editKey = `${section.id}-${insightIndex}`
                const isEditing = editMode[editKey]
                const currentContent = editedContent[editKey] || insight.content

                return (
                  <div key={insightIndex} className="mb-4 pb-4 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center">
                        <span className={`badge ${getBadgeClass(insight.badge)} me-2`}>
                          {insight.type}
                        </span>
                        {insight.title && (
                          <h6 className="mb-0">{insight.title}</h6>
                        )}
                        {insight.channel && (
                          <span className="text-muted ms-2">({insight.channel})</span>
                        )}
                      </div>
                      <div>
                        {isEditing ? (
                          <>
                            <button
                              className="btn btn-sm btn-success me-1"
                              onClick={() => saveEdit(section.id, insightIndex)}
                            >
                              저장
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => toggleEdit(section.id, insightIndex)}
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => toggleEdit(section.id, insightIndex)}
                          >
                            <i className="feather-edit-2"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <textarea
                        className="form-control"
                        rows="4"
                        value={currentContent}
                        onChange={(e) => handleContentChange(section.id, insightIndex, e.target.value)}
                      />
                    ) : (
                      <p className="mb-0 text-dark">{insight.content}</p>
                    )}

                    {insight.metric && (
                      <div className="mt-2">
                        <span className="badge bg-soft-primary text-primary fs-14">
                          {insight.metric}
                        </span>
                        {insight.trend && (
                          <i className={`feather-trending-${insight.trend} ms-2 text-${insight.trend === 'up' ? 'success' : 'danger'}`}></i>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* 푸터 액션 */}
        <div className="card">
          <div className="card-body text-center">
            <p className="text-muted mb-3">
              검수가 완료되면 승인 버튼을 눌러 실제 마케팅 인사이트 페이지에 반영하세요.
            </p>
            {insights.status !== 'approved' && (
              <button className="btn btn-success btn-lg" onClick={approveInsights}>
                <i className="feather-check me-2"></i>
                승인하고 배포
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InsightsPreviewPage
