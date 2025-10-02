'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import InsightRenderer from '@/components/asterasys/InsightRenderer'

function InsightsReviewContent() {
  const searchParams = useSearchParams()
  const monthParam = searchParams.get('month') || '2025-09'

  const [month, setMonth] = useState(monthParam)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)

  useEffect(() => {
    loadInsights()
  }, [month])

  const loadInsights = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/llm-insights?month=${month}&mode=admin`)
      if (res.ok) {
        const data = await res.json()
        setInsights(data)
      } else {
        const error = await res.json()
        alert(error.error || '인사이트 로드 실패')
        setInsights(null)
      }
    } catch (error) {
      console.error('로드 실패:', error)
      alert('인사이트 로드 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm(`${month} 인사이트를 승인하시겠습니까?\n승인 후 일반 사용자에게 노출됩니다.`)) {
      return
    }

    try {
      setApproving(true)
      const res = await fetch('/api/llm-insights/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month })
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message)
        setInsights(data.insights)
      } else {
        alert(data.error || '승인 실패')
      }
    } catch (error) {
      console.error('승인 실패:', error)
      alert('승인 중 오류 발생')
    } finally {
      setApproving(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="main-content">
        <div className="alert alert-warning">
          {month} 인사이트를 찾을 수 없습니다.
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">LLM 인사이트 검수</h3>
          <p className="text-muted mb-0">생성된 인사이트를 검수하고 승인하세요</p>
        </div>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="2025-08">2025년 8월</option>
            <option value="2025-09">2025년 9월</option>
            <option value="2025-10">2025년 10월</option>
          </select>
          {insights.status === 'draft' && (
            <button
              className="btn btn-success"
              onClick={handleApprove}
              disabled={approving}
            >
              {approving ? '승인 중...' : '✓ 승인하고 배포'}
            </button>
          )}
          {insights.status === 'approved' && (
            <span className="badge bg-success fs-6 px-3 py-2">
              ✓ 승인 완료
            </span>
          )}
        </div>
      </div>

      {/* Status Info */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <div className="mb-0">
                <small className="text-muted d-block">대상 월</small>
                <strong>{insights.month}</strong>
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-0">
                <small className="text-muted d-block">상태</small>
                <span className={`badge bg-${insights.status === 'approved' ? 'success' : 'warning'}`}>
                  {insights.status === 'approved' ? '승인됨' : '검수 대기'}
                </span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-0">
                <small className="text-muted d-block">생성일시</small>
                <strong>{new Date(insights.generatedAt).toLocaleString('ko-KR')}</strong>
              </div>
            </div>
            {insights.approvedAt && (
              <div className="col-md-3">
                <div className="mb-0">
                  <small className="text-muted d-block">승인일시</small>
                  <strong>{new Date(insights.approvedAt).toLocaleString('ko-KR')}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Viral Insights (4 sections) */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">바이럴 전략 인사이트</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {insights.viral?.current && (
              <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-primary me-2">{insights.viral.current.title}</span>
                  </div>
                  <InsightRenderer content={insights.viral.current.content} />
                </div>
              </div>
            )}
            {insights.viral?.strategy && (
              <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-success me-2">{insights.viral.strategy.title}</span>
                  </div>
                  <InsightRenderer content={insights.viral.strategy.content} />
                </div>
              </div>
            )}
            {insights.viral?.situation && (
              <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-info me-2">{insights.viral.situation.title}</span>
                  </div>
                  <InsightRenderer content={insights.viral.situation.content} />
                </div>
              </div>
            )}
            {insights.viral?.growth && (
              <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-warning me-2">{insights.viral.growth.title}</span>
                  </div>
                  <InsightRenderer content={insights.viral.growth.content} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel Insights */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">채널별 인사이트</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {insights.channels && Object.entries(insights.channels).map(([channel, data]) => (
              <div key={channel} className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <h6 className="fw-bold text-primary mb-2 text-capitalize">{channel}</h6>
                  <InsightRenderer content={data.insight} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InsightsReviewPage() {
  return (
    <Suspense fallback={
      <div className="main-content">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    }>
      <InsightsReviewContent />
    </Suspense>
  )
}
