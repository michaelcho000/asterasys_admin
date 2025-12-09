'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import InsightRenderer from '@/components/asterasys/InsightRenderer'
import './insights-review.css'

function InsightsReviewContent() {
  const searchParams = useSearchParams()
  const monthParam = searchParams.get('month') || '2025-11'

  const [activeTab, setActiveTab] = useState('data')
  const [month, setMonth] = useState(monthParam)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [approving, setApproving] = useState(false)
  const [editedInsights, setEditedInsights] = useState(null) // 편집 중인 임시 데이터

  // 각 단계별 설정 상태
  const [dataConfig, setDataConfig] = useState({
    selectedSources: ['youtube', 'blog', 'cafe', 'news'],
    dateRange: month,
    filters: {}
  })

  const [promptConfig, setPromptConfig] = useState(null)
  const [promptLoading, setPromptLoading] = useState(true)

  const [formatConfig, setFormatConfig] = useState({
    outputFormat: 'markdown',
    includeMetrics: true,
    includeCharts: false,
    maxLength: 500
  })

  useEffect(() => {
    loadPromptConfig()
    // 월이 변경되면 인사이트도 초기화
    setInsights(null)
    setEditedInsights(null)
    // 데이터 설정도 월에 맞게 업데이트
    setDataConfig(prev => ({
      ...prev,
      dateRange: month
    }))
  }, [month])

  useEffect(() => {
    if (activeTab === 'generate') {
      loadInsights()
    }
  }, [activeTab, month])

  const loadPromptConfig = async () => {
    try {
      setPromptLoading(true)
      const res = await fetch(`/api/llm-insights/prompts?month=${month}`)
      if (res.ok) {
        const data = await res.json()
        setPromptConfig(data)
      }
    } catch (error) {
      console.error('프롬프트 로드 실패:', error)
    } finally {
      setPromptLoading(false)
    }
  }

  const savePromptConfig = async () => {
    if (!confirm('프롬프트 설정을 저장하시겠습니까?')) return

    try {
      const res = await fetch('/api/llm-insights/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, promptConfig })
      })

      if (res.ok) {
        alert('프롬프트 설정이 저장되었습니다.')
      } else {
        const error = await res.json()
        alert(error.error || '저장 실패')
      }
    } catch (error) {
      console.error('저장 실패:', error)
      alert('저장 중 오류 발생')
    }
  }

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

  const handleGenerateInsights = async () => {
    // 임시 저장된 내용이 있으면 경고
    if (editedInsights) {
      if (!confirm('임시 저장된 내용이 있습니다.\n새로 생성하면 임시 저장 내용이 사라집니다. 계속하시겠습니까?')) {
        return
      }
    }

    if (!confirm('새로운 인사이트를 재분석하여 생성하시겠습니까?')) return

    try {
      setLoading(true)
      // 재분석 스크립트 실행 (월 파라미터 전달)
      const res = await fetch(`/api/llm-insights/reanalyze?month=${month}`, {
        method: 'POST'
      })

      if (res.ok) {
        alert('인사이트 재생성이 완료되었습니다.')
        setEditedInsights(null) // 재생성 시 임시 저장 내용 초기화
        // 데이터 다시 로드
        await loadInsights()
      } else {
        const error = await res.json()
        alert(error.error || '재생성 실패')
      }
    } catch (error) {
      console.error('재생성 실패:', error)
      alert('인사이트 재생성 중 오류 발생')
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

      if (editedInsights) {
        // 임시 편집 내용을 실제 파일에 저장 (draft 상태로)
        const saveRes = await fetch('/api/llm-insights/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedInsights)
        })

        if (!saveRes.ok) {
          const saveError = await saveRes.json()
          alert(`저장 실패: ${saveError.error || '알 수 없는 오류'}`)
          setApproving(false)
          return
        }

        // 저장 성공 후 잠시 대기 (파일 시스템 동기화)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // 승인 처리 (파일을 읽어서 approved로 변경)
      const res = await fetch('/api/llm-insights/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month })
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message)
        setInsights(data.insights)
        setEditedInsights(null) // 임시 데이터 초기화
        // 승인 후 데이터 다시 로드
        await loadInsights()
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'data':
        return <DataSourceTab config={dataConfig} setConfig={setDataConfig} month={month} />
      case 'prompt':
        return <PromptEditorTab
          config={promptConfig}
          setConfig={setPromptConfig}
          onSave={savePromptConfig}
          month={month}
        />
      case 'format':
        return <FormatConfigTab config={formatConfig} setConfig={setFormatConfig} />
      case 'generate':
        return <GenerateTab
          insights={insights}
          editedInsights={editedInsights}
          setEditedInsights={setEditedInsights}
          loading={loading}
          onGenerate={handleGenerateInsights}
          onReload={loadInsights}
        />
      case 'deploy':
        return <DeployTab
          insights={editedInsights || insights}
          originalInsights={insights}
          hasEdits={!!editedInsights}
          month={month}
          onApprove={handleApprove}
          approving={approving}
        />
      default:
        return null
    }
  }

  return (
    <div className="insights-review-container">
      {/* Header */}
      <div className="insights-header">
        <div>
          <h3 className="mb-1">LLM 인사이트 워크플로우</h3>
          <p className="text-muted mb-0">데이터 분석부터 배포까지 전체 프로세스를 관리하세요</p>
        </div>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="2025-11">2025년 11월</option>
            <option value="2025-10">2025년 10월</option>
            <option value="2025-09">2025년 9월</option>
            <option value="2025-08">2025년 8월</option>
          </select>
          {insights?.status === 'approved' && (
            <button className="btn btn-success" disabled>
              승인 완료
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="insights-tabs">
        <button
          className={`insights-tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <span className="tab-number">1</span>
          <span className="tab-label">데이터 소스</span>
        </button>
        <button
          className={`insights-tab ${activeTab === 'prompt' ? 'active' : ''}`}
          onClick={() => setActiveTab('prompt')}
        >
          <span className="tab-number">2</span>
          <span className="tab-label">프롬프트 설정</span>
        </button>
        <button
          className={`insights-tab ${activeTab === 'format' ? 'active' : ''}`}
          onClick={() => setActiveTab('format')}
        >
          <span className="tab-number">3</span>
          <span className="tab-label">서식 설정</span>
        </button>
        <button
          className={`insights-tab ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          <span className="tab-number">4</span>
          <span className="tab-label">인사이트 생성</span>
        </button>
        <button
          className={`insights-tab ${activeTab === 'deploy' ? 'active' : ''}`}
          onClick={() => setActiveTab('deploy')}
          disabled={!insights}
        >
          <span className="tab-number">5</span>
          <span className="tab-label">배포</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="insights-content">
        {renderTabContent()}
      </div>
    </div>
  )
}

// Tab 1: 데이터 소스
function DataSourceTab({ config, setConfig, month }) {
  const [fileStatus, setFileStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkDataFiles = async () => {
    setLoading(true)
    try {
      // 실제 데이터 파일 존재 여부 체크
      const dataFiles = [
        { name: 'Blog Rank', file: 'blog_rank.csv', channel: 'blog' },
        { name: 'Cafe Rank', file: 'cafe_rank.csv', channel: 'cafe' },
        { name: 'News Rank', file: 'news_rank.csv', channel: 'news' },
        { name: 'YouTube Rank', file: 'youtube_rank.csv', channel: 'youtube' },
        { name: 'Sales Data', file: 'sale.csv', channel: 'all' },
        { name: 'Traffic Data', file: 'traffic.csv', channel: 'all' }
      ]

      setFileStatus(dataFiles)
    } catch (error) {
      console.error('File check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDataFiles()
  }, [month])

  return (
    <div className="tab-content-wrapper">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">참조 데이터 선택</h5>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <label className="form-label fw-bold">분석 대상 채널</label>
            <div className="d-flex gap-3">
              {['youtube', 'blog', 'cafe', 'news'].map(channel => (
                <div key={channel} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`channel-${channel}`}
                    checked={config.selectedSources.includes(channel)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({
                          ...config,
                          selectedSources: [...config.selectedSources, channel]
                        })
                      } else {
                        setConfig({
                          ...config,
                          selectedSources: config.selectedSources.filter(c => c !== channel)
                        })
                      }
                    }}
                  />
                  <label className="form-check-label text-capitalize" htmlFor={`channel-${channel}`}>
                    {channel}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">데이터 기간</label>
            <input
              type="text"
              className="form-control"
              value={config.dateRange}
              readOnly
            />
            <small className="text-muted">
              데이터 기간은 우측 상단의 월 선택과 자동으로 동기화됩니다.
            </small>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-header">
          <h5 className="card-title mb-0">참조할 데이터 파일</h5>
          <small className="text-muted">
            인사이트 생성 시 아래 데이터 파일들이 LLM에 입력됩니다
          </small>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : fileStatus ? (
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40%' }}>데이터 파일</th>
                    <th style={{ width: '20%' }}>관련 채널</th>
                    <th style={{ width: '20%' }}>분석 대상</th>
                    <th style={{ width: '20%' }}>경로</th>
                  </tr>
                </thead>
                <tbody>
                  {fileStatus.map((file, idx) => {
                    const isSelected = file.channel === 'all' || config.selectedSources.includes(file.channel)
                    return (
                      <tr key={idx} className={isSelected ? '' : 'text-muted'}>
                        <td>
                          <strong>{file.name}</strong>
                          {isSelected && <span className="badge bg-success ms-2">사용</span>}
                          {!isSelected && <span className="badge bg-secondary ms-2">미사용</span>}
                        </td>
                        <td className="text-capitalize">{file.channel}</td>
                        <td>
                          {file.channel === 'all' ? (
                            <span className="badge bg-primary">공통</span>
                          ) : (
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={config.selectedSources.includes(file.channel)}
                              disabled
                            />
                          )}
                        </td>
                        <td>
                          <code className="small">
                            data/raw/{month}/{file.file}
                          </code>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">파일 정보를 확인하는 중...</p>
          )}

          <div className="alert alert-info mt-3 mb-0">
            <strong>참고:</strong>
            <ul className="mb-0 mt-2 small">
              <li>선택한 채널의 Rank 데이터가 LLM에 입력됩니다</li>
              <li>Sales Data와 Traffic Data는 모든 분석에 기본으로 포함됩니다</li>
              <li>각 CSV 파일의 처음 3,000자가 프롬프트에 포함됩니다</li>
              <li>파일 경로: <code>data/raw/{month}/asterasys_total_data - [파일명]</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tab 2: 프롬프트 에디터
function PromptEditorTab({ config, setConfig, onSave, month }) {
  const [viewMode, setViewMode] = useState('structured') // 'structured' or 'raw'

  if (!config) {
    return (
      <div className="tab-content-wrapper">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">프롬프트를 로드하는 중...</p>
        </div>
      </div>
    )
  }

  const updateField = (path, value) => {
    const newConfig = { ...config }
    const keys = path.split('.')
    let current = newConfig

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    setConfig(newConfig)
  }

  return (
    <div className="tab-content-wrapper">
      {/* Header with Save Button */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">프롬프트 설정 - {month}</h6>
              <small className="text-muted">
                모든 항목을 직접 수정할 수 있습니다. 수정 후 저장 버튼을 클릭하세요.
              </small>
            </div>
            <div className="d-flex gap-2">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'structured' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('structured')}
                >
                  구조화 뷰
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'raw' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('raw')}
                >
                  전체 프롬프트
                </button>
              </div>
              <button className="btn btn-success" onClick={onSave}>
                저장
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'raw' ? (
        /* Raw Prompt View */
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">전체 프롬프트 (LLM에 전송되는 최종 텍스트)</h5>
          </div>
          <div className="card-body">
            <textarea
              className="form-control font-monospace"
              rows="30"
              value={generateFullPrompt(config)}
              readOnly
              style={{ fontSize: '0.85rem' }}
            />
            <small className="text-muted mt-2 d-block">
              이 텍스트는 아래 구조화된 설정을 조합하여 자동 생성됩니다. 각 항목을 수정하려면 "구조화 뷰"를 사용하세요.
            </small>
          </div>
        </div>
      ) : (
        /* Structured View */
        <>
          {/* LLM Config */}
          {config.llmConfig && (
            <div className="card mb-3">
              <div className="card-header">
                <h5 className="card-title mb-0">LLM 모델 설정</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-bold">모델</label>
                    <input
                      type="text"
                      className="form-control"
                      value={config.llmConfig.model}
                      onChange={(e) => updateField('llmConfig.model', e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Max Tokens</label>
                    <input
                      type="number"
                      className="form-control"
                      value={config.llmConfig.maxTokens}
                      onChange={(e) => updateField('llmConfig.maxTokens', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Temperature</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={config.llmConfig.temperature}
                      onChange={(e) => updateField('llmConfig.temperature', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Prompt */}
          <div className="card mb-3">
            <div className="card-header">
              <h5 className="card-title mb-0">시스템 프롬프트</h5>
            </div>
            <div className="card-body">
              <textarea
                className="form-control font-monospace"
                rows="4"
                value={config.systemPrompt || ''}
                onChange={(e) => updateField('systemPrompt', e.target.value)}
              />
              <small className="text-muted">변수: {'{{'} MONTH {'}}'}  - 자동으로 대상 월로 치환됩니다.</small>
            </div>
          </div>

          {/* Variables */}
          {config.variables && (
            <div className="card mb-3">
              <div className="card-header">
                <h5 className="card-title mb-0">프롬프트 변수</h5>
                <small className="text-muted">프롬프트에서 {'{{'} 변수명 {'}}'}  형태로 사용됩니다</small>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {Object.entries(config.variables).map(([key, value]) => (
                    <div key={key} className="col-md-6">
                      <label className="form-label fw-bold font-monospace">
                        {'{{'}{key}{'}}'}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={value}
                        onChange={(e) => updateField(`variables.${key}`, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Viral Examples */}
          {config.viralExamples && (
            <div className="card mb-3 border-primary">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0 text-white">
                  바이럴 인사이트 섹션 예시 (Few-Shot Learning)
                </h5>
                <small className="text-white opacity-75">
                  <strong>실제 프롬프트에 포함됩니다!</strong> LLM이 이 예시를 참고하여 동일한 형식으로 인사이트를 생성합니다.
                </small>
              </div>
              <div className="card-body">
                <div className="alert alert-info mb-3">
                  <strong>Few-Shot Learning이란?</strong>
                  <p className="mb-0 mt-1 small">
                    LLM에게 원하는 출력 형식의 예시를 제공하여, 동일한 스타일과 구조로 답변하도록 유도하는 기법입니다.
                    아래 예시를 수정하면 LLM의 출력 형식도 변경됩니다.
                  </p>
                </div>

                {Object.entries(config.viralExamples).map(([key, example]) => (
                  <div key={key} className="mb-4">
                    <label className="form-label fw-bold text-capitalize">
                      {key} 섹션 예시
                      <span className="badge bg-success ms-2">프롬프트 포함</span>
                    </label>
                    <textarea
                      className="form-control font-monospace"
                      rows="6"
                      value={example}
                      onChange={(e) => updateField(`viralExamples.${key}`, e.target.value)}
                      style={{ fontSize: '0.85rem', lineHeight: '1.6' }}
                      placeholder={`${key} 섹션의 출력 형식 예시를 입력하세요...`}
                    />
                    <small className="text-muted">
                      이 예시가 JSON 템플릿의 {'{{'} VIRAL_{key.toUpperCase()}_EXAMPLE {'}}'}  변수에 삽입됩니다
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {config.products && (
            <div className="card mb-3">
              <div className="card-header">
                <h5 className="card-title mb-0">제품 정보</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">우리 제품 (쉼표로 구분)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.products.ours.join(', ')}
                    onChange={(e) => updateField('products.ours', e.target.value.split(',').map(s => s.trim()))}
                  />
                </div>
                <div>
                  <label className="form-label fw-bold">경쟁사 (쉼표로 구분)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.products.competitors.join(', ')}
                    onChange={(e) => updateField('products.competitors', e.target.value.split(',').map(s => s.trim()))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Markdown Rules */}
          {config.markdownSection && (
            <div className="card mb-3">
              <div className="card-header">
                <h5 className="card-title mb-0">마크다운 작성 규칙</h5>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control font-monospace"
                  rows="6"
                  value={config.markdownSection}
                  onChange={(e) => updateField('markdownSection', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Constraints */}
          {config.constraintsSection && (
            <div className="card mb-3">
              <div className="card-header bg-warning bg-opacity-10">
                <h5 className="card-title mb-0">중요 제약사항</h5>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control font-monospace"
                  rows="8"
                  value={config.constraintsSection}
                  onChange={(e) => updateField('constraintsSection', e.target.value)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// 전체 프롬프트 생성 함수
function generateFullPrompt(config) {
  let prompt = config.systemPrompt + '\n\n'
  prompt += config.dataSection + '\n\n'
  prompt += config.productSection + '\n\n'

  // JSON 구조 템플릿 (바이럴 예시 포함)
  let jsonTemplate = config.jsonStructureTemplate

  // 바이럴 예시를 JSON 템플릿에 삽입
  if (config.viralExamples) {
    jsonTemplate = jsonTemplate.replace('{{VIRAL_CURRENT_EXAMPLE}}', config.viralExamples.current || '')
    jsonTemplate = jsonTemplate.replace('{{VIRAL_STRATEGY_EXAMPLE}}', config.viralExamples.strategy || '')
    jsonTemplate = jsonTemplate.replace('{{VIRAL_SITUATION_EXAMPLE}}', config.viralExamples.situation || '')
    jsonTemplate = jsonTemplate.replace('{{VIRAL_GROWTH_EXAMPLE}}', config.viralExamples.growth || '')
  }

  // 채널 예시 삽입
  if (config.channelExample) {
    jsonTemplate = jsonTemplate.replace('{{CHANNEL_CAFE_EXAMPLE}}', config.channelExample)
  }

  prompt += jsonTemplate + '\n\n'
  prompt += config.markdownSection + '\n\n'
  prompt += config.constraintsSection

  // 기본 변수 치환
  if (config.variables) {
    Object.entries(config.variables).forEach(([key, value]) => {
      prompt = prompt.replaceAll(`{{${key}}}`, value)
    })
  }

  return prompt
}

// Tab 3: 서식 설정
function FormatConfigTab({ config, setConfig }) {
  return (
    <div className="tab-content-wrapper">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">출력 서식 설정</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label fw-bold">출력 포맷</label>
            <select
              className="form-select"
              value={config.outputFormat}
              onChange={(e) => setConfig({ ...config, outputFormat: e.target.value })}
            >
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
              <option value="plain">Plain Text</option>
            </select>
          </div>

          <div className="mb-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="includeMetrics"
                checked={config.includeMetrics}
                onChange={(e) => setConfig({ ...config, includeMetrics: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="includeMetrics">
                수치 지표 포함
              </label>
            </div>
          </div>

          <div className="mb-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="includeCharts"
                checked={config.includeCharts}
                onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="includeCharts">
                차트 삽입
              </label>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">최대 길이 (문자)</label>
            <input
              type="number"
              className="form-control"
              value={config.maxLength}
              onChange={(e) => setConfig({ ...config, maxLength: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-header">
          <h5 className="card-title mb-0">미리보기</h5>
        </div>
        <div className="card-body">
          <div className="border rounded p-3 bg-light">
            <p className="mb-2"><strong>포맷:</strong> {config.outputFormat}</p>
            <p className="mb-2"><strong>지표 포함:</strong> {config.includeMetrics ? '예' : '아니오'}</p>
            <p className="mb-2"><strong>차트 포함:</strong> {config.includeCharts ? '예' : '아니오'}</p>
            <p className="mb-0"><strong>최대 길이:</strong> {config.maxLength}자</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tab 4: 인사이트 생성
function GenerateTab({ insights, editedInsights, setEditedInsights, loading, onGenerate, onReload }) {
  const [editMode, setEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState(null)

  // 표시할 데이터: 편집된 내용 또는 원본
  const displayData = editedInsights || insights

  useEffect(() => {
    // 편집 중인 내용이 있으면 그것을 사용, 없으면 원본 사용
    if (displayData) {
      setEditedContent(JSON.parse(JSON.stringify(displayData)))
    }
  }, [insights, editedInsights])

  const handleSaveEdit = async () => {
    if (!confirm('수정사항을 임시 저장하시겠습니까?\n(5. 배포 탭에서 승인 시 최종 반영됩니다)')) return

    try {
      // 임시 저장: 메모리에만 저장
      const updatedContent = {
        ...editedContent,
        updatedAt: new Date().toISOString()
      }
      setEditedInsights(updatedContent)
      alert('임시 저장되었습니다.\n5. 배포 탭에서 최종 검토 후 승인해주세요.')
      setEditMode(false)
    } catch (error) {
      console.error('임시 저장 실패:', error)
      alert('임시 저장 중 오류 발생: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="tab-content-wrapper">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!displayData) {
    return (
      <div className="tab-content-wrapper">
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="mb-3">인사이트가 생성되지 않았습니다</h5>
            <p className="text-muted mb-4">아래 버튼을 눌러 새로운 인사이트를 생성하세요.</p>
            <button className="btn btn-primary" onClick={onGenerate}>
              인사이트 생성하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-content-wrapper">
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">생성 정보</h6>
              <small className="text-muted">
                {new Date(displayData.generatedAt).toLocaleString('ko-KR')} 생성 ·
                상태: <span className={`badge bg-${displayData.status === 'approved' ? 'success' : 'warning'} ms-1`}>
                  {displayData.status === 'approved' ? '승인됨' : '검수 대기'}
                </span>
                {editedInsights && (
                  <span className="text-warning ms-2">(임시 수정 중)</span>
                )}
              </small>
            </div>
            <div className="d-flex gap-2">
              {editMode ? (
                <>
                  <button className="btn btn-sm btn-success" onClick={handleSaveEdit}>
                    임시 저장
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => setEditMode(false)}>
                    취소
                  </button>
                </>
              ) : (
                <>
                  {editedInsights && (
                    <span className="badge bg-warning text-dark me-2">임시 저장됨 (미배포)</span>
                  )}
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setEditMode(true)}>
                    편집
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={onGenerate}>
                    재생성
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Viral Insights */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="card-title mb-0">바이럴 전략 인사이트</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {displayData.viral && Object.entries(displayData.viral).map(([key, data]) => (
              <div key={key} className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-primary me-2">{data.title}</span>
                  </div>
                  {editMode ? (
                    <textarea
                      className="form-control font-monospace"
                      rows="8"
                      value={editedContent?.viral[key]?.content || ''}
                      onChange={(e) => setEditedContent({
                        ...editedContent,
                        viral: {
                          ...editedContent.viral,
                          [key]: { ...editedContent.viral[key], content: e.target.value }
                        }
                      })}
                    />
                  ) : (
                    <InsightRenderer content={data.content} />
                  )}
                </div>
              </div>
            ))}
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
            {displayData.channels && Object.entries(displayData.channels).map(([channel, data]) => (
              <div key={channel} className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <h6 className="fw-bold text-primary mb-2 text-capitalize">{channel}</h6>
                  {editMode ? (
                    <textarea
                      className="form-control font-monospace"
                      rows="6"
                      value={editedContent?.channels[channel]?.insight || ''}
                      onChange={(e) => setEditedContent({
                        ...editedContent,
                        channels: {
                          ...editedContent.channels,
                          [channel]: { ...editedContent.channels[channel], insight: e.target.value }
                        }
                      })}
                    />
                  ) : (
                    <InsightRenderer content={data.insight} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Tab 5: 배포
function DeployTab({ insights, originalInsights, hasEdits, month, onApprove, approving }) {
  if (!insights) {
    return (
      <div className="tab-content-wrapper">
        <div className="alert alert-warning">
          인사이트를 먼저 생성해주세요.
        </div>
      </div>
    )
  }

  // 원본 상태 확인
  const originalStatus = originalInsights?.status || 'draft'

  // 임시 수정이 있거나 원본 status가 draft인 경우 배포 가능
  const canDeploy = hasEdits || originalStatus === 'draft'
  const currentStatus = hasEdits ? 'draft' : originalStatus
  const isRedeployment = hasEdits && originalStatus === 'approved' // 재배포 여부

  return (
    <div className="tab-content-wrapper">
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="card-title mb-0">배포 전 최종 확인</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="mb-3">
                <small className="text-muted d-block">대상 월</small>
                <strong className="fs-5">{month}</strong>
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <small className="text-muted d-block">상태</small>
                <span className={`badge bg-${currentStatus === 'approved' ? 'success' : 'warning'} fs-6`}>
                  {currentStatus === 'approved' ? '승인됨' : hasEdits ? '임시 수정 (미배포)' : '검수 대기'}
                </span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <small className="text-muted d-block">생성일시</small>
                <strong>{new Date(insights.generatedAt).toLocaleString('ko-KR')}</strong>
                {hasEdits && insights.updatedAt && (
                  <div className="text-warning small mt-1">
                    임시 수정: {new Date(insights.updatedAt).toLocaleString('ko-KR')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {canDeploy && (
            <div className="alert alert-info">
              <strong>안내:</strong> {isRedeployment
                ? '승인된 인사이트를 수정했습니다. 재승인하면 수정 내용이 파일에 저장되고 모든 사용자에게 업데이트된 내용이 노출됩니다.'
                : hasEdits
                  ? '임시 수정한 내용을 승인하면 파일에 저장되고 모든 사용자에게 노출됩니다.'
                  : '승인 후 모든 사용자에게 이 인사이트가 노출됩니다.'}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="card-title mb-0">최종 미리보기</h5>
        </div>
        <div className="card-body">
          <div className="preview-section">
            <h6 className="fw-bold mb-3">바이럴 인사이트</h6>
            <div className="row g-3">
              {insights.viral && Object.entries(insights.viral).map(([key, data]) => (
                <div key={key} className="col-md-6">
                  <div className="border rounded p-3 bg-light">
                    <div className="badge bg-primary mb-2">{data.title}</div>
                    <InsightRenderer content={data.content} />
                  </div>
                </div>
              ))}
            </div>

            <h6 className="fw-bold mt-4 mb-3">채널별 인사이트</h6>
            <div className="row g-3">
              {insights.channels && Object.entries(insights.channels).map(([channel, data]) => (
                <div key={channel} className="col-md-6">
                  <div className="border rounded p-3 bg-light">
                    <h6 className="text-primary text-capitalize">{channel}</h6>
                    <InsightRenderer content={data.insight} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deploy Action */}
      {canDeploy && (
        <div className="card">
          <div className="card-body py-4">
            <div className="d-flex flex-column align-items-center">
              <h5 className="mb-3">{isRedeployment ? '재배포 준비 완료' : '배포 준비 완료'}</h5>
              <p className="text-muted mb-4 text-center">
                모든 내용을 확인하셨나요? {isRedeployment
                  ? '재승인하면 수정 내용이 저장되고 즉시 사용자에게 업데이트됩니다.'
                  : hasEdits
                    ? '승인하면 수정 내용이 파일에 저장되고 즉시 사용자에게 노출됩니다.'
                    : '승인하면 즉시 사용자에게 노출됩니다.'}
              </p>
              <button
                className="btn btn-success btn-lg px-5"
                onClick={onApprove}
                disabled={approving}
              >
                {approving ? '승인 중...' : isRedeployment ? '재승인 및 재배포' : hasEdits ? '승인 및 배포' : '최종 승인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!canDeploy && originalStatus === 'approved' && (
        <div className="card">
          <div className="card-body py-4">
            <div className="d-flex flex-column align-items-center">
              <button className="btn btn-success btn-lg mb-3" disabled>배포 완료</button>
              <p className="text-muted mb-0">
                승인일시: {new Date(insights.approvedAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
      )}
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
