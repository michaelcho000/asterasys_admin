'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const InsightsPreviewPage = () => {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState({})
  const [editedContent, setEditedContent] = useState({})

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      const response = await fetch('/api/llm-insights')
      const data = await response.json()
      setInsights(data)
    } catch (error) {
      console.error('인사이트 로드 실패:', error)
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
      await fetch('/api/llm-insights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...insights, status: 'approved' })
      })
      alert('승인 완료! 실제 페이지에 반영되었습니다.')
      loadInsights()
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
      await fetch('/api/llm-insights/reanalyze', { method: 'POST' })
      alert('재분석 완료!')
      loadInsights()
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
                <h1 className="mb-2">LLM 인사이트 검수</h1>
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

        {/* 요약 */}
        {insights.summary && (
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">핵심 발견사항</h5>
                </div>
                <div className="card-body">
                  <ul className="mb-0">
                    {insights.summary.keyFindings?.map((finding, i) => (
                      <li key={i} className="mb-2">{finding}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">실행 권장사항</h5>
                </div>
                <div className="card-body">
                  <ul className="mb-0">
                    {insights.summary.recommendations?.map((rec, i) => (
                      <li key={i} className="mb-2">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 섹션별 인사이트 */}
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
