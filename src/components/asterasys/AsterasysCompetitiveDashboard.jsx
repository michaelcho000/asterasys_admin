'use client'

import React, { useMemo, useState } from 'react'
import useCompetitorAnalysis from '@/hooks/useCompetitorAnalysis'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import CardLoader from '@/components/shared/CardLoader'
import AsterasysMarketChart from '@/components/asterasys/AsterasysMarketChart'
import AsterasysHIFUChart from '@/components/asterasys/AsterasysHIFUChart'
import MarketingChart from '@/components/widgetsCharts/MarketingChart'
import getIcon from '@/utils/getIcon'
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'
import { formatNumber } from '@/utils/formatNumber'

const formatMonthLabel = (month) => {
  if (!month) return '최근 데이터'
  const [year, monthPart] = month.split('-')
  return `${year}년 ${parseInt(monthPart, 10)}월`
}

const AsterasysCompetitiveDashboard = () => {
  const [activeTab, setActiveTab] = useState('all')
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const monthLabel = formatMonthLabel(month)
  const { competitorData, loading, error } = useCompetitorAnalysis()

  const computed = useMemo(() => {
    if (!competitorData) {
      return {
        headerStats: { totalScore: 0, marketShare: '0.0' },
        rfRanks: {},
        hifuRanks: {},
        salesSummary: { total: 0, perProduct: {} },
        engagement: { asterasys: 0, competitors: 0 }
      }
    }

    const asterasysProducts = competitorData.summary.asterasysProducts || []
    const totalScore = asterasysProducts.reduce((sum, product) => sum + (product.totalScore || 0), 0)
    const marketTotal = competitorData.all.reduce((sum, product) => sum + (product.totalScore || 0), 0)
    const marketShare = marketTotal ? ((totalScore / marketTotal) * 100).toFixed(1) : '0.0'

    const rfRanks = {}
    competitorData.rf.forEach((item) => {
      if (item.isAsterasys) {
        rfRanks[item.name] = item.categoryRank
      }
    })

    const hifuRanks = {}
    competitorData.hifu.forEach((item) => {
      if (item.isAsterasys) {
        hifuRanks[item.name] = item.categoryRank
      }
    })

    return {
      headerStats: { totalScore, marketShare },
      rfRanks,
      hifuRanks,
      salesSummary: competitorData.summary.sales,
      engagement: competitorData.summary.engagement
    }
  }, [competitorData])

  const filteredCompetitors = useMemo(() => {
    if (!competitorData) return []
    if (activeTab === 'rf') return competitorData.rf
    if (activeTab === 'hifu') return competitorData.hifu
    return competitorData.all
  }, [competitorData, activeTab])

  if (loading) return <div className="col-12"><CardLoader /></div>
  if (error) return <div className="col-12"><div className="alert alert-danger">데이터 로딩 오류: {error.message}</div></div>
  if (!competitorData) return <div className="col-12"><div className="alert alert-info">데이터를 불러오는 중...</div></div>

  const rfCount = competitorData.rf.length
  const hifuCount = competitorData.hifu.length
  const totalCount = competitorData.summary.totalCompetitors

  const asterasysSales = computed.salesSummary?.perProduct || {}

  return (
    <>
      {/* Executive Header */}
      <div className="col-12 mb-4">
        <div className="card border-0 bg-gradient-primary text-white">
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h2 className="card-title text-white mb-1">📊 Asterasys 경쟁 인텔리전스</h2>
                <p className="mb-0 opacity-90">
                  {totalCount}개 의료기기 브랜드 실시간 비교 분석 • {monthLabel}
                  <span className="badge bg-white text-primary ms-2">Live</span>
                </p>
              </div>
              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center justify-content-end gap-4">
                  <div>
                    <div className="h4 text-white mb-0">{formatNumber(computed.headerStats.totalScore)}</div>
                    <small className="opacity-75">Asterasys 종합 점수</small>
                  </div>
                  <div>
                    <div className="h4 text-white mb-0">{computed.headerStats.marketShare}%</div>
                    <small className="opacity-75">시장 점유율</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="col-12 mb-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-3">
            <div className="d-flex justify-content-center">
              <div className="btn-group btn-group-lg" role="group">
                <button
                  className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('all')}
                >
                  전체 시장 ({totalCount}개)
                </button>
                <button
                  className={`btn ${activeTab === 'rf' ? 'btn-outline-purple' : 'btn-outline-secondary'}`}
                  style={{ borderColor: '#8b5cf6', color: activeTab === 'rf' ? '#8b5cf6' : '#6c757d' }}
                  onClick={() => setActiveTab('rf')}
                >
                  고주파 (RF) - {rfCount}개
                </button>
                <button
                  className={`btn ${activeTab === 'hifu' ? 'btn-outline-info' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('hifu')}
                >
                  초음파 (HIFU) - {hifuCount}개
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero KPI cards */}
      <div className="col-12 mb-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg h-100 border-purple" style={{ borderWidth: '3px !important' }}>
              <div className="card-body p-5 text-center">
                <div className="avatar-text avatar-xl bg-purple-subtle text-purple mb-4" style={{ width: '80px', height: '80px', fontSize: '24px' }}>
                  {React.cloneElement(getIcon('feather-target'), { size: '32' })}
                </div>
                <h4 className="card-title text-dark mb-2">시장 순위</h4>
                <p className="text-muted mb-4">Asterasys 제품 포지션</p>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-purple-subtle rounded">
                      <div className="h5 text-purple fw-bold">{computed.rfRanks['쿨페이즈'] ? `${computed.rfRanks['쿨페이즈']}위` : 'N/A'}</div>
                      <small className="text-muted">RF (쿨페이즈)</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-info-subtle rounded">
                      <div className="h5 text-info fw-bold">
                        {computed.hifuRanks['쿨소닉'] ? `${computed.hifuRanks['쿨소닉']}위` : 'N/A'} / {computed.hifuRanks['리프테라'] ? `${computed.hifuRanks['리프테라']}위` : 'N/A'}
                      </div>
                      <small className="text-muted">HIFU (쿨소닉/리프테라)</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-lg h-100 border-success" style={{ borderWidth: '3px !important' }}>
              <div className="card-body p-5 text-center">
                <div className="avatar-text avatar-xl bg-success-subtle text-success mb-4" style={{ width: '80px', height: '80px', fontSize: '24px' }}>
                  {React.cloneElement(getIcon('feather-shopping-cart'), { size: '32' })}
                </div>
                <h4 className="card-title text-dark mb-2">판매 성과</h4>
                <p className="text-muted mb-4">Asterasys 3종 판매량</p>
                <div className="h2 text-success fw-bold mb-3">{formatNumber(computed.salesSummary?.total || 0)}</div>
                <div className="row g-2">
                  {Object.entries(asterasysSales).map(([product, values]) => (
                    <div key={product} className="col-4">
                      <div className="small text-muted">{product}</div>
                      <div className="fw-bold">{formatNumber(values.total)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-lg h-100 border-info" style={{ borderWidth: '3px !important' }}>
              <div className="card-body p-5 text-center">
                <div className="avatar-text avatar-xl bg-info-subtle text-info mb-4" style={{ width: '80px', height: '80px', fontSize: '24px' }}>
                  {React.cloneElement(getIcon('feather-message-circle'), { size: '32' })}
                </div>
                <h4 className="card-title text-dark mb-2">채널 참여도</h4>
                <p className="text-muted mb-4">댓글 + 대댓글 기준</p>
                <div className="d-flex justify-content-center align-items-center gap-3">
                  <span className="badge bg-success">우리 {computed.engagement?.asterasysAverage?.toFixed?.(2) || '0.00'}</span>
                  <FiTrendingUp className="text-success" />
                  <span className="badge bg-secondary">경쟁사 {computed.engagement?.competitorsAverage?.toFixed?.(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market charts */}
      <div className="col-xxl-8">
        <AsterasysMarketChart />
      </div>
      <div className="col-xxl-4">
        <AsterasysHIFUChart />
      </div>

      {/* Competitor tables */}
      <div className="col-12 mb-4">
        <div className="card stretch stretch-full">
          <div className="card-header">
            <h5 className="card-title">🏆 {activeTab === 'all' ? '전체 시장' : activeTab === 'rf' ? 'RF (고주파)' : 'HIFU (초음파)'} 순위 현황</h5>
            <div className="card-header-action">
              <small className="text-muted">카페 + 블로그 + 검색 + 유튜브 + 뉴스 점수</small>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead className="table-light">
                  <tr>
                    <th>순위</th>
                    <th>브랜드</th>
                    <th>분류</th>
                    <th>종합점수</th>
                    <th>카페</th>
                    <th>블로그</th>
                    <th>검색</th>
                    <th>유튜브</th>
                    <th>뉴스</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompetitors.map((competitor) => (
                    <tr key={`${activeTab}-${competitor.name}`} className={competitor.isAsterasys ? 'table-warning' : ''}>
                      <td className="fw-bold">{activeTab === 'all' ? competitor.overallRank : competitor.categoryRank}</td>
                      <td>
                        {competitor.isAsterasys && <span className="badge bg-warning text-dark me-1">⭐</span>}
                        {competitor.name}
                      </td>
                      <td>
                        <span className={`badge ${competitor.group === '고주파' ? 'bg-purple' : 'bg-info'}`}>
                          {competitor.group === '고주파' ? 'RF' : 'HIFU'}
                        </span>
                      </td>
                      <td className="fw-semibold text-primary">{formatNumber(competitor.totalScore)}</td>
                      <td>{formatNumber(competitor.cafeScore || 0)}</td>
                      <td>{formatNumber(competitor.blogScore || 0)}</td>
                      <td>{formatNumber(competitor.searchScore || 0)}</td>
                      <td>{formatNumber(competitor.youtubeScore || 0)}</td>
                      <td>{formatNumber(competitor.newsScore || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Additional content */}
      <div className="col-xxl-8">
        <MarketingChart />
      </div>
      <div className="col-xxl-4">
        <div className="card stretch stretch-full">
          <div className="card-header">
            <h5 className="card-title">⚠️ 경쟁사 위협 요인</h5>
          </div>
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 bg-danger-subtle rounded-circle me-3">
                <FiTrendingUp className="text-danger" />
              </div>
              <div>
                <div className="fw-semibold">상위 RF 경쟁사</div>
                <small className="text-muted">{competitorData.summary.topRfCompetitor?.name || '데이터 없음'}</small>
              </div>
            </div>
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 bg-info-subtle rounded-circle me-3">
                <FiTrendingDown className="text-info" />
              </div>
              <div>
                <div className="fw-semibold">상위 HIFU 경쟁사</div>
                <small className="text-muted">{competitorData.summary.topHifuCompetitor?.name || '데이터 없음'}</small>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <div className="p-2 bg-secondary-subtle rounded-circle me-3">
                <FiMinus className="text-secondary" />
              </div>
              <div>
                <div className="fw-semibold">Asterasys 기회 요인</div>
                <small className="text-muted">{monthLabel} 데이터 기반 인사이트 제공</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AsterasysCompetitiveDashboard
