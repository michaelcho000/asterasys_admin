'use client'
import React, { useState } from 'react'
import { competitorMatrix, marketOverview, heroKPIs } from '@/utils/fackData/competitorData'
import AsterasysMarketChart from '@/components/asterasys/AsterasysMarketChart'
import AsterasysHIFUChart from '@/components/asterasys/AsterasysHIFUChart'
import MarketingChart from '@/components/widgetsCharts/MarketingChart'
import getIcon from '@/utils/getIcon'
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'

/**
 * Asterasys 경쟁 분석 대시보드
 * 18개 경쟁사 비교 + Duralux 차트 컴포넌트 활용 + 3+2+4 레이아웃 구조
 */

const AsterasysCompetitiveDashboard = () => {
    const [activeTab, setActiveTab] = useState('all')

    const getFilteredData = (technology) => {
        if (technology === 'rf') return competitorMatrix.RF
        if (technology === 'hifu') return competitorMatrix.HIFU
        return [...competitorMatrix.RF, ...competitorMatrix.HIFU]
    }

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
                                    18개 의료기기 브랜드 실시간 비교 분석 • 2025년 8월 실제 데이터
                                    <span className="badge bg-white text-primary ms-2">Live</span>
                                </p>
                            </div>
                            <div className="col-md-4 text-end">
                                <div className="d-flex align-items-center justify-content-end">
                                    <div className="me-4">
                                        <div className="h4 text-white mb-0">674</div>
                                        <small className="opacity-75">전체 판매량 (대)</small>
                                    </div>
                                    <div>
                                        <div className="h4 text-white mb-0">8.71%</div>
                                        <small className="opacity-75">시장 점유율</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 기전별 탭 */}
            <div className="col-12 mb-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                        <div className="d-flex justify-content-center">
                            <div className="btn-group btn-group-lg" role="group">
                                <button 
                                    className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    전체 시장 (18개)
                                </button>
                                <button 
                                    className={`btn ${activeTab === 'rf' ? 'btn-outline-purple' : 'btn-outline-secondary'}`}
                                    style={{ borderColor: '#8b5cf6', color: activeTab === 'rf' ? '#8b5cf6' : '#6c757d' }}
                                    onClick={() => setActiveTab('rf')}
                                >
                                    고주파 (RF) - 9개
                                </button>
                                <button 
                                    className={`btn ${activeTab === 'hifu' ? 'btn-outline-info' : 'btn-outline-secondary'}`}
                                    onClick={() => setActiveTab('hifu')}
                                >
                                    초음파 (HIFU) - 9개
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero KPI Section (3개 대형) */}
            <div className="col-12 mb-5">
                <div className="row g-4">
                    {heroKPIs.map((kpi) => (
                        <div key={kpi.id} className="col-lg-4">
                            <div className={`card border-0 shadow-lg h-100 border-${kpi.color}`} style={{ borderWidth: '3px !important' }}>
                                <div className="card-body p-5 text-center">
                                    <div className={`avatar-text avatar-xl bg-${kpi.color}-subtle text-${kpi.color} mb-4`} style={{ width: '80px', height: '80px', fontSize: '24px' }}>
                                        {React.cloneElement(getIcon(kpi.icon), { size: "32" })}
                                    </div>
                                    
                                    <h4 className="card-title text-dark mb-2">{kpi.title}</h4>
                                    <p className="text-muted mb-4">{kpi.subtitle}</p>
                                    
                                    {/* 데이터 표시 */}
                                    {kpi.id === 1 && (
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <div className="p-3 bg-purple-subtle rounded">
                                                    <div className="h5 text-purple fw-bold">9위</div>
                                                    <small className="text-muted">RF 부문</small>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-3 bg-info-subtle rounded">
                                                    <div className="h5 text-info fw-bold">3-4위</div>
                                                    <small className="text-muted">HIFU 부문</small>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {kpi.id === 2 && (
                                        <div className="text-center">
                                            <div className="h2 text-success fw-bold mb-3">{kpi.data.total}</div>
                                            <div className="text-muted mb-3">총 판매량 (대)</div>
                                            <div className="row g-2">
                                                <div className="col-4">
                                                    <div className="small text-muted">리프테라</div>
                                                    <div className="fw-bold">492</div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="small text-muted">쿨페이즈</div>
                                                    <div className="fw-bold">159</div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="small text-muted">쿨소닉</div>
                                                    <div className="fw-bold">23</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {kpi.id === 3 && (
                                        <div className="text-center">
                                            <div className="h2 text-primary fw-bold mb-2">{kpi.data.totalEngagement}</div>
                                            <div className="text-muted mb-3">총 참여 (댓글+대댓글)</div>
                                            <div className="d-flex justify-content-center align-items-center">
                                                <span className="badge bg-success me-2">우리 4.08</span>
                                                <FiTrendingUp className="text-success" />
                                                <span className="badge bg-secondary ms-2">경쟁사 2.02</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="mt-4 pt-3 border-top">
                                        <small className="text-muted">데이터: {kpi.source}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 경쟁 분석 차트 Section (2개) */}
            <div className="col-12 mb-5">
                <div className="row g-4">
                    {/* RF 시장 분석 차트 */}
                    <div className="col-lg-8">
                        <div className="card stretch stretch-full">
                            <div className="card-header">
                                <h5 className="card-title d-flex align-items-center">
                                    <div className="w-4 h-4 bg-purple rounded me-2" style={{ width: '16px', height: '16px', backgroundColor: '#8b5cf6' }}></div>
                                    RF (고주파) 시장 순위
                                    <span className="badge bg-purple ms-2">9개 브랜드</span>
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {competitorMatrix.RF.map((brand, index) => (
                                        <div key={brand.brand} className="col-12">
                                            <div className={`d-flex align-items-center p-3 rounded ${brand.asterasys ? 'bg-warning-subtle border border-warning' : 'bg-light'}`}>
                                                <div className="me-3">
                                                    <span className={`badge ${brand.asterasys ? 'bg-warning text-dark' : 'bg-secondary'} fs-6`}>
                                                        {brand.rank}위
                                                    </span>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="fw-semibold">
                                                        {brand.asterasys && '⭐ '}
                                                        {brand.brand}
                                                    </div>
                                                    <small className="text-muted">카페 발행량</small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="h5 fw-bold text-primary mb-0">{brand.cafe}</div>
                                                    <small className="text-muted">건</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HIFU 시장 분석 도넛 */}
                    <div className="col-lg-4">
                        <div className="card stretch stretch-full">
                            <div className="card-header">
                                <h5 className="card-title d-flex align-items-center">
                                    <div className="w-4 h-4 bg-info rounded me-2" style={{ width: '16px', height: '16px' }}></div>
                                    HIFU (초음파) 성과
                                    <span className="badge bg-info ms-2">9개 브랜드</span>
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {competitorMatrix.HIFU.map((brand, index) => (
                                        <div key={brand.brand} className="col-12">
                                            <div className={`d-flex align-items-center p-3 rounded ${brand.asterasys ? 'bg-warning-subtle border border-warning' : 'bg-light'}`}>
                                                <div className="me-3">
                                                    <span className={`badge ${brand.asterasys ? 'bg-warning text-dark' : 'bg-info'} fs-6`}>
                                                        {brand.rank}위
                                                    </span>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="fw-semibold">
                                                        {brand.asterasys && '⭐ '}
                                                        {brand.brand}
                                                    </div>
                                                    <small className="text-muted">카페 발행량</small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="h5 fw-bold text-info mb-0">{brand.cafe}</div>
                                                    <small className="text-muted">건</small>
                                                </div>
                                                {brand.sales && (
                                                    <div className="ms-3 text-end">
                                                        <div className="small text-success fw-bold">{brand.sales}</div>
                                                        <small className="text-muted">판매</small>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 경쟁사 순위 테이블 */}
            <div className="col-12 mb-4">
                <div className="card stretch stretch-full">
                    <div className="card-header">
                        <h5 className="card-title">🏆 경쟁사 순위 현황 (실제 데이터)</h5>
                        <div className="card-header-action">
                            <small className="text-muted">
                                데이터: cafe_rank.csv • ⭐ Asterasys 제품
                            </small>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {/* RF 순위 */}
                            <div className="col-lg-6">
                                <h6 className="text-purple fw-semibold mb-3">
                                    <div className="w-3 h-3 bg-purple rounded me-2 d-inline-block" style={{ backgroundColor: '#8b5cf6' }}></div>
                                    RF (고주파) 순위
                                </h6>
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>순위</th>
                                                <th>브랜드</th>
                                                <th>카페 발행량</th>
                                                <th>판매량</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {competitorMatrix.RF.map((brand) => (
                                                <tr key={brand.brand} className={brand.asterasys ? 'table-warning' : ''}>
                                                    <td className="fw-bold">{brand.rank}</td>
                                                    <td>
                                                        {brand.asterasys && <span className="badge bg-warning text-dark me-1">⭐</span>}
                                                        {brand.brand}
                                                    </td>
                                                    <td>{brand.cafe}건</td>
                                                    <td>{brand.sales ? `${brand.sales}대` : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* HIFU 순위 */}
                            <div className="col-lg-6">
                                <h6 className="text-info fw-semibold mb-3">
                                    <div className="w-3 h-3 bg-info rounded me-2 d-inline-block"></div>
                                    HIFU (초음파) 순위
                                </h6>
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>순위</th>
                                                <th>브랜드</th>
                                                <th>카페 발행량</th>
                                                <th>판매량</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {competitorMatrix.HIFU.map((brand) => (
                                                <tr key={brand.brand} className={brand.asterasys ? 'table-warning' : ''}>
                                                    <td className="fw-bold">{brand.rank}</td>
                                                    <td>
                                                        {brand.asterasys && <span className="badge bg-warning text-dark me-1">⭐</span>}
                                                        {brand.brand}
                                                    </td>
                                                    <td>{brand.cafe}건</td>
                                                    <td>{brand.sales ? `${brand.sales}대` : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 운영 성과 요약 (4개 카드) */}
            <div className="col-12">
                <div className="card stretch stretch-full">
                    <div className="card-header">
                        <h5 className="card-title">🛠️ 운영 성과 현황</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-4">
                            <div className="col-lg-3 col-md-6">
                                <div className="card border-0 bg-danger-subtle h-100">
                                    <div className="card-body text-center p-4">
                                        <div className="text-danger mb-2">
                                            <i className="feather-youtube" style={{ fontSize: '24px' }}></i>
                                        </div>
                                        <div className="h4 fw-bold text-danger">₩132</div>
                                        <div className="text-muted mb-2">평균 CPV</div>
                                        <div className="small">
                                            <div>노출: 1,117만회</div>
                                            <div>조회: 196만회</div>
                                        </div>
                                        <div className="mt-3 pt-2 border-top">
                                            <small className="text-muted">youtube_sponsor ad.csv</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6">
                                <div className="card border-0 bg-primary-subtle h-100">
                                    <div className="card-body text-center p-4">
                                        <div className="text-primary mb-2">
                                            <i className="feather-facebook" style={{ fontSize: '24px' }}></i>
                                        </div>
                                        <div className="h4 fw-bold text-primary">17,845</div>
                                        <div className="text-muted mb-2">도달 수 (명)</div>
                                        <div className="small">
                                            <div>노출: 29,511회</div>
                                            <div>클릭: 889회</div>
                                        </div>
                                        <div className="mt-3 pt-2 border-top">
                                            <small className="text-muted">facebook_targeting.csv</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6">
                                <div className="card border-0 bg-success-subtle h-100">
                                    <div className="card-body text-center p-4">
                                        <div className="text-success mb-2">
                                            <i className="feather-edit-3" style={{ fontSize: '24px' }}></i>
                                        </div>
                                        <div className="h4 fw-bold text-success">24</div>
                                        <div className="text-muted mb-2">블로그 발행</div>
                                        <div className="small">
                                            <div>8개 병원</div>
                                            <div>월간 게시물</div>
                                        </div>
                                        <div className="mt-3 pt-2 border-top">
                                            <small className="text-muted">blog_post.csv</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6">
                                <div className="card border-0 bg-warning-subtle h-100">
                                    <div className="card-body text-center p-4">
                                        <div className="text-warning mb-2">
                                            <i className="feather-file-text" style={{ fontSize: '24px' }}></i>
                                        </div>
                                        <div className="h4 fw-bold text-warning">12</div>
                                        <div className="text-muted mb-2">뉴스 릴리즈</div>
                                        <div className="small">
                                            <div>4일간</div>
                                            <div>3개 언론사</div>
                                        </div>
                                        <div className="mt-3 pt-2 border-top">
                                            <small className="text-muted">news_release.csv</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AsterasysCompetitiveDashboard