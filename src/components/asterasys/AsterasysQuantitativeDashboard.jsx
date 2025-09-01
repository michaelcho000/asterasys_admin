'use client'
import React, { useState } from 'react'
import { asterasysQuantitativeData } from '@/utils/fackData/asterasysQuantitativeData'
import getIcon from '@/utils/getIcon'
import { FiMoreVertical } from 'react-icons/fi'

/**
 * Asterasys 정량 데이터 중심 메인 대시보드
 * 순수 CSV 기반 정량 데이터만 표시 (추론/분석 완전 배제)
 */

const AsterasysQuantitativeDashboard = () => {
    const [activeTab, setActiveTab] = useState('all') // all, rf, hifu

    const { coreRankingCards, engagementCards, operationalCards, asterasysProducts, totalSales } = asterasysQuantitativeData

    return (
        <>
            {/* 기전별 탭 시스템 */}
            <div className="col-12 mb-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                        <div className="d-flex justify-content-center">
                            <div className="btn-group" role="group">
                                <button 
                                    className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    전체
                                </button>
                                <button 
                                    className={`btn ${activeTab === 'rf' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setActiveTab('rf')}
                                >
                                    고주파 (RF)
                                </button>
                                <button 
                                    className={`btn ${activeTab === 'hifu' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setActiveTab('hifu')}
                                >
                                    초음파 (HIFU)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 핵심 순위 섹션 (5개 카드) */}
            <div className="col-12 mb-4">
                <div className="card stretch stretch-full">
                    <div className="card-header">
                        <h5 className="card-title">📊 핵심 순위 성과 (실제 CSV 데이터)</h5>
                        <span className="badge bg-success">2025년 8월</span>
                    </div>
                    <div className="card-body">
                        <div className="row g-4">
                            {coreRankingCards.map((card) => (
                                <div key={card.id} className="col-lg col-md-6">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body text-center p-4">
                                            <div className={`avatar-text avatar-lg bg-${card.color}-subtle text-${card.color} mb-3`}>
                                                {React.cloneElement(getIcon(card.icon), { size: "20" })}
                                            </div>
                                            
                                            <div className={`h3 fw-bold text-${card.color} mb-1`}>
                                                {card.value}
                                                <small className="text-muted ms-1 fs-6">{card.unit}</small>
                                            </div>
                                            
                                            {card.rank && (
                                                <div className={`badge bg-${card.color} mb-2`}>
                                                    {card.rank}
                                                </div>
                                            )}
                                            
                                            <h6 className="card-title text-dark mb-1">{card.title}</h6>
                                            <p className="text-muted small mb-0">{card.subtitle}</p>
                                            
                                            <div className="mt-3 pt-2 border-top">
                                                <small className="text-muted">
                                                    데이터: {card.source}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Asterasys 3종 제품 정량 데이터 */}
            <div className="col-12 mb-4">
                <div className="card stretch stretch-full border-warning">
                    <div className="card-header bg-warning text-white">
                        <h5 className="card-title mb-0">⭐ Asterasys 3종 제품 정량 성과</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-4">
                            {Object.entries(asterasysProducts).map(([productName, data]) => (
                                <div key={productName} className="col-lg-4">
                                    <div className="card border-warning h-100">
                                        <div className="card-header bg-light">
                                            <h6 className="card-title mb-1 d-flex align-items-center">
                                                <span className="badge bg-warning text-dark me-2">⭐</span>
                                                {productName}
                                            </h6>
                                            <small className="text-muted">{data.technology}</small>
                                        </div>
                                        <div className="card-body">
                                            {/* 블로그 데이터 */}
                                            {data.blog && (
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between">
                                                        <span className="small text-muted">블로그</span>
                                                        <span className="fw-bold">{data.blog.posts}건 ({data.blog.rank}위)</span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* 카페 데이터 */}
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between">
                                                    <span className="small text-muted">카페</span>
                                                    <span className="fw-bold">{data.cafe.posts}건 ({data.cafe.rank}위)</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span className="small text-muted">댓글</span>
                                                    <span className="small">{data.cafe.comments.toLocaleString()}개</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span className="small text-muted">조회</span>
                                                    <span className="small">{data.cafe.views.toLocaleString()}회</span>
                                                </div>
                                            </div>
                                            
                                            {/* 판매 데이터 */}
                                            <div className="bg-primary-subtle rounded p-2 text-center">
                                                <div className="fw-bold text-primary h5 mb-1">{data.sales.volume}</div>
                                                <small className="text-muted">판매량 (대)</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* 전체 판매량 요약 */}
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="alert alert-warning border-0">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h6 className="mb-1">Asterasys 전체 판매량</h6>
                                            <p className="mb-0">리프테라 492대 + 쿨페이즈 159대 + 쿨소닉 23대</p>
                                        </div>
                                        <div className="text-end">
                                            <div className="h3 text-warning fw-bold">{totalSales.asterasys}</div>
                                            <small className="text-muted">대</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 참여도 데이터 카드 */}
            <div className="col-12 mb-4">
                <div className="card stretch stretch-full">
                    <div className="card-header">
                        <h5 className="card-title">💬 참여도 정량 데이터</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-4">
                            {engagementCards.map((card) => (
                                <div key={card.id} className="col-lg-3 col-md-6">
                                    <div className="card border-0 bg-light h-100">
                                        <div className="card-body text-center p-3">
                                            <div className="text-primary mb-2">
                                                {React.cloneElement(getIcon(card.icon), { size: "24" })}
                                            </div>
                                            <div className="h4 fw-bold text-dark mb-1">
                                                {card.value}
                                                <small className="text-muted ms-1">{card.unit}</small>
                                            </div>
                                            <h6 className="card-title mb-1">{card.title}</h6>
                                            <small className="text-muted">{card.subtitle}</small>
                                            
                                            <div className="mt-2 pt-2 border-top">
                                                <small className="text-muted">{card.source}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 운영 성과 카드 */}
            <div className="col-12">
                <div className="card stretch stretch-full">
                    <div className="card-header">
                        <h5 className="card-title">🛠️ 운영 성과 정량 데이터</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-4">
                            {operationalCards.map((card) => (
                                <div key={card.id} className="col-lg-4 col-md-6">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="text-primary me-3">
                                                    {React.cloneElement(getIcon(card.icon), { size: "24" })}
                                                </div>
                                                <div>
                                                    <h6 className="card-title mb-0">{card.title}</h6>
                                                    <small className="text-muted">{card.subtitle}</small>
                                                </div>
                                            </div>
                                            
                                            <div className="text-center mb-3">
                                                <div className="h3 fw-bold text-primary">
                                                    {card.value}
                                                    {card.unit && <small className="text-muted ms-1">{card.unit}</small>}
                                                </div>
                                            </div>
                                            
                                            {card.additionalData && (
                                                <div className="border-top pt-3">
                                                    {Object.entries(card.additionalData).map(([key, value]) => (
                                                        <div key={key} className="d-flex justify-content-between mb-1">
                                                            <small className="text-muted">{key}</small>
                                                            <small className="fw-medium">{value}</small>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <div className="mt-3 pt-2 border-top">
                                                <small className="text-muted">{card.source}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AsterasysQuantitativeDashboard